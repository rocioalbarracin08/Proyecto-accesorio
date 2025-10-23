# server_flask/utils/auth_utils.py
import jwt
from flask import request, jsonify, g
from functools import wraps

SECRET_KEY = "clave_super_secreta"

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
