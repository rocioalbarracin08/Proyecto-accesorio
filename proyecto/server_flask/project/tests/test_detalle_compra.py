from flask import g

def test_detalle_compra(mocker):
    # Mocks para DB
    mock_cursor = mocker.Mock()
    mock_db = mocker.Mock()
    
    from app import create_app
    app = create_app({"TESTING": True})
    
    with app.app_context():
        g.db_cursor = mock_cursor
        g.db = mock_db
        
        client = app.test_client()
        
        # Request POST: envía JSON correcto con id_factura y array items
        response = client.post("/detalle_factura/insertar/compra", json={
            "id_factura": 1,  # Cambia id_compra por id_factura
            "items": [  # Envía como array de objetos
                {
                    "id_producto": 10,  # Opcional, pero lo incluyo
                    "nombre_producto": "Producto Test",  # Cambia "producto" por "nombre_producto"
                    "cantidad": 2,
                    "precio_unitario": 25.0,  # Agrega precio_unitario (necesario)
                    "subtotal": 50.0  # Agrega subtotal (necesario)
                }
            ]
        })
        
        # Verificaciones
        assert response.status_code == 201
        assert response.get_json()["mensaje"] == "Compra(s) agregada(s) exitosamente"
        # Verifica que execute se llamó por cada item (en este caso, 1 vez)
        assert mock_cursor.execute.call_count == 1  # O len(items) si hay múltiples
        mock_db.commit.assert_called_once()