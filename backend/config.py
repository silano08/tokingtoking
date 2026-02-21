from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str = ""

    # OpenAI
    openai_api_key: str

    # Groq (Whisper STT - fast transcription)
    groq_api_key: str = ""

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 7

    # Apps in Toss
    toss_api_url: str = "https://apps-in-toss-api.toss.im"
    toss_pay_api_url: str = "https://pay-apps-in-toss-api.toss.im"
    toss_mtls_cert_path: str = "./certs/client.crt"
    toss_mtls_key_path: str = "./certs/client.key"

    # AES
    aes_decryption_key: str = ""

    # App
    free_daily_session_limit: int = 3
    cors_origins: str = "*"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
