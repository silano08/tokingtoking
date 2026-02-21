from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from config import settings
from db.supabase_client import supabase
from middleware.auth import get_current_user_id
from models.chat import ChatMessageRequest, SessionCreateRequest
from services.chat_service import create_session, get_session_detail, send_message

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _check_daily_limit(user_id: str):
    """무료 유저 일일 세션 제한 (3회/일)."""
    user = (
        supabase.table("users")
        .select("is_premium")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if user.data.get("is_premium"):
        return  # 프리미엄 유저는 제한 없음

    today = date.today().isoformat()
    sessions_today = (
        supabase.table("study_sessions")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("started_at", f"{today}T00:00:00")
        .execute()
    )
    if (sessions_today.count or 0) >= settings.free_daily_session_limit:
        raise HTTPException(
            status_code=429,
            detail=f"일일 무료 학습 횟수({settings.free_daily_session_limit}회)를 초과했습니다. Premium으로 업그레이드하세요!",
        )


@router.post("/session")
async def start_session(
    request: SessionCreateRequest,
    user_id: str = Depends(get_current_user_id),
):
    if len(request.word_ids) != 3:
        raise HTTPException(status_code=400, detail="Exactly 3 word IDs required")

    _check_daily_limit(user_id)
    result = create_session(user_id, request.mode, request.word_ids)
    return result


@router.get("/session/{session_id}")
async def get_session(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
):
    try:
        result = get_session_detail(user_id, session_id)
        return result
    except Exception:
        raise HTTPException(status_code=404, detail="Session not found")


@router.post("/message")
async def chat_message(
    request: ChatMessageRequest,
    user_id: str = Depends(get_current_user_id),
):
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty")

    if len(request.content) > 500:
        raise HTTPException(status_code=400, detail="Message too long (max 500 chars)")

    result = send_message(user_id, request.session_id, request.content, mode="chat")
    return result
