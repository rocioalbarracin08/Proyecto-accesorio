# Test para registrar una venta usando la misma convención que otros tests:
# - Se loguea con `client` a `/usuarios/login` para obtener la cookie `Set-Cookie`.
# - Se consulta `/usuarios/perfil` usando la cookie para obtener `id_cliente`.
# - Se llama a `/ventas/registrar_venta` con los datos necesarios y se valida la respuesta.

def test_registrar_venta_con_client(client):

    #Loguearse para obtener la cookie de sesión (token)
    login_payload = {"email": "abi@gmail.com", "password": "abi1234"}
    login_resp = client.post("/usuarios/login", json=login_payload)
    assert login_resp.status_code == 200

    # Extraer la cookie completa 'Set-Cookie' para reenviarla en llamadas posteriores
    token_cookie = login_resp.headers.get("Set-Cookie")
    assert token_cookie is not None

    #Obtener perfil del usuario logueado para leer su id_cliente
    perfil_resp = client.get("/usuarios/perfil", headers={"Cookie": token_cookie})
    assert perfil_resp.status_code == 200
    perfil = perfil_resp.get_json()
    #id_cliente será usado para la venta online; si no existe, este test no puede continuar
    id_cliente = perfil.get('id_cliente')
    assert id_cliente is not None, "El usuario de test debe ser un cliente con id_cliente no nulo"

    #Preparar payload de venta (usar id_producto 2 por convención de tests)
    payload = {
        "id_cliente": id_cliente,
        "id_metodo_pago": 1,
        "detalles": [
            {"id_producto": 2, "cantidad": 1}
        ]
    }

    #Llama al endpoint de registrar venta usando la cookie de sesión
    resp = client.post("/ventas/registrar_venta", json=payload, headers={"Cookie": token_cookie})
    #Esperamos que se cree la venta correctamente
    assert resp.status_code == 201
    data = resp.get_json()
    assert data.get("mensaje") == "Venta registrada exitosamente"
    assert "id_factura" in data
