import json
from fastapi import APIRouter, Request, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from ..services.ai_service import ai_service
from ..database import get_chat_history

from fastapi import APIRouter, Request, Query, UploadFile, File

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"
    is_voice: bool = False

class PolishRequest(BaseModel):
    text: str

@router.post("/polish")
async def polish_endpoint(req: PolishRequest):
    """
    Polishes phonetically misheard voice dictation text with Gemini,
    correcting technical terms, IT acronyms, and punctuation.
    """
    cleaned = ai_service.polish_dictation(req.text)
    return {"text": cleaned}

@router.post("")
async def chat_endpoint(req: ChatRequest):
    """
    Streaming chat endpoint using Server-Sent Events (SSE).
    Streams tokens and tool execution notifications in real-time.
    """
    def event_generator():
        for chunk in ai_service.stream_chat_response(
            session_id=req.session_id,
            user_message=req.message,
            is_voice=req.is_voice
        ):
            yield f"data: {json.dumps(chunk)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/history")
def history_endpoint(session_id: str = "default_session", limit: int = 50) -> List[Dict[str, Any]]:
    """Returns chat message history for the session."""
    return get_chat_history(session_id=session_id, limit=limit)
