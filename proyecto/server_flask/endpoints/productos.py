from flask import Blueprint, request, jsonify,g

bp = Blueprint('productos', __name__, url_prefix='/productos')

#---------------------------MOSTRAR--------------------------------

@bp.route("/mostrar/productos")
def productos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Parámetros de paginación
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10)) #Se solicita la cantidad de productos a mostrar por página
        offset = (page - 1) * per_page

        g.db_cursor.execute("SELECT COUNT(*) AS total FROM productos")
        total_result = g.db_cursor.fetchone()
        total_productos = total_result['total'] if total_result else 0

        g.db_cursor.execute("""
            SELECT id_producto, `name` as name, precio, imagen_url
            FROM productos
            LIMIT %s OFFSET %s
        """, (per_page, offset))
        productos_list = g.db_cursor.fetchall()

        # Calcular metadata
        total_pages = (total_productos + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1

        return jsonify({
            'productos': productos_list,
            'page': page,
            'per_page': per_page, #por defecto se mostrarán 10 productos por página
            'total_pages': total_pages,
            'total_productos': total_productos,
            'has_next': has_next,
            'has_prev': has_prev,
            'message': f'Productos cargados exitosamente (página {page} de {total_pages})'
        }), 200

    except Exception as err:
        g.db.rollback()
        print(f"Error al obtener productos: {err}")
        return jsonify({"error": f"Error al obtener productos: {err}"}), 500

    
#-------------------------PRODUCTOS POR CATEGORIA-------------------------------


### Mostrar productos por categoría ###
@bp.route("/por_categoria/<int:id_categoria>", methods=['GET'])
def productosXcategoria(id_categoria):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Parámetros de paginación
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        offset = (page - 1) * per_page

        # Total de productos en la categoría
        g.db_cursor.execute("SELECT COUNT(*) as total FROM productos WHERE id_categoria = %s", (id_categoria,))
        total_result = g.db_cursor.fetchone()
        total_productos = total_result['total'] if total_result else 0

        # Productos paginados
        g.db_cursor.execute("""
            SELECT p.*, c.categoria 
            FROM productos p 
            INNER JOIN categoria c ON c.id_category = p.id_categoria 
            WHERE p.id_categoria = %s
            LIMIT %s OFFSET %s
        """, (id_categoria, per_page, offset))
        productos_list = g.db_cursor.fetchall()

        total_pages = (total_productos + per_page - 1) // per_page
        has_next = page < total_pages
        has_prev = page > 1

        return jsonify({
            'productos': productos_list,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages,
            'total_productos': total_productos,
            'has_next': has_next,
            'has_prev': has_prev,
            'message': f'Productos de la categoría {id_categoria} cargados exitosamente (página {page} de {total_pages})'
        }), 200
    except Exception as e:
        return jsonify({"error": f"Hubo un problema al consultar productos por categoría: {e}"}), 500


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
