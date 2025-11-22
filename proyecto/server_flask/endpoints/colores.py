from flask import Blueprint, request, jsonify, g
from server_flask.utils.auth import solo_empleado

bp = Blueprint('colores', __name__, url_prefix='/colores')

@bp.post("/")
@solo_empleado
def crear_color():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    data = request.json
    nombre = data.get("nombre_color")
    hex_code = data.get("codigo_hex")

    if not nombre or not hex_code:
        return jsonify({"error": "Faltan datos"}), 400

    try:
        # 1. Verificar si ya existe por HEX o nombre
        g.db_cursor.execute("""
            SELECT * FROM colores
            WHERE codigo_hex = %s OR nombre_color = %s
        """, (hex_code, nombre))
        existente = g.db_cursor.fetchone()

        if existente:
            return jsonify({
                "message": "Color ya existía",
                "color": existente
            }), 200

        # 2. Insertar color
        g.db_cursor.execute("""
            INSERT INTO colores (nombre_color, codigo_hex)
            VALUES (%s, %s)
        """, (nombre, hex_code))

        g.db.commit()

        # 3. Traer el color recién creado
        nuevo_id = g.db_cursor.lastrowid
        g.db_cursor.execute("SELECT * FROM colores WHERE id_color = %s", (nuevo_id,))
        creado = g.db_cursor.fetchone()

        return jsonify({
            "message": "Color creado",
            "color": creado
        }), 201
    
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al crear color: {err}"}), 500

@bp.get("/")
def buscar_colores():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    search = request.args.get("q", "").strip()
    try:
        if search:
            # busca por nombre o hex
            g.db_cursor.execute("""
                SELECT *
                FROM colores
                WHERE nombre_color LIKE %s
                   OR codigo_hex LIKE %s
                ORDER BY nombre_color ASC
            """, (f"%{search}%", f"%{search}%"))
        else:
            # traer todos
            g.db_cursor.execute("""
                SELECT *
                FROM colores
                ORDER BY nombre_color ASC """) 
        colores = g.db_cursor.fetchall()
        return jsonify(colores), 200

    except Exception as err:
        return jsonify({"error": f"Error al buscar colores: {err}"}), 500

@bp.post("/a_producto/<int:id_producto>")
@solo_empleado
def asignar_colores_a_producto(id_producto):
    if g.db_cursor is None:
        return jsonify({"error": "No hay conexión con DB"}), 500

    data = request.json
    colores = data.get("colores", [])  # array de id_color

    # Si mandan lista vacía → eliminar colores asignados
    try:
        # 1. Verificar que el producto exista
        g.db_cursor.execute("SELECT id_producto FROM productos WHERE id_producto = %s", (id_producto,))
        if g.db_cursor.fetchone() is None:
            return jsonify({"error": "Producto no encontrado"}), 404

        # 2. Borrar colores actuales (dejamos limpio)
        g.db_cursor.execute("DELETE FROM producto_colores WHERE id_producto = %s", (id_producto,))

        # 3. Insertar los nuevos (si la lista no está vacía)
        if colores:
            insert_values = [(id_producto, id_color) for id_color in colores]
            g.db_cursor.executemany("""
                INSERT INTO producto_colores (id_producto, id_color)
                VALUES (%s, %s)
            """, insert_values)

        g.db.commit()

        return jsonify({
            "message": "Colores asignados",
            "colores": colores
        }), 200

    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al asignar colores: {err}"}), 500

@bp.get("/producto/<int:id_producto>")
def obtener_colores_de_producto(id_producto):
    if g.db_cursor is None:
        return jsonify({"error": "No hay conexión con DB"}), 500

    try:
        g.db_cursor.execute("""
            SELECT c.*
            FROM producto_colores pc
            JOIN colores c ON pc.id_color = c.id_color
            WHERE pc.id_producto = %s
            ORDER BY c.nombre_color ASC
        """, (id_producto,))
        
        colores = g.db_cursor.fetchall()
        return jsonify(colores), 200

    except Exception as err:
        return jsonify({"error": f"Error al obtener colores: {err}"}), 500

@bp.delete("/<int:id_producto>/borrar_colores/<int:id_color>")
@solo_empleado
def eliminar_color_del_producto(id_producto, id_color):
    if g.db_cursor is None:
        return jsonify({"error": "No hay conexión con DB"}), 500
    try:
        g.db_cursor.execute("""
            DELETE FROM producto_colores
            WHERE id_producto = %s AND id_color = %s
        """, (id_producto, id_color))

        g.db.commit()
        return jsonify({"message": "Color eliminado del producto"}), 200
    
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al eliminar color: {err}"}), 500
