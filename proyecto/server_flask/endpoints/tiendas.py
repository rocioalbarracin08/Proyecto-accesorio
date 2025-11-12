from flask import Blueprint, request, jsonify, g

bp = Blueprint('tienda', __name__, url_prefix='/tienda')

########################### C R E A R  ###########################
@bp.route("/", methods=["POST"])
def crear_tienda():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    datos = request.get_json()
    nombre = datos.get("nombre")
    ubicacion = datos.get("ubicacion")
    if not nombre or not ubicacion:
        return jsonify({"error": "Faltan campos obligatorios"}), 400
    try:
        g.db_cursor.execute(
            "INSERT INTO tiendas (nombre, ubicacion) VALUES (%s, %s)",
            (nombre, ubicacion)
        )
        g.db.commit()
        return jsonify({"mensaje": "Tienda creada exitosamente."}), 201

    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al crear la tienda: {err}"}), 500


########################### M O S T R A R  ###########################
@bp.route("/mostrar", methods=["GET"])
def listar_tiendas():
    if not hasattr(g, "db_cursor"):
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT id_tienda, nombre, ubicacion FROM tiendas")
        tiendas = g.db_cursor.fetchall()
        return jsonify(tiendas)
    except Exception as e:
        return jsonify({"error": "Error al consultar las tiendas"}), 500
