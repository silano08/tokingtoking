"""Seed script to load vocabularies and level test questions into Supabase."""
import json
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.supabase_client import get_supabase


def load_json(path: str):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_vocabularies(supabase):
    data_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "data", "seed", "vocabularies.json"
    )
    words = load_json(data_path)

    # Upsert to avoid duplicates
    for word in words:
        supabase.table("vocabularies").upsert(
            word, on_conflict="word,level"
        ).execute()

    print(f"Seeded {len(words)} vocabulary words.")


def seed_level_test_questions(supabase):
    data_path = os.path.join(
        os.path.dirname(__file__), "..", "..", "data", "seed", "level_test_questions.json"
    )
    questions = load_json(data_path)

    for q in questions:
        supabase.table("level_test_questions").upsert(
            q, on_conflict="id"
        ).execute()

    print(f"Seeded {len(questions)} level test questions.")


def main():
    supabase = get_supabase()
    print("Starting seed...")
    seed_vocabularies(supabase)
    seed_level_test_questions(supabase)
    print("Seed completed!")


if __name__ == "__main__":
    main()
