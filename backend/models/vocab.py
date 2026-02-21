from pydantic import BaseModel


class VocabWord(BaseModel):
    id: str
    word: str
    pos: str
    definition_ko: str
    definition_en: str
    example_sentence: str
    pronunciation: str | None = None


class VocabListResponse(BaseModel):
    words: list[VocabWord]
