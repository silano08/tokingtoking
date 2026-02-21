from datetime import datetime, timedelta, timezone

from db.supabase_client import supabase
from services.toss_api_service import get_order_status


PRODUCT_DURATIONS = {
    "monthly_premium": timedelta(days=30),
    "yearly_premium": timedelta(days=365),
}


async def verify_and_activate(user_id: str, order_id: str, product_id: str) -> dict:
    # 유저의 토스 키 조회
    user = (
        supabase.table("users")
        .select("toss_user_key")
        .eq("id", user_id)
        .single()
        .execute()
    )

    # 앱인토스 IAP API로 주문 상태 확인
    order_status = await get_order_status(order_id, user.data["toss_user_key"])

    if order_status.get("status") not in ("PURCHASED", "PAYMENT_COMPLETED"):
        return {"verified": False, "subscription": None}

    # 구독 기간 계산
    duration = PRODUCT_DURATIONS.get(product_id, timedelta(days=30))
    now = datetime.now(timezone.utc)
    expires_at = now + duration

    # 구독 기록 저장
    supabase.table("subscriptions").insert(
        {
            "user_id": user_id,
            "order_id": order_id,
            "product_id": product_id,
            "status": "active",
            "expires_at": expires_at.isoformat(),
        }
    ).execute()

    # 유저 프리미엄 상태 업데이트
    supabase.table("users").update(
        {
            "is_premium": True,
            "premium_expires_at": expires_at.isoformat(),
        }
    ).eq("id", user_id).execute()

    return {
        "verified": True,
        "subscription": {
            "status": "active",
            "product_id": product_id,
            "expires_at": expires_at.isoformat(),
        },
    }


def get_subscription_status(user_id: str) -> dict:
    user = (
        supabase.table("users")
        .select("is_premium, premium_expires_at")
        .eq("id", user_id)
        .single()
        .execute()
    )

    if not user.data["is_premium"]:
        return {"is_premium": False, "subscription": None}

    active_sub = (
        supabase.table("subscriptions")
        .select("*")
        .eq("user_id", user_id)
        .eq("status", "active")
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )

    sub_data = active_sub.data[0] if active_sub.data else None
    return {"is_premium": True, "subscription": sub_data}
