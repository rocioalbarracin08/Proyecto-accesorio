from flask import Blueprint, request, jsonify,g
from werkzeug.security import generate_password_hash

bp = Blueprint('usuarios', __name__, url_prefix='/usuarios')

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
        
        
        g.db_cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
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