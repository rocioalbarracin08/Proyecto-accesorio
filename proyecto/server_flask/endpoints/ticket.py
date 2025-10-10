from flask import Blueprint, request, jsonify, g

bp = Blueprint('ticket', __name__, url_prefix='/ticket')

########################### M O D I F I C A R ###########################
@bp.route("/", methods=["PUT"]) 
def actualizar_costo_ticket():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    datos = request.get_json()
    costo_total = datos.get("costo_total")
    id_ticket = datos.get("id_ticket")

    if not id_ticket or costo_total is None:
        return jsonify({"error": "Datos incompletos"}), 400

    try:
        g.db_cursor.execute(
            "UPDATE tickets SET costo_total = %s WHERE id_ticket = %s",
            (costo_total, id_ticket)
        )
        g.db.commit()
        return jsonify({"mensaje": "Costo total actualizado correctamente"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al actualizar el costo total: {err}"}), 500
