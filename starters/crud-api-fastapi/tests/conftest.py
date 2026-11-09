import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client():
    # Entering the client runs the lifespan: opens the pool and creates the table.
    # The tests need the database from DB_* (see README, "Run the tests").
    with TestClient(app) as client:
        yield client
