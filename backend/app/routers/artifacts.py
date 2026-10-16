from fastapi import APIRouter, HTTPException, Header
from typing import Dict, Any, Optional
from ..services.artifact_service import get_artifact, get_all_artifacts

router = APIRouter(prefix="/api/artifacts", tags=["artifacts"])

@router.get("")
def list_artifacts(x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns all current canonical career artifacts for the specific user."""
    uid = (x_user_id or "user1").strip().lower()
    return get_all_artifacts(user_id=uid)

@router.get("/{name}")
def get_single_artifact(name: str, x_user_id: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Returns a specific artifact by name for the specific user."""
    allowed = ["career_story", "traits", "profile_master", "skills_matrix"]
    if name not in allowed:
        raise HTTPException(status_code=404, detail=f"Artifact {name} not found. Must be one of {allowed}")
    uid = (x_user_id or "user1").strip().lower()
    art = get_artifact(name, user_id=uid)
    if art is None:
        raise HTTPException(status_code=404, detail=f"Artifact {name} is empty or not created yet.")
    return art
