from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.db import pool

router = APIRouter()


@router.get("/")
def index():
    return {
        "name": "CRUD API (FastAPI)",
        "routes": [
            "GET /health",
            "GET /items?limit=20&offset=0",
            "GET /items/{id}",
            "POST /items",
            "PUT /items/{id}",
            "DELETE /items/{id}",
            "GET /docs",
        ],
    }


@router.get("/health")
def health():
    try:
        with pool.connection() as conn:
            conn.execute("SELECT 1")
        return {"status": "ok"}
    except Exception:
        return JSONResponse({"error": "Database unavailable"}, status_code=503)
