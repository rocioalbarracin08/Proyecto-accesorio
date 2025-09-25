#Hacer importaciones necesarias

#No se pierda el nombre original de la función decorada
from proyecto.app import obtener_conexion

#Blueprint: agrupar rutas y lógica en módulos (ej: auth, accesorios)
from flask import Blueprint, url_for, request, session, jsonify

#generate_password_hash : encripta la contraseña antes de guardarla en la base de datos
#check_password_hash: compara una contraseña ingresada con la contraseña encriptada guardada.
from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('roCategoria', __name__, url_prefix='/roCategoria')

@bp.route("/categorias/mostrar") #Para el boton de navegacón
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

@bp.route("/crear/categoria", methods=('GET','POST'))
#@login_required  -> se asegura de que la función no se ejecute a menos que el usuario esté autenticado
def crearCategoria():
    conexion = obtener_conexion()
    if conexion in None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor(dictionary=True)  # Para devolver como diccionarios

    if request.method == 'POST':
        datos = request.get_json()
        nombreCategoria = datos.get("categoria")

        try:
            cursor.execute(
                "INSERT INTO categorias (categoria) VALUES (?)",(nombreCategoria,)
            )
            conexion.commit()

        except Exception as e:
        return jsonify({"error": str(e)}), 400

    cursor.close()
    conexion.close()

@bp.route("/modificar/categoria", methods=('GET', 'POST'))
def modificarCategoria():
    conexion = obtener_conexion()
    if conexion in None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor(dictionary=True) 

    if request.method == 'POST':
        datos = request.get_json()
        nombreCategoria = datos.get("categoria")

