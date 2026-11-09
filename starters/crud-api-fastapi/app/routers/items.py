from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from app.db import pool
from app.schemas import ItemIn

router = APIRouter(prefix="/items", tags=["items"])

COLUMNS = "id, name, description, created_at, updated_at"


def one_or_404(row):
    if row is None:
        raise HTTPException(404, "Item not found")
    return row


@router.get("")
def list_items(limit: int = Query(20, ge=1, le=100), offset: int = Query(0, ge=0, le=2**53)):
    with pool.connection() as conn:
        return conn.execute(
            f"SELECT {COLUMNS} FROM items ORDER BY id LIMIT %s OFFSET %s", (limit, offset)
        ).fetchall()


@router.get("/{item_id}")
def get_item(item_id: int):
    with pool.connection() as conn:
        return one_or_404(
            conn.execute(f"SELECT {COLUMNS} FROM items WHERE id = %s", (item_id,)).fetchone()
        )


@router.post("", status_code=201)
def create_item(item: ItemIn):
    with pool.connection() as conn:
        return conn.execute(
            f"INSERT INTO items (name, description) VALUES (%s, %s) RETURNING {COLUMNS}",
            (item.name, item.description),
        ).fetchone()


@router.put("/{item_id}")
def update_item(item_id: int, item: ItemIn):
    with pool.connection() as conn:
        return one_or_404(
            conn.execute(
                f"""UPDATE items SET name = %s, description = %s, updated_at = now()
                WHERE id = %s RETURNING {COLUMNS}""",
                (item.name, item.description, item_id),
            ).fetchone()
        )


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int):
    with pool.connection() as conn:
        if conn.execute("DELETE FROM items WHERE id = %s", (item_id,)).rowcount == 0:
            raise HTTPException(404, "Item not found")
    return Response(status_code=204)
