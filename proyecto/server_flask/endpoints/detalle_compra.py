from flask import Blueprint, request, jsonify, g

bp = Blueprint('detalle_factura', __name__, url_prefix='/detalle_factura')

@bp.route("/insertar/compra", methods=["POST"])
def agregaCompra():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        
        # Obtener el id_factura y el array de items
        id_factura = datos.get("id_factura")
        items = datos.get("items", [])
        
        if not id_factura or not items:
            return jsonify({"error": "Faltan id_factura o items"}), 400
        
        # Iterar sobre cada item y insertar en detalle_factura
        for item in items:
            nombre_producto = print(item.get("nombre_producto")) #agregue el print para ver que llega
            cantidad = item.get("cantidad")
            precio_unitario = item.get("precio_unitario")
            subtotal = item.get("subtotal")
            
            if not all([nombre_producto, cantidad, precio_unitario, subtotal]):
                return jsonify({"error": "Datos incompletos en uno de los items"}), 400
            
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