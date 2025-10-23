from flask import Blueprint, request, jsonify, g
from server_flask.endpoints.auth_dueno import solo_dueno  # Importa el decorador
import json  # Agrega esto para parsear JSON

bp = Blueprint('nosotros', __name__, url_prefix='/nosotros')

@bp.route('/', methods=['GET'])
def get_nosotros():
    if g.db_cursor is None:
        print("Error: No se pudo conectar a la DB")  # Log
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        print("Ejecutando consulta a 'nosotros'")  # Log
        g.db_cursor.execute("SELECT * FROM nosotros LIMIT 1")
        data = g.db_cursor.fetchone()
        print(f"Datos obtenidos: {data}")  # Log: Muestra los datos
        if not data:
            print("No se encontraron datos en 'nosotros'")  # Log
            return jsonify({"error": "Datos no encontrados"}), 404
        
        # Parsea JSON si son strings (de MySQL)
        if 'preguntas' in data and isinstance(data['preguntas'], str):
            data['preguntas'] = json.loads(data['preguntas'])
        if 'imagenes' in data and isinstance(data['imagenes'], str):
            data['imagenes'] = json.loads(data['imagenes'])
        
        return jsonify(data)
    except Exception as err:
        print(f"Error en get_nosotros: {err}")  # Log
        return jsonify({"error": f"Error: {err}"}), 500


@bp.route('/', methods=['PUT'])  # Cambia '/modificar' a '/' para que sea /nosotros con PUT
@solo_dueno  # Solo el dueño puede editar
def update_nosotros():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        data = request.get_json()
        
        # Convierte preguntas a string JSON si es array (para guardar en MySQL)
        if 'preguntas' in data and isinstance(data['preguntas'], list):
            data['preguntas'] = json.dumps(data['preguntas'])
        if 'imagenes' in data and isinstance(data['imagenes'], list):
            data['imagenes'] = json.dumps(data['imagenes'])
        
        # Actualiza solo los campos enviados
        updates = []
        params = []
        for field in ['titulo', 'descripcion', 'imagenes', 'preguntas', 'ubicacion_lat', 'ubicacion_lng', 'ubicacion_descripcion']:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])
        if not updates:
            return jsonify({"error": "No hay campos para actualizar"}), 400
        
        query = f"UPDATE nosotros SET {', '.join(updates)} WHERE id = 1"  # Asumiendo id=1; ajusta si es diferente
        g.db_cursor.execute(query, params)
        g.db.commit()
        return jsonify({"mensaje": "Actualizado exitosamente"}), 200
    except Exception as err:
        g.db.rollback()
        print(f"Error en update_nosotros: {err}")  # Log para depurar
        return jsonify({"error": f"Error: {err}"}), 500