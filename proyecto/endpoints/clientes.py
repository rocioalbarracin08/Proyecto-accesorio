from proyecto.app import obtener_conexion
from flask import Blueprint, url_for, request, session, jsonify
from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('roClientes', __name__, url_prefix='/roClientes')

@bp.route('/clientes') # GET por defecto
def obtener_clientes():
    conexion = obtener_conexion() #Abrimos conexión
    if conexion is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    #si
    cursor = conexion.cursor(dictionary=True) #¿?
    cursor.execute("SELECT * FROM clientes")  # Suponiendo que tienes una tabla 'usuarios'
    
    usuarios = cursor.fetchall()  # Obtiene todos los registros de la consulta
    
    # Cerrar el cursor y la conexión
    cursor.close()
    conexion.close()
    
    return jsonify(usuarios)