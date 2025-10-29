from flask import Blueprint, request, jsonify, g

bp = Blueprint('inventario', __name__, url_prefix='/inventario')

@bp.route('/actualizar_stock/<int:id_producto>', methods=['PATCH']) # Actualiza y agrega una unica vez. Verificando si existe un registro similar al que se estan insertando en la base de datos
def actualizar_stock(id_producto):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        data = request.get_json()
        stock = data.get('stock')
        id_tienda = data.get('id_tienda', 1)  # Default a tienda online
        if stock is None or stock < 0:
            return jsonify({"error": "Stock válido requerido"}), 400
        
        g.db_cursor.execute("""
            UPDATE inventario SET stock_actual = %s WHERE id_producto = %s AND id_tienda = %s
        """, (stock, id_producto, id_tienda))
        if g.db_cursor.rowcount == 0:
            return jsonify({"error": "Producto o tienda no encontrada en inventario"}), 404
        g.db.commit()
        return jsonify({"mensaje": "Stock actualizado"}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": f"Error al actualizar stock: {e}"}), 500