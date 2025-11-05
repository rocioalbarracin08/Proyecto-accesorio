def test_crear_tienda_exitoso(client):
    response = client.get("/tienda/mostrar")
    assert response.status_code == 200
    data = response.get_json()

    assert len(data) > 0
    tienda = data[0]
    assert "nombre" in tienda 
    assert "ubicacion" in tienda 




    #from server_flask.tests import create_app
    #app = create_app({"TESTING": True})   # Creamos la app usada en el test

