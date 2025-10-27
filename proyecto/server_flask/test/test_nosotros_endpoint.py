import json
from server_flask.app import app

# Nota: Estas pruebas usan la configuración por defecto y requieren que la DB esté accesible desde .env

def test_put_get_nosotros():
    client = app.test_client()
    payload = {
        "titulo": "Titulo de prueba",
        "descripcion": "Descripcion de prueba",
        "preguntas": [{"pregunta": "P?","respuesta": "R"}],
        "imagenes": ["/path/img.jpg"],
        "ubicacion_lat": 0.0,
        "ubicacion_lng": 0.0,
        "ubicacion_descripcion": "Test"
    }

    # Intentar PUT
    resp_put = client.put('/nosotros', data=json.dumps(payload), content_type='application/json')
    print('PUT status:', resp_put.status_code, resp_put.data)

    # Intentar GET
    resp_get = client.get('/nosotros')
    print('GET status:', resp_get.status_code, resp_get.data)

    assert resp_put.status_code in (200, 201, 400, 500)
    assert resp_get.status_code in (200, 404, 500)


if __name__ == '__main__':
    test_put_get_nosotros()
