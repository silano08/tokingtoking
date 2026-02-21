from fastapi import APIRouter, Depends

from middleware.auth import get_current_user_id
from models.subscription import IAPVerifyRequest
from services.iap_service import get_subscription_status, verify_and_activate

router = APIRouter(prefix="/api/iap", tags=["iap"])


@router.post("/verify")
async def verify_purchase(
    request: IAPVerifyRequest,
    user_id: str = Depends(get_current_user_id),
):
    result = await verify_and_activate(user_id, request.order_id, request.product_id)
    return result


@router.get("/subscription")
async def subscription_status(user_id: str = Depends(get_current_user_id)):
    return get_subscription_status(user_id)
