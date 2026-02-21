from pydantic import BaseModel


class IAPVerifyRequest(BaseModel):
    order_id: str
    product_id: str


class IAPVerifyResponse(BaseModel):
    verified: bool
    subscription: dict | None = None


class SubscriptionStatusResponse(BaseModel):
    is_premium: bool
    subscription: dict | None = None
