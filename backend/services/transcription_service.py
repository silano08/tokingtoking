"""
Groq Whisper STT Service
Inspired by Freeflow (github.com/zachlatta/freeflow)

Pipeline: Audio → Groq Whisper (transcription) → LLM post-processing
- Groq Whisper Large v3 Turbo: 216x real-time speed, <1 second transcription
- LLM post-processing: context-aware correction with target vocabulary
"""

import httpx
from openai import OpenAI

from config import settings

# Groq client (OpenAI-compatible API)
groq_client = httpx.AsyncClient(
    base_url="https://api.groq.com/openai/v1",
    headers={"Authorization": f"Bearer {settings.groq_api_key}"},
    timeout=20.0,
)

openai_client = OpenAI(api_key=settings.openai_api_key)


async def transcribe_audio(audio_data: bytes, filename: str = "audio.webm") -> str:
    """
    Transcribe audio using Groq Whisper API.
    Returns raw transcription text.

    Groq Whisper Large v3 Turbo: $0.04/hour, 216x real-time speed
    """
    if not settings.groq_api_key:
        raise ValueError("GROQ_API_KEY is not configured")

    response = await groq_client.post(
        "/audio/transcriptions",
        files={"file": (filename, audio_data, "audio/webm")},
        data={
            "model": "whisper-large-v3-turbo",
            "language": "en",
            "response_format": "text",
        },
    )
    response.raise_for_status()
    return response.text.strip()


def post_process_transcript(
    raw_transcript: str,
    target_words: list[str],
    learning_context: str = "conversation practice",
) -> str:
    """
    LLM post-processing of raw transcript (Freeflow pattern).
    Fixes spelling/grammar while preserving target vocabulary exactly.

    Uses gpt-4o-mini for cost efficiency.
    """
    if not raw_transcript:
        return ""

    system_prompt = f"""You are a dictation post-processor for an English vocabulary learning app.

Your job:
1. Clean up the raw speech transcription
2. Fix minor grammar and punctuation issues
3. Preserve the student's intended meaning exactly
4. Do NOT add words the student didn't speak
5. Do NOT change the sentence structure significantly

CRITICAL - High-priority vocabulary (preserve exact spelling):
{', '.join(target_words)}

If the student attempted to use any of these vocabulary words, ensure they are spelled correctly in the output.

Output ONLY the cleaned transcript. No commentary, no explanations."""

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"LEARNING_CONTEXT: {learning_context}\nRAW_TRANSCRIPTION: {raw_transcript}",
            },
        ],
        temperature=0.0,
        max_tokens=500,
    )

    return response.choices[0].message.content.strip()


async def transcribe_and_process(
    audio_data: bytes,
    target_words: list[str],
    filename: str = "audio.webm",
) -> dict:
    """
    Full pipeline: Groq Whisper transcription + LLM post-processing.
    Returns both raw and processed transcripts.
    """
    # Stage 1: Fast transcription via Groq Whisper
    raw_transcript = await transcribe_audio(audio_data, filename)

    # Stage 2: LLM post-processing with vocabulary context
    processed_transcript = post_process_transcript(raw_transcript, target_words)

    return {
        "raw_transcript": raw_transcript,
        "processed_transcript": processed_transcript,
        "text": processed_transcript or raw_transcript,  # Fallback to raw if post-processing fails
    }
