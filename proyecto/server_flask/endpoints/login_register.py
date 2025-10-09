from flask import Blueprint, request, jsonify,g

from werkzeug.security import generate_password_hash, check_password_hash

import jwt
from datetime import datetime, timezone, timedelta
from flask import make_response

bp = Blueprint('usuarios', __name__, url_prefix='/usuarios')
SECRET_KEY = "clave_super_secreta"

@bp.route('/register', methods=['POST'])
def register():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        if request.method == 'POST': 
            data = request.get_json()

            name = data.get('nombre')
            apellido = data.get('apellido')
            genero = data.get('genero')
            email = data.get('email')
            password = data.get('password')

        if not all([name, apellido, genero, email, password]):
            return jsonify({'error': 'Faltan datos obligatorios'}), 400
        
        #Verificar que no haya otro usuario con el mismo mail
        g.db_cursor.execute("SELECT id_cliente FROM clientes WHERE email = %s", (email,))
        if g.db_cursor.fetchone():
            return jsonify({"error": "El email ya está registrado"}), 409
        
        # Hashear contraseña
        hashed_password = generate_password_hash(password)
        
        g.db_cursor.execute("""
            INSERT INTO clientes (name, apellido, genero, email, password)
            VALUES (%s, %s, %s, %s, %s)
        """, (name, apellido, genero, email, hashed_password))

        g.db.commit()

        return jsonify({"mensaje": "Usuario registrado correctamente"}), 201
    
    except Exception as err:
        g.db.rollback()  #conexión en 'g' para revertir | rollback: deshacer los cambios realizados que no se han confirmado commit()
        print(f"Error al eliminar el registro: {err}")
        return jsonify({"error": f"Error al eliminar el registro: {err}"}), 500
    

@bp.route('/login', methods=['POST'])
def login():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        data = request.get_json()
        email = data.get('email') #Esto lo verifica bien
        password = data.get('password') #Esto no lo verifica bien

        if not all([email, password]):
            return jsonify({'error': 'Faltan datos'}), 400

        g.db_cursor.execute("SELECT id_cliente, password FROM clientes WHERE email = %s", (email,))
        user = g.db_cursor.fetchone()

        #Verificamos si el usuario existe y si la contraseña es correcta
        if not user:
            return jsonify({"error": "El email no está registrado"}), 401
        if not check_password_hash(user[1], password):
            return jsonify({"error": "La contraseña es incorrecta"}), 401

        # Creo un token JWT, que es un texto cifrado
        token = jwt.encode({ 
            #Datos del usuario
            "id_cliente": user[0], # el id del usuario esta en el índice 0 de la lista
            "exp": datetime.now(timezone.utc) + timedelta(hours=4) # vence en 2 horas
        }, SECRET_KEY, algorithm="HS256") #cómo cifrar y firmar el token, hash usado
        if isinstance(token, bytes):
            token = token.decode('utf-8')

        response = make_response(jsonify({"mensaje": "Login exitoso"}))

        #guarda el token en una cookie del navegador
        response.set_cookie('token', token, httponly=True, samesite='Lax')

        return response, 200

    except Exception as err:
        print(f"Error en login: {err}")
        return jsonify({"error": f"Error interno: {str(err)}"}), 500

################ LECTURA DE LA COOKIE #####################
@bp.route('/perfil', methods=['GET'])
def perfil():
    token = request.cookies.get('token')  # lee la cookie
    if not token:
        return jsonify({"error": "No estás logueado"}), 401

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data['id_cliente']
        return jsonify({"mensaje": f"Usuario logueado con id {user_id}"})
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Token inválido"}), 401


############## CERRAR SESIÓN Y borrar logueo ##############
@bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"mensaje": "Sesión cerrada"}))
    response.set_cookie('token', '', expires=0)  # borra la cookie
    return response, 200