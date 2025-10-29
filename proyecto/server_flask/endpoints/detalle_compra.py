from flask import Blueprint, request, jsonify, g

bp = Blueprint('detalle_factura', __name__, url_prefix='/detalle_factura')


@bp.route("/insertar/compra", methods=["POST"])
def agregaCompra():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        id_factura = datos.get("id_factura")
        nombre_producto = datos.get("nombre_producto")
        cantidad = datos.get("cantidad")
        precio_unitario = datos.get("precio_unitario")
        subtotal = datos.get("subtotal")

        g.db_cursor.execute(
            """
            INSERT INTO detalle_factura 
            (id_factura, nombre_producto, cantidad, precio_unitario, subtotal)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (id_factura, nombre_producto, cantidad, precio_unitario, subtotal)
             )

        g.db.commit()
        return jsonify({"mensaje": "Compra(s) agregada(s) exitosamente"}), 201

    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al agregar compra: {err}"}), 500

