from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from ..services.jobs_service import jobs_service

router = APIRouter(tags=["jobs"])

class FetchJobsRequest(BaseModel):
    location: Optional[str] = "Pune, India"
    query: Optional[str] = "Senior Data Analyst"

class MarkAppliedRequest(BaseModel):
    job_url: str
    job_title: Optional[str] = ""
    company: Optional[str] = ""

class TelegramCheckRequest(BaseModel):
    refresh: Optional[bool] = False

# ----------------- Market Jobs Endpoints -----------------

@router.get("/api/jobs/matched")
def get_matched_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1, le=50),
    location: str = Query("")
) -> Dict[str, Any]:
    """Retrieves paginated market jobs scored against candidate's profile."""
    data = jobs_service.get_matched_jobs(page=page, page_size=page_size, location=location)
    return {"status": "success", "data": data}

@router.post("/api/jobs/fetch-next-batch")
def fetch_next_job_batch(req: Optional[FetchJobsRequest] = None) -> Dict[str, Any]:
    """Searches live open roles via Google Jobs and network indexes, scores them and saves."""
    loc = req.location if req and req.location else "Pune, India"
    q = req.query if req and req.query else "Senior Data Analyst"
    try:
        data = jobs_service.fetch_next_job_batch(search_term=q, location=loc)
        return {"status": "success", "data": data, "message": f"Fetched fresh jobs for '{q}' in {loc}!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/jobs/applied")
def get_applied_jobs() -> Dict[str, Any]:
    """Returns list of all applied jobs."""
    applied = jobs_service.get_applied_jobs()
    return {"status": "success", "applied_jobs": applied}

@router.post("/api/jobs/mark-applied")
def mark_job_applied(req: MarkAppliedRequest) -> Dict[str, Any]:
    """Marks a specific job as applied."""
    return jobs_service.mark_job_applied(job_url=req.job_url, job_title=req.job_title, company=req.company)

@router.get("/api/jobs/cover-letter/{company}")
def get_cover_letter(company: str) -> Dict[str, Any]:
    """Retrieves tailored cover letter content for the given company."""
    content = jobs_service.get_cover_letter_content(company)
    if not content:
        raise HTTPException(status_code=404, detail=f"Cover letter for '{company}' not found.")
    return {"status": "success", "company": company, "content": content}

# ----------------- Telegram Referral Endpoints -----------------

@router.get("/api/telegram/referrals")
@router.get("/api/jobs/telegram")
def get_telegram_referrals() -> Dict[str, Any]:
    """Retrieves verified Telegram group referral posts with DM outreach pitches."""
    return jobs_service.get_telegram_referrals()

@router.post("/api/telegram/check-referrals")
@router.post("/api/jobs/telegram/refresh")
def check_telegram_referrals(req: Optional[TelegramCheckRequest] = None) -> Dict[str, Any]:
    """Scans/re-matches Telegram messages against candidate profile."""
    refresh_live = req.refresh if req else False
    return jobs_service.refresh_telegram_referrals(force_live_scrape=refresh_live)
