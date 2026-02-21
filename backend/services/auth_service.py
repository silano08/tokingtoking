from db.supabase_client import supabase
from middleware.auth import create_access_token, create_refresh_token
from services.toss_api_service import exchange_authorization_code, get_toss_user_info


async def login_with_toss(authorization_code: str, referrer: str) -> dict:
    # 1. 토스 API로 토큰 교환
    token_data = await exchange_authorization_code(authorization_code, referrer)
    toss_access_token = token_data["accessToken"]

    # 2. 토스 사용자 정보 조회
    user_info = await get_toss_user_info(toss_access_token)
    toss_user_key = user_info["userKey"]

    # 3. 내부 유저 조회 또는 생성
    existing = (
        supabase.table("users")
        .select("*")
        .eq("toss_user_key", toss_user_key)
        .execute()
    )

    is_new_user = len(existing.data) == 0

    if is_new_user:
        result = (
            supabase.table("users")
            .insert({"toss_user_key": toss_user_key})
            .execute()
        )
        user = result.data[0]
    else:
        user = existing.data[0]

    # 4. 내부 JWT 발급
    access_token = create_access_token(user["id"])
    refresh_token = create_refresh_token(user["id"])

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user["id"],
            "level": user["level"],
            "is_premium": user["is_premium"],
            "total_sessions": user["total_sessions"],
            "streak_days": user["streak_days"],
        },
        "is_new_user": is_new_user,
    }


def get_user_info(user_id: str) -> dict:
    result = (
        supabase.table("users")
        .select("id, level, is_premium, total_sessions, streak_days, last_study_date")
        .eq("id", user_id)
        .single()
        .execute()
    )
    return result.data
