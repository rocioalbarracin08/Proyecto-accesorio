from flask import Blueprint, request, jsonify, g

from werkzeug.security import generate_password_hash, check_password_hash

import jwt
from datetime import datetime, timezone, timedelta
from flask import make_response

bp = Blueprint('empleados', __name__, url_prefix='/empleados')

SECRET_KEY = "clave_super_secreta"

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
        
        hashed_password = generate_password_hash(password)
        
        #Insertar en empleados primero
        g.db_cursor.execute("""
            INSERT INTO empleados (nombre, apellido, email, id_tienda, puesto_trabajo, telefono)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (nombre, apellido, email, id_tienda, puesto_trabajo, telefono))
        id_empleado = g.db_cursor.lastrowid  # Obtener ID del empleado
        
        #Insertar en usuarios con id_empleado y rol 'empleado'
        g.db_cursor.execute("""
            INSERT INTO usuarios (id_empleado, email, password, id_rol, nombre, apellido,genero)
            VALUES (%s, %s, %s, (SELECT id_rol FROM roles WHERE rol = 'empleado'), %s, %s,%s)
        """, (id_empleado, email, hashed_password, nombre, apellido, genero))
        
        g.db.commit()
        return jsonify({"mensaje": "Empleado registrado correctamente"}), 201
    
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al registrar empleado: {err}"}), 500

@bp.route('/insertar', methods=['POST'])
def agregar_empleado():
    if g.db_cursor is None:  # Corrección: g.db_cursor
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        nombre = datos.get("nombre")
        apellido = datos.get("apellido")
        email = datos.get("email")
        id_tienda = datos.get("id_tienda")
        puesto_trabajo = datos.get("puesto_trabajo")
        telefono = datos.get("telefono")

        ###### POR LO QUE RECUERDO, EN ESTA TABLA NO HAY CAMPO GENERO ######
        if not all([nombre, apellido, email, id_tienda, puesto_trabajo, telefono]):
            return jsonify({"error": "Datos incompletos"}), 400
        g.db_cursor.execute("""
            INSERT INTO empleados (nombre, apellido, email, id_tienda, puesto_trabajo, telefono)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (nombre, apellido, email, id_tienda, puesto_trabajo, telefono))
        g.db.commit()
        return jsonify({"mensaje": "Empleado agregado"}), 201
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al agregar empleado: {err}"}), 500

@bp.route("/borrar", methods=["DELETE"])
def borrar_empleado():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        data = request.get_json()
        id_empleado = data.get("id_empleado")
        if not id_empleado:
            return jsonify({"error": "ID de empleado requerido"}), 400
        g.db_cursor.execute("DELETE FROM empleados WHERE id_empleado = %s", (id_empleado,))
        g.db.commit()
        return jsonify({"mensaje": "Empleado eliminado"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al borrar empleado: {err}"}), 500