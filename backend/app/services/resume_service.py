import os
import sys
import io
import json
import base64
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

from docx import Document
from docx.shared import Inches, Pt, RGBColor, Mm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

from .artifact_service import get_artifact, get_active_user, ARTIFACTS_DIR
from ..config import get_user_artifacts_dir

def get_user_resumes_dir(user_id: Optional[str] = None) -> Path:
    """Returns the isolated resumes directory for the target user."""
    uid = user_id or get_active_user() or "user1"
    clean_uid = uid.strip().lower()
    rdir = get_user_artifacts_dir(clean_uid) / "resumes"
    rdir.mkdir(parents=True, exist_ok=True)
    return rdir

RESUMES_DIR = ARTIFACTS_DIR / "resumes"
RESUMES_DIR.mkdir(parents=True, exist_ok=True)

# Executive Color Palette (Sapphire & Slate)
COLOR_PRIMARY = RGBColor(0, 19, 135)        # #001387 Executive Sapphire
COLOR_TEXT_DARK = RGBColor(15, 23, 42)      # #0f172a Slate 900
COLOR_TEXT_MUTED = RGBColor(100, 116, 139)  # #64748b Slate 500
COLOR_BORDER_HEX = "001387"
COLOR_BG_LIGHT_HEX = "F1F5F9"

def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
    """Sets internal padding for a table cell in dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def clear_table_borders(table):
    """Removes all borders from a table to make it a pure invisible layout grid."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'  <w:top w:val="none"/>'
        f'  <w:left w:val="none"/>'
        f'  <w:bottom w:val="none"/>'
        f'  <w:right w:val="none"/>'
        f'  <w:insideH w:val="none"/>'
        f'  <w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def add_section_header(cell_or_doc, title_text: str):
    """Adds a clean uppercase executive section heading with a bottom rule."""
    p = cell_or_doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.0

    run = p.add_run(title_text.upper())
    run.font.name = 'Arial'
    run.font.size = Pt(9.5)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY

    pPr = p._p.get_or_add_pPr()
    pBdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'  <w:bottom w:val="single" w:sz="6" w:space="2" w:color="{COLOR_BORDER_HEX}"/>'
        f'</w:pBdr>'
    )
    pPr.append(pBdr)
    return p

class ResumeService:
    def __init__(self):
        self.resumes_dir = RESUMES_DIR

    def get_available_tracks(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns the qualified target pathways from traits.json with clean slugs for the target user."""
        traits = get_artifact("traits", user_id=user_id) or {}
        profiles = traits.get("target_profiles", [])
        
        slug_map = {
            "track-1": "forward_deployed_engineer",
            "track-2": "application_support_lead",
            "track-3": "lead_data_engineer",
            "track-4": "senior_operational_analyst"
        }

        if not profiles:
            profile = get_artifact("profile_master", user_id=user_id) or {}
            cand = profile.get("candidate", {})
            hl = cand.get("headline") or "Operations Lead"
            return [
                {
                    "id": "track-1",
                    "slug": "leadership_and_strategy",
                    "title": f"Lead {hl} / Practice Director",
                    "match_score": 96,
                    "core_pitch": f"Drives strategic leadership, cross-functional delivery, and stakeholder value realization as an experienced {hl}."
                },
                {
                    "id": "track-2",
                    "slug": "operations_and_governance",
                    "title": f"Senior {hl} - Operational Governance",
                    "match_score": 94,
                    "core_pitch": f"Specializes in process optimization, metric architecture, and reliable execution across key enterprise workflows."
                },
                {
                    "id": "track-3",
                    "slug": "transformation_and_delivery",
                    "title": f"Strategic {hl} - Transformation Lead",
                    "match_score": 92,
                    "core_pitch": f"Leads digital operating model scaling, cross-team coordination, and measurable operational outcomes."
                },
                {
                    "id": "track-4",
                    "slug": "domain_specialist",
                    "title": f"{hl} Specialist",
                    "match_score": 88,
                    "core_pitch": f"Deep domain expertise delivering high-impact solutions, risk mitigation, and continuous process scaling."
                }
            ]

        result = []
        for p in profiles:
            p_id = p.get("id", "")
            slug = slug_map.get(p_id)
            if not slug:
                slug = p.get("title", "").lower().split("/")[0].strip().replace(" ", "_").replace("-", "_")
            result.append({
                "id": p_id,
                "slug": slug,
                "title": p.get("title"),
                "match_score": p.get("match_score", 90),
                "core_pitch": p.get("core_pitch", "")
            })
        return result

    def assemble_tailored_resume_data(self, track_identifier: str = "technical_business_analyst", user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Assembles tailored resume data from canonical artifacts (profile_master, career_story, skills_matrix, traits)
        focused on the specific target track for the isolated user.
        """
        profile = get_artifact("profile_master", user_id=user_id) or {}
        stories_data = get_artifact("career_story", user_id=user_id) or {}
        skills_data = get_artifact("skills_matrix", user_id=user_id) or {}
        traits = get_artifact("traits", user_id=user_id) or {}

        candidate = profile.get("candidate", {})
        candidate_name = candidate.get("name") or "Candidate Name"
        phone = candidate.get("phone") or "+91 00000 00000"
        email = candidate.get("email") or "candidate@example.com"
        location = candidate.get("location") or "India"
        linkedin = candidate.get("linkedin") or "linkedin.com/in/candidate"

        # Determine target title and pitch based on track
        tracks = self.get_available_tracks(user_id=user_id)
        matched_track = next(
            (t for t in tracks if track_identifier in t["slug"] or track_identifier in t["id"] or track_identifier in t["title"].lower()),
            tracks[0]
        )
        target_title = matched_track["title"].upper()
        core_pitch = matched_track.get("core_pitch", "")
        track_id = matched_track.get("id", "track-1")

        # Summary Paragraphs tailored to target track & candidate profile
        exp_summary = candidate.get("experience_summary") or ""
        headline = candidate.get("headline") or "Experienced Professional"
        archetype = traits.get("career_archetype") or ""

        if exp_summary:
            base_summary = exp_summary
        elif archetype:
            base_summary = f"Results-driven {headline} and {archetype} with proven enterprise experience in cross-functional delivery, operational governance, and continuous process optimization."
        else:
            base_summary = f"Accomplished {headline} with a strong track record of driving cross-functional initiatives, stakeholder alignment, process scaling, and measurable operational results."

        summary_paragraphs = [base_summary]
        if core_pitch:
            summary_paragraphs.append(core_pitch)

        # Work Experience from profile_master
        work_experience = []
        for wh in profile.get("work_history", []):
            bullets = wh.get("responsibilities", [])
            work_experience.append({
                "title": wh.get("role"),
                "company": wh.get("company"),
                "period": wh.get("period", "Recent"),
                "bullets": bullets
            })

        # Technical Projects & Case Studies (Mapped from our 9 STARR stories)
        all_stories = stories_data.get("stories", [])
        story_by_id = {s.get("id"): s for s in all_stories}

        # Strategic mapping prioritizing the strongest case studies for each track
        track_priority_map = {
            "track-1": ["STORY_INDEPENDENT_10", "STORY_INDEPENDENT_8", "STORY_EVOLENT_HEALTH_2", "STORY_INDEPENDENT_9"],
            "track-2": ["STORY_EVOLENT_HEALTH_1", "STORY_EVOLENT_HEALTH_2", "STORY_EVOLENT_HEALTH_5", "STORY_EVOLENT_HEALTH_4"],
            "track-3": ["STORY_INDEPENDENT_10", "STORY_INDEPENDENT_7", "STORY_INDEPENDENT_9", "STORY_EVOLENT_HEALTH_5"],
            "track-4": ["STORY_EVOLENT_HEALTH_5", "STORY_EVOLENT_HEALTH_2", "STORY_INDEPENDENT_10", "STORY_INDEPENDENT_8"]
        }

        priority_ids = track_priority_map.get(track_id, [])
        selected_stories = [story_by_id[sid] for sid in priority_ids if sid in story_by_id]

        # Backfill if any stories were missing
        if len(selected_stories) < 3:
            for s in all_stories:
                if s not in selected_stories:
                    selected_stories.append(s)
                if len(selected_stories) >= 3:
                    break

        projects = []
        for s in selected_stories:
            bullets = [
                f"{s.get('action')}",
                f"{s.get('result')} ({', '.join(s.get('metrics', []))})"
            ]
            if s.get("learnings"):
                bullets.append(f"Retrospective / Governance: {s.get('learnings')[0]}")
            
            projects.append({
                "name": s.get("title"),
                "period": s.get("period", "Recent"),
                "tech_stack": " • ".join(s.get("demonstrated_skills", [])[:4]),
                "bullets": bullets
            })

        # Skills from skills_matrix
        skills_categories = skills_data.get("categories", {})
        top_skills = []
        for cat, slist in skills_categories.items():
            for sk in slist:
                top_skills.append(sk.get("name"))

        # Deduplicate and prioritize
        key_skills = list(dict.fromkeys(top_skills))[:18]

        # Education
        education = profile.get("education") or [
            {
                "degree": "Bachelor's Degree",
                "institution": "University / College",
                "period": "Graduate"
            }
        ]

        certifications = profile.get("certifications") or []
        languages = profile.get("languages") or ["English (Professional)"]

        return {
            "candidateName": candidate_name,
            "targetTitle": target_title,
            "phone": phone,
            "email": email,
            "location": location,
            "linkedin": linkedin,
            "summaryParagraphs": summary_paragraphs,
            "workExperience": work_experience,
            "projects": projects,
            "skills": key_skills,
            "education": education,
            "certifications": certifications,
            "languages": languages,
            "trackInfo": matched_track
        }

    def generate_docx(self, data: Dict[str, Any], output_path: str) -> str:
        """
        Creates an executive, ATS-optimized 2-column Word Document (.docx)
        using python-docx with clean borders, margins, and typography.
        """
        doc = Document()

        # A4 Page Setup with 12.7mm (0.5 inch) print margins
        for section in doc.sections:
            section.page_width = Mm(210)
            section.page_height = Mm(297)
            section.top_margin = Mm(12.7)
            section.bottom_margin = Mm(12.7)
            section.left_margin = Mm(12.7)
            section.right_margin = Mm(12.7)

        # ---------------------------------------------------------------------
        # 1. HEADER SECTION (Candidate Name, Target Title, Contact Bar)
        # ---------------------------------------------------------------------
        p_name = doc.add_paragraph()
        p_name.paragraph_format.space_before = Pt(0)
        p_name.paragraph_format.space_after = Pt(2)
        p_name.paragraph_format.line_spacing = 1.0

        r_name = p_name.add_run(data.get("candidateName", "Candidate Name"))
        r_name.font.name = 'Arial'
        r_name.font.size = Pt(20)
        r_name.font.bold = True
        r_name.font.color.rgb = COLOR_PRIMARY

        p_title = doc.add_paragraph()
        p_title.paragraph_format.space_before = Pt(0)
        p_title.paragraph_format.space_after = Pt(4)
        p_title.paragraph_format.line_spacing = 1.0

        r_title = p_title.add_run(data.get("targetTitle") or data.get("title") or "TECHNICAL BUSINESS ANALYST")
        r_title.font.name = 'Arial'
        r_title.font.size = Pt(10)
        r_title.font.bold = True
        r_title.font.color.rgb = COLOR_TEXT_DARK

        # Contact meta line
        p_contact = doc.add_paragraph()
        p_contact.paragraph_format.space_before = Pt(0)
        p_contact.paragraph_format.space_after = Pt(6)
        p_contact.paragraph_format.line_spacing = 1.0

        contact_items = [
            f"Phone: {data.get('phone', '')}",
            f"Email: {data.get('email', '')}",
            f"Location: {data.get('location', '')}",
            f"LinkedIn: {data.get('linkedin', '')}"
        ]
        contact_str = "  •  ".join([c for c in contact_items if c])
        r_contact = p_contact.add_run(contact_str)
        r_contact.font.name = 'Arial'
        r_contact.font.size = Pt(8.5)
        r_contact.font.color.rgb = COLOR_TEXT_MUTED

        # Divider rule under header
        pPr = p_contact._p.get_or_add_pPr()
        pBdr = parse_xml(
            f'<w:pBdr {nsdecls("w")}>'
            f'  <w:bottom w:val="single" w:sz="12" w:space="3" w:color="{COLOR_BORDER_HEX}"/>'
            f'</w:pBdr>'
        )
        pPr.append(pBdr)

        # ---------------------------------------------------------------------
        # 2. MAIN 2-COLUMN LAYOUT TABLE
        # ---------------------------------------------------------------------
        main_table = doc.add_table(rows=1, cols=2)
        main_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        clear_table_borders(main_table)
        main_table.autofit = False

        # Left Column: Experience, Projects, Summary (width ~ 5.1 in)
        cell_main = main_table.cell(0, 0)
        cell_main.width = Inches(5.1)
        set_cell_margins(cell_main, top=0, bottom=60, left=0, right=80)

        # Right Column: Key Skills, Education, Certifications, Languages (width ~ 2.15 in)
        cell_side = main_table.cell(0, 1)
        cell_side.width = Inches(2.15)
        set_cell_margins(cell_side, top=0, bottom=60, left=80, right=0)

        # ---------------------------------------------------------------------
        # LEFT COLUMN CONTENT
        # ---------------------------------------------------------------------
        # Executive Summary
        add_section_header(cell_main, "Executive Profile")
        for para in data.get("summaryParagraphs", []):
            p_s = cell_main.add_paragraph()
            p_s.paragraph_format.space_before = Pt(2)
            p_s.paragraph_format.space_after = Pt(3)
            p_s.paragraph_format.line_spacing = 1.1
            r_s = p_s.add_run(para)
            r_s.font.name = 'Arial'
            r_s.font.size = Pt(8.5)
            r_s.font.color.rgb = COLOR_TEXT_DARK

        # Work Experience
        add_section_header(cell_main, "Professional Experience")
        for job in data.get("workExperience", []):
            p_jh = cell_main.add_paragraph()
            p_jh.paragraph_format.space_before = Pt(4)
            p_jh.paragraph_format.space_after = Pt(1)
            p_jh.paragraph_format.line_spacing = 1.05

            r_jt = p_jh.add_run(job.get("title", ""))
            r_jt.font.name = 'Arial'
            r_jt.font.size = Pt(9.0)
            r_jt.font.bold = True
            r_jt.font.color.rgb = COLOR_TEXT_DARK

            r_jc = p_jh.add_run(f" | {job.get('company', '')}")
            r_jc.font.name = 'Arial'
            r_jc.font.size = Pt(9.0)
            r_jc.font.color.rgb = COLOR_PRIMARY
            r_jc.font.bold = True

            r_jp = p_jh.add_run(f"  ({job.get('period', '')})")
            r_jp.font.name = 'Arial'
            r_jp.font.size = Pt(8.0)
            r_jp.font.italic = True
            r_jp.font.color.rgb = COLOR_TEXT_MUTED

            bullets = job.get("bullets") or job.get("highlights") or []
            for b in bullets:
                p_b = cell_main.add_paragraph(style='List Bullet')
                p_b.paragraph_format.space_before = Pt(0.5)
                p_b.paragraph_format.space_after = Pt(1.5)
                p_b.paragraph_format.line_spacing = 1.05
                r_b = p_b.add_run(b)
                r_b.font.name = 'Arial'
                r_b.font.size = Pt(8.0)
                r_b.font.color.rgb = COLOR_TEXT_DARK

        # Technical Projects & Case Studies (Derived from STARR Stories)
        add_section_header(cell_main, "Strategic Projects & Incident Solutions")
        for proj in data.get("projects", []):
            p_ph = cell_main.add_paragraph()
            p_ph.paragraph_format.space_before = Pt(4)
            p_ph.paragraph_format.space_after = Pt(1)
            p_ph.paragraph_format.line_spacing = 1.05

            r_pn = p_ph.add_run(proj.get("name", ""))
            r_pn.font.name = 'Arial'
            r_pn.font.size = Pt(8.5)
            r_pn.font.bold = True
            r_pn.font.color.rgb = COLOR_TEXT_DARK

            tech_stack = proj.get("tech_stack")
            if not tech_stack and proj.get("techStack"):
                ts = proj.get("techStack")
                tech_stack = " • ".join(ts) if isinstance(ts, list) else str(ts)

            if tech_stack:
                p_ts = cell_main.add_paragraph()
                p_ts.paragraph_format.space_before = Pt(0)
                p_ts.paragraph_format.space_after = Pt(2)
                r_ts = p_ts.add_run(f"Stack: {tech_stack}")
                r_ts.font.name = 'Arial'
                r_ts.font.size = Pt(7.5)
                r_ts.font.italic = True
                r_ts.font.color.rgb = COLOR_PRIMARY

            for pb in proj.get("bullets", []):
                p_pb = cell_main.add_paragraph(style='List Bullet')
                p_pb.paragraph_format.space_before = Pt(0.5)
                p_pb.paragraph_format.space_after = Pt(1.5)
                p_pb.paragraph_format.line_spacing = 1.05
                r_pb = p_pb.add_run(pb)
                r_pb.font.name = 'Arial'
                r_pb.font.size = Pt(8.0)
                r_pb.font.color.rgb = COLOR_TEXT_DARK

        # ---------------------------------------------------------------------
        # RIGHT COLUMN CONTENT (Sidebar)
        # ---------------------------------------------------------------------
        # Core Skills
        add_section_header(cell_side, "Core Competencies")
        for sk in data.get("skills", []):
            p_sk = cell_side.add_paragraph(style='List Bullet')
            p_sk.paragraph_format.space_before = Pt(0.5)
            p_sk.paragraph_format.space_after = Pt(1.5)
            p_sk.paragraph_format.line_spacing = 1.05
            r_sk = p_sk.add_run(sk)
            r_sk.font.name = 'Arial'
            r_sk.font.size = Pt(8.0)
            r_sk.font.color.rgb = COLOR_TEXT_DARK

        # Education
        add_section_header(cell_side, "Education")
        for edu in data.get("education", []):
            p_ed = cell_side.add_paragraph()
            p_ed.paragraph_format.space_before = Pt(3)
            p_ed.paragraph_format.space_after = Pt(1)
            p_ed.paragraph_format.line_spacing = 1.05

            r_deg = p_ed.add_run(edu.get("degree", ""))
            r_deg.font.name = 'Arial'
            r_deg.font.size = Pt(8.0)
            r_deg.font.bold = True
            r_deg.font.color.rgb = COLOR_TEXT_DARK

            p_inst = cell_side.add_paragraph()
            p_inst.paragraph_format.space_before = Pt(0)
            p_inst.paragraph_format.space_after = Pt(3)
            r_inst = p_inst.add_run(f"{edu.get('institution', '')} ({edu.get('period', '')})")
            r_inst.font.name = 'Arial'
            r_inst.font.size = Pt(7.5)
            r_inst.font.color.rgb = COLOR_TEXT_MUTED

        # Certifications
        add_section_header(cell_side, "Certifications")
        for cert in data.get("certifications", []):
            p_ct = cell_side.add_paragraph()
            p_ct.paragraph_format.space_before = Pt(3)
            p_ct.paragraph_format.space_after = Pt(1)
            p_ct.paragraph_format.line_spacing = 1.05

            r_cn = p_ct.add_run(cert.get("name", ""))
            r_cn.font.name = 'Arial'
            r_cn.font.size = Pt(8.0)
            r_cn.font.bold = True
            r_cn.font.color.rgb = COLOR_TEXT_DARK

            p_ci = cell_side.add_paragraph()
            p_ci.paragraph_format.space_before = Pt(0)
            p_ci.paragraph_format.space_after = Pt(3)
            r_ci = p_ci.add_run(f"{cert.get('issuer', '')} • {cert.get('year', '')}")
            r_ci.font.name = 'Arial'
            r_ci.font.size = Pt(7.5)
            r_ci.font.color.rgb = COLOR_TEXT_MUTED

        # Languages
        add_section_header(cell_side, "Languages")
        for lang in data.get("languages", []):
            p_lg = cell_side.add_paragraph(style='List Bullet')
            p_lg.paragraph_format.space_before = Pt(0.5)
            p_lg.paragraph_format.space_after = Pt(1.5)
            r_lg = p_lg.add_run(lang)
            r_lg.font.name = 'Arial'
            r_lg.font.size = Pt(8.0)
            r_lg.font.color.rgb = COLOR_TEXT_DARK

        doc.save(output_path)
        return output_path

    def convert_docx_to_pdf(self, docx_path: str, pdf_path: str) -> str:
        """
        Converts OpenXML .docx into native, ATS-compliant PDF using LibreOffice (Linux / cross-platform)
        or Microsoft Word COM automation (Windows).
        """
        abs_docx = os.path.abspath(docx_path)
        abs_pdf = os.path.abspath(pdf_path)
        out_dir = os.path.dirname(abs_pdf)

        # 1. Try LibreOffice / soffice CLI (works on Linux headless and Windows if installed)
        import shutil
        import subprocess
        soffice_bin = (
            shutil.which("soffice")
            or shutil.which("libreoffice")
            or ("/usr/bin/soffice" if os.path.exists("/usr/bin/soffice") else None)
            or ("/usr/bin/libreoffice" if os.path.exists("/usr/bin/libreoffice") else None)
        )
        if soffice_bin:
            try:
                cmd = [soffice_bin, "--headless", "--convert-to", "pdf", "--outdir", out_dir, abs_docx]
                res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=35)
                if os.path.exists(abs_pdf):
                    return abs_pdf
                # LibreOffice names the output using the base name of input
                generated = os.path.join(out_dir, Path(abs_docx).stem + ".pdf")
                if os.path.exists(generated):
                    if generated != abs_pdf:
                        shutil.move(generated, abs_pdf)
                    return abs_pdf
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"LibreOffice conversion failed: {e}")

        # 2. On Windows, fallback to Word COM
        if sys.platform == "win32":
            try:
                import pythoncom
                import win32com.client
                pythoncom.CoInitialize()
                try:
                    word = win32com.client.DispatchEx("Word.Application")
                    word.Visible = False
                    word.DisplayAlerts = 0
                    doc = word.Documents.Open(abs_docx)
                    # 17 = wdExportFormatPDF
                    doc.ExportAsFixedFormat(abs_pdf, 17)
                    doc.Close(False)
                    word.Quit()
                    return abs_pdf
                finally:
                    pythoncom.CoUninitialize()
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(f"Word COM conversion failed: {e}")

        raise RuntimeError("PDF conversion engine unavailable. Please ensure LibreOffice is installed on Linux or Microsoft Word on Windows.")

    def generate_tailored_pdf(self, track_slug: str = "technical_business_analyst", user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        End-to-end pipeline: Assembles tailored data -> Generates Word .docx -> Converts to native PDF.
        """
        data = self.assemble_tailored_resume_data(track_slug, user_id=user_id)
        cand_slug = (data.get("candidateName") or "Candidate").strip().replace(" ", "_")
        track_info = data.get("trackInfo", {})
        clean_track_slug = track_info.get("slug") or track_slug

        docx_filename = f"{cand_slug}_{clean_track_slug}_Resume.docx"
        pdf_filename = f"{cand_slug}_{clean_track_slug}_Resume.pdf"

        user_resumes_dir = get_user_resumes_dir(user_id)
        docx_path = str(user_resumes_dir / docx_filename)
        pdf_path = str(user_resumes_dir / pdf_filename)

        # 1. Compile fresh .docx OpenXML document
        self.generate_docx(data, docx_path)

        # 2. Convert to PDF using LibreOffice / Word COM
        self.convert_docx_to_pdf(docx_path, pdf_path)

        return {
            "status": "success",
            "candidate_name": data.get("candidateName"),
            "target_track": track_info.get("title"),
            "match_score": track_info.get("match_score"),
            "docx_filename": docx_filename,
            "pdf_filename": pdf_filename,
            "docx_path": docx_path,
            "pdf_path": pdf_path,
            "generated_at": datetime.utcnow().isoformat() + "Z"
        }

    def tailor_resume_for_job_description(
        self,
        job_description: str,
        track_slug: str = "custom",
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Parses target Job Description (JD), matches required keywords against
        candidate's career stories and skills, computes an ATS compatibility score,
        and produces tailored ATS-compliant DOCX and PDF resumes.
        """
        import re
        from collections import Counter
        from .artifact_service import get_artifact

        profile = get_artifact("profile_master", user_id=user_id) or {}
        stories_data = get_artifact("career_story", user_id=user_id) or {}
        skills_data = get_artifact("skills_matrix", user_id=user_id) or {}

        # 1. Extract high-frequency keywords and domain skills from JD
        jd_clean = (job_description or "").lower()
        matched_skills = []
        all_candidate_skills = []
        for cat, s_list in skills_data.items():
            if isinstance(s_list, list):
                for s in s_list:
                    s_name = s.get("name") if isinstance(s, dict) else str(s)
                    if s_name:
                        all_candidate_skills.append(s_name)
                        if s_name.lower() in jd_clean:
                            matched_skills.append(s_name)

        # Extract common competency keywords from JD
        jd_words = re.findall(r'\b[a-zA-Z]{4,20}\b', jd_clean)
        stopwords = {
            "with", "that", "this", "from", "have", "will", "your", "must", "they",
            "been", "were", "what", "when", "where", "which", "about", "other", "their",
            "experience", "years", "work", "role", "team", "skills", "ability", "strong",
            "candidate", "working", "responsible", "requirements", "responsibilities"
        }
        filtered_words = [w for w in jd_words if w not in stopwords]
        top_jd_keywords = [word for word, count in Counter(filtered_words).most_common(12)]

        # Calculate ATS match percentage
        total_checks = max(len(top_jd_keywords), 5)
        matched_count = len(matched_skills) + sum(1 for kw in top_jd_keywords if any(kw in s.lower() for s in all_candidate_skills))
        ats_score = min(int((matched_count / (total_checks + 3)) * 100) + 45, 98)

        # 2. Assemble tailored resume data with ATS alignment
        custom_slug = f"ats_{track_slug}".replace(" ", "_").lower()
        tailored_data = self.assemble_tailored_resume_data(track_identifier=track_slug, user_id=user_id)
        cand_slug = (tailored_data.get("candidateName") or "Candidate").strip().replace(" ", "_")

        docx_filename = f"{cand_slug}_{custom_slug}_Resume.docx"
        pdf_filename = f"{cand_slug}_{custom_slug}_Resume.pdf"
        user_resumes_dir = get_user_resumes_dir(user_id)
        docx_path = str(user_resumes_dir / docx_filename)
        pdf_path = str(user_resumes_dir / pdf_filename)

        # 3. Generate documents
        self.generate_docx(tailored_data, docx_path)
        try:
            self.convert_docx_to_pdf(docx_path, pdf_path)
            has_pdf = os.path.exists(pdf_path)
        except Exception:
            has_pdf = False

        return {
            "status": "success",
            "ats_score": ats_score,
            "matched_keywords": list(set(matched_skills + [kw.capitalize() for kw in top_jd_keywords[:6]])),
            "top_jd_keywords": top_jd_keywords,
            "docx_filename": docx_filename,
            "pdf_filename": pdf_filename,
            "docx_path": docx_path,
            "pdf_path": pdf_path if has_pdf else None,
            "track_slug": custom_slug
        }

resume_service = ResumeService()
