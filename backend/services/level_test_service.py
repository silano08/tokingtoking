from db.supabase_client import supabase


def get_test_questions() -> list[dict]:
    questions = []
    order = 1

    for level in ["beginner", "intermediate", "advanced"]:
        result = (
            supabase.table("level_test_questions")
            .select("id, question_type, question_text, options, level, difficulty_score")
            .eq("level", level)
            .order("difficulty_score")
            .limit(5)
            .execute()
        )
        for q in result.data:
            q["order"] = order
            questions.append(q)
            order += 1

    return questions


def grade_and_assign_level(user_id: str, answers: list[dict]) -> dict:
    # 문제 정답 조회
    question_ids = [a["question_id"] for a in answers]
    result = (
        supabase.table("level_test_questions")
        .select("id, correct_answer, level")
        .in_("id", question_ids)
        .execute()
    )
    questions_map = {q["id"]: q for q in result.data}

    # 채점
    level_scores = {"beginner": 0, "intermediate": 0, "advanced": 0}
    total_correct = 0

    for answer in answers:
        question = questions_map.get(answer["question_id"])
        if question and answer["answer"] == question["correct_answer"]:
            level_scores[question["level"]] += 1
            total_correct += 1

    # 레벨 판정
    if level_scores["advanced"] >= 3:
        assigned_level = "advanced"
    elif level_scores["intermediate"] >= 3:
        assigned_level = "intermediate"
    else:
        assigned_level = "beginner"

    # 유저 레벨 업데이트
    supabase.table("users").update({"level": assigned_level}).eq(
        "id", user_id
    ).execute()

    level_messages = {
        "beginner": "기초 레벨로 배정되었습니다! 일상 영어부터 시작해요 💪",
        "intermediate": "중급 레벨로 배정되었습니다! 다양한 주제로 대화해봐요 📚",
        "advanced": "고급 레벨로 배정되었습니다! 심화 어휘로 도전해봐요 🚀",
    }

    return {
        "score": total_correct,
        "total": len(answers),
        "level_scores": level_scores,
        "assigned_level": assigned_level,
        "message": level_messages[assigned_level],
    }
