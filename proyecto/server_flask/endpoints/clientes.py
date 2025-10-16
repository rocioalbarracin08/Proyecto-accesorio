from flask import Blueprint, request, jsonify,g

bp = Blueprint('clientes', __name__, url_prefix='/clientes')

@bp.route('/')
def obtener_clientes():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT * FROM clientes")
        clientes = g.db_cursor.fetchall()#Obtenemos todos los resultados de la consulta
        return jsonify(clientes)  # En formato JSON
        
    except Exception as e:
        print(f"Error al obtener categorías: {e}") #Muestra el error en la consola del servidor
        return jsonify({"error": "Hubo un problema al consultar las categorías"}), 500 #Response con error


@bp.route("/borrar", methods=['DELETE'])
def borrar_cliente():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
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
    
    
    
########################### C R E A R ###########################
@bp.route("/", methods=['POST']) #Distinto a PUT (no crea repetidos)
def crearCliente():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    if request.method == 'POST':
        datos = request.get_json() 
        nombreCategoria = datos.get("categoria")

        try:
            g.db_cursor.execute("INSERT INTO categoria (name, apellido, genero, email, password)VALUES (%s, %s, %s, %s, %s)", (name, apellido, genero, email, password))
            g.db.commit() 
            return jsonify({"mensaje": "Cliente creado exitosamente."}), 200

        except Exception as err:
            g.db.rollback()  #Usa la conexión en 'g' para revertir
            return jsonify({"error": f"Error al crear la categoría: {err}"}), 500


########################### M O D I F I C A R ###########################
@bp.route("/modificar", methods=['PUT']) 
def modificarCliente():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}),500

    try:
        # Obtiene los datos de la solicitud JSON
        data = request.get_json()

        name = data.get('nombre')
        apellido = data.get('apellido')
        idCliente = data.get('id_cliente')

        if not name or not apellido or not idCliente: 
            return jsonify({"error": "Datos incompletos"}), 400

        g.db_cursor.execute("UPDATE categoria SET name = %s apellido = %s WHERE id_cliente = %s", (name, apellido, idCliente))
        g.db.commit() 

        return jsonify({"mensaje": "Registro modificado"}), 200
        
    except Exception as err:
        g.db.rollback()  # Revierte la transacción en caso de error
        print(f"Error al modificar el registro: {err}")
        return jsonify({"error": f"Error al modificar el registro: {err}"}), 500
