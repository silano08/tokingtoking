from collections import defaultdict
from datetime import date

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

    today = date.today().isoformat()
    today_sessions = (
        supabase.table("study_sessions")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .gte("started_at", f"{today}T00:00:00")
        .execute()
    )

    return {
        "level": user.data["level"],
        "total_sessions": user.data["total_sessions"],
        "completed_sessions": completed_sessions.count or 0,
        "today_sessions": today_sessions.count or 0,
        "streak_days": user.data["streak_days"],
        "last_study_date": user.data["last_study_date"],
    }


@router.get("/word-history")
async def get_word_history(
    limit: int = Query(default=30, ge=1, le=90),
    user_id: str = Depends(get_current_user_id),
):
    """날짜별 학습 단어 기록 조회 (day1, day2... 형태)"""
    sessions = (
        supabase.table("study_sessions")
        .select("target_words, started_at, mode, is_completed")
        .eq("user_id", user_id)
        .eq("is_completed", True)
        .order("started_at", desc=True)
        .limit(100)
        .execute()
    )

    # 날짜별로 단어 ID 수집
    date_words: dict[str, set] = defaultdict(set)
    date_sessions: dict[str, int] = defaultdict(int)
    for session in sessions.data:
        day = session["started_at"][:10]  # YYYY-MM-DD
        for wid in session.get("target_words", []):
            date_words[day].add(wid)
        date_sessions[day] += 1

    # 모든 고유 단어 ID 수집
    all_word_ids = set()
    for wids in date_words.values():
        all_word_ids.update(wids)

    # 단어 정보 조회
    word_map: dict[str, dict] = {}
    if all_word_ids:
        words_result = (
            supabase.table("vocabularies")
            .select("id, word, pos, definition_ko")
            .in_("id", list(all_word_ids))
            .execute()
        )
        for w in words_result.data:
            word_map[w["id"]] = w

    # 날짜별 정리 (최신순)
    sorted_dates = sorted(date_words.keys(), reverse=True)[:limit]
    history = []
    for d in sorted_dates:
        words = [word_map[wid] for wid in date_words[d] if wid in word_map]
        words.sort(key=lambda w: w["word"])
        history.append({
            "date": d,
            "session_count": date_sessions[d],
            "words": words,
        })

    return {"history": history, "total_days": len(sorted_dates)}
