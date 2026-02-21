import json
from datetime import date, datetime, timezone
from pathlib import Path

from openai import OpenAI

from config import settings
from db.supabase_client import supabase
from services.vocab_service import get_words_by_ids

client = OpenAI(api_key=settings.openai_api_key)

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def _load_prompt(filename: str) -> str:
    return (PROMPTS_DIR / filename).read_text(encoding="utf-8")


def _build_system_prompt(
    mode: str, level: str, target_words: list[dict], words_used: dict
) -> str:
    template = _load_prompt(
        "speaking_system.txt" if mode == "speaking" else "chat_system.txt"
    )
    word_names = [w["word"] for w in target_words]
    used_list = [w for w, used in words_used.items() if used]

    return template.format(
        level=level,
        word1=word_names[0] if len(word_names) > 0 else "",
        word2=word_names[1] if len(word_names) > 1 else "",
        word3=word_names[2] if len(word_names) > 2 else "",
        used_words=", ".join(used_list) if used_list else "none",
    )


def create_session(user_id: str, mode: str, word_ids: list[str]) -> dict:
    words = get_words_by_ids(word_ids)
    words_used = {w["word"]: False for w in words}

    # 세션 생성
    session = (
        supabase.table("study_sessions")
        .insert(
            {
                "user_id": user_id,
                "mode": mode,
                "target_words": word_ids,
                "words_used": words_used,
            }
        )
        .execute()
    )
    session_id = session.data[0]["id"]

    # 유저 레벨 조회
    user = (
        supabase.table("users")
        .select("level")
        .eq("id", user_id)
        .single()
        .execute()
    )

    # AI 첫 메시지 생성
    system_prompt = _build_system_prompt(mode, user.data["level"], words, words_used)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": "Start the conversation. Set up a natural scenario.",
            },
        ],
        temperature=0.8,
        response_format={"type": "json_object"},
    )

    ai_response = json.loads(response.choices[0].message.content)

    # 첫 메시지 저장
    supabase.table("chat_messages").insert(
        {
            "session_id": session_id,
            "role": "assistant",
            "content": ai_response.get("message", ""),
            "word_usage_snapshot": words_used,
        }
    ).execute()

    return {
        "session_id": session_id,
        "mode": mode,
        "target_words": [
            {"id": w["id"], "word": w["word"], "definition_ko": w["definition_ko"]}
            for w in words
        ],
        "initial_message": {
            "role": "assistant",
            "content": ai_response.get("message", ""),
            "word_usage": words_used,
        },
    }


def send_message(user_id: str, session_id: str, content: str, mode: str = "chat") -> dict:
    # 세션 조회
    session = (
        supabase.table("study_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    session_data = session.data
    words_used = session_data["words_used"]

    # 세션의 단어 정보 조회
    words = get_words_by_ids(session_data["target_words"])

    # 유저 레벨 조회
    user = (
        supabase.table("users")
        .select("level")
        .eq("id", user_id)
        .single()
        .execute()
    )

    # 이전 메시지 조회
    prev_messages = (
        supabase.table("chat_messages")
        .select("role, content")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )

    # OpenAI 메시지 구성
    system_prompt = _build_system_prompt(mode, user.data["level"], words, words_used)
    messages = [{"role": "system", "content": system_prompt}]
    for msg in prev_messages.data:
        messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": content})

    # AI 응답
    model = "gpt-4o" if mode == "speaking" else "gpt-4o-mini"
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.8,
        response_format={"type": "json_object"},
    )

    ai_response = json.loads(response.choices[0].message.content)

    # 단어 사용 상태 업데이트 (누적)
    new_word_usage = ai_response.get("word_usage", {})
    for word, used in new_word_usage.items():
        if used:
            words_used[word] = True

    completed_count = sum(1 for v in words_used.values() if v)
    is_completed = completed_count == len(words_used)

    # 유저 메시지 저장
    supabase.table("chat_messages").insert(
        {
            "session_id": session_id,
            "role": "user",
            "content": content,
            "word_usage_snapshot": words_used,
        }
    ).execute()

    # AI 메시지 저장
    feedback = ai_response.get("feedback") if mode == "speaking" else None
    supabase.table("chat_messages").insert(
        {
            "session_id": session_id,
            "role": "assistant",
            "content": ai_response.get("message", ""),
            "feedback": feedback,
            "word_usage_snapshot": words_used,
        }
    ).execute()

    # 세션 상태 업데이트
    update_data = {"words_used": words_used}
    if is_completed:
        update_data["is_completed"] = True
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        _update_user_stats(user_id)

    supabase.table("study_sessions").update(update_data).eq(
        "id", session_id
    ).execute()

    result = {
        "message": {
            "role": "assistant",
            "content": ai_response.get("message", ""),
            "word_usage": words_used,
            "feedback": feedback,
            "hint": ai_response.get("hint"),
        },
        "session_status": {
            "words_used": words_used,
            "completed_count": completed_count,
            "is_completed": is_completed,
        },
    }

    if is_completed:
        result["summary"] = _generate_summary(session_id, session_data)

    return result


def get_session_detail(user_id: str, session_id: str) -> dict:
    session = (
        supabase.table("study_sessions")
        .select("*")
        .eq("id", session_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )

    messages = (
        supabase.table("chat_messages")
        .select("role, content, feedback, word_usage_snapshot, created_at")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )

    words = get_words_by_ids(session.data["target_words"])

    return {
        "session_id": session_id,
        "mode": session.data["mode"],
        "target_words": [
            {"id": w["id"], "word": w["word"], "definition_ko": w["definition_ko"]}
            for w in words
        ],
        "messages": [
            {
                "role": m["role"],
                "content": m["content"],
                "feedback": m.get("feedback"),
                "word_usage": m.get("word_usage_snapshot", {}),
            }
            for m in messages.data
        ],
        "session_status": {
            "words_used": session.data["words_used"],
            "completed_count": sum(
                1 for v in session.data["words_used"].values() if v
            ),
            "is_completed": session.data.get("is_completed", False),
        },
    }


def _update_user_stats(user_id: str):
    user = (
        supabase.table("users")
        .select("total_sessions, streak_days, last_study_date")
        .eq("id", user_id)
        .single()
        .execute()
    )
    user_data = user.data
    today = date.today()
    last_study = user_data.get("last_study_date")

    new_streak = user_data["streak_days"]
    if last_study:
        last_date = date.fromisoformat(last_study)
        if (today - last_date).days == 1:
            new_streak += 1
        elif (today - last_date).days > 1:
            new_streak = 1
    else:
        new_streak = 1

    supabase.table("users").update(
        {
            "total_sessions": user_data["total_sessions"] + 1,
            "streak_days": new_streak,
            "last_study_date": today.isoformat(),
        }
    ).eq("id", user_id).execute()


def _generate_summary(session_id: str, session_data: dict) -> dict:
    messages = (
        supabase.table("chat_messages")
        .select("role, content, created_at")
        .eq("session_id", session_id)
        .order("created_at")
        .execute()
    )

    user_messages = [m for m in messages.data if m["role"] == "user"]
    words = get_words_by_ids(session_data["target_words"])
    word_names = [w["word"] for w in words]

    word_usage_details = []
    for word_name in word_names:
        for msg in user_messages:
            if word_name.lower() in msg["content"].lower():
                word_usage_details.append(
                    {
                        "word": word_name,
                        "used_in": msg["content"][:100],
                        "feedback": "자연스럽게 사용했어요!",
                    }
                )
                break

    first_msg_time = messages.data[0]["created_at"] if messages.data else None
    last_msg_time = messages.data[-1]["created_at"] if messages.data else None
    duration = 0
    if first_msg_time and last_msg_time:
        t1 = datetime.fromisoformat(first_msg_time.replace("Z", "+00:00"))
        t2 = datetime.fromisoformat(last_msg_time.replace("Z", "+00:00"))
        duration = int((t2 - t1).total_seconds())

    return {
        "session_id": session_id,
        "duration_seconds": duration,
        "message_count": len(messages.data),
        "word_usage_details": word_usage_details,
    }
