import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from middleware.logging import LoggingMiddleware, setup_json_logging
from routers import auth, chat, history, iap, level_test, speaking, vocab

setup_json_logging()
logger = logging.getLogger("toking-api")

app = FastAPI(
    title="TokingToking API",
    description="AI 영어 어휘 학습 앱 - 앱인토스",
    version="0.1.0",
)

# Logging middleware (innermost = runs first)
app.add_middleware(LoggingMiddleware)

# CORS
origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(level_test.router)
app.include_router(vocab.router)
app.include_router(chat.router)
app.include_router(speaking.router)
app.include_router(iap.router)
app.include_router(history.router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."},
    )


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "toking-toking"}
