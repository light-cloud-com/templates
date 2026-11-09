import pytest


@pytest.fixture
def item(client):
    response = client.post("/items", json={"name": "  Test item  ", "description": "Hello"})
    assert response.status_code == 201
    item = response.json()
    yield item
    client.delete(f"/items/{item['id']}")


def test_create_trims_name(item):
    assert item["name"] == "Test item"
    assert item["description"] == "Hello"
    assert {"id", "created_at", "updated_at"} <= item.keys()


def test_get(client, item):
    assert client.get(f"/items/{item['id']}").json() == item


def test_update_replaces_fields(client, item):
    response = client.put(f"/items/{item['id']}", json={"name": "Renamed"})
    assert response.status_code == 200
    assert response.json()["name"] == "Renamed"
    assert response.json()["description"] is None


def test_delete(client, item):
    assert client.delete(f"/items/{item['id']}").status_code == 204
    assert client.get(f"/items/{item['id']}").status_code == 404
    assert client.delete(f"/items/{item['id']}").status_code == 404


def test_list_pagination(client):
    ids = [client.post("/items", json={"name": f"Page {n}"}).json()["id"] for n in range(3)]
    try:
        everything = client.get("/items?limit=100").json()
        assert len(everything) <= 100
        position = [row["id"] for row in everything].index(ids[0])
        page = client.get(f"/items?limit=2&offset={position + 1}").json()
        assert [row["id"] for row in page] == ids[1:]
        assert len(client.get("/items").json()) <= 20
    finally:
        for item_id in ids:
            client.delete(f"/items/{item_id}")


@pytest.mark.parametrize("query", ["limit=0", "limit=101", "offset=-1", "limit=abc"])
def test_list_rejects_bad_paging(client, query):
    response = client.get(f"/items?{query}")
    assert response.status_code == 400
    assert "error" in response.json()


@pytest.mark.parametrize(
    "body", [{}, {"name": ""}, {"name": "   "}, {"name": "x" * 201}, {"name": 5}]
)
def test_create_rejects_invalid_body(client, body):
    response = client.post("/items", json=body)
    assert response.status_code == 400
    assert "error" in response.json()


@pytest.mark.parametrize("path", ["/items/999999999", "/items/abc"])
def test_unknown_item_is_404(client, path):
    assert client.get(path).json() == {"error": "Item not found"}
