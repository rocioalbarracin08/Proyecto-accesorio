from flask import g

def test_crear_tienda_exitoso(mocker):
    mock_cursor = mocker.Mock()
    mock_db = mocker.Mock()

    from server_flask.tests import create_app
    app = create_app({"TESTING": True})   # Creamos la app usada en el test

    with app.app_context():
        g.db_cursor = mock_cursor
        g.db = mock_db

        client = app.test_client()  # client DE ESTA app, no el fixture

        response = client.post("/tienda/", json={
            "nombre": "Kiosco Test",
            "ubicacion": "Calle 123"
        })

        assert response.status_code == 201
        assert response.get_json()["mensaje"] == "Tienda creada exitosamente."
        mock_cursor.execute.assert_called_once()
        mock_db.commit.assert_called_once()