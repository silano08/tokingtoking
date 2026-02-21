from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError, jwt

from config import settings
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
