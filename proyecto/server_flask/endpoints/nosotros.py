from flask import Blueprint, request, jsonify, g
from server_flask.endpoints.auth_dueno import solo_dueno  # Importa el decorador

bp = Blueprint('nosotros', __name__, url_prefix='/nosotros')

@bp.route('/', methods=['GET'])
def get_nosotros():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT * FROM nosotros LIMIT 1")  # Asumiendo una sola fila
        data = g.db_cursor.fetchone()
        if not data:
            return jsonify({"error": "Datos no encontrados"}), 404
        return jsonify(data)
    except Exception as err:
        return jsonify({"error": f"Error: {err}"}), 500

@bp.route('/modificar', methods=['PUT'])
@solo_dueno  # Solo el dueño puede editar
def update_nosotros():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        data = request.get_json()
        # Actualiza solo los campos enviados
        updates = []
        params = []
        for field in ['titulo', 'descripcion', 'imagenes', 'preguntas', 'ubicacion_lat', 'ubicacion_lng', 'ubicacion_descripcion']:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        if not updates:
            return jsonify({"error": "No hay campos para actualizar"}), 400
        
        query = f"UPDATE nosotros SET {', '.join(updates)} WHERE id = 1"  # Asumiendo id=1
        g.db_cursor.execute(query, params)
        g.db.commit()
        return jsonify({"mensaje": "Actualizado exitosamente"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error: {err}"}), 500