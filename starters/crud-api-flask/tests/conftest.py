import pytest

from app import create_app


@pytest.fixture(scope="session")
def app():
    # create_app opens the pool and creates the table.
    # The tests need the database from DB_* (see README, "Run the tests").
    app = create_app()
    app.config.update(TESTING=True)
    return app


@pytest.fixture
def client(app):
    return app.test_client()
