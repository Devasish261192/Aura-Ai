from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from ..services.jobs_service import jobs_service

router = APIRouter(tags=["jobs"])

class FetchJobsRequest(BaseModel):
    location: Optional[str] = "Pune, India"
    query: Optional[str] = ""

class MarkAppliedRequest(BaseModel):
    job_url: str
    job_title: Optional[str] = ""
    company: Optional[str] = ""

class ToggleAppliedRequest(BaseModel):
    job_url: str
    applied: bool
    job_title: Optional[str] = ""
    company: Optional[str] = ""

class TelegramCheckRequest(BaseModel):
    refresh: Optional[bool] = False

# ----------------- Market Jobs Endpoints -----------------

@router.get("/api/jobs/matched")
def get_matched_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1, le=50),
    location: str = Query(""),
    x_user_id: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """Retrieves paginated market jobs scored against candidate's profile."""
    uid = (x_user_id or "user1").strip().lower()
    data = jobs_service.get_matched_jobs(user_id=uid, page=page, page_size=page_size, location=location)
    return {"status": "success", "data": data}

@router.post("/api/jobs/fetch-next-batch")
def fetch_next_job_batch(
    req: Optional[FetchJobsRequest] = None,
    x_user_id: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """Searches live open roles via Google Jobs and network indexes, scores them and saves."""
    uid = (x_user_id or "user1").strip().lower()
    loc = req.location if req and req.location else "Pune, India"
    q = req.query if req and req.query else ""
    try:
        data = jobs_service.fetch_next_job_batch(user_id=uid, search_term=q, location=loc)
        return {"status": "success", "data": data, "message": f"Fetched fresh jobs for '{q or 'your domain'}' in {loc}!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/jobs/applied")
def get_applied_jobs(x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns list of all applied jobs."""
    uid = (x_user_id or "user1").strip().lower()
    applied = jobs_service.get_applied_jobs(user_id=uid)
    return {"status": "success", "applied_jobs": applied}

@router.post("/api/jobs/mark-applied")
def mark_job_applied(req: MarkAppliedRequest, x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Marks a specific job as applied."""
    uid = (x_user_id or "user1").strip().lower()
    return jobs_service.mark_job_applied(user_id=uid, job_url=req.job_url, job_title=req.job_title, company=req.company)

@router.post("/api/jobs/toggle-applied")
def toggle_job_applied(req: ToggleAppliedRequest, x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Toggles applied state for a job (applied: true/false)."""
    uid = (x_user_id or "user1").strip().lower()
    return jobs_service.toggle_job_applied(
        user_id=uid,
        job_url=req.job_url,
        applied=req.applied,
        job_title=req.job_title,
        company=req.company
    )

@router.get("/api/jobs/cover-letter/{company}")
def get_cover_letter(company: str, x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Retrieves tailored cover letter content for the given company."""
    uid = (x_user_id or "user1").strip().lower()
    content = jobs_service.get_cover_letter_content(user_id=uid, company=company)
    if not content:
        raise HTTPException(status_code=404, detail=f"Cover letter for '{company}' not found.")
    return {"status": "success", "company": company, "content": content}

# ----------------- Telegram Referral Endpoints -----------------

@router.get("/api/telegram/referrals")
@router.get("/api/jobs/telegram")
def get_telegram_referrals(x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Retrieves verified Telegram group referral posts with DM outreach pitches."""
    uid = (x_user_id or "user1").strip().lower()
    return jobs_service.get_telegram_referrals(user_id=uid)

@router.post("/api/telegram/check-referrals")
@router.post("/api/jobs/telegram/refresh")
def check_telegram_referrals(req: Optional[TelegramCheckRequest] = None, x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Scans/re-matches Telegram messages against candidate profile."""
    uid = (x_user_id or "user1").strip().lower()
    refresh_live = req.refresh if req else False
    return jobs_service.refresh_telegram_referrals(user_id=uid, force_live_scrape=refresh_live)
