import os
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ..services.resume_service import resume_service, RESUMES_DIR
from ..services.cv_extractor_service import cv_extractor_service
from ..services.artifact_service import get_artifact, _atomic_write_json
from ..config import ARTIFACTS_DIR

router = APIRouter(prefix="/api/resume", tags=["resume"])

class GenerateResumeRequest(BaseModel):
    track_slug: str = "technical_business_analyst"

@router.get("/tracks")
def get_resume_tracks() -> List[Dict[str, Any]]:
    """Returns all qualified target career tracks for resume generation."""
    return resume_service.get_available_tracks()

@router.get("/data/{track_slug}")
def get_resume_data(track_slug: str) -> Dict[str, Any]:
    """Returns the assembled canonical resume payload for a specific track."""
    return resume_service.assemble_tailored_resume_data(track_slug)

@router.post("/generate")
def generate_resume(req: GenerateResumeRequest) -> Dict[str, Any]:
    """
    Generates an executive, ATS-compliant Word DOCX and native vector PDF
    tailored to the requested career track.
    """
    try:
        result = resume_service.generate_tailored_pdf(req.track_slug)
        track_slug = req.track_slug
        # Add frontend-accessible download URLs
        result["download_pdf_url"] = f"/api/resume/download/{track_slug}/pdf"
        result["download_docx_url"] = f"/api/resume/download/{track_slug}/docx"
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")

@router.get("/download/{track_slug}/{file_format}")
def download_resume(track_slug: str, file_format: str):
    """
    Downloads either the PDF or Word DOCX resume for the specified track.
    Auto-generates if not already generated.
    """
    file_format = file_format.lower().strip()
    if file_format not in ["pdf", "docx"]:
        raise HTTPException(status_code=400, detail="Invalid format. Must be 'pdf' or 'docx'.")

    # Generate or retrieve
    tracks = resume_service.get_available_tracks()
    matched = next((t for t in tracks if track_slug in t["slug"] or track_slug in t["id"] or track_slug in t["title"].lower()), tracks[0])
    clean_slug = matched["slug"]

    data = resume_service.assemble_tailored_resume_data(clean_slug)
    cand_slug = (data.get("candidateName") or "Candidate_Resume").strip().replace(" ", "_")

    target_filename = f"{cand_slug}_{clean_slug}_Resume.{file_format}"
    target_path = RESUMES_DIR / target_filename

    # If file does not exist, trigger generation
    if not target_path.exists():
        resume_service.generate_tailored_pdf(clean_slug)

    if not target_path.exists():
        raise HTTPException(status_code=404, detail=f"Generated file not found at {target_path}")

    media_type = "application/pdf" if file_format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    return FileResponse(
        path=str(target_path),
        filename=target_filename,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{target_filename}"'}
    )

# -----------------------------------------------------------------------------
# CV Parsing, Role/Phase Extraction & Timeline Confirmation Endpoints
# -----------------------------------------------------------------------------

class ConfirmTimelineRequest(BaseModel):
    candidate: Optional[Dict[str, Any]] = None
    work_history: List[Dict[str, Any]]
    education: Optional[List[Dict[str, Any]]] = None
    skills: Optional[List[str]] = None

@router.post("/parse-cv")
async def parse_uploaded_cv(file: UploadFile = File(...)):
    """
    Extracts text from uploaded PDF/DOCX and parses chronological timeline, roles,
    and gap phase using AI with deterministic fallbacks.
    """
    try:
        content = await file.read()
        raw_text = cv_extractor_service.extract_text_from_bytes(content, file.filename)
        
        # Save copy to user artifacts directory
        upload_save_path = ARTIFACTS_DIR / f"uploaded_{file.filename}"
        with open(upload_save_path, "wb") as f:
            f.write(content)
            
        parsed = cv_extractor_service.parse_cv_text(raw_text)
        return {
            "status": "success",
            "filename": file.filename,
            "extracted_data": parsed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV parsing failed: {str(e)}")

@router.post("/parse-stored-cv")
def parse_stored_sample_cv():
    """
    Parses existing CV from system storage for instant 1-click verification.
    """
    candidate_paths = list(ARTIFACTS_DIR.glob("*.pdf"))
    target_file = candidate_paths[0] if candidate_paths else None
    if not target_file:
        raise HTTPException(status_code=404, detail="No stored CV file found in user artifacts directory.")
        
    with open(target_file, "rb") as f:
        content = f.read()
        
    raw_text = cv_extractor_service.extract_text_from_bytes(content, target_file.name)
    parsed = cv_extractor_service.parse_cv_text(raw_text)
    return {
        "status": "success",
        "filename": target_file.name,
        "extracted_data": parsed
    }

@router.post("/confirm-timeline")
def confirm_career_timeline(req: ConfirmTimelineRequest):
    """
    Confirms extracted timeline, updates profile_master.json, and recompiles track resumes.
    """
    profile = get_artifact("profile_master") or {
        "version": 1,
        "candidate": {},
        "work_history": [],
        "education": []
    }
    
    if req.candidate:
        profile.setdefault("candidate", {}).update(req.candidate)
        
    clean_work_history = []
    for wh in req.work_history:
        clean_work_history.append({
            "company": wh.get("company", ""),
            "role": wh.get("role", ""),
            "period": wh.get("period", "Recent"),
            "location": wh.get("location", ""),
            "is_gap_phase": wh.get("is_gap_phase", False),
            "summary": wh.get("summary", ""),
            "responsibilities": wh.get("responsibilities", [])
        })
        
    profile["work_history"] = clean_work_history
    
    if req.education:
        profile["education"] = req.education
        
    from datetime import datetime
    profile["version"] = profile.get("version", 1) + 1
    profile["last_updated"] = datetime.utcnow().isoformat() + "Z"
    
    _atomic_write_json(ARTIFACTS_DIR / "profile_master.json", profile)
    
    # If new skills provided, add them to skills_matrix.json
    if req.skills:
        skills_art = get_artifact("skills_matrix") or {"categories": {}}
        cats = skills_art.setdefault("categories", {})
        gen_list = cats.setdefault("core_technical", [])
        existing_skill_names = {s.get("name") for s in gen_list if isinstance(s, dict)}
        for sk in req.skills:
            if sk not in existing_skill_names:
                gen_list.append({"name": sk, "proficiency": "Advanced"})
        _atomic_write_json(ARTIFACTS_DIR / "skills_matrix.json", skills_art)
        
    # Recompile resumes for all tracks
    compiled_tracks = []
    for t in resume_service.get_available_tracks():
        try:
            resume_service.generate_tailored_pdf(t["slug"])
            compiled_tracks.append(t["slug"])
        except Exception as e:
            pass
            
    return {
        "status": "success",
        "message": "Career timeline confirmed and saved to Canonical Vault. Resumes recompiled.",
        "work_history_count": len(clean_work_history),
        "recompiled_tracks": compiled_tracks
    }

# -----------------------------------------------------------------------------
# CV Forge Interactive Studio Endpoints (100% Backwards Compatible with CV Forge)
# -----------------------------------------------------------------------------

cv_forge_router = APIRouter(prefix="/api/cv-forge", tags=["cv-forge"])

class CVForgeExportDocxRequest(BaseModel):
    documentName: Optional[str] = "Resume.docx"
    resumeData: Optional[dict] = None
    panes: Optional[list] = None

class CVForgeChatRequest(BaseModel):
    message: str
    resume_data: Optional[dict] = None

@cv_forge_router.post("/parse-resume")
async def api_cv_forge_parse_resume(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None)
):
    """
    Parses uploaded resume (PDF, DOCX, TXT, JSON) directly for CV Forge Interactive Studio
    and synchronizes the Canonical Artifact Vault.
    """
    import json
    extracted_text = ""
    doc_name = "Uploaded_Resume.pdf"
    
    if file:
        doc_name = file.filename or "Uploaded_Resume.pdf"
        content = await file.read()
        
        # If it's a JSON file
        if doc_name.lower().endswith(".json"):
            try:
                parsed_json = json.loads(content.decode("utf-8", errors="ignore"))
                if "resumeData" in parsed_json:
                    return {
                        "status": "success",
                        "documentName": doc_name.replace(".json", ".pdf"),
                        "resumeData": parsed_json["resumeData"],
                        "panes": parsed_json.get("panes")
                    }
                elif "candidateName" in parsed_json or "full_name" in parsed_json:
                    return {
                        "status": "success",
                        "documentName": doc_name.replace(".json", ".pdf"),
                        "resumeData": parsed_json
                    }
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid JSON schema: {e}")
                
        # Extract text from PDF, DOCX, TXT
        try:
            extracted_text = cv_extractor_service.extract_text_from_bytes(content, doc_name)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
            
    elif raw_text and raw_text.strip():
        extracted_text = raw_text.strip()
        doc_name = "Pasted_Resume.pdf"
        
    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="No readable text could be extracted from the file.")
        
    # Parse using cv_extractor_service
    parsed = cv_extractor_service.parse_cv_text(extracted_text)
    
    # Convert into CV Forge Studio's exact ResumeData format
    cand = parsed.get("candidate", {})
    work_hist = parsed.get("work_history", [])
    edu_list = parsed.get("education", [])
    proj_list = parsed.get("projects", [])
    skills_list = parsed.get("skills", [])
    
    work_experience = []
    for i, wh in enumerate(work_hist):
        work_experience.append({
            "id": f"work-{i+1}",
            "title": wh.get("role", "Job Title"),
            "company": wh.get("company", "Company"),
            "period": wh.get("period", "Recent"),
            "bullets": wh.get("responsibilities", [])
        })
        
    education = []
    for i, ed in enumerate(edu_list):
        education.append({
            "id": f"edu-{i+1}",
            "degree": ed.get("degree", "Degree"),
            "institution": ed.get("institution", "Institution"),
            "period": ed.get("period", "")
        })

    projects = []
    for i, pr in enumerate(proj_list):
        projects.append({
            "id": f"proj-{i+1}",
            "name": pr.get("name", "Project"),
            "period": pr.get("period", "Recent"),
            "description": pr.get("bullets", [""])[0] if pr.get("bullets") else "",
            "techStack": pr.get("tech_stack", "").split("•") if isinstance(pr.get("tech_stack"), str) else pr.get("tech_stack", [])
        })

    resume_data = {
        "candidateName": cand.get("name") or "Candidate Name",
        "title": cand.get("headline") or "Lead Systems Architect & Quantitative Systems Builder",
        "photoUrl": "",
        "phone": cand.get("phone") or "+1 (555) 000-0000",
        "email": cand.get("email") or "candidate@example.com",
        "location": cand.get("location") or "City, Country",
        "linkedin": cand.get("linkedin") or "linkedin.com/in/candidate",
        "experienceYears": "9+ Years Experience",
        "summaryTitle": "Executive Profile",
        "summarySubtitle": "High-throughput data platforms • L2/L3 operations • Process automation",
        "summaryParagraphs": [
            cand.get("experience_summary") or "Senior technology and data professional with 9+ years in application support, SQL/T-SQL, data analysis, production operations, and problem solving."
        ],
        "skills": skills_list or ["Python", "SQL / T-SQL", "Kafka", "Polars", "Pandas", "FastAPI", "React", "TypeScript", "Jira", "ITIL"],
        "whatIBring": [
            "Deep SQL capability combined with end-to-end application and data investigation.",
            "Builder mindset: independent capability of delivering working software and data systems.",
            "Production problem solving: investigate → isolate → communicate → fix → prevent."
        ],
        "languages": ["English (Fluent)", "Hindi (Fluent)", "Marathi", "Odia"],
        "workExperience": work_experience,
        "education": education,
        "certifications": [
            {"id": "cert-1", "name": "Data Analysis with Python", "issuer": "Free Code Camp", "year": "2022"},
            {"id": "cert-2", "name": "Scientific Computing Python", "issuer": "Free Code Camp", "year": "2021"},
            {"id": "cert-3", "name": "ITIL Incident & Problem Management", "issuer": "Enterprise Certified", "year": "2020"}
        ],
        "projects": projects
    }
    
    # Update profile_master.json directly to keep canonical vault in live sync!
    profile = get_artifact("profile_master") or {
        "version": 1,
        "candidate": {},
        "work_history": [],
        "education": []
    }
    profile["candidate"] = {
        "name": cand.get("name") or "Candidate Name",
        "headline": cand.get("headline") or "Senior analytics & technical leader with 9+ years experience.",
        "phone": cand.get("phone") or "+1 (555) 000-0000",
        "email": cand.get("email") or "candidate@example.com",
        "location": cand.get("location") or "City, Country",
        "linkedin": cand.get("linkedin") or "linkedin.com/in/candidate",
        "experience_summary": cand.get("experience_summary") or ""
    }
    profile["work_history"] = work_hist
    if edu_list:
        profile["education"] = edu_list
    from datetime import datetime
    profile["version"] = profile.get("version", 1) + 1
    profile["last_updated"] = datetime.utcnow().isoformat() + "Z"
    _atomic_write_json(ARTIFACTS_DIR / "profile_master.json", profile)

    return {
        "status": "success",
        "documentName": doc_name.replace(".json", ".pdf"),
        "resumeData": resume_data
    }

@cv_forge_router.post("/export-docx")
def api_cv_forge_export_docx(req: CVForgeExportDocxRequest):
    """Compiles and downloads an executive Word (.docx) document from CV Forge Studio."""
    data = req.resumeData or {}
    cand_name = (data.get("candidateName") or "Candidate").strip().replace(" ", "_")
    output_filename = f"{cand_name}_Resume.docx"
    output_path = RESUMES_DIR / output_filename
    
    resume_service.generate_docx(data, str(output_path))
    return FileResponse(
        path=str(output_path),
        filename=output_filename,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{output_filename}"'}
    )

@cv_forge_router.post("/auto-save-docx")
def api_cv_forge_auto_save_docx(req: CVForgeExportDocxRequest):
    """Auto-saves live resume edits from CV Forge Studio to disk."""
    data = req.resumeData or {}
    cand_name = (data.get("candidateName") or "Candidate").strip().replace(" ", "_")
    output_filename = f"{cand_name}_Resume.docx"
    output_path = RESUMES_DIR / output_filename
    
    resume_service.generate_docx(data, str(output_path))
    from datetime import datetime
    return {
        "status": "success",
        "message": "Auto-saved to Word (.docx)",
        "filename": output_filename,
        "saved_at": datetime.utcnow().isoformat() + "Z"
    }

@cv_forge_router.post("/export-word-pdf")
def api_cv_forge_export_word_pdf(req: CVForgeExportDocxRequest):
    """
    Compiles live resume from CV Forge Studio to Word .docx and converts it
    to native vector PDF using Microsoft Word COM automation.
    """
    data = req.resumeData or {}
    cand_name = (data.get("candidateName") or "Candidate").strip().replace(" ", "_")
    docx_filename = f"{cand_name}_Resume.docx"
    pdf_filename = f"{cand_name}_Resume.pdf"
    
    docx_path = str(RESUMES_DIR / docx_filename)
    pdf_path = str(RESUMES_DIR / pdf_filename)
    
    # 1. Generate docx
    resume_service.generate_docx(data, docx_path)
    # 2. Convert via Word COM
    resume_service.convert_docx_to_pdf(docx_path, pdf_path)
    
    return FileResponse(
        path=pdf_path,
        filename=pdf_filename,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{pdf_filename}"'}
    )

@cv_forge_router.post("/chat")
def api_cv_forge_chat(req: CVForgeChatRequest):
    """AI Counselor resume critique and bullet enhancement inside CV Forge Studio."""
    prompt = f"Provide expert executive resume critique or enhancements for this candidate. Question: {req.message}"
    try:
        from ..services.ai_service import ai_service
        reply = ai_service.get_response(session_id="cv_forge_session", user_message=req.message)
        return {"status": "success", "reply": reply}
    except Exception as e:
        return {"status": "success", "reply": f"Consider highlighting quantifiable metrics (e.g., ticket volume, % latency reduction, SLA uptime)."}

@cv_forge_router.get("/download-sample-docx")
def api_cv_forge_download_sample():
    """Returns sample blank executive Word (.docx) document."""
    tracks = resume_service.get_available_tracks()
    clean_slug = tracks[0]["slug"] if tracks else "technical_business_analyst"
    data = resume_service.assemble_tailored_resume_data(clean_slug)
    sample_path = str(RESUMES_DIR / "Sample_Executive_Resume.docx")
    resume_service.generate_docx(data, sample_path)
    return FileResponse(
        path=sample_path,
        filename="Sample_Executive_Resume.docx",
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

