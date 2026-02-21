from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from middleware.premium import require_premium
from models.chat import SpeakingMessageRequest
from services.chat_service import send_message
from services.transcription_service import transcribe_and_process
from services.vocab_service import get_words_by_ids
from db.supabase_client import supabase

router = APIRouter(prefix="/api/speaking", tags=["speaking"])


@router.post("/message")
async def speaking_message(
    request: SpeakingMessageRequest,
    user_id: str = Depends(require_premium),
):
    """Text-based speaking message (fallback when audio upload not used)."""
    if not request.transcribed_text.strip():
        raise HTTPException(status_code=400, detail="Transcribed text cannot be empty")

    if len(request.transcribed_text) > 500:
        raise HTTPException(status_code=400, detail="Text too long (max 500 chars)")

    result = send_message(
        user_id, request.session_id, request.transcribed_text, mode="speaking"
    )
    return result


@router.post("/transcribe")
async def transcribe_and_respond(
    audio: UploadFile = File(...),
    session_id: str = Form(...),
    user_id: str = Depends(require_premium),
):
    """
    Audio-based speaking: Groq Whisper transcription + LLM post-processing + AI response.

    Pipeline (inspired by Freeflow):
    1. Receive audio blob from frontend
    2. Groq Whisper: fast transcription (<1 second)
    3. LLM post-processing: fix spelling with vocabulary context
    4. Send processed text to chat service for AI response
    """
    # Validate audio
    audio_data = await audio.read()
    if len(audio_data) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Audio file too large (max 10MB)")

    if len(audio_data) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file")

    # Get target words for vocabulary-aware post-processing
    session = (
        supabase.table("study_sessions")
        .select("target_words")
        .eq("id", session_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    words = get_words_by_ids(session.data["target_words"])
    target_word_names = [w["word"] for w in words]

    # Groq Whisper transcription + LLM post-processing
    transcription = await transcribe_and_process(
        audio_data,
        target_words=target_word_names,
        filename=audio.filename or "audio.webm",
    )

    processed_text = transcription["text"]
    if not processed_text.strip():
        raise HTTPException(status_code=400, detail="Could not transcribe audio")

    # Send to AI for response + feedback
    result = send_message(user_id, session_id, processed_text, mode="speaking")

    # Include transcription details in response
    result["transcription"] = {
        "raw": transcription["raw_transcript"],
        "processed": transcription["processed_transcript"],
    }

    return result
