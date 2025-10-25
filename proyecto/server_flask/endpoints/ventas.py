from flask import Blueprint, request, jsonify, g
import jwt
from datetime import datetime
from proyecto.server_flask.utils.config import SECRET_KEY

bp = Blueprint('ventas', __name__, url_prefix='/ventas')

# Función auxiliar para verificar rol y obtener datos del usuario
def verificar_usuario():
    token = request.cookies.get('token')
    if not token:
        return None, jsonify({"error": "No autorizado"}), 401
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data['id_usuario']
        g.db_cursor.execute("""
            SELECT u.id_cliente, u.id_empleado, e.id_tienda 
            FROM usuarios u 
            LEFT JOIN empleados e ON u.id_empleado = e.id_empleado 
            WHERE u.id_usuario = %s
        """, (user_id,))
        user = g.db_cursor.fetchone()
        if not user:
            return None, jsonify({"error": "Usuario no encontrado"}), 404
        return user, None, None
    except:
        return None, jsonify({"error": "Token inválido"}), 401

@bp.route('/registrar_venta', methods=['POST'])
def registrar_venta():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    # Verificar usuario y rol
    user, error, status = verificar_usuario()
    if error:
        return error, status
    
    id_cliente_user = user['id_cliente']
    id_empleado = user['id_empleado']
    id_tienda_empleado = user['id_tienda']
    
    # Determinar tipo de venta
    es_venta_online = id_cliente_user is not None  # Si es cliente logueado, venta online
    es_venta_fisica = id_empleado is not None     # Si es empleado, venta física
    
    if not es_venta_fisica and not es_venta_online:
        return jsonify({"error": "Solo clientes o empleados pueden registrar ventas"}), 403
    
    try:
        data = request.get_json()
        id_cliente = data.get('id_cliente')  # Opcional para física, obligatorio para online
        metodo_pago = data.get('metodo_pago')
        detalles = data.get('detalles')  # Lista de dicts: [{'id_producto': int, 'cantidad': int}, ...]
        
        if not all([metodo_pago, detalles]) or not detalles:
            return jsonify({"error": "Faltan datos obligatorios: metodo_pago, detalles"}), 400
        
        # Validar id_cliente según tipo de venta
        if es_venta_online:
            if id_cliente_user != id_cliente:
                return jsonify({"error": "Para ventas online, id_cliente debe coincidir con el usuario logueado"}), 400
        elif es_venta_fisica:
            if id_cliente is not None:
                # Verificar que el cliente existe si se proporciona
                g.db_cursor.execute("SELECT id_cliente FROM clientes WHERE id_cliente = %s", (id_cliente,))
                if not g.db_cursor.fetchone():
                    return jsonify({"error": "Cliente no encontrado"}), 404
            # id_cliente puede ser NULL
        
        # Obtener datos de la tienda (solo para física, pero por simplicidad, siempre)
        if es_venta_fisica:
            tienda_query = """
                SELECT nombre, direccion, telefono 
                FROM tiendas 
                WHERE id_tienda = %s
            """
            g.db_cursor.execute(tienda_query, (id_tienda_empleado,))
            tienda = g.db_cursor.fetchone()
            if not tienda:
                return jsonify({"error": "Tienda del empleado no encontrada"}), 500
        else:
            # Para online, podrías hardcodear o obtener de otro lado; por ahora, usa NULL o un valor default
            tienda = {'nombre': 'Online', 'direccion': 'N/A', 'telefono': 'N/A'}
        
        # Calcular total y validar productos (igual que antes)
        costo_total = 0
        detalles_validos = []
        for det in detalles:
            id_prod = det.get('id_producto')
            cantidad = det.get('cantidad')
            if not id_prod or not cantidad or cantidad <= 0:
                return jsonify({"error": "Detalles inválidos: id_producto y cantidad > 0 requeridos"}), 400
            
            g.db_cursor.execute("SELECT name, precio FROM productos WHERE id_producto = %s", (id_prod,))
            prod = g.db_cursor.fetchone()
            if not prod:
                return jsonify({"error": f"Producto {id_prod} no encontrado"}), 404
            
            precio_unitario = prod['precio']
            subtotal = precio_unitario * cantidad
            costo_total += subtotal
            detalles_validos.append({
                'id_producto': id_prod,
                'nombre_producto': prod['name'],
                'cantidad': cantidad,
                'precio_unitario': precio_unitario
            })
        
        # Insertar factura
        fecha = datetime.now().date()
        hora = datetime.now().time()
        g.db_cursor.execute("""
            INSERT INTO factura (fecha, hora, nombre_tienda, direccion_tienda, telefono_tienda, id_cliente, id_empleado, metodo_pago, costo_total)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (fecha, hora, tienda['nombre'], tienda['direccion'], tienda['telefono'], id_cliente, id_empleado, metodo_pago, costo_total))
        id_factura = g.db_cursor.lastrowid
        
        # Insertar detalles (igual que antes)
        for det in detalles_validos:
            g.db_cursor.execute("""
                INSERT INTO detalle_factura (id_factura, id_producto, nombre_producto, cantidad, precio_unitario)
                VALUES (%s, %s, %s, %s, %s)
            """, (id_factura, det['id_producto'], det['nombre_producto'], det['cantidad'], det['precio_unitario']))
        
        g.db.commit()
        return jsonify({"mensaje": "Venta registrada exitosamente", "id_factura": id_factura}), 201
    
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al registrar venta: {err}"}), 500

#Listar ventas del empleado (paginado, similar a productos)
@bp.route('/', methods=['GET'])
def listar_ventas():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    # Verificar token y obtener id_empleado
    token = request.cookies.get('token')
    if not token:
        return jsonify({"error": "No autorizado"}), 401
    try:
        data_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data_token['id_usuario']
        g.db_cursor.execute("SELECT id_empleado FROM usuarios WHERE id_usuario = %s", (user_id,))
        user = g.db_cursor.fetchone()
        if not user or not user['id_empleado']:
            return jsonify({"error": "Acceso denegado"}), 403
        id_empleado = user['id_empleado']
    except:
        return jsonify({"error": "Token inválido"}), 401
    
    try:
        # Paginación
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        offset = (page - 1) * per_page
        
        # Total de ventas
        g.db_cursor.execute("SELECT COUNT(*) AS total FROM factura WHERE id_empleado = %s", (id_empleado,))
        total_result = g.db_cursor.fetchone()
        total_ventas = total_result['total'] if total_result else 0
        
        # Ventas paginadas con detalles
        g.db_cursor.execute("""
            SELECT f.id_factura, f.fecha, f.hora, f.nombre_tienda, f.metodo_pago, f.costo_total,
                   GROUP_CONCAT(CONCAT(df.nombre_producto, ' (', df.cantidad, ' x ', df.precio_unitario, ')') SEPARATOR '; ') AS productos
            FROM factura f
            LEFT JOIN detalle_factura df ON f.id_factura = df.id_factura
            WHERE f.id_empleado = %s
            GROUP BY f.id_factura
            ORDER BY f.fecha DESC, f.hora DESC
            LIMIT %s OFFSET %s
        """, (id_empleado, per_page, offset))
        ventas = g.db_cursor.fetchall()
        
        total_pages = (total_ventas + per_page - 1) // per_page
        return jsonify({
            'ventas': ventas,
            'page': page,
            'per_page': per_page,
            'total_pages': total_pages,
            'total_ventas': total_ventas,
            'has_next': page < total_pages,
            'has_prev': page > 1
        }), 200
    
    except Exception as err:
        return jsonify({"error": f"Error al listar ventas: {err}"}), 500