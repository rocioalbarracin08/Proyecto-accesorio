from flask import Blueprint, request, jsonify,g

bp = Blueprint('productos', __name__, url_prefix='/productos')

#-----------------------------------------------------------

@bp.route("/")
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


### Mostrar los prodyuctos por categoría ###
@bp.route("/por_categoria/<int:id_categoria>", methods=['POST'])
def productosXcategoria(id_categoria):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        if request.method == 'POST':
            g.db_cursor.execute("SELECT * FROM productos p INNER JOIN categoria c ON c.id_category = p.id_categoria WHERE p.id_categoria = %s ",(id_categoria,))
            productos = g.db_cursor.fetchall()
            g.db.commit() 
            return jsonify(productos)   
         
    except Exception as e:
        return jsonify({"error": "Hubo un problema al consultar el id"}), 500 


@bp.route("/borrar", methods=['DELETE'])
def borrar():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        id = datos.get("id_producto")
        
        g.db_cursor.execute("DELETE FROM productos WHERE id_producto =%s", (id,))
        g.db.commit()  # conexión en 'g' para confirmar
        print(f"Registro con ID {id} eliminado exitosamente.")
        return jsonify({"mensaje": "Registro eliminado"}), 200

    except Exception as err:
        g.db.rollback()  #buena práctica
        print(f"Error al eliminar el registro: {err}")
        return jsonify({"error": f"Error al eliminar el registro: {err}"}), 500   
    

@bp.route("/con_categoria")
def accesoriosConCategoria():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    g.db_cursor.execute("SELECT p.id_producto, p.name, p.precio, c.categoria from productos p JOIN categoria c ON p.id_categoria = c.id_category")
    accesorio = g.db_cursor.fetchall()
    return jsonify(accesorio),200

@bp.route("/cambiar", methods=["POST"]) #AGREGAAR
def cambiar_producto():
    if g.db_cursor is None: 
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        name = request.json.get("name")
        id_categoria = request.json.get("id_categoria")
        precio = request.json.get("precio")
        id_producto = request.json.get("id")
        
        g.db_cursor.execute( #inserta nuevos datos para la tabla productos
            """UPDATE productos SET name = %s , id_categoria = %s, precio= %s WHERE id_producto = %s""",
            (name, id_categoria,precio, id_producto))
        g.db.commit() 
        return jsonify({"mensaje": "Producto creado exitosamente."}), 200

    except Exception as err:
        g.db.rollback()  #Usa la conexión en 'g' para revertir
        return jsonify({"error": f"Error al crear: {err}"}), 500

'''
@bp.route('/productos')
def get_productos():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    offset = (page - 1) * per_page

    g.db_cursor.execute("SELECT COUNT(*) FROM productos")
    total = g.db_cursor.fetchone()[0]

    g.db_cursor.execute(
        "SELECT * FROM productos LIMIT %s OFFSET %s", (per_page, offset)
    )
    productos = g.db_cursor.fetchall()

    return jsonify({
        "total": total,
        "page": page,
        "per_page": per_page,
        "productos": productos
    })
'''

#####En react
'''
const page = 1;
const perPage = 10;
fetch(`http://localhost:5000/usuarios/productos?page=${page}&per_page=${perPage}`)
  .then(res => res.json())
  .then(data => {
    // data.productos contiene los productos de la página actual
    // data.total es el total de productos
  });
'''
