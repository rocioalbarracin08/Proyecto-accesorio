from flask import Blueprint, request, jsonify, g

bp = Blueprint('empleado', __name__, url_prefix='/empleado')

########################### C R E A R  ###########################
@bp.route("/", methods=["POST"])
def crear_empleado():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    datos = request.get_json()
    nombre = datos.get("nombre")
    apellido = datos.get("apellido")
    email = datos.get("email")
    id_tienda = datos.get("id_tienda")
    puesto_trabajo = datos.get("puesto_trabajo")
    telefono = datos.get("telefono")

    try:
        g.db_cursor.execute(
            """
            INSERT INTO empleados (nombre, apellido, email, id_tienda, puesto_trabajo, telefono)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (nombre, apellido, email, id_tienda, puesto_trabajo, telefono)
        )
        g.db.commit()
        return jsonify({"mensaje": "Empleado agregado exitosamente."}), 201

    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al crear el empleado: {err}"}), 500


########################### M O S T R A R  ###########################
@bp.route("/", methods=["GET"])
def listar_empleados():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT id_empleado, nombre, apellido, email, puesto_trabajo FROM empleados")
        empleados = g.db_cursor.fetchall()
        return jsonify(empleados)
    except Exception as e:
        return jsonify({"error": "Hubo un problema al consultar los empleados"}), 500


########################### M O S T R A R  U N O ###########################
@bp.route("/mostrar", methods=["POST"])
def mostrar_empleado():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    datos = request.get_json()
    id_empleado = datos.get("id_empleado")

    try:
        g.db_cursor.execute("SELECT * FROM empleados WHERE id_empleado = %s", (id_empleado,))
        empleado = g.db_cursor.fetchone()
        if empleado:
            return jsonify(empleado)
        return jsonify({"mensaje": "Empleado no encontrado"}), 404

    except Exception as e:
        return jsonify({"error": "Error al consultar el empleado"}), 500


########################### B O R R A R ###########################
@bp.route("/<int:id_empleado>", methods=["DELETE"])
def borrar_empleado(id_empleado):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("DELETE FROM empleados WHERE id_empleado = %s", (id_empleado,))
        g.db.commit()
        return jsonify({"mensaje": "Empleado eliminado correctamente"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al eliminar el empleado: {err}"}), 500


########################### M O D I F I C A R ###########################
@bp.route("/", methods=["PUT"])
def modificar_empleado():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    datos = request.get_json()
    id_empleado = datos.get("id_empleado")
    nombre = datos.get("nombre")
    apellido = datos.get("apellido")
    email = datos.get("email")
    puesto_trabajo = datos.get("puesto_trabajo")
    telefono = datos.get("telefono")

    if not id_empleado:
        return jsonify({"error": "Debe especificarse el id_empleado"}), 400

    try:
        g.db_cursor.execute(
            """
            UPDATE empleados
            SET nombre=%s, apellido=%s, email=%s, puesto_trabajo=%s, telefono=%s
            WHERE id_empleado=%s
            """,
            (nombre, apellido, email, puesto_trabajo, telefono, id_empleado)
        )
        g.db.commit()
        return jsonify({"mensaje": "Empleado actualizado correctamente"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al modificar el empleado: {err}"}), 500
