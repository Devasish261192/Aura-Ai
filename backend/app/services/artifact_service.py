import json
import os
import re
import logging
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from ..config import ARTIFACTS_DIR
from ..database import log_artifact_mutation

def _atomic_write_json(file_path: Path, data: Dict[str, Any]):
    """Writes JSON atomically using a temp file and rename to prevent corruption."""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", dir=file_path.parent, delete=False, encoding="utf-8") as tf:
        json.dump(data, tf, indent=2, ensure_ascii=False)
        temp_name = tf.name
    os.replace(temp_name, file_path)

def get_artifact(name: str) -> Optional[Dict[str, Any]]:
    target = ARTIFACTS_DIR / f"{name}.json"
    if not target.exists():
        return None
    try:
        with open(target, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading artifact {name}: {e}")
        return None

def get_all_artifacts() -> Dict[str, Any]:
    return {
        "career_story": get_artifact("career_story") or {},
        "traits": get_artifact("traits") or {},
        "profile_master": get_artifact("profile_master") or {},
        "skills_matrix": get_artifact("skills_matrix") or {}
    }

def add_or_update_career_story(
    title: str,
    company: str,
    role: str,
    situation: str,
    task: str,
    action: str,
    result: str,
    metrics: List[str],
    demonstrated_skills: List[str],
    applicable_profiles: List[str],
    period: str = "Recent",
    domain: str = "General",
    learnings: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Appends or updates a STARR narrative in career_story.json."""
    data = get_artifact("career_story") or {
        "version": 1,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "candidate_name": "",
        "stories": []
    }
    
    # Generate story ID if not matched
    story_id = f"STORY_{company.upper().replace(' ', '_')}_{len(data.get('stories', [])) + 1}"
    
    # Check if a story with similar title already exists
    updated = False
    for s in data.get("stories", []):
        if s.get("title", "").strip().lower() == title.strip().lower():
            s.update({
                "company": company,
                "role": role,
                "situation": situation,
                "task": task,
                "action": action,
                "result": result,
                "metrics": metrics,
                "learnings": learnings or s.get("learnings", []),
                "demonstrated_skills": demonstrated_skills,
                "applicable_profiles": applicable_profiles,
                "period": period,
                "domain": domain
            })
            story_id = s.get("id", story_id)
            updated = True
            break
            
    if not updated:
        new_story = {
            "id": story_id,
            "title": title,
            "company": company,
            "role": role,
            "period": period,
            "domain": domain,
            "situation": situation,
            "task": task,
            "action": action,
            "result": result,
            "metrics": metrics,
            "learnings": learnings or [],
            "demonstrated_skills": demonstrated_skills,
            "applicable_profiles": applicable_profiles
        }
        data["stories"].append(new_story)
        
    data["version"] = data.get("version", 1) + 1
    data["last_updated"] = datetime.utcnow().isoformat() + "Z"
    
    _atomic_write_json(ARTIFACTS_DIR / "career_story.json", data)
    log_artifact_mutation("career_story", "UPDATE" if updated else "INSERT", {"story_id": story_id, "title": title})
    
    return {
        "status": "success",
        "operation": "update" if updated else "create",
        "story_id": story_id,
        "title": title,
        "total_stories": len(data["stories"])
    }

def save_work_experience_entry(
    company: str,
    role: str,
    period: str = "Recent",
    location: str = "",
    experience_summary: str = "",
    core_responsibilities: Optional[List[str]] = None,
    candidate_name: Optional[str] = None,
    headline: Optional[str] = None
) -> Dict[str, Any]:
    """Appends or updates a work history entry and candidate info in profile_master.json."""
    data = get_artifact("profile_master") or {
        "version": 1,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "candidate": {
            "name": "",
            "headline": "",
            "phone": "",
            "email": "",
            "location": "",
            "linkedin": "",
            "experience_summary": ""
        },
        "work_history": [],
        "education": []
    }
    
    if candidate_name:
        data.setdefault("candidate", {})["name"] = candidate_name
    if headline:
        data.setdefault("candidate", {})["headline"] = headline
    if experience_summary:
        data.setdefault("candidate", {})["experience_summary"] = experience_summary

    updated = False
    for item in data.get("work_history", []):
        if item.get("company", "").strip().lower() == company.strip().lower():
            item["role"] = role
            if period:
                item["period"] = period
            if location:
                item["location"] = location
            if experience_summary:
                item["summary"] = experience_summary
            if core_responsibilities:
                existing_resp = set(item.get("responsibilities", []))
                for r in core_responsibilities:
                    if r not in existing_resp:
                        item.setdefault("responsibilities", []).append(r)
            updated = True
            break
            
    if not updated:
        data.setdefault("work_history", []).append({
            "company": company,
            "role": role,
            "period": period,
            "location": location,
            "summary": experience_summary,
            "responsibilities": core_responsibilities or []
        })
        
    data["version"] = data.get("version", 1) + 1
    data["last_updated"] = datetime.utcnow().isoformat() + "Z"
    
    _atomic_write_json(ARTIFACTS_DIR / "profile_master.json", data)
    log_artifact_mutation("profile_master", "UPDATE" if updated else "INSERT", {"company": company, "role": role})
    
    return {
        "status": "success",
        "operation": "update" if updated else "create",
        "company": company,
        "role": role,
        "work_history_count": len(data.get("work_history", []))
    }

def update_candidate_traits(
    personality_traits: Optional[List[str]] = None,
    core_competencies: Optional[List[str]] = None,
    career_archetype: Optional[str] = None,
    target_profiles: Optional[List[Dict[str, Any]]] = None,
    candidate_name: Optional[str] = None
) -> Dict[str, Any]:
    """Updates candidate traits, competencies, archetype, and target profiles in traits.json."""
    data = get_artifact("traits") or {
        "version": 1,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "candidate_name": "",
        "career_archetype": "",
        "personality_traits": [],
        "core_competencies": [],
        "target_profiles": []
    }
    
    if candidate_name:
        data["candidate_name"] = candidate_name
        
    if personality_traits:
        for pt in personality_traits:
            if pt not in data.get("personality_traits", []):
                data.setdefault("personality_traits", []).append(pt)
                
    if core_competencies:
        for cc in core_competencies:
            if cc not in data.get("core_competencies", []):
                data.setdefault("core_competencies", []).append(cc)
                
    if career_archetype:
        data["career_archetype"] = career_archetype
        
    if target_profiles:
        data["target_profiles"] = target_profiles
        
    data["version"] = data.get("version", 1) + 1
    data["last_updated"] = datetime.utcnow().isoformat() + "Z"
    
    _atomic_write_json(ARTIFACTS_DIR / "traits.json", data)
    log_artifact_mutation("traits", "UPDATE", {"traits_count": len(data.get("personality_traits", []))})
    
    return {"status": "success", "traits_version": data["version"]}

def add_skills_to_matrix(category: str, skills: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Adds or updates skills in the skills matrix under a category."""
    data = get_artifact("skills_matrix") or {
        "version": 1,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "categories": {}
    }
    
    cat_skills = data.setdefault("categories", {}).setdefault(category, [])
    existing_names = {s.get("name", "").lower(): s for s in cat_skills}
    
    for s in skills:
        s_name = s.get("name", "").strip()
        if not s_name:
            continue
        if s_name.lower() in existing_names:
            existing_names[s_name.lower()].update(s)
        else:
            cat_skills.append(s)
            
    data["version"] = data.get("version", 1) + 1
    data["last_updated"] = datetime.utcnow().isoformat() + "Z"
    
    _atomic_write_json(ARTIFACTS_DIR / "skills_matrix.json", data)
    log_artifact_mutation("skills_matrix", "UPDATE", {"category": category, "added": len(skills)})
    
    return {"status": "success", "category": category, "matrix_version": data["version"]}

def edit_existing_story_in_vault(
    story_id_or_title: str,
    incident_update: Optional[str] = None,
    action_update: Optional[str] = None,
    new_metrics: Optional[List[str]] = None,
    new_learnings: Optional[List[str]] = None,
    new_skills: Optional[List[str]] = None,
    refined_situation: Optional[str] = None,
    refined_task: Optional[str] = None,
    refined_result: Optional[str] = None
) -> Dict[str, Any]:
    """
    Finds an existing story in career_story.json by ID (e.g. STORY_1) or keyword in title/company,
    and updates/enriches it with new incidents, actions, metrics, or learnings.
    """
    data = get_artifact("career_story")
    if not data or not data.get("stories"):
        return {"status": "error", "message": "No stories found in career_story.json to edit."}
    
    query = story_id_or_title.strip().lower()
    matched_story = None
    
    # 1. Check exact ID or company/title substring
    for s in data.get("stories", []):
        s_id = s.get("id", "").lower()
        s_title = s.get("title", "").lower()
        s_company = s.get("company", "").lower()
        if query == s_id or query in s_title or query in s_company:
            matched_story = s
            break

    # 2. Check story index / number (e.g. 'story 1', 'story_1', 'story #1', '1')
    if not matched_story:
        num_match = re.search(r'(?:story\s*[_#]?\s*|^)(\d+)', query)
        if num_match:
            idx = int(num_match.group(1)) - 1
            if 0 <= idx < len(data["stories"]):
                matched_story = data["stories"][idx]

    # 3. Check 'last', 'latest', or fuzzy keyword
    if not matched_story:
        if "last" in query or "latest" in query or "recent" in query:
            matched_story = data["stories"][-1]
        else:
            for s in data["stories"]:
                if any(w in s.get("title", "").lower() for w in query.split() if len(w) > 3):
                    matched_story = s
                    break

    if not matched_story:
        return {"status": "error", "message": f"Story matching '{story_id_or_title}' not found in vault."}

    # Apply updates
    if incident_update or refined_situation:
        inc = incident_update or refined_situation
        matched_story["situation"] = f"{matched_story.get('situation', '')} [Incident Update: {inc}]".strip() if incident_update else inc
    if refined_task:
        matched_story["task"] = refined_task
    if action_update:
        matched_story["action"] = f"{matched_story.get('action', '')} [Action Update: {action_update}]".strip()
    if refined_result:
        matched_story["result"] = refined_result
    if new_metrics:
        for m in new_metrics:
            if m not in matched_story.get("metrics", []):
                matched_story.setdefault("metrics", []).append(m)
    if new_learnings:
        for l in new_learnings:
            if l not in matched_story.get("learnings", []):
                matched_story.setdefault("learnings", []).append(l)
    if new_skills:
        for sk in new_skills:
            if sk not in matched_story.get("demonstrated_skills", []):
                matched_story.setdefault("demonstrated_skills", []).append(sk)

    data["version"] = data.get("version", 1) + 1
    data["last_updated"] = datetime.utcnow().isoformat() + "Z"
    _atomic_write_json(ARTIFACTS_DIR / "career_story.json", data)
    log_artifact_mutation("career_story", "UPDATE", {"story_id": matched_story.get("id"), "title": matched_story.get("title")})

    return {
        "status": "success",
        "operation": "edit_story",
        "story_id": matched_story.get("id"),
        "title": matched_story.get("title"),
        "updated_metrics": matched_story.get("metrics", []),
        "updated_learnings": matched_story.get("learnings", [])
    }

def modify_cv_forge_resume_in_vault(
    track_slug: str = "technical_business_analyst",
    summary_revision: Optional[str] = None,
    bullet_points_to_add: Optional[List[str]] = None,
    skills_to_highlight: Optional[List[str]] = None,
    custom_instruction: Optional[str] = None
) -> Dict[str, Any]:
    """
    Modifies candidate's profile/resume summary, skills, or bullet points for a target track in CV Forge,
    and updates profile_master.json.
    """
    data = get_artifact("profile_master")
    if not data:
        return {"status": "error", "message": "profile_master.json not found."}

    if summary_revision:
        data.setdefault("candidate", {})["experience_summary"] = summary_revision
        data["candidate"]["headline"] = summary_revision[:90]

    if bullet_points_to_add and data.get("work_history"):
        latest_work = data["work_history"][0]
        for b in bullet_points_to_add:
            if b not in latest_work.get("responsibilities", []):
                latest_work.setdefault("responsibilities", []).append(b)

    data["version"] = data.get("version", 1) + 1
    data["last_updated"] = datetime.utcnow().isoformat() + "Z"
    _atomic_write_json(ARTIFACTS_DIR / "profile_master.json", data)

    try:
        from .resume_service import resume_service
        resume_service.generate_tailored_pdf(track_slug)
    except Exception as e:
        logger.warning(f"Resume regeneration notice: {e}")

    log_artifact_mutation("profile_master", "UPDATE", {"track_slug": track_slug, "instruction": custom_instruction})

    return {
        "status": "success",
        "operation": "modify_cv",
        "track_slug": track_slug,
        "summary": data.get("candidate", {}).get("experience_summary", "")[:120],
        "message": f"Updated CV Forge resume for track '{track_slug}' and re-compiled PDF."
    }

