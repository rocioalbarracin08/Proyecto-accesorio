def test_inventario(client):
    """Test que verifica que el stock de un producto se actualiza correctamente.
    - Loguea como empleado (usar credenciales de test existentes).
    - Llama PATCH a /productos/actualizar_stock/<id_producto> con un nuevo stock.
    - Consulta /productos/mostrar y verifica que el campo 'stock' cambió para ese producto (usa id_producto=2 por convención de tests).
    """

    login_payload = {"email": "eve@gmail.com", "password": "ro123"} 
    
    #cambiar al de dueño
    login_resp = client.post("/usuarios/login", json=login_payload)
    assert login_resp.status_code == 200

    token_cookie = login_resp.headers.get("Set-Cookie")
    assert token_cookie is not None

    # Obtener producto y buscar el id de un producto que tenga stock
    id_producto = 3
    nuevo_stock = 200


    # Llamar al endpoint para actualizar stock (ruta definida en /productos/actualizar_stock/<id>)
    patch_resp = client.patch(f"/inventario/actualizar_stock/{id_producto}", json={"stock": nuevo_stock}, headers={"Cookie": token_cookie})
    
    assert patch_resp.status_code == 200 # Si no sos empleado, el endpoint devuelve 403 — el test requiere ser empleado
   
    data = patch_resp.get_json()
    assert data.get('mensaje') is not None

    # Ahora obtener productos y buscar el id para comprobar su stock
    get_resp = client.get('/productos/mostrar', headers={"Cookie": token_cookie})
    print(get_resp.get_json())
    assert get_resp.status_code == 200
    productos = get_resp.get_json().get('productos') if isinstance(get_resp.get_json(), dict) else get_resp.get_json()
    # Algunos endpoints devuelven una lista directa, otros un dict con 'productos'
    assert productos is not None

    # Buscar el producto por id
    producto = next((p for p in (productos or []) if p.get('id_producto') == id_producto or p.get('id') == id_producto), None)
    assert producto is not None, f"No se encontró producto con id {id_producto} en /productos/mostrar"

    # El campo stock puede venir como 'stock' o 'stock_actual'
    stock_actual = producto.get('stock') if producto.get('stock') is not None else producto.get('stock_actual')
    assert stock_actual == nuevo_stock, f"Stock esperado {nuevo_stock}, obtenido {stock_actual}"

