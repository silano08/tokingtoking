import os

from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt

from config import settings
from db.supabase_client import supabase
from middleware.auth import create_access_token, create_refresh_token, get_current_user_id
from models.user import LoginRequest, LoginResponse, TokenRefreshRequest, TokenResponse, UserInfo
from services.auth_service import get_user_info, login_with_toss

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login")
async def login(request: LoginRequest):
    try:
        result = await login_with_toss(request.authorization_code, request.referrer)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refresh")
async def refresh_token(request: TokenRefreshRequest):
    try:
        payload = jwt.decode(
            request.refresh_token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )
        new_access = create_access_token(user_id)
        new_refresh = create_refresh_token(user_id)
        return TokenResponse(access_token=new_access, refresh_token=new_refresh)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired or invalid",
        )


@router.post("/logout")
async def logout(user_id: str = Depends(get_current_user_id)):
    return {"message": "Logged out successfully"}


@router.get("/me")
async def me(user_id: str = Depends(get_current_user_id)):
    user = get_user_info(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Dev-only login (local testing) ──────────────────────────────
@router.post("/dev-login")
async def dev_login():
    """토스 로그인 없이 테스트 유저로 로그인 (개발 전용)"""
    if os.environ.get("ENVIRONMENT") == "production":
        raise HTTPException(status_code=404, detail="Not found")

    dev_key = "DEV_TEST_USER"
    existing = (
        supabase.table("users")
        .select("*")
        .eq("toss_user_key", dev_key)
        .execute()
    )

    if len(existing.data) == 0:
        result = (
            supabase.table("users")
            .insert({"toss_user_key": dev_key, "level": "intermediate"})
            .execute()
        )
        user = result.data[0]
        is_new_user = True
    else:
        user = existing.data[0]
        is_new_user = False

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


@router.patch("/dev-update")
async def dev_update(
    updates: dict,
    user_id: str = Depends(get_current_user_id),
):
    """테스트 유저 정보 수정 (개발 전용)"""
    if os.environ.get("ENVIRONMENT") == "production":
        raise HTTPException(status_code=404, detail="Not found")

    allowed = {"level", "is_premium", "streak_days", "total_sessions"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        raise HTTPException(status_code=400, detail="No valid fields")

    supabase.table("users").update(filtered).eq("id", user_id).execute()
    return get_user_info(user_id)
