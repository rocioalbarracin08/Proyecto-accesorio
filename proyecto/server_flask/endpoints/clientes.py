from flask import Blueprint, url_for, request, session, jsonify,g

bp = Blueprint('roClientes', __name__, url_prefix='/roClientes')

@bp.route('/clientes') # GET por defecto
def obtener_clientes():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT * FROM clientes") # Ejecuta la consulta
        clientes = g.db_cursor.fetchall()#Obtenemos todos los resultados de la consulta
        return jsonify(clientes)  # Devuelve los resultados en formato JSON
        
    except Exception as e:
        print(f"Error al obtener categorías: {e}") #Muestra el error en la cnsola del servidor
        return jsonify({"error": "Hubo un problema al consultar las categorías"}), 500 #Response con error


@bp.route("/cliente/borrar", methods=('POST', 'DELETE'))
def borrar():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Aseguramos que la solicitud sea POST
        if request.method == 'POST':
            datos = request.get_json()
            id = datos.get("id_cliente")
            
            g.db_cursor.execute("DELETE FROM clientes WHERE id_cliente =%s", (id,))
            g.db.commit()  # conexión en 'g' para confirmar
            print(f"Registro con ID {id} eliminado exitosamente.")
            return jsonify({"mensaje": "Registro eliminado"}), 200

    except Exception as err:
        g.db.rollback()  #conexión en 'g' para revertir | rollback: deshacer los cambios realizados que no se han confirmado commit()
        print(f"Error al eliminar el registro: {err}")
        return jsonify({"error": f"Error al eliminar el registro: {err}"}), 500   
    