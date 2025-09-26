# obtener, agregar, modificar y eliminar datos
# SELECT

from flask import Blueprint, url_for, request, session, jsonify,g

bp = Blueprint('roProductos', __name__, url_prefix='/roProductos')

#-----------------------------------------------------------

#AGREGAR PRODUCTOS -> INSERT
@bp.route("/api/productos")
def productos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        if request.method == 'POST':
            g.db_cursor.execute("SELECT * FROM clientes ")

            categorias = g.db_cursor.fetchall()

            g.db.commit()  # conexión en 'g' para confirmar
            
            return jsonify(categorias)

    except Exception as err:
        g.db.rollback()  #conexión en 'g' para revertir | rollback: deshacer los cambios realizados que no se han confirmado commit()
        print(f"Error al eliminar el registro: {err}")
        return jsonify({"error": f"Error al eliminar el registro: {err}"}), 500

@bp.route("/api/xCategoria/<int:id_categoria>", methods=('POST', 'DELETE'))
def productos(id_categoria):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        if request.method == 'POST':

            g.db_cursor.execute("SELECT * FROM productos p INNER JOIN categoria c ON c.id_category = p.id_categoria WHERE p.id_categoria = %s ",(id_categoria,))

            productos = g.db_cursor.fetchall()

            g.db.close()  # conexión en 'g' para confirmar
            
            return jsonify(productos)   
         
    except Exception as e:
        return jsonify({"error": "Hubo un problema al consultar el id"}), 500 


'''
@bp.route("/api/Agregar", methods=('POST'))
def agregarProductos():    
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        if request.method == 'POST':
            datos = request.get_json()
            id_producto = datos.get("id_producto")
            
            g.db_cursor.execute("INSERT FROM productos WHERE id_cliente =%s", (id_producto,))
            g.db.commit()  # conexión en 'g' para confirmar
            print(f"Registro con ID {id} eliminado exitosamente.")
            return jsonify({"mensaje": "Registro eliminado"}), 200

    except Exception as err:
        g.db.rollback()  #conexión en 'g' para revertir | rollback: deshacer los cambios realizados que no se han confirmado commit()
        return jsonify({"error": f"Error al agregar el registro: {err}"}), 500
    
@bp.route("/modificar/producto", methods=('GET', 'POST'))
def modificarCategoria():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 400 #Es error 500 o 400?
    try:
        if request.method == 'POST':
            # Obtiene los datos de la solicitud JSON
            datos = request.get_json()
            nombreCategoria = datos.get("nombreCategoria") #'nombreCategoria' para mayor claridad
            id_producto = datos.get("id_producto") #ID para saber qué registro modificar

            g.db_cursor.execute("UPDATE productos SET nombre = %s WHERE id = %s", (nombreCategoria, id_producto))
            g.db.commit()  # Confirma la transacción en la base de datos

            return jsonify({"mensaje": "Registro modificado"}), 200
        
    except Exception as err:
        g.db.rollback()  # Revierte la transacción en caso de error
        print(f"Error al modificar el registro: {err}")
        return jsonify({"error": f"Error al modificar el registro: {err}"}), 500
'''