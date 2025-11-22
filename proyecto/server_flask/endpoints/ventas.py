from flask import Blueprint, request, jsonify, g
import jwt
from datetime import datetime, date, timedelta
from server_flask.utils.config import SECRET_KEY

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

# Función auxiliar para calcular descuento aplicable a un producto
def calcular_descuento(id_producto, id_metodo_pago):
    g.db_cursor.execute("""
        SELECT p.descuento, p.tipo_descuento
        FROM promociones p
        INNER JOIN productos pr ON (p.id_producto = pr.id_producto OR p.id_categoria = pr.id_categoria)
        WHERE p.activo = TRUE AND CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin
        AND (p.id_metodo_pago IS NULL OR p.id_metodo_pago = %s)
        AND pr.id_producto = %s
        ORDER BY p.descuento DESC LIMIT 1  -- Toma la de mayor descuento
    """, (id_metodo_pago, id_producto))
    promo = g.db_cursor.fetchone()
    if promo:
        descuento = promo['descuento']
        tipo = promo['tipo_descuento']
        return descuento, tipo
    return 0, None

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
        id_metodo_pago = data.get('id_metodo_pago')  # Cambiado a id_metodo_pago
        detalles = data.get('detalles')  # Lista de dicts: [{'id_producto': int, 'cantidad': int}, ...]
        
        if not all([id_metodo_pago, detalles]) or not detalles:
            return jsonify({"error": "Faltan datos obligatorios: id_metodo_pago, detalles"}), 400
        
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
        
        # Determinar id_tienda para restar stock y almacenar en factura
        if es_venta_fisica:
            id_tienda_factura = id_tienda_empleado  # Tienda del empleado
        elif es_venta_online:
            id_tienda_factura = 1  # Tienda 1 para online
        
        # Calcular total y validar productos (MODIFICADO PARA APLICAR DESCUENTOS)
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
            descuento, tipo_descuento = calcular_descuento(id_prod, id_metodo_pago)  # Aplicar descuento
            if tipo_descuento == 'porcentaje':
                precio_con_descuento = precio_unitario * (1 - descuento)
            elif tipo_descuento == 'fijo':
                precio_con_descuento = max(0, precio_unitario - descuento)
            else:
                precio_con_descuento = precio_unitario
            
            subtotal = precio_con_descuento * cantidad
            costo_total += subtotal
            detalles_validos.append({
                'id_producto': id_prod,
                'nombre_producto': prod['name'],
                'cantidad': cantidad,
                'precio_unitario': precio_con_descuento,  # Precio con descuento aplicado
                'subtotal': subtotal 
            })
        
        # Restar stock (para física y online)
        for det in detalles_validos:
            g.db_cursor.execute("""
                UPDATE inventario SET stock_actual = stock_actual - %s 
                WHERE id_producto = %s AND id_tienda = %s
            """, (det['cantidad'], det['id_producto'], id_tienda_factura))
        
        # Insertar factura (AHORA CON id_tienda EN LUGAR DE CAMPOS DIRECTOS)
        fecha = datetime.now().date()
        hora = datetime.now().time()
        g.db_cursor.execute("""
            INSERT INTO factura (fecha, hora, id_tienda, id_cliente, id_empleado, id_metodo_pago, costo_total)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (fecha, hora, id_tienda_factura, id_cliente, id_empleado, id_metodo_pago, costo_total))
        id_factura = g.db_cursor.lastrowid
        
        # Insertar detalles
        for det in detalles_validos:
            g.db_cursor.execute("""
                INSERT INTO detalle_factura (id_factura, id_producto, nombre_producto, cantidad, precio_unitario, subtotal)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (id_factura, det['id_producto'], det['nombre_producto'], det['cantidad'], det['precio_unitario'], det['subtotal']))
        
        g.db.commit()
        return jsonify({"mensaje": "Venta registrada exitosamente", "id_factura": id_factura}), 201
    
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al registrar venta: {err}"}), 500

# Listar ventas del empleado (paginado) - ACTUALIZADO PARA HACER JOIN CON TIENDAS Y MÉTODOS DE PAGO
@bp.route('/', methods=['GET'])
def listar_ventas():
    if g.db_cursor is None:
        print("Error: No se pudo conectar a la base de datos")  # Log agregado
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    # Verificar token y obtener id_empleado
    token = request.cookies.get('token')
    if not token:
        print("Error: No hay token en cookies")  # Log agregado
        return jsonify({"error": "No autorizado"}), 401
    try:
        data_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data_token['id_usuario']
        print(f"Usuario ID del token: {user_id}")  # Log agregado
        g.db_cursor.execute("SELECT id_empleado FROM usuarios WHERE id_usuario = %s", (user_id,))
        user = g.db_cursor.fetchone()
        if not user or not user['id_empleado']:
            print(f"Error: Usuario {user_id} no es empleado o no tiene id_empleado")  # Log agregado
            return jsonify({"error": "Acceso denegado"}), 403
        id_empleado = user['id_empleado']
        print(f"ID Empleado: {id_empleado}")  # Log agregado
    except Exception as e:
        print(f"Error al decodificar token: {e}")  # Log agregado
        return jsonify({"error": "Token inválido"}), 401
    
    try:
        # Paginación con manejo de error
        page_str = request.args.get('page', '1')
        per_page_str = request.args.get('per_page', '10')
        try:
            page = int(page_str)
            per_page = int(per_page_str)
        except ValueError:
            print("Error: Parámetros de paginación inválidos")  # Log agregado
            return jsonify({"error": "Parámetros de paginación inválidos"}), 400
        
        offset = (page - 1) * per_page
        print(f"Página: {page}, Por página: {per_page}, Offset: {offset}")  # Log agregado
        
        # Total de ventas
        g.db_cursor.execute("SELECT COUNT(*) AS total FROM factura WHERE id_empleado = %s", (id_empleado,))
        total_result = g.db_cursor.fetchone()
        total_ventas = total_result['total'] if total_result else 0
        print(f"Total ventas para empleado {id_empleado}: {total_ventas}")  # Log agregado
        
        # Ventas paginadas con detalles
        g.db_cursor.execute("""
            SELECT f.id_factura, f.fecha, f.hora, t.nombre AS nombre_tienda, mp.name AS metodo_pago, f.costo_total,
                   GROUP_CONCAT(CONCAT(df.nombre_producto, ' (', df.cantidad, ' x ', df.precio_unitario, ')') SEPARATOR '; ') AS productos
            FROM factura f
            LEFT JOIN tiendas t ON f.id_tienda = t.id_tienda
            LEFT JOIN metodos_pagos mp ON f.id_metodo_pago = mp.id_metodo_pago
            LEFT JOIN detalle_factura df ON f.id_factura = df.id_factura
            WHERE f.id_empleado = %s
            GROUP BY f.id_factura
            ORDER BY f.fecha DESC, f.hora DESC
            LIMIT %s OFFSET %s
        """, (id_empleado, per_page, offset))
        ventas = g.db_cursor.fetchall()
        # MODIFICAR FECHA Y HORA (para ser aceptados por JSON)
        for v in ventas:
            if isinstance(v.get("fecha"), (datetime, date)):
                v["fecha"] = v["fecha"].strftime("%Y-%m-%d")

            if isinstance(v.get("hora"), timedelta):
                total_seconds = int(v["hora"].total_seconds())
                horas = total_seconds // 3600
                minutos = (total_seconds % 3600) // 60
                segundos = total_seconds % 60
                v["hora"] = f"{horas:02d}:{minutos:02d}:{segundos:02d}"

        print(f"Ventas obtenidas: {len(ventas)}")  # Log agregado
        
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
        print(f"Error en query: {err}")  # Log agregado
        return jsonify({"error": f"Error al listar ventas: {err}"}), 500