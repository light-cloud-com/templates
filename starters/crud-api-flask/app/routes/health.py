from flask import Blueprint

from app.db import pool
from app.errors import error

bp = Blueprint("health", __name__)


@bp.get("/")
def index():
    return {
        "name": "CRUD API (Flask)",
        "routes": [
            "GET /health",
            "GET /items?limit=20&offset=0",
            "GET /items/<id>",
            "POST /items",
            "PUT /items/<id>",
            "DELETE /items/<id>",
        ],
    }


@bp.get("/health")
def health():
    try:
        with pool.connection() as conn:
            conn.execute("SELECT 1")
        return {"status": "ok"}
    except Exception:
        return error("Database unavailable", 503)
