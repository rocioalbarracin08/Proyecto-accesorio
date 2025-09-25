#Hacer importaciones necesarias

#No se pierda el nombre original de la función decorada
from proyecto.server-flask.app import conexion_db
from flask import g


#Blueprint: agrupar rutas y lógica en módulos (ej: auth, accesorios)
from flask import Blueprint, url_for, request, session, jsonify

#generate_password_hash : encripta la contraseña antes de guardarla en la base de datos
#check_password_hash: compara una contraseña ingresada con la contraseña encriptada guardada.
from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('roCategoria', __name__, url_prefix='/roCategoria')


@bp.route("/categorias/mostrar") #Para el boton de navegacón
def categorias():
    conexion =  conexion_db()
    if conexion is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor(dictionary=True)  # Para devolver como diccionarios
    cursor.execute("SELECT categoria FROM categoria")  # Ajusta según tu tabla
    
    categorias = cursor.fetchall()  # Lista de dicts con las categorías
    
    cursor.close()
    conexion.close()
    return jsonify(categorias)

@bp.route("/borrar/categoria", methods=('GET', 'POST'))
def borrarRegistro():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    try:
        # Aseguramos que la solicitud sea POST
        if request.method == 'POST':
            datos = request.get_json()
            id = datos.get("idCategoria")
            
            g.db_cursor.execute("DELETE FROM categoria WHERE id =%s", (id,))
            g.db.commit()  # conexión en 'g' para confirmar
            print(f"Registro con ID {id} eliminado exitosamente.")
            return jsonify({"mensaje": "Registro eliminado"}), 200

    except Exception as err:
        g.db.rollback()  #conexión en 'g' para revertir
        print(f"Error al eliminar el registro: {err}")
        return jsonify({"error": f"Error al eliminar el registro: {err}"}), 500

@bp.route("/crear/categoria", methods=('GET','POST'))
#@login_required  -> se asegura de que la función no se ejecute a menos que el usuario esté autenticado
def crearCategoria():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    if request.method == 'POST':
        datos = request.get_json()
        nombreCategoria = datos.get("categoria")

        try:
            g.db_cursor.execute("INSERT INTO categoria (nombre) VALUES (%s)", (nombreCategoria,))
            g.db.commit() 

        except Exception as err:
            g.db.rollback()  # ✅ Usa la conexión en 'g' para revertir
            return jsonify({"error": f"Error al crear la categoría: {err}"}), 400

@bp.route("/modificar/categoria", methods=('GET', 'POST'))
def modificarCategoria():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 400 #Es error 500 o 400?

    try:
        
        if request.method == 'POST':
            # Obtiene los datos de la solicitud JSON
            datos = request.get_json()
            nombreCategoria = datos.get("nombreCategoria") #'nombreCategoria' para mayor claridad
            idCategoria = datos.get("idCategoria") #ID para saber qué registro modificar

            g.db_cursor.execute("UPDATE categoria SET nombre = %s WHERE id = %s", (nombreCategoria, idCategoria))
            g.db.commit()  # Confirma la transacción en la base de datos

            return jsonify({"mensaje": "Registro modificado"}), 200
        
    except Exception as err:
        g.db.rollback()  # Revierte la transacción en caso de error
        print(f"Error al modificar el registro: {err}")
        return jsonify({"error": f"Error al modificar el registro: {err}"}), 500



     

