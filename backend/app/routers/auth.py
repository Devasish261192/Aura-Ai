import json
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from ..config import get_user_artifacts_dir

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Initial Seed configurations for known beta tracks
SEED_TESTERS: Dict[str, Dict[str, Any]] = {
    "user1": {
        "name": "Tester 1",
        "default_role": "Workforce Management (WFM)",
        "default_badge": "WFM / RTA",
        "color": "border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
    },
    "user2": {
        "name": "Tester 2",
        "default_role": "Human Resources & Talent Acquisition",
        "default_badge": "HR / Talent",
        "color": "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
    },
    "user3": {
        "name": "Tester 3",
        "default_role": "Management & Business Consulting",
        "default_badge": "Consulting",
        "color": "border-purple-500/40 bg-purple-950/40 text-purple-300"
    },
    "user4": {
        "name": "Tester 4",
        "default_role": "Application Support & Operations",
        "default_badge": "App Support",
        "color": "border-blue-500/40 bg-blue-950/40 text-blue-300"
    },
    "user5": {
        "name": "Tester 5",
        "default_role": "Data Engineering & Analytics",
        "default_badge": "Data Analytics",
        "color": "border-amber-500/40 bg-amber-950/40 text-amber-300"
    }
}

SHARED_PASSWORD = "password1234"

def evaluate_tester_profile(username: str) -> Dict[str, Any]:
    """Dynamically reads the tester's artifact profile to check if they have provided a role or if the slot is open."""
    u = username.strip().lower()
    num_str = "".join(c for c in u if c.isdigit())
    num = int(num_str) if num_str else 1
    canonical_user = f"user{num}"

    artifacts_dir = get_user_artifacts_dir(canonical_user)
    profile_file = artifacts_dir / "profile_master.json"

    candidate_name = ""
    latest_role = ""
    company = ""
    is_customized = False

    if profile_file.exists():
        try:
            with open(profile_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            candidate = data.get("candidate", {}) or {}
            candidate_name = candidate.get("name", "").strip()
            headline = candidate.get("headline", "").strip()

            work_history = data.get("work_history", []) or []
            if work_history and isinstance(work_history, list) and len(work_history) > 0:
                for wh in work_history:
                    if isinstance(wh, dict) and wh.get("role"):
                        latest_role = wh.get("role", "").strip()
                        company = wh.get("company", "").strip()
                        break

            if not latest_role and headline:
                latest_role = headline

            if latest_role or candidate_name:
                is_customized = True
        except Exception:
            pass

    seed = SEED_TESTERS.get(canonical_user)

    if is_customized:
        display_role = f"{latest_role} ({company})" if company else latest_role
        badge = (latest_role[:14] + "..") if len(latest_role) > 14 else latest_role
        status = "ASSIGNED"
        color = "border-sky-500/40 bg-sky-950/40 text-sky-300"
    elif seed:
        display_role = seed["default_role"]
        badge = seed["default_badge"]
        status = "ASSIGNED"
        color = seed.get("color", "border-cyan-500/40 bg-cyan-950/40 text-cyan-300")
    else:
        # user6 to user20 initially open / available
        display_role = "Open Career Track · Available Slot"
        badge = "OPEN"
        status = "OPEN"
        color = "border-emerald-500/30 bg-emerald-950/20 text-emerald-400"

    return {
        "username": canonical_user,
        "name": f"Tester {num}",
        "candidate_name": candidate_name,
        "role_track": display_role,
        "status": status,
        "is_assigned": status == "ASSIGNED",
        "badge": badge,
        "latest_role": latest_role or (seed["default_role"] if seed else ""),
        "company": company,
        "color": color
    }

class LoginRequest(BaseModel):
    username: str
    password: str

class UpdateRoleRequest(BaseModel):
    role: str
    company: Optional[str] = ""
    candidate_name: Optional[str] = ""
    experience_summary: Optional[str] = ""

def is_valid_test_user(u: str) -> bool:
    """Checks if username matches user1..user20, test1..test20, testuser1..testuser20."""
    num_str = "".join(c for c in u if c.isdigit())
    if not num_str:
        return False
    try:
        num = int(num_str)
        return 1 <= num <= 20
    except ValueError:
        return False

@router.post("/login")
def login(req: LoginRequest) -> Dict[str, Any]:
    """Authenticates one of the 20 pre-configured beta tester accounts."""
    u = req.username.strip().lower()
    p = req.password.strip()

    if is_valid_test_user(u) and p == SHARED_PASSWORD:
        user_info = evaluate_tester_profile(u)
        return {
            "status": "success",
            "token": f"aura_token_{user_info['username']}",
            "user": user_info
        }

    raise HTTPException(
        status_code=401,
        detail="Invalid credentials. Use accounts user1 to user20 with password: password1234"
    )

@router.get("/testers")
def list_testers() -> List[Dict[str, Any]]:
    """Returns all 20 test accounts with dynamic real-time role assignment and OPEN/ASSIGNED status."""
    return [evaluate_tester_profile(f"user{i}") for i in range(1, 21)]

@router.get("/me")
def get_current_user(x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns current active user session info evaluated dynamically."""
    u = (x_user_id or "user1").strip().lower()
    return evaluate_tester_profile(u)

@router.post("/update-role")
def update_tester_role(req: UpdateRoleRequest, x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Updates a tester's latest job role, marking their slot as ASSIGNED."""
    u = (x_user_id or "user1").strip().lower()
    num_str = "".join(c for c in u if c.isdigit())
    num = int(num_str) if num_str else 1
    canonical_user = f"user{num}"

    artifacts_dir = get_user_artifacts_dir(canonical_user)
    profile_file = artifacts_dir / "profile_master.json"

    data = {
        "version": 1,
        "last_updated": datetime.utcnow().isoformat() + "Z",
        "candidate": {
            "name": req.candidate_name or "",
            "headline": req.role,
            "experience_summary": req.experience_summary or (f"{req.role} at {req.company}" if req.company else req.role)
        },
        "work_history": [
            {
                "company": req.company or "Current Organization",
                "role": req.role,
                "period": "Recent",
                "summary": req.experience_summary or "",
                "responsibilities": []
            }
        ],
        "education": []
    }

    if profile_file.exists():
        try:
            with open(profile_file, "r", encoding="utf-8") as f:
                existing = json.load(f)
            cand = existing.setdefault("candidate", {})
            cand["headline"] = req.role
            if req.candidate_name:
                cand["name"] = req.candidate_name
            if req.experience_summary:
                cand["experience_summary"] = req.experience_summary

            wh_list = existing.setdefault("work_history", [])
            if wh_list and isinstance(wh_list, list) and len(wh_list) > 0:
                wh_list[0]["role"] = req.role
                if req.company:
                    wh_list[0]["company"] = req.company
            else:
                wh_list.insert(0, {
                    "company": req.company or "Current Organization",
                    "role": req.role,
                    "period": "Recent",
                    "summary": req.experience_summary or "",
                    "responsibilities": []
                })

            existing["version"] = existing.get("version", 1) + 1
            existing["last_updated"] = datetime.utcnow().isoformat() + "Z"
            data = existing
        except Exception:
            pass

    # Atomic write
    temp_file = profile_file.with_suffix(".tmp")
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    temp_file.replace(profile_file)

    updated_profile = evaluate_tester_profile(canonical_user)
    return {
        "status": "success",
        "message": f"Tester account {canonical_user} successfully assigned to role: {req.role}",
        "user": updated_profile
    }
