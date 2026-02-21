from pydantic import BaseModel


class LevelTestQuestion(BaseModel):
    id: str
    question_type: str
    question_text: str
    options: list[str] | None = None
    level: str
    order: int


class LevelTestQuestionsResponse(BaseModel):
    questions: list[LevelTestQuestion]
    total_count: int


class LevelTestAnswer(BaseModel):
    question_id: str
    answer: str


class LevelTestSubmitRequest(BaseModel):
    answers: list[LevelTestAnswer]


class LevelTestSubmitResponse(BaseModel):
    score: int
    total: int
    level_scores: dict[str, int]
    assigned_level: str
    message: str
