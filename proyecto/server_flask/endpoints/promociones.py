from flask import Blueprint, request, jsonify, g  # g: Objeto global de Flask para almacenar datos por solicitud (e.g., conexión DB)
import mysql.connector  # Librería para conectar con MySQL
import jwt  # Librería PyJWT para manejar tokens JWT (decodificar/verificar)
from server_flask.app import SECRET_KEY  # SECRET_KEY: Clave secreta definida en app.py para JWT

from server_flask.endpoints.auth_dueno import solo_dueno  # importá el decorador

bp = Blueprint('promociones', __name__, url_prefix='/promociones')  # Blueprint: Módulo de Flask para organizar rutas

# Función auxiliar para verificar si el usuario logueado es el dueño
def verificar_dueno():
    token = request.cookies.get('token')  # request.cookies: Objeto de Flask para acceder a cookies del navegador
    if not token:
        return False
    try:
        # jwt.decode: Función de PyJWT para decodificar y verificar el token JWT usando la clave secreta
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data['id_usuario']
        # g.db_cursor: Cursor de la base de datos establecido en before_request (para ejecutar queries)
        g.db_cursor.execute("SELECT id_cliente, id_empleado FROM usuarios WHERE id_usuario = %s", (user_id,))
        user = g.db_cursor.fetchone()
        # Verifica si id_cliente e id_empleado son NULL (solo el dueño los tiene así)
        return user and user['id_cliente'] is None and user['id_empleado'] is None
    except:
        return False

# ------------------- C R E A R -------------------
@bp.route("/", methods=["POST"])
def crear_promocion():
    if g.db_cursor is None:  # g.db_cursor: Verifica si la conexión DB está disponible
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if not verificar_dueno():  # verificar_dueno: Función propia para chequear permisos del dueño
        return jsonify({"error": "Solo el dueño puede crear promociones"}), 403
    
    datos = request.get_json()  # request.get_json(): Método de Flask para parsear JSON del body de la request
    descripcion = datos.get("descripcion")
    descuento = datos.get("descuento")
    tipo_descuento = datos.get("tipo_descuento")  # 'porcentaje' o 'fijo'
    fecha_inicio = datos.get("fecha_inicio")
    fecha_fin = datos.get("fecha_fin")
    id_categoria = datos.get("id_categoria")
    id_producto = datos.get("id_producto")
    activo = datos.get("activo", True)
    
    if not all([descripcion, descuento, tipo_descuento, fecha_inicio, fecha_fin]):
        return jsonify({"error": "Faltan campos obligatorios"}), 400
    if tipo_descuento not in ['porcentaje', 'fijo']:
        return jsonify({"error": "Tipo de descuento inválido"}), 400
    
    try:
        # g.db_cursor.execute: Ejecuta query SQL usando el cursor de DB
        g.db_cursor.execute("""
            INSERT INTO promociones (descripcion, descuento, tipo_descuento, fecha_inicio, fecha_fin, id_categoria, id_producto, activo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (descripcion, descuento, tipo_descuento, fecha_inicio, fecha_fin, id_categoria, id_producto, activo))
        g.db.commit()  # g.db.commit(): Confirma cambios en la DB (de mysql.connector)
        return jsonify({"mensaje": "Promoción creada exitosamente"}), 201
    except Exception as err:
        g.db.rollback()  # g.db.rollback(): Revierte cambios en caso de error (de mysql.connector)
        return jsonify({"error": f"Error al crear promoción: {err}"}), 500

# ------------------- 
@bp.route("/", methods=["GET"])
@solo_dueno
def listar_promociones():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # request.args.get(): Método de Flask para obtener parámetros de query string (e.g., ?activas=true)
        activas = request.args.get('activas', 'false').lower() == 'true'
        id_categoria = request.args.get('categoria')
        id_producto = request.args.get('producto')
        
        query = """
            SELECT p.*, c.categoria, pr.name AS producto, p.img_url 
            FROM promociones p
            LEFT JOIN categoria c ON p.id_categoria = c.id_category
            LEFT JOIN productos pr ON p.id_producto = pr.id_producto
            WHERE 1=1
        """
        params = []
        if activas:
            query += " AND p.activo = TRUE AND CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin"  # CURDATE(): Función SQL para fecha actual
        if id_categoria:
            query += " AND p.id_categoria = %s"
            params.append(id_categoria)
        if id_producto:
            query += " AND p.id_producto = %s"
            params.append(id_producto)
        
        g.db_cursor.execute(query, params)
        promociones = g.db_cursor.fetchall()  # fetchall(): Método de cursor para obtener todos los resultados
        return jsonify(promociones), 200
    except Exception as e:
        return jsonify({"error": f"Error al listar promociones: {e}"}), 500

#------------------- B U S C A R -------------------
@bp.route("/<int:id_promocion>", methods=["GET"])
def obtener_promocion(id_promocion):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("""
            SELECT p.*, c.categoria, pr.name AS producto
            FROM promociones p
            LEFT JOIN categoria c ON p.id_categoria = c.id_category
            LEFT JOIN productos pr ON p.id_producto = pr.id_producto
            WHERE p.id_promocion = %s
        """, (id_promocion,))
        promocion = g.db_cursor.fetchone()  # fetchone(): Método de cursor para obtener un solo resultado
        if not promocion:
            return jsonify({"error": "Promoción no encontrada"}), 404
        return jsonify(promocion), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener promoción: {e}"}), 500

#------------------- A C T U A L I Z A R -------------------
@bp.route("/<int:id_promocion>", methods=["PUT"])
@solo_dueno
def actualizar_promocion(id_promocion):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if not verificar_dueno():
        return jsonify({"error": "Solo el dueño puede actualizar promociones"}), 403
    
    datos = request.get_json()
    descripcion = datos.get("descripcion")
    descuento = datos.get("descuento")
    tipo_descuento = datos.get("tipo_descuento")
    fecha_inicio = datos.get("fecha_inicio")
    fecha_fin = datos.get("fecha_fin")
    id_categoria = datos.get("id_categoria")
    id_producto = datos.get("id_producto")
    activo = datos.get("activo")
    
    try:
        g.db_cursor.execute("""
            UPDATE promociones SET descripcion = %s, descuento = %s, tipo_descuento = %s, fecha_inicio = %s, fecha_fin = %s, id_categoria = %s, id_producto = %s, activo = %s
            WHERE id_promocion = %s
        """, (descripcion, descuento, tipo_descuento, fecha_inicio, fecha_fin, id_categoria, id_producto, activo, id_promocion))
        g.db.commit()
        return jsonify({"mensaje": "Promoción actualizada"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al actualizar promoción: {err}"}), 500

#------------------- E L I M I N A R -------------------
@bp.route("/<int:id_promocion>", methods=["DELETE"])
@solo_dueno
def eliminar_promocion(id_promocion):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if not verificar_dueno():
        return jsonify({"error": "Solo el dueño puede eliminar promociones"}), 403
    
    try:
        g.db_cursor.execute("DELETE FROM promociones WHERE id_promocion = %s", (id_promocion,))
        g.db.commit()
        return jsonify({"mensaje": "Promoción eliminada"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al eliminar promoción: {err}"}), 500

#Desactivar
@bp.route("/<int:id_promocion>/desactivar", methods=["PATCH"])
def desactivar_promocion(id_promocion):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if not verificar_dueno():
        return jsonify({"error": "Solo el dueño puede desactivar promociones"}), 403
    
    try:
        g.db_cursor.execute("UPDATE promociones SET activo = FALSE WHERE id_promocion = %s", (id_promocion,))
        g.db.commit()
        return jsonify({"mensaje": "Promoción desactivada"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al desactivar promoción: {err}"}), 500