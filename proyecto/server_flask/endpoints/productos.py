from flask import Blueprint, request, jsonify, g
from server_flask.utils.auth import solo_empleado  # Si lo tienes, sino quítalo

# Importar la función de ventas.py para verificar usuario y obtener tienda
from server_flask.endpoints.ventas import verificar_usuario  # Asegúrate de que la ruta sea correcta

bp = Blueprint('productos', __name__, url_prefix='/productos')

# MOSTRAR (público, filtra activos y stock por tienda del usuario)
@bp.route("/mostrar")
def productos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    # Verificar usuario para obtener su tienda
    user, error, status = verificar_usuario()
    if error:
        # Si no hay token o error, usar tienda 1 por defecto (para público)
        id_tienda_usuario = 1
    else:
        # Si es empleado, usar su tienda; si cliente, tienda 1
        id_tienda_usuario = user.get('id_tienda') or 1  # id_tienda de empleado, o 1 para online
    
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        offset = (page - 1) * per_page

        # Filtra productos activos y une con inventario usando la tienda del usuario
        g.db_cursor.execute("""
            SELECT p.id_producto, p.name, p.id_categoria, p.precio, p.imagen_url, i.stock_actual AS stock
            FROM productos p
            LEFT JOIN inventario i ON p.id_producto = i.id_producto AND i.id_tienda = %s
            WHERE p.activo = 1
            LIMIT %s OFFSET %s
        """, (id_tienda_usuario, per_page, offset))
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

# PRODUCTOS POR CATEGORIA
@bp.route("/por_categoria/<int:id_categoria>", methods=['GET'])
def productosXcategoria(id_categoria):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        offset = (page - 1) * per_page

        g.db_cursor.execute("SELECT COUNT(*) as total FROM productos WHERE id_categoria = %s AND activo = 1", (id_categoria,))
        total_result = g.db_cursor.fetchone()
        total_productos = total_result['total'] if total_result else 0

        g.db_cursor.execute("""
            SELECT p.*, c.categoria 
            FROM productos p 
            INNER JOIN categoria c ON c.id_category = p.id_categoria 
            WHERE p.id_categoria = %s AND p.activo = 1
            LIMIT %s OFFSET %s
        """, (id_categoria, per_page, offset))
        productos_list = g.db_cursor.fetchall()
        print(productos_list)
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
    except Exception as e:
        return jsonify({"error": f"Error al consultar productos por categoría: {e}"}), 500

# BUSCAR (ahora incluye productos sin categoría y filtra correctamente)
@bp.route("/buscar", methods=['GET'])
def buscar_productos():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    # Verificar usuario para obtener su tienda (igual que en /mostrar)
    user, error, status = verificar_usuario()
    if error:
        id_tienda_usuario = 1
    else:
        id_tienda_usuario = user.get('id_tienda') or 1
    
    query = request.args.get('q', '').strip()
    if not query or len(query) < 2:
        return jsonify({"resultados": []}), 200
    
    try:
        # Cambiar INNER JOIN a LEFT JOIN para incluir productos sin categoría
        # Ajustar WHERE para que productos sin categoría aparezcan si coinciden por name
        g.db_cursor.execute("""
            SELECT p.id_producto, p.name, p.precio, p.imagen_url, c.categoria, i.stock_actual AS stock
            FROM productos p
            LEFT JOIN categoria c ON p.id_categoria = c.id_category
            LEFT JOIN inventario i ON p.id_producto = i.id_producto AND i.id_tienda = %s
            WHERE p.activo = 1 AND (p.name LIKE %s OR (c.categoria IS NOT NULL AND c.categoria LIKE %s))
            LIMIT 10 
        """, (id_tienda_usuario, f'%{query}%', f'%{query}%'))
        
        resultados = g.db_cursor.fetchall()
        return jsonify({"resultados": resultados}), 200
    except Exception as err:
        return jsonify({"error": f"Error en búsqueda: {err}"}), 500

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
        id_tienda = datos.get("id_tienda", 1)
        if not all([name, id_categoria, precio]):
            return jsonify({"error": "Faltan campos obligatorios"}), 400
        
        g.db_cursor.execute("""
            INSERT INTO productos (name, id_categoria, precio, imagen_url, activo) 
            VALUES (%s, %s, %s, %s, 1)
        """, (name, id_categoria, precio, imagen_url))
        id_producto = g.db_cursor.lastrowid
        
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
        id_tienda = datos.get("id_tienda", 1)
        if not all([name, id_categoria, precio, stock]):
            return jsonify({"error": "Faltan campos obligatorios"}), 400
        
        g.db_cursor.execute("""
            UPDATE productos SET name = %s, id_categoria = %s, precio = %s, imagen_url = %s 
            WHERE id_producto = %s
        """, (name, id_categoria, precio, imagen_url, id_producto))
        
        g.db_cursor.execute("""
            UPDATE inventario SET stock_actual = %s WHERE id_producto = %s AND id_tienda = %s
        """, (stock, id_producto, id_tienda))
        
        g.db.commit()
        return jsonify({"mensaje": "Producto modificado"}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": str(e)}), 500

# DESACTIVAR (solo empleados)
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

# ACTUALIZAR STOCK (solo empleados, solo en su tienda)
@bp.route("/actualizar_stock/<int:id_producto>", methods=["PATCH"])
@solo_empleado
def actualizar_stock(id_producto):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    # Verificar usuario y obtener su tienda
    user, error, status = verificar_usuario()
    if error:
        return error, status
    
    id_tienda_empleado = user.get('id_tienda')
    if not id_tienda_empleado:
        return jsonify({"error": "Empleado no asignado a una tienda"}), 403
    
    try:
        datos = request.get_json()
        stock = datos.get("stock")
        if stock is None or stock < 0:
            return jsonify({"error": "Stock válido requerido"}), 400
        
        # Actualizar solo en la tienda del empleado
        g.db_cursor.execute("""
            UPDATE inventario SET stock_actual = %s WHERE id_producto = %s AND id_tienda = %s
        """, (stock, id_producto, id_tienda_empleado))
        if g.db_cursor.rowcount == 0:
            # Si no existe, insertar en su tienda
            g.db_cursor.execute("""
                INSERT INTO inventario (id_producto, id_tienda, stock_actual, stock_minimo) 
                VALUES (%s, %s, %s, 3)
            """, (id_producto, id_tienda_empleado, stock))
        
        g.db.commit()
        return jsonify({"mensaje": "Stock actualizado en tu tienda"}), 200
    except Exception as e:
        g.db.rollback()
        return jsonify({"error": f"Error al actualizar stock: {e}"}), 500