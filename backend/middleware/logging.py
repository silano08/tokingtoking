import json
import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "service": "toking-api",
            "request_id": getattr(record, "request_id", "N/A"),
            "message": record.getMessage(),
        }
        if hasattr(record, "data"):
            log_record["data"] = record.data
        return json.dumps(log_record, ensure_ascii=False)


def setup_json_logging():
    handler = logging.StreamHandler()
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(logging.INFO)
    # Quiet noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


logger = logging.getLogger("toking-api")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get(
            "X-Request-ID", f"req_{uuid.uuid4().hex[:8]}"
        )
        request.state.request_id = request_id
        start_time = time.time()

        logger.info(
            "Request started",
            extra={
                "request_id": request_id,
                "data": {
                    "method": request.method,
                    "path": request.url.path,
                    "query": str(request.query_params) if request.query_params else None,
                },
            },
        )

        try:
            response = await call_next(request)
        except Exception as exc:
            duration = (time.time() - start_time) * 1000
            logger.error(
                f"Request failed: {exc}",
                extra={
                    "request_id": request_id,
                    "data": {
                        "method": request.method,
                        "path": request.url.path,
                        "duration_ms": round(duration, 2),
                        "error": str(exc),
                    },
                },
            )
            raise

        duration = (time.time() - start_time) * 1000
        log_fn = logger.warning if response.status_code >= 400 else logger.info
        log_fn(
            "Request completed",
            extra={
                "request_id": request_id,
                "data": {
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "duration_ms": round(duration, 2),
                },
            },
        )

        response.headers["X-Request-ID"] = request_id
        return response
