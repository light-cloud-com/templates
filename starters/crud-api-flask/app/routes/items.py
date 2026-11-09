from flask import Blueprint, jsonify

from app.db import pool
from app.errors import error
from app.validation import int_arg, parse_item

bp = Blueprint("items", __name__, url_prefix="/items")

COLUMNS = "id, name, description, created_at, updated_at"


@bp.get("")
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


@bp.get("/<int:item_id>")
def get_item(item_id):
    with pool.connection() as conn:
        row = conn.execute(f"SELECT {COLUMNS} FROM items WHERE id = %s", (item_id,)).fetchone()
    return row or error("Item not found", 404)


@bp.post("")
def create_item():
    item, message = parse_item()
    if message:
        return error(message, 400)
    with pool.connection() as conn:
        row = conn.execute(
            f"INSERT INTO items (name, description) VALUES (%s, %s) RETURNING {COLUMNS}", item
        ).fetchone()
    return row, 201


@bp.put("/<int:item_id>")
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


@bp.delete("/<int:item_id>")
def delete_item(item_id):
    with pool.connection() as conn:
        deleted = conn.execute("DELETE FROM items WHERE id = %s", (item_id,)).rowcount
    return ("", 204) if deleted else error("Item not found", 404)
