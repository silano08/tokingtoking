from fastapi import APIRouter, Depends, Query

from db.supabase_client import supabase
from middleware.auth import get_current_user_id

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("/sessions")
async def get_sessions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=50),
    user_id: str = Depends(get_current_user_id),
):
    offset = (page - 1) * limit
    result = (
        supabase.table("study_sessions")
        .select("id, mode, words_used, is_completed, started_at, completed_at")
        .eq("user_id", user_id)
        .order("started_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"sessions": result.data, "page": page, "limit": limit}


@router.get("/stats")
async def get_stats(user_id: str = Depends(get_current_user_id)):
    user = (
        supabase.table("users")
        .select("total_sessions, streak_days, last_study_date, level")
        .eq("id", user_id)
        .single()
        .execute()
    )

    completed_sessions = (
        supabase.table("study_sessions")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("is_completed", True)
        .execute()
    )

    return {
        "level": user.data["level"],
        "total_sessions": user.data["total_sessions"],
        "completed_sessions": completed_sessions.count or 0,
        "streak_days": user.data["streak_days"],
        "last_study_date": user.data["last_study_date"],
    }
