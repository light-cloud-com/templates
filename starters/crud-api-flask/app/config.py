"""Settings, read from the environment in one place."""

import os

from psycopg.conninfo import make_conninfo

# Light Cloud sets DB_HOST ("host" or "host:port"), DB_NAME, DB_USER and DB_PASSWORD.
# sslmode=require: TLS on, certificate not verified (the database's certificate is
# platform-internal). Set DB_SSLMODE=disable for a local database without TLS.
_host, _, _port = os.environ.get("DB_HOST", "localhost").partition(":")

DATABASE_CONNINFO = make_conninfo(
    host=_host,
    port=_port or "5432",
    dbname=os.environ.get("DB_NAME", "postgres"),
    user=os.environ.get("DB_USER", "postgres"),
    password=os.environ.get("DB_PASSWORD", ""),
    sslmode=os.environ.get("DB_SSLMODE", "require"),
)
