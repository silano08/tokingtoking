from db.supabase_client import supabase


def get_random_words(user_id: str, count: int = 3) -> list[dict]:
    # 유저 레벨 조회
    user = (
        supabase.table("users")
        .select("level")
        .eq("id", user_id)
        .single()
        .execute()
    )
    level = user.data["level"]

    # 최근 학습한 단어 ID 조회 (최근 10세션)
    recent_sessions = (
        supabase.table("study_sessions")
        .select("target_words")
        .eq("user_id", user_id)
        .order("started_at", desc=True)
        .limit(10)
        .execute()
    )
    recent_word_ids = set()
    for session in recent_sessions.data:
        for word_id in session.get("target_words", []):
            recent_word_ids.add(word_id)

    # 레벨에 맞는 단어 조회 (최근 학습 단어 제외)
    query = (
        supabase.table("vocabularies")
        .select("id, word, pos, definition_ko, definition_en, example_sentence, pronunciation")
        .eq("level", level)
    )

    result = query.execute()
    available_words = [w for w in result.data if w["id"] not in recent_word_ids]

    # 부족하면 최근 단어도 포함
    if len(available_words) < count:
        available_words = result.data

    # 랜덤 선택
    import random

    selected = random.sample(available_words, min(count, len(available_words)))
    return selected


def get_words_by_ids(word_ids: list[str]) -> list[dict]:
    result = (
        supabase.table("vocabularies")
        .select("id, word, pos, definition_ko, definition_en, example_sentence, pronunciation")
        .in_("id", word_ids)
        .execute()
    )
    return result.data
