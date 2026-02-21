from fastapi import APIRouter, Depends, Query

from middleware.auth import get_current_user_id
from services.vocab_service import get_random_words

router = APIRouter(prefix="/api/vocab", tags=["vocab"])


@router.get("/random")
async def random_words(
    count: int = Query(default=3, ge=1, le=5),
    user_id: str = Depends(get_current_user_id),
):
    words = get_random_words(user_id, count)
    return {"words": words}
