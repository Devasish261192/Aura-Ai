from typing import List, Dict, Any, Optional
from ..services.artifact_service import (
    add_or_update_career_story,
    save_work_experience_entry as mutate_work_experience,
    update_candidate_traits as mutate_traits,
    add_skills_to_matrix,
    get_all_artifacts,
    edit_existing_story_in_vault,
    modify_cv_forge_resume_in_vault
)

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
    """
    Saves or updates the candidate's profile, recent organization, role, and daily responsibilities in profile_master.json.
    Must be called when the candidate shares their current or recent organization, job title, and day-to-day responsibilities.
    """
    return mutate_work_experience(
        company=company,
        role=role,
        period=period,
        location=location,
        experience_summary=experience_summary,
        core_responsibilities=core_responsibilities,
        candidate_name=candidate_name,
        headline=headline
    )

def save_career_story_entry(
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
    domain: str = "Enterprise Operations",
    learnings: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Saves or updates a verified STARR / STAR-L career story into the candidate's canonical career_story.json artifact.
    Must be called whenever the candidate finishes detailing all 5 points of a story scenario:
    Situation, Plan/Task, Action/Execution, Result/Metrics, and Learnings/Retrospective.
    """
    return add_or_update_career_story(
        title=title,
        company=company,
        role=role,
        situation=situation,
        task=task,
        action=action,
        result=result,
        metrics=metrics,
        demonstrated_skills=demonstrated_skills,
        applicable_profiles=applicable_profiles,
        period=period,
        domain=domain,
        learnings=learnings
    )

def update_candidate_traits(
    personality_traits: Optional[List[str]] = None,
    core_competencies: Optional[List[str]] = None,
    career_archetype: Optional[str] = None,
    target_profiles: Optional[List[Dict[str, Any]]] = None,
    candidate_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Updates the candidate's professional archetype, personality traits, competencies, and discovered target profiles in traits.json.
    Call this when evaluating the user's work style, strengths, leadership patterns, or target roles.
    """
    return mutate_traits(
        personality_traits=personality_traits,
        core_competencies=core_competencies,
        career_archetype=career_archetype,
        target_profiles=target_profiles,
        candidate_name=candidate_name
    )

def add_skills(
    category: str,
    skills_list: List[str],
    level: str = "Advanced",
    applicable_profiles: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Categorizes and registers technical, functional, or leadership skills into skills_matrix.json.
    Category can be: 'databases_and_sql', 'application_support_and_operations', 'business_analysis_and_governance', 'data_analytics_and_programming', 'tools_and_platforms', or domain specific.
    """
    profiles = applicable_profiles or ["core"]
    skill_dicts = [{"name": s, "level": level, "profiles": profiles} for s in skills_list]
    return add_skills_to_matrix(category=category, skills=skill_dicts)

def get_current_career_artifacts() -> Dict[str, Any]:
    """
    Retrieves the entire active career vault state (stories, traits, profile, skills) to provide verified context.
    """
    return get_all_artifacts()

def edit_career_story(
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
    Edits, updates, or enriches an existing career story when the candidate remembers a new incident, new metric, or refined actions/learnings.
    story_id_or_title can be the story ID (e.g., 'STORY_EVOLENT_1') or a keyword from the story title/company (e.g., 'Evolent', 'Claims T-SQL', '130+ scripts').
    """
    return edit_existing_story_in_vault(
        story_id_or_title=story_id_or_title,
        incident_update=incident_update,
        action_update=action_update,
        new_metrics=new_metrics,
        new_learnings=new_learnings,
        new_skills=new_skills,
        refined_situation=refined_situation,
        refined_task=refined_task,
        refined_result=refined_result
    )

def modify_cv_forge_resume(
    track_slug: str = "custom",
    summary_revision: Optional[str] = None,
    bullet_points_to_add: Optional[List[str]] = None,
    skills_to_highlight: Optional[List[str]] = None,
    custom_instruction: Optional[str] = None
) -> Dict[str, Any]:
    """
    Modifies candidate's profile/resume summary, skills, or bullet points in CV Forge, and triggers clean PDF recompilation.
    track_slug can be any target track slug (e.g. 'operations', 'leadership_and_strategy', 'transformation_and_delivery', etc.).
    """
    return modify_cv_forge_resume_in_vault(
        track_slug=track_slug,
        summary_revision=summary_revision,
        bullet_points_to_add=bullet_points_to_add,
        skills_to_highlight=skills_to_highlight,
        custom_instruction=custom_instruction
    )

def search_live_jobs_serp(
    role_or_title: str,
    location: str = "India"
) -> Dict[str, Any]:
    """
    Searches live open job listings across India or a specific city using SerpAPI (Google Jobs).
    Each returned job includes the job title, company, location, application link, and a direct Google Maps URL to review the company location.
    If location is 'India' or empty, searches all over India (pan-India). Otherwise searches the specific city (e.g. 'Bengaluru', 'Mumbai', 'Pune', 'Delhi NCR').
    """
    from ..services.jobs_service import jobs_service
    from ..services.artifact_service import get_active_user
    uid = get_active_user() or "user1"
    return jobs_service.fetch_next_job_batch(user_id=uid, search_term=role_or_title, location=location)

def tailor_resume_to_job_description(
    job_description: str,
    target_role: Optional[str] = "custom"
) -> Dict[str, Any]:
    """
    Analyzes an arbitrary target Job Description (JD), matches required keywords and skills against the candidate's career vault,
    computes an ATS compliance score (e.g. 92%), and generates an ATS-compliant resume in DOCX and PDF formats.
    """
    from ..services.resume_service import resume_service
    from ..services.artifact_service import get_active_user
    uid = get_active_user() or "user1"
    return resume_service.tailor_resume_for_job_description(
        job_description=job_description,
        track_slug=target_role or "custom",
        user_id=uid
    )

# List of tool functions directly callable by Google GenAI
AURA_TOOLS = [
    save_work_experience_entry,
    save_career_story_entry,
    edit_career_story,
    modify_cv_forge_resume,
    update_candidate_traits,
    add_skills,
    get_current_career_artifacts,
    search_live_jobs_serp,
    tailor_resume_to_job_description
]

TOOL_DISPATCH_MAP = {
    "save_work_experience_entry": save_work_experience_entry,
    "save_career_story_entry": save_career_story_entry,
    "edit_career_story": edit_career_story,
    "modify_cv_forge_resume": modify_cv_forge_resume,
    "update_candidate_traits": update_candidate_traits,
    "add_skills": add_skills,
    "get_current_career_artifacts": get_current_career_artifacts,
    "search_live_jobs_serp": search_live_jobs_serp,
    "tailor_resume_to_job_description": tailor_resume_to_job_description
}
