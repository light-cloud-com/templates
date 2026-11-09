import os
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, Response
from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from pydantic import BaseModel, StringConstraints
from starlette.exceptions import HTTPException as StarletteHTTPException

# Light Cloud sets DB_HOST ("host" or "host:port"), DB_NAME, DB_USER and DB_PASSWORD.
# sslmode=require: TLS on, certificate not verified (the database's certificate is
# platform-internal). Set DB_SSLMODE=disable for a local database without TLS.
host, _, port = os.environ.get("DB_HOST", "localhost").partition(":")
pool = ConnectionPool(
    make_conninfo(
        host=host,
        port=port or "5432",
        dbname=os.environ.get("DB_NAME", "postgres"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ.get("DB_PASSWORD", ""),
        sslmode=os.environ.get("DB_SSLMODE", "require"),
    ),
    min_size=1,
    max_size=5,
    timeout=5,
    kwargs={"row_factory": dict_row},
    open=False,
)

COLUMNS = "id, name, description, created_at, updated_at"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Creates the table on start. If the database is unreachable the app does not start.
    pool.open(wait=True)
    with pool.connection() as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS items (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )"""
        )
    yield
    pool.close()


app = FastAPI(title="CRUD API", lifespan=lifespan)


class ItemIn(BaseModel):
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
    description: str | None = None


# Every error leaves as {"error": "..."}; a malformed id in the path is a 404.
@app.exception_handler(StarletteHTTPException)
def http_error(request, exc: StarletteHTTPException):
    return JSONResponse({"error": exc.detail}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
def validation_error(request, exc: RequestValidationError):
    errors = exc.errors()
    if any(e["loc"][0] == "path" for e in errors):
        return JSONResponse({"error": "Item not found"}, status_code=404)
    message = "; ".join(f"{'.'.join(map(str, e['loc'][1:])) or 'body'}: {e['msg']}" for e in errors)
    return JSONResponse({"error": message}, status_code=400)


def one_or_404(row):
    if row is None:
        raise HTTPException(404, "Item not found")
    return row


@app.get("/")
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


@app.get("/health")
def health():
    try:
        with pool.connection() as conn:
            conn.execute("SELECT 1")
        return {"status": "ok"}
    except Exception:
        return JSONResponse({"error": "Database unavailable"}, status_code=503)


@app.get("/items")
def list_items(limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0, le=2**53)):
    with pool.connection() as conn:
        return conn.execute(
            f"SELECT {COLUMNS} FROM items ORDER BY id LIMIT %s OFFSET %s", (limit, offset)
        ).fetchall()


@app.get("/items/{item_id}")
def get_item(item_id: int):
    with pool.connection() as conn:
        return one_or_404(
            conn.execute(f"SELECT {COLUMNS} FROM items WHERE id = %s", (item_id,)).fetchone()
        )


@app.post("/items", status_code=201)
def create_item(item: ItemIn):
    with pool.connection() as conn:
        return conn.execute(
            f"INSERT INTO items (name, description) VALUES (%s, %s) RETURNING {COLUMNS}",
            (item.name, item.description),
        ).fetchone()


@app.put("/items/{item_id}")
def update_item(item_id: int, item: ItemIn):
    with pool.connection() as conn:
        return one_or_404(
            conn.execute(
                f"""UPDATE items SET name = %s, description = %s, updated_at = now()
                WHERE id = %s RETURNING {COLUMNS}""",
                (item.name, item.description, item_id),
            ).fetchone()
        )


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    with pool.connection() as conn:
        if conn.execute("DELETE FROM items WHERE id = %s", (item_id,)).rowcount == 0:
            raise HTTPException(404, "Item not found")
    return Response(status_code=204)
