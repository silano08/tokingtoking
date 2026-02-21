from fastapi import APIRouter, Depends

from middleware.auth import get_current_user_id
from models.session import LevelTestSubmitRequest
from services.level_test_service import get_test_questions, grade_and_assign_level

router = APIRouter(prefix="/api/level-test", tags=["level-test"])


@router.get("/questions")
async def get_questions(user_id: str = Depends(get_current_user_id)):
    questions = get_test_questions()
    return {"questions": questions, "total_count": len(questions)}


@router.post("/submit")
async def submit_test(
    request: LevelTestSubmitRequest,
    user_id: str = Depends(get_current_user_id),
):
    result = grade_and_assign_level(user_id, [a.model_dump() for a in request.answers])
    return result
