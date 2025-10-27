from flask import Blueprint, request, jsonify, g
from server_flask.utils.auth import solo_dueno

bp = Blueprint('metodos_pagos', __name__, url_prefix='/metodos_pagos')

# ------------------- L I S T A R TODOS -------------------
@bp.route("/", methods=["GET"])
def listar_metodos_pagos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT id_metodo_pago, name FROM metodos_pagos")
        metodos = g.db_cursor.fetchall()
        return jsonify(metodos), 200
    except Exception as e:
        return jsonify({"error": f"Error al listar métodos de pago: {e}"}), 500

# ------------------- O B T E N E R POR ID -------------------
@bp.route("/<int:id_metodo_pago>", methods=["GET"])
def obtener_metodo_pago(id_metodo_pago):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT id_metodo_pago, name FROM metodos_pagos WHERE id_metodo_pago = %s", (id_metodo_pago,))
        metodo = g.db_cursor.fetchone()
        if not metodo:
            return jsonify({"error": "Método de pago no encontrado"}), 404
        return jsonify(metodo), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener método de pago: {e}"}), 500

# ------------------- C R E A R (Solo Dueño) -------------------

@bp.route("/", methods=["POST"])
@solo_dueno
def crear_metodo_pago():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        name = datos.get("name")
        if not name:
            return jsonify({"error": "Nombre requerido"}), 400
        g.db_cursor.execute("INSERT INTO metodos_pagos (name) VALUES (%s)", (name,))
        g.db.commit()
        return jsonify({"mensaje": "Método de pago creado"}), 201
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": f"Error al crear método de pago: {e}"}), 500

# ------------------- A C T U A L I Z A R (Solo Dueño) -------------------
@bp.route("/<int:id_metodo_pago>", methods=["PUT"])
@solo_dueno
def actualizar_metodo_pago(id_metodo_pago):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        name = datos.get("name")
        if not name:
            return jsonify({"error": "Nombre requerido"}), 400
        g.db_cursor.execute("UPDATE metodos_pagos SET name = %s WHERE id_metodo_pago = %s", (name, id_metodo_pago))
        g.db.commit()
        return jsonify({"mensaje": "Método de pago actualizado"}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": f"Error al actualizar método de pago: {e}"}), 500

# ------------------- E L I M I N A R (Solo Dueño) -------------------
@bp.route("/<int:id_metodo_pago>", methods=["DELETE"])
@solo_dueno
def eliminar_metodo_pago(id_metodo_pago):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("DELETE FROM metodos_pagos WHERE id_metodo_pago = %s", (id_metodo_pago,))
        g.db.commit()
        return jsonify({"mensaje": "Método de pago eliminado"}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": f"Error al eliminar método de pago: {e}"}), 500