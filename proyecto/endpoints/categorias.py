#Hacer importaciones necesarias

#No se pierda el nombre original de la función decorada
from flaskr.db import get_db

#Blueprint: agrupar rutas y lógica en módulos (ej: auth, accesorios)
from flask import (Blueprint, url_for, request, session)

#generate_password_hash : encripta la contraseña antes de guardarla en la base de datos
#check_password_hash: compara una contraseña ingresada con la contraseña encriptada guardada.
from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('ro', __name__, url_prefix='/ro')

@bp.route("/categorias") #Para el boton de navegacón
def categorias():
    conexion =  obtener_conexion()
    if conexion is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor(dictionary=True)  # Para devolver como diccionarios
    cursor.execute("SELECT categoria FROM categoria")  # Ajusta según tu tabla
    
    categorias = cursor.fetchall()  # Lista de dicts con las categorías
    
    cursor.close()
    conexion.close()
    return jsonify(categorias)