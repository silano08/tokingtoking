from pydantic import BaseModel


class LoginRequest(BaseModel):
    authorization_code: str
    referrer: str = "DEFAULT"


class LoginResponse(BaseModel):
    access_token: str
    user: "UserInfo"
    is_new_user: bool


class UserInfo(BaseModel):
    id: str
    level: str
    is_premium: bool
    total_sessions: int
    streak_days: int


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
