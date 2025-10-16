from flask import Blueprint, request, jsonify,g

bp = Blueprint('tiendas', __name__, url_prefix='/tiendas')

#----------------------INSERTA TIENDA---------------------------

@bp.route("/inserta/tiendas", methods=["POST"]) 
def cambiar_venta():
     if g.db.cursor is None: 
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
     
     try: 
        nombre = request.json.get("nombre") #obtiene las columnas de la tabla tiendas
        ubicacion = request.json.get("ubicacion")
        g.db_cursor.execute("INSERT INTO tiendas (nombre, ubicacion) VALUES (%s, %s)",
            (nombre, ubicacion)
        )
        g.db.commit()
        return jsonify({"mensaje": "pudiste agregar el nuevo dato de la tabla tiendas"}), 201 #201 significa que se creó un recurso
    
     except Exception as e: #si hay un error
        return jsonify({"Error al insertar tienda": str(e)}), 400
    