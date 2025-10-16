from flask import Blueprint, request, jsonify,g

bp = Blueprint('empleados', __name__, url_prefix='/empleados')

#-------------------------AGREGA EMPLEADOS-----------------------------------

@bp.route('/inserta/empleados', methods=['POST'])
def agregar_empleado():
    if g.db.cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        datos = request.get_json()  # obtiene los datos en formato json
        nombre = datos.get("nombre")  # obtiene el nombre del empleado
        apellido = datos.get("apellido")  # obtiene el apellido del empleado
        email = datos.get("email")  # obtiene el email del empleado
        id_tienda = datos.get("id_tienda")  # obtiene el id de la tienda
        puesto_trabajo = datos.get("puesto_trabajo")  # obtiene el puesto de trabajo del empleado
        telefono = datos.get("telefono")  # obtiene el telefono del empleado

        g.db.cursor.execute("""
            INSERT INTO empleados (nombre, apellido, email, id_tienda, puesto_trabajo, telefono)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (nombre, apellido, email, id_tienda, puesto_trabajo, telefono))

        g.db.commit()
        return jsonify({"mensaje": "Empleado agregado"}), 200

    except Exception as err:
        return jsonify({"error": f"Error al agregar el registro: {err}"}), 500
    
#---------------------------BORRA EMPLEADO--------------------------------

@bp.route("/borra/empleados", methods=["DELETE"])   
def borrar_empleado():#obtiene el id del empleado a borrar
    if g.db.cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    try:
        data = request.get_json()
        id_empleado = data.get("id_empleado")
        g.db_cursor.execute("DELETE FROM empleados WHERE id_empleado = %s", (id_empleado,)) 

        g.db.commit()
        return jsonify({"mensaje": "Empleado eliminado correctamente"}), 200
    
    except Exception as err:
        return jsonify({"error": f"Error al borrar empleado: {err}"}), 500
   

