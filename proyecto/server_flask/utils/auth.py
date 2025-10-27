import jwt
from flask import request, jsonify, g
from functools import wraps

from server_flask.utils.config import SECRET_KEY

def solo_dueno(f):
    @wraps(f)
    def decorador(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return jsonify({"error": "No autorizado"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            g.db_cursor.execute("""
                SELECT id_cliente, id_empleado FROM usuarios WHERE id_usuario = %s
            """, (data["id_usuario"],))
            user = g.db_cursor.fetchone()
            # Si tiene id_cliente o id_empleado, no es dueño
            if not user or user["id_cliente"] is not None or user["id_empleado"] is not None:
                return jsonify({"error": "Acceso solo para el dueño"}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except Exception as e:
            return jsonify({"error": f"Token inválido: {e}"}), 401
        return f(*args, **kwargs)
    return decorador

def solo_empleado(f):
    def wrapper(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return jsonify({"error": "No autorizado"}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = data['id_usuario']

            # Buscar id_rol del usuario
            g.db_cursor.execute("SELECT id_rol FROM usuarios WHERE id_usuario = %s", (user_id,))
            user = g.db_cursor.fetchone()

            # Buscar id_rol del rol 'empleado'
            g.db_cursor.execute("SELECT id_rol FROM roles WHERE rol = 'empleado'")
            id_empleado = g.db_cursor.fetchone()

            if not user or not id_empleado or user['id_rol'] != id_empleado['id_rol']:
                return jsonify({"error": "Solo empleados pueden acceder"}), 403

        except Exception as e:
            print(e)  # útil para debug
            return jsonify({"error": "Token inválido"}), 401

        return f(*args, **kwargs)
    wrapper.__name__ = f.__name__
    return wrapper
