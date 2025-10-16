from flask import Blueprint, request, jsonify,g

bp = Blueprint('productos', __name__, url_prefix='/productos')

#-----------------------------------------------------------

@bp.route("/")
def productos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Parámetros de paginación (defaults: página 1, 10 items por página)
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10)) #Se solicita la cantidad de productos a mostrar por página
        offset = (page - 1) * per_page

        # Query para total de productos (sin paginación)
        g.db_cursor.execute("SELECT COUNT(*) as total FROM productos")  # Ajusta tabla si es diferente
        total_result = g.db_cursor.fetchone()
        total_productos = total_result['total'] if total_result else 0
        
        # Query para productos paginados
        query_productos = """
            SELECT * FROM productos  -- Ajusta columnas si quieres específicas (ej. id_producto, name, precio, id_categoria)
            LIMIT %s OFFSET %s
        """
        g.db_cursor.execute(query_productos, (per_page, offset))
        productos_list = g.db_cursor.fetchall()
        
        # Calcular metadata
        total_pages = (total_productos + per_page - 1) // per_page  # Redondeo hacia arriba
        has_next = page < total_pages
        has_prev = page > 1
        
        # No necesitas commit() para SELECT
        return jsonify({
            'productos': productos_list,  # Lista de dicts (por dictionary=True en cursor)
            'page': page,
            'per_page': per_page, #por defecto se mostrarán 10 productos por página
            'total_pages': total_pages,
            'total_productos': total_productos,
            'has_next': has_next, #indica si existe una página siguiente.
            'has_prev': has_prev, #indica si existe una página anterior.
            'message': f'Productos cargados exitosamente (página {page} de {total_pages})'
        }), 200
        '''
        "total": total,
        "page": page,
        "per_page": per_page,
        "productos": productos
        '''

    except Exception as err:
        print(f"Error paginado: {err}")
        return jsonify({"error": f"Error interno: {err}"}), 500


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


@bp.route("/borrar", methods=['DELETE'])
def borrar():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        id_producto = datos.get("id_producto")
        
        g.db_cursor.execute("DELETE FROM productos WHERE id_producto =%s", (id_producto,))
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

@bp.route("/cambiar", methods=["PUT"]) #AGREGAAR
def cambiar_producto():
    if g.db_cursor is None: 
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    try:
        data = request.get_json()  # Usa get_json() para consistencia
        name = data.get("name")
        id_categoria = data.get("id_categoria")
        precio = data.get("precio")
        id_producto = data.get("id")  # Corregi segun la base de datos
        
        if not all([name, id_categoria, precio, id_producto]):
            return jsonify({"error": "Datos incompletos"}), 400
        
        g.db_cursor.execute("""
            UPDATE productos 
            SET name = %s, id_categoria = %s, precio = %s 
            WHERE id_producto = %s
        """, (name, id_categoria, precio, id_producto))
        g.db.commit()
        return jsonify({"mensaje": "Producto actualizado exitosamente."}), 200

    except Exception as err:
        g.db.rollback()  #conexión en 'g' para revertir | rollback: deshacer los cambios realizados que no se han confirmado commit()
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
