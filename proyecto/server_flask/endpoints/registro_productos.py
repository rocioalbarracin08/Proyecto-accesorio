from flask import Blueprint, url_for, request, session, jsonify,g

bp = Blueprint('roRegistroProductos', __name__, url_prefix='/roRegisProductos')

@bp.route("/api/productoRegistrado/<int:id_categoria>", methods=('POST'))
def productos(id):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        if request == "POST":
            g.db_cursor.execute("SELECT * FROM registro_productos rg INNER JOIN ... WHERE p.id_categoria = %s ",(id,))

            productos = g.db_cursor.fetchall()

            g.db.close()
            
            return jsonify(productos)   
         
    except Exception as e:
        return jsonify({"error": "Hubo un problema al consultar el id"}), 500 