from app.db import pool


def test_index_lists_routes(client):
    response = client.get("/")
    assert response.status_code == 200
    assert "GET /health" in response.json()["routes"]


def test_health_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_503_when_database_is_down(client, monkeypatch):
    def unavailable():
        raise OSError("database is down")

    monkeypatch.setattr(pool, "connection", unavailable)
    response = client.get("/health")
    assert response.status_code == 503
    assert response.json() == {"error": "Database unavailable"}
