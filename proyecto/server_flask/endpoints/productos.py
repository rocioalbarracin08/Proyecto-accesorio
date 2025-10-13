# obtener, agregar, modificar y eliminar datos
# SELECT

from flask import Blueprint, request, jsonify,g

bp = Blueprint('productos', __name__, url_prefix='/productos')

#---------------------------MOSTRAR--------------------------------

@bp.route("/mostrar/productos")
def productos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT * FROM clientes ")
        categorias = g.db_cursor.fetchall()
        g.db.commit()  # conexión en 'g' para confirmar
        
        return jsonify(categorias)

    except Exception as err:
        g.db.rollback()  #conexión en 'g' para revertir | rollback: deshacer los cambios realizados que no se han confirmado commit()
        print(f"Error al eliminar el registro: {err}")
        return jsonify({"error": f"Error al eliminar el registro: {err}"}), 500
    
#-------------------------PRODUCTOS POR CATEGORIA-------------------------------

@bp.route("/productPorCateg/<int:id_categoria>", methods=('POST'))
def productos(id_categoria):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        if request.method == 'POST':
            g.db_cursor.execute("SELECT * FROM productos p INNER JOIN categoria c ON c.id_category = p.id_categoria WHERE p.id_categoria = %s ",(id_categoria,))
            productos = g.db_cursor.fetchall()
            g.db.close() 
            
            return jsonify(productos)   
         
    except Exception as e:
        return jsonify({"error": "Hubo un problema al consultar el id"}), 500 


#--------------------------------------AGREGAR-------------------------------------------
@bp.route("/inserta/productos") 
def agregarProductos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        if  request.method == 'POST':
         g.db_cursor.execute("INSERT INTO productos (name, id_categoria, precio) VALUES (%s, %s, %s)")
         productos = g.db_cursor.fetchall()
         g.db.close()
        
        return jsonify({"mensaje":"pudiste agregar un nuevo producto"})
    
    except Exception as e:
        return jsonify({"error": "No se pudo agregar el producto que deseeas"}), 500 

#--------------------------------------MODIFICA-------------------------------------------
@bp.route("/modifica/productos", methods=["POST"]) 
def cambiar_producto() :

    if g.db.cursor is None: 
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
       name = request.json.get("name")
       id_categoria = request.json.get("id_categoria")
       precio = request.json.get("precio")
       id_producto = request.json.get("id")
       g.db_cursor.execute("""UPDATE productos SET name = %s , id_categoria = %s, precio= %s WHERE id_producto = %s""",
            (name, id_categoria,precio, id_producto)
        )
       
       return jsonify({"mensaje": "pudiste modificar las columnas de la tabla productos"}), 201 #201 significa que se creó un recurso
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400
