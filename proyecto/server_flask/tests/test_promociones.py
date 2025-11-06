def test_promociones(client):
    """
    este test verifica que el endpoint PATCH /promociones/<id>/desactivar
    desactiva una promoción. Se loguea primero como dueño para obtener la
    cookie de autenticación usada por el decorador `solo_dueno`.
    Este test busca una promoción existente y comprueba su campo `activo`.
    """
    #Loguea como dueño (usar credenciales existentes en la DB de test, no te deja hcer el test si no sos el dueño ya que solo el puede crear/eliminar)
    login_payload = {"email": "dueño@gmail.com", "password": "ro123"} 
    
    #cambiar al de dueño
    login_resp = client.post("/usuarios/login", json=login_payload)
    assert login_resp.status_code == 200

    token_cookie = login_resp.headers.get("Set-Cookie")
    assert token_cookie is not None

    # Listar promociones y elegir una (si no existe, fallará para que se cree manualmente en la DB de test)
    resp = client.get("/promociones/", headers={"Cookie": token_cookie})
    assert resp.status_code == 200
    promociones = resp.get_json()
    assert isinstance(promociones, list)
    assert len(promociones) > 0, "Se necesita al menos una promoción en la DB para este test"

    promo = promociones[0] # Usar la primera promoción encontrada
    id_promocion = promo.get('id_promocion') or promo.get('id')
    assert id_promocion is not None, "La promoción debe tener un id"

    inicial_activo = promo.get('activo') # comprueba si está activo o no
    # Algunos fetches devuelven True/False o 1/0
    assert inicial_activo in (True, False, 1, 0)

    # Llamar al endpoint para desactivar
    patch_resp = client.patch(f'/promociones/{id_promocion}/desactivar', headers={"Cookie": token_cookie})
    # Si no sos dueño, el endpoint devuelve 403 — el test requiere ser dueño
    assert patch_resp.status_code == 200
    data = patch_resp.get_json()
    assert data.get('mensaje') == 'Promoción desactivada'

    # Volver a obtener la promoción y comprobar 'activo' es False/0
    get_resp = client.get(f'/promociones/{id_promocion}', headers={"Cookie": token_cookie})
    assert get_resp.status_code == 200
    promo2 = get_resp.get_json()
    activo_final = promo2.get('activo')
    assert activo_final in (False, 0)
