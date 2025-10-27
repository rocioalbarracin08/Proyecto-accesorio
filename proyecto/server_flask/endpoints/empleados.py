from flask import Blueprint, request, jsonify, g
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timezone, timedelta
from flask import make_response

bp = Blueprint('empleados', __name__, url_prefix='/empleados')

from server_flask.utils.config import SECRET_KEY
from server_flask.utils.auth import solo_dueno

@bp.route('/listar')
@solo_dueno
def listar_empleados():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("""
            SELECT e.id_empleado, e.nombre, e.apellido, e.email, e.puesto_trabajo, e.telefono, 
                   t.nombre AS tienda_nombre, u.genero, e.activo
            FROM empleados e
            JOIN tiendas t ON e.id_tienda = t.id_tienda
            JOIN usuarios u ON e.id_empleado = u.id_empleado
        """)
        empleados = g.db_cursor.fetchall()
        print(f"Empleados encontrados: {len(empleados)}")  # Log para depurar | Parece haber solo 1 empleado por alguna razón (el empleado no esta en usuarios)
        return jsonify(empleados)
    except Exception as e:
        return jsonify({"error": f"Error al listar empleados: {e}"}), 500

@bp.route('/editar/<int:id_empleado>', methods=['PUT'])
@solo_dueno
def editar_empleado(id_empleado):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        apellido = data.get('apellido')
        email = data.get('email')
        puesto_trabajo = data.get('puesto_trabajo')
        telefono = data.get('telefono')
        genero = data.get('genero')
        password = data.get('password')

        # Actualizar empleados
        g.db_cursor.execute("""
            UPDATE empleados 
            SET nombre = %s, apellido = %s, email = %s, puesto_trabajo = %s, telefono = %s 
            WHERE id_empleado = %s
        """, (nombre, apellido, email, puesto_trabajo, telefono, id_empleado))
        
        # Actualizar usuarios
        if password:
            hashed_password = generate_password_hash(password)
            g.db_cursor.execute("""
                UPDATE usuarios 
                SET email = %s, genero = %s, password = %s 
                WHERE id_empleado = %s
            """, (email, genero, hashed_password, id_empleado))
        else:
            g.db_cursor.execute("""
                UPDATE usuarios 
                SET email = %s, genero = %s 
                WHERE id_empleado = %s
            """, (email, genero, id_empleado))
        
        g.db.commit()
        return jsonify({"mensaje": "Empleado actualizado"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al editar empleado: {err}"}), 500

# Desactivar/Activar empleado (en lugar de eliminar)
@bp.route("/desactivar/<int:id_empleado>", methods=["PATCH"])
@solo_dueno
def desactivar_empleado(id_empleado):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Verificar si existe y obtener estado actual
        g.db_cursor.execute("SELECT activo FROM empleados WHERE id_empleado = %s", (id_empleado,))
        emp = g.db_cursor.fetchone()
        if not emp:
            return jsonify({"error": "Empleado no encontrado"}), 404
        
        nuevo_activo = 0 if emp['activo'] == 1 else 1  # Toggle
        
        # Actualizar empleados y usuarios
        g.db_cursor.execute("UPDATE empleados SET activo = %s WHERE id_empleado = %s", (nuevo_activo, id_empleado))
        g.db_cursor.execute("UPDATE usuarios SET activo = %s WHERE id_empleado = %s", (nuevo_activo, id_empleado))
        g.db.commit()
        return jsonify({"mensaje": f"Empleado {'desactivado' if nuevo_activo == 0 else 'activado'}"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al cambiar estado: {err}"}), 500

################## Registrar empleados (solo dueño)###########################
@bp.route('/registro_por_dueno', methods=['POST'])
def registro_por_dueno():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    #Verificar si el usuario logueado es el dueño
    token = request.cookies.get('token')
    if not token:
        return jsonify({"error": "No autorizado"}), 401
    try:
        data_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data_token['id_usuario']
        g.db_cursor.execute("SELECT id_cliente, id_empleado FROM usuarios WHERE id_usuario = %s", (user_id,))
        user = g.db_cursor.fetchone()
        if not user or user['id_cliente'] is not None or user['id_empleado'] is not None:
            return jsonify({"error": "Solo el dueño puede registrar empleados"}), 403
    except:
        return jsonify({"error": "Token inválido"}), 401
    
    #Procesar registro de empleado
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        apellido = data.get('apellido')
        email = data.get('email')
        id_tienda = data.get('id_tienda')
        puesto_trabajo = data.get('puesto_trabajo')
        telefono = data.get('telefono')
        genero = data.get('genero')
        password = data.get('password')  #password para empleados
        
        if not all([nombre, apellido, email, id_tienda, puesto_trabajo, telefono,genero, password]):
            return jsonify({'error': 'Faltan datos obligatorios'}), 400
        
        #Verificar email único
        g.db_cursor.execute("SELECT id_usuario FROM usuarios WHERE email = %s", (email,))
        if g.db_cursor.fetchone():
            return jsonify({"error": "El email ya está registrado"}), 409
        #Verificar si existe la tienda ingresada
        g.db_cursor.execute("SELECT id_tienda FROM tiendas WHERE id_tienda = %s", (id_tienda,))
        if not g.db_cursor.fetchone():
            return jsonify({"error": "Tienda no existe"}), 400
            
        hashed_password = generate_password_hash(password)
        
        #Insertar en empleados primero
        g.db_cursor.execute("""
            INSERT INTO empleados (nombre, apellido, email, id_tienda, puesto_trabajo, telefono, activo)
            VALUES (%s, %s, %s, %s, %s, %s,1)
        """, (nombre, apellido, email, id_tienda, puesto_trabajo, telefono))
        id_empleado = g.db_cursor.lastrowid  # Obtener ID del empleado
        
        #Insertar en usuarios con id_empleado y rol 'empleado'
        g.db_cursor.execute("""
            INSERT INTO usuarios (id_empleado, email, password, id_rol, nombre, apellido,genero, activo)
            VALUES (%s, %s, %s, (SELECT id_rol FROM roles WHERE rol = 'empleado'), %s, %s,%s,1)
        """, (id_empleado, email, hashed_password, nombre, apellido, genero))
        
        g.db.commit()
        return jsonify({"mensaje": "Empleado registrado correctamente"}), 201
    
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al registrar empleado: {err}"}), 500