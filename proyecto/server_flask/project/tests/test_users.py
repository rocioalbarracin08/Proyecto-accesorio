def test_ping(client):
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.get_json() == {"message": "pong"}


def test_create_user_success(client):
    response = client.post("/users", json={"name": "Alice"})
    assert response.status_code == 201
    data = response.get_json()
    assert data["user"]["name"] == "Alice"


def test_create_user_missing_name(client):
    response = client.post("/users", json={})
    assert response.status_code == 400
    assert "error" in response.get_json()

