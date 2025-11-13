from flask import Blueprint, request, jsonify, g
from server_flask.utils.auth import solo_cliente

bp = Blueprint('pago', __name__, url_prefix='/pago')

@bp.route("/", methods=["POST"])
def listar_pagos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        # Obtener los datos del JSON en el cuerpo de la solicitud
        data = request.get_json()
        id_factura = data.get('id_factura')
        id_cliente = data.get('id_cliente')
        numero_tarjeta = data.get('numero_tarjeta')
        id_metodo_pago = data.get('id_metodo_pago')
        nombre_titular = data.get('nombre_titular')
        fecha_expiracion = data.get('fecha_expiracion')
        cvv = data.get('cvv')
        
        # Validar que no falten datos obligatorios
        if not all([id_factura, id_cliente, id_metodo_pago, numero_tarjeta, nombre_titular, fecha_expiracion, cvv]):
            return jsonify({'error': 'Faltan datos obligatorios'}), 400
        
        # Insertar los datos en la tabla 'pagos'
        g.db_cursor.execute("""
            INSERT INTO pagos (id_factura, id_cliente, id_metodo_pago, numero_tarjeta, nombre_titular, fecha_expiracion, cvv)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (id_factura, id_cliente, id_metodo_pago, numero_tarjeta, nombre_titular, fecha_expiracion, cvv))

        # Verificar si la inserción fue exitosa
        g.db_cursor.connection.commit()  # Confirmar la transacción
        return jsonify({"message": "Pago registrado exitosamente"}), 201

    except Exception as e:
        # Manejo de excepciones si algo sale mal
        return jsonify({"error": str(e)}), 500
