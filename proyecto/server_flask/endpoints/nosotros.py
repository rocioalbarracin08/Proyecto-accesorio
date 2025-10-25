from flask import Blueprint, request, jsonify, g
from proyecto.server_flask.utils.auth_dueno import solo_dueno
import json

bp = Blueprint('nosotros', __name__, url_prefix='/nosotros')

@bp.route('', methods=['GET'])
def get_nosotros():
    if g.db_cursor is None:
        print("Error: No se pudo conectar a la DB")
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        print("Ejecutando consulta a 'nosotros'")
        # Obtener fila id=1 (nosotros principal)
        g.db_cursor.execute("SELECT * FROM nosotros WHERE id = 1")
        data_nosotros = g.db_cursor.fetchone()
        # Obtener fila id=2 (preguntas)
        g.db_cursor.execute("SELECT * FROM nosotros WHERE id = 2")
        data_preguntas = g.db_cursor.fetchone()
        
        print(f"Datos nosotros: {data_nosotros}")
        print(f"Datos preguntas: {data_preguntas}")
        
        # Normalizar fila nosotros (id=1) - AGREGAR preguntas
        nosotros = {
            "titulo": data_nosotros.get('titulo', '') if data_nosotros else '',
            "descripcion": data_nosotros.get('descripcion', '') if data_nosotros else '',
            "imagenes": json.loads(data_nosotros.get('imagenes', '[]')) if data_nosotros and data_nosotros.get('imagenes') else [],
            "preguntas": json.loads(data_nosotros.get('preguntas', '[]')) if data_nosotros and data_nosotros.get('preguntas') else [],  # AGREGADO
            "ubicacion_lat": data_nosotros.get('ubicacion_lat', 0) if data_nosotros else 0,
            "ubicacion_lng": data_nosotros.get('ubicacion_lng', 0) if data_nosotros else 0,
            "ubicacion_descripcion": data_nosotros.get('ubicacion_descripcion', '') if data_nosotros else '',
        }
        
        # Normalizar fila preguntas (id=2)
        preguntas = {
            "preguntas": json.loads(data_preguntas.get('preguntas', '[]')) if data_preguntas and data_preguntas.get('preguntas') else [],
        }
        
        return jsonify({"nosotros": nosotros, "preguntas": preguntas})
    except Exception as err:
        print(f"Error en get_nosotros: {err}")
        return jsonify({"error": f"Error: {err}"}), 500

@bp.route('', methods=['PUT'])
@solo_dueno
def update_nosotros():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        data = request.get_json()
        print(f"Datos recibidos para UPDATE nosotros: {data}")
        
        # Convierte imagenes y preguntas a JSON strings
        imagenes = json.dumps(data.get('imagenes', []))
        preguntas = json.dumps(data.get('preguntas', []))  # AGREGADO
        
        # UPDATE fila id=1 - AGREGAR preguntas
        query = """
        UPDATE nosotros 
        SET titulo = %s, descripcion = %s, imagenes = %s, preguntas = %s, ubicacion_lat = %s, ubicacion_lng = %s, ubicacion_descripcion = %s 
        WHERE id = 1
        """
        params = [
            data.get('titulo', ''),
            data.get('descripcion', ''),
            imagenes,
            preguntas,  # AGREGADO
            data.get('ubicacion_lat', 0),
            data.get('ubicacion_lng', 0),
            data.get('ubicacion_descripcion', ''),
        ]
        g.db_cursor.execute(query, params)
        print(f"Filas afectadas en nosotros: {g.db_cursor.rowcount}")
        g.db.commit()
        return jsonify({"mensaje": "Nosotros actualizado exitosamente"}), 200
    except Exception as err:
        g.db.rollback()
        print(f"Error en update_nosotros: {err}")
        return jsonify({"error": f"Error: {err}"}), 500

@bp.route('/preguntas', methods=['PUT'])
@solo_dueno
def update_preguntas():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        data = request.get_json()
        print(f"Datos recibidos para UPDATE preguntas: {data}")
        
        # Convierte preguntas a JSON string
        preguntas = json.dumps(data.get('preguntas', []))
        
        # UPDATE fila id=2
        query = "UPDATE nosotros SET preguntas = %s WHERE id = 2"
        g.db_cursor.execute(query, [preguntas])
        print(f"Filas afectadas en preguntas: {g.db_cursor.rowcount}")
        g.db.commit()
        return jsonify({"mensaje": "Preguntas actualizadas exitosamente"}), 200
    except Exception as err:
        g.db.rollback()
        print(f"Error en update_preguntas: {err}")
        return jsonify({"error": f"Error: {err}"}), 500