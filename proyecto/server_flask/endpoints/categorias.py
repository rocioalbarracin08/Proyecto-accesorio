#Hacer importaciones necesarias

#Blueprint: agrupar rutas y lógica en módulos (ej: auth, accesorios)
from flask import Blueprint, url_for, request, session, jsonify,g

#generate_password_hash : encripta la contraseña antes de guardarla en la base de datos
#check_password_hash: compara una contraseña ingresada con la contraseña encriptada guardada.
from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('/roCategoria', __name__, url_prefix='/roCategoria')


@bp.route("/categorias/mostrar") #Para el boton de navegacón
def categorias():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT categoria FROM categoria") # Ejecuta la consulta
        categorias = g.db_cursor.fetchall()#Obtenemos todos los resultados de la consulta
        return jsonify(categorias)  # Devuelve los resultados en formato JSON
        
    except Exception as e:
        print(f"Error al obtener categorías: {e}") #Muestra el error en la cnsola del servidor
        return jsonify({"error": "Hubo un problema al consultar las categorías"}), 500 #Response con error

@bp.route("/borrar/categoria", methods=['DELETE'])
def borrarRegistro():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Obtener el id_category de la solicitud DELETE
        datos = request.get_json()
        id_category = datos.get("id_category")

        g.db_cursor.execute("DELETE FROM categoria WHERE id_category = %s", (id_category,))
        g.db.commit()  # Confirmar la eliminación
        print(f"Registro con ID {id_category} eliminado exitosamente.")
        return jsonify({"mensaje": "Registro eliminado"}), 200
    except Exception as err:
        g.db.rollback()  # Revertir la transacción si ocurre un error
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
            g.db.rollback()  #Usa la conexión en 'g' para revertir
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


