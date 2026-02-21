from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status

from db.supabase_client import supabase
from middleware.auth import get_current_user_id


def require_premium(user_id: str = Depends(get_current_user_id)) -> str:
    result = (
        supabase.table("users")
        .select("is_premium, premium_expires_at")
        .eq("id", user_id)
        .single()
        .execute()
    )
    user = result.data
    if not user or not user.get("is_premium"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "PREMIUM_REQUIRED",
                "message": "스피킹 학습은 프리미엄 구독이 필요합니다.",
                "action": "REDIRECT_SUBSCRIBE",
            },
        )

    expires_at = user.get("premium_expires_at")
    if expires_at:
        expire_dt = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if expire_dt < datetime.now(timezone.utc):
            supabase.table("users").update({"is_premium": False}).eq(
                "id", user_id
            ).execute()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "SUBSCRIPTION_EXPIRED",
                    "message": "구독이 만료되었습니다. 갱신해주세요.",
                    "action": "REDIRECT_SUBSCRIBE",
                },
            )

    return user_id
