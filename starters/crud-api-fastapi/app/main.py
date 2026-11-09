from contextlib import asynccontextmanager

from fastapi import FastAPI

from app import errors
from app.db import create_tables, pool
from app.routers import health, items


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Creates the table on start. If the database is unreachable the app does not start.
    pool.open(wait=True)
    create_tables()
    yield
    pool.close()


app = FastAPI(title="CRUD API", lifespan=lifespan)
errors.register(app)
app.include_router(health.router)
app.include_router(items.router)
