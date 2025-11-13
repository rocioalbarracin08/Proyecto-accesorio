from flask import Blueprint, request, jsonify,g

from werkzeug.security import generate_password_hash, check_password_hash

from server_flask.extensions import mail  
from flask_mail import Mail, Message  # Para enviar emails

import jwt
from datetime import datetime, timezone, timedelta
from flask import make_response


bp = Blueprint('usuarios', __name__, url_prefix='/usuarios')

from server_flask.utils.config import SECRET_KEY

@bp.route('/register', methods=['POST'])
def register():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        if request.method == 'POST': 
            data = request.get_json()

            nombre = data.get('nombre')
            apellido = data.get('apellido')
            genero = data.get('genero')
            email = data.get('email')
            password = data.get('password')

        if not all([nombre, apellido, genero, email, password]):
            return jsonify({'error': 'Faltan datos obligatorios'}), 400
        
        #Verificar que no haya otro usuario con el mismo mail
        g.db_cursor.execute("SELECT id_usuario FROM usuarios WHERE email = %s", (email,))
        if g.db_cursor.fetchone():
            return jsonify({"error": "El email ya está registrado"}), 409
        
        # Hashear contraseña
        hashed_password = generate_password_hash(password)
        ## cuando borre de la tabla de clientes email y password tengo 
        ## que sacarlo de aca tambien
        g.db_cursor.execute("""
            INSERT INTO clientes ()
            VALUES ()
        """)
        id_cliente = g.db_cursor.lastrowid  # Obtener el ID del cliente recién insertado
        print (id_cliente)
        g.db_cursor.execute("""
            INSERT INTO usuarios (id_cliente, email, password, id_rol, nombre, apellido, genero)
            VALUES (%s, %s, %s, (select id_rol from roles where rol = 'cliente'),%s,%s,%s)
        """, (id_cliente, email, hashed_password, nombre, apellido, genero))
        g.db.commit()

        return jsonify({"mensaje": "Usuario registrado correctamente"}), 201
    
    except Exception as err:
        g.db.rollback()  #conexión en 'g' para revertir | rollback: deshacer los cambios realizados que no se han confirmado commit()
        print(err)
        return jsonify({"error": f"Error al registrar: {err}"}), 500


@bp.route('/login', methods=['POST'])
def login():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not all([email, password]):
            return jsonify({'error': 'Faltan datos'}), 400
        
        print(f"Intentando login con email: {email}")

        g.db_cursor.execute("SELECT id_usuario, password, activo FROM usuarios WHERE email = %s", (email,))
        user = g.db_cursor.fetchone()

        if not user:
            print("Email no registrado") 
            return jsonify({"error": "El email no está registrado"}), 401

        if not check_password_hash(user["password"], password):
            return jsonify({"error": "La contraseña es incorrecta"}), 401

        if user.get("activo", 1) == 0:
            return jsonify({"error": "Cuenta desactivada"}), 403
        
        print(f"Token con email: {email}")
        token = jwt.encode({
            "id_usuario": user["id_usuario"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=4)
        }, SECRET_KEY, algorithm="HS256")

        if isinstance(token, bytes):
            token = token.decode('utf-8')

        response = make_response(jsonify({"mensaje": "Login exitoso"}))
        response.set_cookie('token', token, httponly=True, samesite='Lax')

        return response, 200

    except Exception as err:
        print(f"Error en login: {err}")
        return jsonify({"error": f"Error interno: {str(err)}"}), 500

################ LECTURA DE LA COOKIE #####################
@bp.route('/perfil')
def perfil():
    token = request.cookies.get('token')  # lee la cookie
    if not token:
        return jsonify({"error": "No estás logueado"}), 401
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data['id_usuario']
        # Buscar datos completos del usuario, incluyendo id_tienda si es empleado
        g.db_cursor.execute("""
            SELECT u.nombre, u.apellido, u.genero, u.email, u.id_cliente, u.id_empleado, e.id_tienda 
            FROM usuarios u 
            LEFT JOIN empleados e ON u.id_empleado = e.id_empleado 
            WHERE u.id_usuario = %s
        """, (user_id,))
        user = g.db_cursor.fetchone()
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        return jsonify(user)
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Token inválido"}), 405

#Cambiar contraseña (cualquier rol logueado) 
@bp.route('/cambiar_contrasena', methods=['POST'])
def cambiar_contrasena():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    # Verificar usuario logueado
    token = request.cookies.get('token')
    if not token:
        return jsonify({"error": "No autorizado"}), 401
    try:
        data_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data_token['id_usuario']
        
        # Obtener contraseña actual del usuario
        g.db_cursor.execute("SELECT password FROM usuarios WHERE id_usuario = %s", (user_id,))
        user = g.db_cursor.fetchone()
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
    except:
        return jsonify({"error": "Token inválido"}), 401
    
    # Procesar cambio
    try:
        data = request.get_json()
        contrasena_actual = data.get('contrasena_actual')
        nueva_contrasena = data.get('nueva_contrasena')
        if not contrasena_actual or not nueva_contrasena:
            return jsonify({"error": "Ambas contraseñas requeridas"}), 400
        
        # Verificar contraseña actual
        if not check_password_hash(user['password'], contrasena_actual):
            return jsonify({"error": "Contraseña actual incorrecta"}), 401
        
        # Hashear nueva y actualizar
        hashed_nueva = generate_password_hash(nueva_contrasena)
        g.db_cursor.execute("UPDATE usuarios SET password = %s WHERE id_usuario = %s", (hashed_nueva, user_id))
        g.db.commit()
        
        return jsonify({"mensaje": "Contraseña cambiada exitosamente"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error cambiando contraseña: {err}"}), 500

################### LO TENGO DUPLICADO EN AUTH_DUENO ###########################3
@bp.route('/es_dueno')
def es_dueno():
    token = request.cookies.get('token')
    if not token:
        return jsonify({"es_dueno": False}), 401
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data['id_usuario']
        g.db_cursor.execute("SELECT id_cliente, id_empleado FROM usuarios WHERE id_usuario = %s", (user_id,))
        user = g.db_cursor.fetchone()
        #(solo si id_cliente e id_empleado son NULL)
        if user and user['id_cliente'] is None and user['id_empleado'] is None:
            return jsonify({"es_dueno": True})
        return jsonify({"es_dueno": False})
    except:
        return jsonify({"es_dueno": False}), 401

############## CERRAR SESIÓN Y borrar logueo ##############
@bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"mensaje": "Sesión cerrada"}))
    response.set_cookie('token', '', expires=0)  # borra la cookie
    return response, 200

#Solicitar recuperación
@bp.route('/recuperar', methods=['POST'])
def recuperar_contrasena():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email requerido"}), 400
    
    try:
        # Verificar que el email existe y es cliente
        g.db_cursor.execute("""
            SELECT u.id_usuario FROM usuarios u 
            JOIN roles r ON u.id_rol = r.id_rol 
            WHERE u.email = %s
        """, (email,))
        user = g.db_cursor.fetchone()
        if not user:
            return jsonify({"error": "Email no registrado o no es cliente"}), 404
        
        # Generar token JWT temporal (expira en 1 hora)
        reset_token = jwt.encode({
            "id_usuario": user['id_usuario'],
            "exp": datetime.now(timezone.utc) + timedelta(hours=1)
        }, SECRET_KEY, algorithm="HS256")
        
        # Guardar token en DB
        g.db_cursor.execute("""
            UPDATE usuarios SET reset_token = %s, reset_expires = %s WHERE id_usuario = %s
        """, (reset_token, datetime.now(timezone.utc) + timedelta(hours=1), user['id_usuario']))
        g.db.commit()
        
        # Enviar email (configura mail en app.py)
        reset_url = f"http://localhost:5173/resetear-contrasena?token={reset_token}"  # Ajusta dominio
        #msg = Message('Recuperación de Contraseña', sender='tuemail@gmail.com', recipients=[email])
        #msg.body = f'Haz click aquí para resetear tu contraseña: {reset_url}'
        #mail.send(msg)   mail configurado en app.py
        print(f"Simulación: Email enviado a {email}. Enlace de recuperación: {reset_url}")
        return jsonify({"reset_url": reset_url}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error en recuperación: {err}"}), 500

#Resetear contraseña
@bp.route('/resetear', methods=['POST'])
def resetear_contrasena():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    data = request.get_json()
    token = data.get('token')
    nueva_password = data.get('password')  

    if not token or not nueva_password:
        return jsonify({"error": "Token y nueva contraseña requeridos"}), 400
    
    try:
        # Verificar token
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload['id_usuario']
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Token inválido"}), 401
    
    try:
        # Verificar token en DB y expiración
        g.db_cursor.execute("""
            SELECT id_usuario FROM usuarios 
            WHERE id_usuario = %s AND reset_token = %s AND reset_expires > NOW()
        """, (user_id, token))
        user = g.db_cursor.fetchone()
        if not user:
            return jsonify({"error": "Token inválido o expirado"}), 401
        
        # Hashear nueva contraseña y actualizar
        hashed_password = generate_password_hash(nueva_password)
        g.db_cursor.execute("""
            UPDATE usuarios SET password = %s, reset_token = NULL, reset_expires = NULL WHERE id_usuario = %s
        """, (hashed_password, user_id))
        g.db.commit()
        
        return jsonify({"mensaje": "Contraseña reseteada exitosamente"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error en reseteo: {err}"}), 500