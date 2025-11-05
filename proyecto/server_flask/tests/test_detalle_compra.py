from flask import g
def test_detalle_compra(client):
    payload = {
        "id_factura": 1,
        "items": [
            {
                "id_producto": 2,
                "nombre_producto": "Pepsi 1L",
                "cantidad": 2,
                "precio_unitario": 100,
                "subtotal": 200
            }
        ]
    }

    response = client.post("/detalle_factura/insertar/compra", json=payload)
    print(response.get_json())


    assert response.status_code == 201  # Se espera creación ok
    data = response.get_json()
    assert data["mensaje"] == "Compra(s) agregada(s) exitosamente"
