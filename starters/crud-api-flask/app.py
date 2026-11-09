import os
from datetime import datetime

from flask import Flask, jsonify, request
from flask.json.provider import DefaultJSONProvider
from psycopg.conninfo import make_conninfo
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from werkzeug.exceptions import HTTPException

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

COLUMNS = "id, name, description, created_at, updated_at"


class JSONProvider(DefaultJSONProvider):
    # ISO 8601 timestamps instead of Flask's default HTTP-date format.
    @staticmethod
    def default(o):
        return o.isoformat() if isinstance(o, datetime) else DefaultJSONProvider.default(o)


app = Flask(__name__)
app.json = JSONProvider(app)


def error(message, status):
    return jsonify(error=message), status


@app.errorhandler(HTTPException)
def http_error(e):
    return error(e.name, e.code)


def parse_item():
    """Returns ((name, description), None) or (None, error message) for the request body."""
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return None, "Send a JSON object"
    name = body.get("name")
    name = name.strip() if isinstance(name, str) else ""
    description = body.get("description")
    if not 1 <= len(name) <= 200:
        return None, "name is required and must be 1 to 200 characters"
    if description is not None and not isinstance(description, str):
        return None, "description must be a string"
    return (name, description), None


def int_arg(key, default, low, high):
    value = request.args.get(key)
    if value is None:
        return default
    return int(value) if value.isdigit() and low <= int(value) <= high else None


@app.get("/")
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


@app.get("/health")
def health():
    try:
        with pool.connection() as conn:
            conn.execute("SELECT 1")
        return {"status": "ok"}
    except Exception:
        return error("Database unavailable", 503)


@app.get("/items")
def list_items():
    limit = int_arg("limit", 20, 1, 100)
    offset = int_arg("offset", 0, 0, 2**53)
    if limit is None or offset is None:
        return error("limit must be 1 to 100 and offset 0 or more", 400)
    with pool.connection() as conn:
        rows = conn.execute(
            f"SELECT {COLUMNS} FROM items ORDER BY id LIMIT %s OFFSET %s", (limit, offset)
        ).fetchall()
    return jsonify(rows)


@app.get("/items/<int:item_id>")
def get_item(item_id):
    with pool.connection() as conn:
        row = conn.execute(f"SELECT {COLUMNS} FROM items WHERE id = %s", (item_id,)).fetchone()
    return row or error("Item not found", 404)


@app.post("/items")
def create_item():
    item, message = parse_item()
    if message:
        return error(message, 400)
    with pool.connection() as conn:
        row = conn.execute(
            f"INSERT INTO items (name, description) VALUES (%s, %s) RETURNING {COLUMNS}", item
        ).fetchone()
    return row, 201


@app.put("/items/<int:item_id>")
def update_item(item_id):
    item, message = parse_item()
    if message:
        return error(message, 400)
    with pool.connection() as conn:
        row = conn.execute(
            f"""UPDATE items SET name = %s, description = %s, updated_at = now()
            WHERE id = %s RETURNING {COLUMNS}""",
            (*item, item_id),
        ).fetchone()
    return row or error("Item not found", 404)


@app.delete("/items/<int:item_id>")
def delete_item(item_id):
    with pool.connection() as conn:
        deleted = conn.execute("DELETE FROM items WHERE id = %s", (item_id,)).rowcount
    return ("", 204) if deleted else error("Item not found", 404)
