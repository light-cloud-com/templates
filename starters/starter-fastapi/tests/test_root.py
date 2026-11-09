from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_index():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from FastAPI on Light Cloud"}


def test_docs():
    assert client.get("/docs").status_code == 200
