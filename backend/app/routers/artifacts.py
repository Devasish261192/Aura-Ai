from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..services.artifact_service import get_artifact, get_all_artifacts

router = APIRouter(prefix="/api/artifacts", tags=["artifacts"])

@router.get("")
def list_artifacts() -> Dict[str, Any]:
    """Returns all current canonical career artifacts."""
    return get_all_artifacts()

@router.get("/{name}")
def get_single_artifact(name: str) -> Dict[str, Any]:
    """Returns a specific artifact by name."""
    allowed = ["career_story", "traits", "profile_master", "skills_matrix"]
    if name not in allowed:
        raise HTTPException(status_code=404, detail=f"Artifact {name} not found. Must be one of {allowed}")
    art = get_artifact(name)
    if art is None:
        raise HTTPException(status_code=404, detail=f"Artifact {name} is empty or not created yet.")
    return art
