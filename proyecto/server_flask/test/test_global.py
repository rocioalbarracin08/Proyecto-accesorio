import pytest
from server_flask.app import create_app

# Fixture que crea el client para testear
@pytest.fixture
def client():
    app = create_app()
    app.testing = True

    # Reemplaza la conexión real a MySQL por fake
    from flask import g
    @app.before_request
    def fake_conexion_db():
        class DummyCursor:
            def execute(self, *args, **kwargs): pass
            def fetchall(self): return [{"id": 1, "nombre": "Test"}]
            def fetchone(self): return {"id": 1, "nombre": "Test"}
            def close(self): pass
        class DummyDB:
            def cursor(self, dictionary=True): return DummyCursor()
            def close(self): pass
        g.db = DummyDB()
        g.db_cursor = g.db.cursor()

    with app.test_client() as client:
        yield client

# Test rutas de promociones
def test_promociones(client):
    response = client.get('/promociones/')
    assert response.status_code == 200
    data = response.get_json()
    assert "nombre" in data[0] or "promos" in data

# Test rutas de clientes
def test_clientes(client):
    response = client.get('/clientes/')
    assert response.status_code == 200
    data = response.get_json()
    assert "nombre" in data[0]

# Test rutas de productos
def test_productos(client):
    response = client.get('/productos/')
    assert response.status_code == 200
    data = response.get_json()
    assert "nombre" in data[0]
