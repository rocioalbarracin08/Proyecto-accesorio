from flask import Blueprint, request, jsonify, g

bp = Blueprint('clientes', __name__, url_prefix='/clientes')

@bp.route('/', methods=['GET']) 
def obtener_clientes():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        busqueda = request.args.get('busqueda', '').strip()
        
        if busqueda:
            # Buscar en usuarios (solo clientes: id_rol = 1), filtrando por nombre, apellido o email
            query = """
                SELECT id_cliente, nombre AS name, apellido, email 
                FROM usuarios 
                WHERE id_rol = 1 AND (nombre LIKE %s OR apellido LIKE %s OR email LIKE %s)
            """
            search_term = f'%{busqueda}%'
            g.db_cursor.execute(query, (search_term, search_term, search_term))
        else:
            # Sin búsqueda, devolver todos los clientes de usuarios
            query = "SELECT id_cliente, nombre AS name, apellido, email FROM usuarios WHERE id_rol = 1"
            g.db_cursor.execute(query)
        
        clientes = g.db_cursor.fetchall()
        return jsonify(clientes)
    except Exception as e:
        return jsonify({"error": f"Error al obtener clientes: {e}"}), 500

@bp.route("/borrar", methods=['DELETE'])
def borrar_cliente():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        id = datos.get("id_cliente")
        g.db_cursor.execute("DELETE FROM clientes WHERE id_cliente = %s", (id,))
        g.db.commit()
        return jsonify({"mensaje": "Cliente eliminado"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al eliminar cliente: {err}"}), 500

@bp.route("/", methods=['POST'])
def crearCliente():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if request.method == 'POST':
        try:
            g.db_cursor.execute("INSERT INTO clientes () VALUES ()")
            g.db.commit()
            return jsonify({"mensaje": "Cliente creado exitosamente."}), 201
        except Exception as err:
            g.db.rollback()
            return jsonify({"error": f"Error al crear cliente: {err}"}), 500

@bp.route("/modificar", methods=['PUT'])
def modificarCliente():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        apellido = data.get('apellido')
        idCliente = data.get('id_cliente')
        if not nombre or not apellido or not idCliente:
            return jsonify({"error": "Datos incompletos"}), 400
        g.db_cursor.execute("UPDATE clientes SET name = %s, apellido = %s WHERE id_cliente = %s", (nombre, apellido, idCliente))  # Corregido a 'name'
        g.db.commit()
        return jsonify({"mensaje": "Cliente modificado"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al modificar cliente: {err}"}), 500