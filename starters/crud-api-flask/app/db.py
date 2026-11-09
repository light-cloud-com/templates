from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.config import DATABASE_CONNINFO

pool = ConnectionPool(
    DATABASE_CONNINFO,
    min_size=1,
    max_size=5,
    timeout=5,
    kwargs={"row_factory": dict_row},
    open=False,
)


def create_tables():
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
