from flask import Blueprint, request, jsonify,g
from server_flask.utils.auth import solo_empleado

bp = Blueprint('productos', __name__, url_prefix='/productos')
from flask import Blueprint, request, jsonify, g
from server_flask.utils.auth import solo_empleado  # Asegúrate de que este archivo exista

bp = Blueprint('productos', __name__, url_prefix='/productos')

#---------------------------MOSTRAR--------------------------------

# MOSTRAR (público, filtra activos)
@bp.route("/mostrar")
def productos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        offset = (page - 1) * per_page

        # Filtra productos activos y une con inventario para stock
        g.db_cursor.execute("""
            SELECT p.id_producto, p.name, p.precio, p.imagen_url, i.stock_actual AS stock
            FROM productos p
            LEFT JOIN inventario i ON p.id_producto = i.id_producto AND i.id_tienda = 1  -- Asume tienda default 1; ajusta si es dinámico
            WHERE p.activo = 1
            LIMIT %s OFFSET %s
        """, (per_page, offset))
        productos_list = g.db_cursor.fetchall()

        g.db_cursor.execute("SELECT COUNT(*) AS total FROM productos WHERE activo = 1")
        total_result = g.db_cursor.fetchone()
        total_productos = total_result['total'] if total_result else 0

        total_pages = (total_productos + per_page - 1) // per_page
        return jsonify({
            'productos': productos_list,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages,
            'total_productos': total_productos,
            'has_next': page < total_pages,
            'has_prev': page > 1
        }), 200
    except Exception as err:
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

#--------------------------------------BUSCAR-------------------------------------------
#Buscar productos por nombre o categoría
@bp.route("/buscar", methods=['GET'])
def buscar_productos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    query = request.args.get('q', '').strip()  # Parámetro 'q' del frontend (e.g., ?q=electronico)
    if not query or len(query) < 2:  # Evita búsquedas vacías o muy cortas
        return jsonify({"resultados": []}), 200
    
    try:
        # Busca en productos por nombre, y une con categoría
        g.db_cursor.execute("""
            SELECT p.id_producto, p.name, p.precio, p.imagen_url, c.categoria
            FROM productos p
            INNER JOIN categoria c ON p.id_categoria = c.id_category
            WHERE p.name LIKE %s OR c.categoria LIKE %s
            LIMIT 10 
        """, (f'%{query}%', f'%{query}%'))  # LIKE con % para coincidencias parciales
        
        resultados = g.db_cursor.fetchall()
        return jsonify({"resultados": resultados}), 200
    except Exception as err:
        return jsonify({"error": f"Error en búsqueda: {err}"}), 500

##################### S O L O  E M P L E A D O ####################
# INSERTAR (solo empleados)
@bp.route("/insertar", methods=["POST"])
@solo_empleado
def agregarProductos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        name = datos.get("name")
        id_categoria = datos.get("id_categoria")
        precio = datos.get("precio")
        imagen_url = datos.get("imagen_url", "")
        stock = datos.get("stock", 0)
        id_tienda = datos.get("id_tienda", 1)  # Default tienda 1; ajusta si es dinámico
        if not all([name, id_categoria, precio]):
            return jsonify({"error": "Faltan campos obligatorios"}), 400
        
        # Inserta producto
        g.db_cursor.execute("""
            INSERT INTO productos (name, id_categoria, precio, imagen_url, activo) 
            VALUES (%s, %s, %s, %s, 1)
        """, (name, id_categoria, precio, imagen_url))
        id_producto = g.db_cursor.lastrowid
        
        # Inserta en inventario
        g.db_cursor.execute("""
            INSERT INTO inventario (id_producto, id_tienda, stock_actual, stock_minimo) 
            VALUES (%s, %s, %s, 3)
        """, (id_producto, id_tienda, stock))
        
        g.db.commit()
        return jsonify({"mensaje": "Producto agregado exitosamente"}), 201
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": f"Error al agregar producto: {e}"}), 500

# MODIFICAR (solo empleados)
@bp.route("/modificar/<int:id_producto>", methods=["PUT"])
@solo_empleado
def cambiar_producto(id_producto):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        name = datos.get("name")
        id_categoria = datos.get("id_categoria")
        precio = datos.get("precio")
        imagen_url = datos.get("imagen_url")
        stock = datos.get("stock")
        if not all([name, id_categoria, precio, stock]):
            return jsonify({"error": "Faltan campos obligatorios"}), 400
        
        # Actualiza producto
        g.db_cursor.execute("""
            UPDATE productos SET name = %s, id_categoria = %s, precio = %s, imagen_url = %s 
            WHERE id_producto = %s
        """, (name, id_categoria, precio, imagen_url, id_producto))
        
        # Actualiza inventario (asume tienda 1)
        g.db_cursor.execute("""
            UPDATE inventario SET stock_actual = %s WHERE id_producto = %s AND id_tienda = 1
        """, (stock, id_producto))
        
        g.db.commit()
        return jsonify({"mensaje": "Producto modificado"}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": str(e)}), 500

# ACTUALIZAR STOCK (solo empleados)
@bp.route("/actualizar_stock/<int:id_producto>", methods=["PATCH"])
@solo_empleado
def actualizar_stock(id_producto):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        stock = datos.get("stock")
        id_tienda = datos.get("id_tienda", 1)  # Default
        if stock is None:
            return jsonify({"error": "Stock requerido"}), 400
        g.db_cursor.execute("""
            UPDATE inventario SET stock_actual = %s WHERE id_producto = %s AND id_tienda = %s
        """, (stock, id_producto, id_tienda))
        g.db.commit()
        return jsonify({"mensaje": "Stock actualizado"}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": f"Error al actualizar stock: {e}"}), 500

# Borrar producto (solo empleados)
# DESACTIVAR (en lugar de borrar, solo empleados)
@bp.route("/desactivar/<int:id_producto>", methods=["PATCH"])
@solo_empleado
def desactivar_producto(id_producto):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("UPDATE productos SET activo = 0 WHERE id_producto = %s", (id_producto,))
        g.db.commit()
        return jsonify({"mensaje": "Producto desactivado"}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": f"Error al desactivar producto: {e}"}), 500

@bp.route("/actualizar_stock/<int:id_producto>", methods=["PATCH"])
@solo_empleado
def actualizar_stock(id_producto):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        stock = datos.get("stock")
        if stock is None:
            return jsonify({"error": "Stock requerido"}), 400
        g.db_cursor.execute("UPDATE productos SET stock = %s WHERE id_producto = %s", (stock, id_producto))
        g.db.commit()
        return jsonify({"mensaje": "Stock actualizado"}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": f"Error al actualizar stock: {e}"}), 500