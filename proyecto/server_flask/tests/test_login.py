#para hacer el test el usuario debe simular el logueo primero para obtener la cookie del servidor
def test_lee_cookie_login(client):
    #Loguearse primero
    login_payload = {
        "email": "abi@gmail.com",
        "password": "abi1234"
    }

    login_response = client.post("/usuarios/login", json=login_payload)
    assert login_response.status_code == 200

    #Extrae la cookie 'token'
    token_cookie = login_response.headers.get("Set-Cookie")
    assert token_cookie is not None

    #Llama a /usuarios/perfil enviando la cookie
    response = client.get("/usuarios/perfil", headers={"Cookie": token_cookie})

    assert response.status_code == 200

    data = response.get_json()
    assert "nombre" in data
    assert "email" in data
