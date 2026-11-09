def test_index(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.get_json() == {"message": "Hello from Flask on Light Cloud"}


def test_unknown_route_is_404(client):
    assert client.get("/nope").status_code == 404
