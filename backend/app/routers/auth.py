from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

router = APIRouter(prefix="/api/auth", tags=["auth"])

# 10 Test Accounts for Founder & Beta Testers
TEST_USERS_MAP: Dict[str, Dict[str, Any]] = {
    "user1": {"username": "user1", "name": "Beta Tester 1 (WFM Lead)", "role_track": "Workforce Management (WFM)"},
    "user2": {"username": "user2", "name": "Beta Tester 2 (HRBP Lead)", "role_track": "Human Resources & Talent Acquisition"},
    "user3": {"username": "user3", "name": "Beta Tester 3 (Strategy Consultant)", "role_track": "Management & Business Consulting"},
    "user4": {"username": "user4", "name": "Beta Tester 4 (App Support Lead)", "role_track": "Application Support & Operations"},
    "user5": {"username": "user5", "name": "Beta Tester 5 (Data & Analytics)", "role_track": "Data Engineering & Analytics"},
    "user6": {"username": "user6", "name": "Beta Tester 6 (General Track)", "role_track": "Open Career Track 6"},
    "user7": {"username": "user7", "name": "Beta Tester 7 (General Track)", "role_track": "Open Career Track 7"},
    "user8": {"username": "user8", "name": "Beta Tester 8 (General Track)", "role_track": "Open Career Track 8"},
    "user9": {"username": "user9", "name": "Beta Tester 9 (General Track)", "role_track": "Open Career Track 9"},
    "user10": {"username": "user10", "name": "Beta Tester 10 (General Track)", "role_track": "Open Career Track 10"},
}

# Add convenient aliases: test1..test10 and testuser1..testuser10
for i in range(1, 11):
    base_info = TEST_USERS_MAP[f"user{i}"]
    TEST_USERS_MAP[f"test{i}"] = {**base_info, "username": f"test{i}"}
    TEST_USERS_MAP[f"testuser{i}"] = {**base_info, "username": f"testuser{i}"}
    TEST_USERS_MAP[f"test_user_{i}"] = {**base_info, "username": f"test_user_{i}"}

SHARED_PASSWORD = "password1234"

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(req: LoginRequest) -> Dict[str, Any]:
    """Authenticates one of the 10 pre-configured beta tester accounts."""
    u = req.username.strip().lower()
    p = req.password.strip()

    if u in TEST_USERS_MAP and p == SHARED_PASSWORD:
        user_info = TEST_USERS_MAP[u]
        return {
            "status": "success",
            "token": f"aura_token_{u}",
            "user": user_info
        }
    
    raise HTTPException(
        status_code=401,
        detail="Invalid credentials. Use accounts user1 to user10 (or test1 to test10) with password: password1234"
    )

@router.get("/testers")
def list_testers() -> List[Dict[str, Any]]:
    """Returns the official 10 test accounts for quick 1-click login on the UI."""
    return [TEST_USERS_MAP[f"user{i}"] for i in range(1, 11)]

@router.get("/me")
def get_current_user(x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns current active user session info."""
    u = (x_user_id or "user1").strip().lower()
    return TEST_USERS_MAP.get(u, TEST_USERS_MAP["user1"])
