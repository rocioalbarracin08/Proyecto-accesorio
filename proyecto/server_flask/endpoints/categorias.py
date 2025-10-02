#Hacer importaciones necesarias

#Blueprint: agrupar rutas y lógica en módulos (ej: auth, accesorios)
from flask import Blueprint, url_for, request, jsonify,g

#generate_password_hash : encripta la contraseña antes de guardarla en la base de datos
#check_password_hash: compara una contraseña ingresada con la contraseña encriptada guardada.

bp = Blueprint('categoria', __name__, url_prefix='/categoria')

########################### M O S T R A R ###########################
@bp.route("/mostrar") #Para el boton de navegacón
def categorias():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT categoria FROM categoria") # Ejecuta la consulta
        categorias = g.db_cursor.fetchall()#Obtenemos todos los resultados de la consulta
        return jsonify(categorias)  # Devuelve los resultados en formato JSON
        
    except Exception as e:
        return jsonify({"error": "Hubo un problema al consultar las categorías"}), 500 #Response con error


########################### B O R R A R ###########################
@bp.route("/borrar/<int:id_category>", methods=['DELETE'])
def borrarRegistro(id_category):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Obtener el id_category de la solicitud DELETE
        g.db_cursor.execute("DELETE FROM categoria WHERE id_category = %s", (id_category,))
        g.db.commit()  # Confirmar la eliminación
        print(f"Registro con ID {id_category} eliminado exitosamente.")
        return jsonify({"mensaje": "Registro eliminado"}), 200
    
    except Exception as err:
        g.db.rollback()  # Revertir la transacción si ocurre un error
        return jsonify({"error": f"Error al eliminar el registro: {err}"}), 500


########################### C R E A R ###########################
@bp.route("/crear/categoria", methods=('POST'))
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
            return jsonify({"mensaje": "Categoría creada exitosamente."}), 200

        except Exception as err:
            g.db.rollback()  #Usa la conexión en 'g' para revertir
            return jsonify({"error": f"Error al crear la categoría: {err}"}), 500


########################### M O D I F I C A R ###########################
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


