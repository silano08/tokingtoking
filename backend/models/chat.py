from pydantic import BaseModel


class SessionCreateRequest(BaseModel):
    mode: str = "chat"
    word_ids: list[str]


class SessionCreateResponse(BaseModel):
    session_id: str
    mode: str
    target_words: list[dict]
    initial_message: dict


class ChatMessageRequest(BaseModel):
    session_id: str
    content: str


class SpeakingMessageRequest(BaseModel):
    session_id: str
    transcribed_text: str
    audio_duration_ms: int = 0


class ChatMessageResponse(BaseModel):
    message: dict
    session_status: dict
    summary: dict | None = None
