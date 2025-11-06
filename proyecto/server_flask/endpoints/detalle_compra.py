from flask import Blueprint, request, jsonify, g

bp = Blueprint('detalle_factura', __name__, url_prefix='/detalle_factura')

@bp.route("/insertar/compra", methods=["POST"])
def agregaCompra():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        datos = request.get_json()
        items = datos.get("items", [])

        if not items:
            return jsonify({"error": "No se enviaron items"}), 400

        # 1) Insertar factura primero
        # Insertar factura con costo_total (coincide con el esquema usado en ventas.py)
        g.db_cursor.execute(
            """
            INSERT INTO factura (fecha, costo_total)
            VALUES (NOW(), 0)
            """
        )
        id_factura = g.db_cursor.lastrowid  # <-- ID generado automáticamente

        total_factura = 0

        # 2) Insertar detalles usando el id_factura recién creado
        for item in items:
            id_producto = item.get("id_producto")
            nombre_producto = item.get("nombre_producto")
            cantidad = item.get("cantidad")
            precio_unitario = item.get("precio_unitario")
            subtotal = item.get("subtotal")

            total_factura += subtotal

            g.db_cursor.execute(
                """
                INSERT INTO detalle_factura 
                (id_factura, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (id_factura, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
            )

        # 3) Actualizar costo_total en factura (misma columna que usa el endpoint de ventas)
        g.db_cursor.execute(
            "UPDATE factura SET costo_total = %s WHERE id_factura = %s",
            (total_factura, id_factura)
        )

        g.db.commit()
        return jsonify({"mensaje": "Factura registrada correctamente", "id_factura": id_factura}), 201

    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al agregar compra: {err}"}), 500
