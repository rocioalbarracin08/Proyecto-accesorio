from flask import Blueprint, request, jsonify,g
bp = Blueprint('empleados', __name__, url_prefix='/empleados')


@bp.route("/modifica/tickets", methods=["PUT"])
def actualizar_costo_total():
    if g.db.cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    try:
        costo_total = request.json.get("costo_total")
        id_ticket = request.json.get("id_ticket")
        g.db_cursor.execute(
            "UPDATE tickets SET costo_total = %s WHERE id_ticket = %s",
            (costo_total, id_ticket)
        )
        g.db.commit()
        return jsonify({"mensaje": "Costo total actualizado"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
