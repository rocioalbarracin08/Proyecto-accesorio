from flask import Blueprint, request, jsonify, g

bp = Blueprint('detalle_factura', __name__, url_prefix='/detalle_factura')

@bp.route("/insertar/compra", methods=["POST"])
def agregaCompra():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        
        id_factura = datos.get("id_factura")

        items = datos.get("items", [])
        
        if not id_factura or not items:
            return jsonify({"error": "Faltan id_factura o items"}), 400
        
        for item in items:
            id_producto = item.get("id_producto")
            nombre_producto = item.get("nombre_producto")
            cantidad = item.get("cantidad")
            precio_unitario = item.get("precio_unitario")
            subtotal = item.get("subtotal")

            print("Producto:", nombre_producto, "| Cantidad:", cantidad, "| Subtotal:", subtotal)

            if not all([id_producto, nombre_producto, cantidad, precio_unitario, subtotal]):
                return jsonify({"error": "Datos incompletos en uno de los items"}), 400
            
            g.db_cursor.execute(
                """
                INSERT INTO detalle_factura 
                (id_factura, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (id_factura, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
            )
        
        g.db.commit()
        return jsonify({"mensaje": "Compra(s) agregada(s) exitosamente"}), 201

    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al agregar compra: {err}"}), 500
