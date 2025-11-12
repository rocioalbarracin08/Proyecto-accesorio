import pytest
from server_flask.app import create_app
from flask import request, jsonify, g


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def actualizar_stock(id_producto):
    #simula un endpoint para no tocar el endpoint real

    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        data = request.get_json()
        stock = data.get('stock')
        id_tienda = data.get('id_tienda', 1)  # Default a tienda online
        if stock is None or stock < 0:
            return jsonify({"error": "Stock válido requerido"}), 400
        
        #si no existe lo crea, si existe lo actualiza
        g.db_cursor.execute(""" 
        INSERT INTO inventario (id_producto, id_tienda, stock_actual, stock_minimo)
        VALUES (%s, %s, %s, 3)
        ON DUPLICATE KEY UPDATE stock_actual = VALUES(stock_actual)
    """, (id_producto, id_tienda, stock))
        g.db.commit()



    print("\nSetting up resources...")
    yield   # Provide the data to the test
    # Teardown: Clean up resources (if any) after the test
    print("\nTearing down resources...")