from flask import Blueprint, request, jsonify, g
import jwt
from server_flask.utils.config import SECRET_KEY
from server_flask.utils.auth import solo_dueno

bp = Blueprint('promociones', __name__, url_prefix='/promociones')

def verificar_dueno():
    token = request.cookies.get('token')
    if not token:
        return False
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = data['id_usuario']
        g.db_cursor.execute("SELECT id_cliente, id_empleado FROM usuarios WHERE id_usuario = %s", (user_id,))
        user = g.db_cursor.fetchone()
        return user and user['id_cliente'] is None and user['id_empleado'] is None
    except:
        return False

# ------------------- C R E A R -------------------
@bp.route("/", methods=["POST"])
def crear_promocion():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if not verificar_dueno():
        return jsonify({"error": "Solo el dueño puede crear promociones"}), 403
    
    datos = request.get_json()
    descripcion = datos.get("descripcion")
    descuento = datos.get("descuento")
    tipo_descuento = datos.get("tipo_descuento")
    fecha_inicio = datos.get("fecha_inicio")
    fecha_fin = datos.get("fecha_fin")
    id_categoria = datos.get("id_categoria")
    id_metodo_pago = datos.get("id_metodo_pago")
    id_producto = datos.get("id_producto")
    activo = datos.get("activo", True)
    
    if not all([descripcion, descuento, tipo_descuento, fecha_inicio, fecha_fin]):
        return jsonify({"error": "Faltan campos obligatorios"}), 400
    if tipo_descuento not in ['porcentaje', 'fijo']:
        return jsonify({"error": "Tipo de descuento inválido"}), 400
    
    try:
        g.db_cursor.execute("""
            INSERT INTO promociones (descripcion, descuento, tipo_descuento, fecha_inicio, fecha_fin, id_categoria, id_metodo_pago, id_producto, activo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (descripcion, descuento, tipo_descuento, fecha_inicio, fecha_fin, id_categoria, id_metodo_pago, id_producto, activo))
        g.db.commit()
        return jsonify({"mensaje": "Promoción creada exitosamente"}), 201
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al crear promoción: {err}"}), 500

# ------------------- L I S T A R -------------------
@bp.route("/", methods=["GET"])
def listar_promociones():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        activas = request.args.get('activas', 'false').lower() == 'true'
        id_categoria = request.args.get('categoria')
        id_metodo_pago = request.args.get('metodo_pago')
        id_producto = request.args.get('producto')
        
        query = """
            SELECT p.*, c.categoria, mp.name AS metodo_pago, pr.name AS producto
            FROM promociones p
            LEFT JOIN categoria c ON p.id_categoria = c.id_category
            LEFT JOIN metodos_pagos mp ON p.id_metodo_pago = mp.id_metodo_pago
            LEFT JOIN productos pr ON p.id_producto = pr.id_producto
            WHERE 1=1
        """
        params = []
        if activas:
            query += " AND p.activo = TRUE AND CURDATE() BETWEEN p.fecha_inicio AND p.fecha_fin"
        if id_categoria:
            query += " AND p.id_categoria = %s"
            params.append(id_categoria)
        if id_metodo_pago:
            query += " AND p.id_metodo_pago = %s"
            params.append(id_metodo_pago)
        if id_producto:
            query += " AND p.id_producto = %s"
            params.append(id_producto)
        
        g.db_cursor.execute(query, params)
        promociones = g.db_cursor.fetchall()
        return jsonify(promociones), 200
    except Exception as e:
        return jsonify({"error": f"Error al listar promociones: {e}"}), 500

#------------------- B U S C A R -------------------
@bp.route("/<int:id_promocion>", methods=["GET"])
def obtener_promocion(id_promocion):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("""
            SELECT p.*, c.categoria, mp.name AS metodo_pago, pr.name AS producto
            FROM promociones p
            LEFT JOIN categoria c ON p.id_categoria = c.id_category
            LEFT JOIN metodos_pagos mp ON p.id_metodo_pago = mp.id_metodo_pago
            LEFT JOIN productos pr ON p.id_producto = pr.id_producto
            WHERE p.id_promocion = %s
        """, (id_promocion,))
        promocion = g.db_cursor.fetchone()
        if not promocion:
            return jsonify({"error": "Promoción no encontrada"}), 404
        return jsonify(promocion), 200
    except Exception as e:
        return jsonify({"error": f"Error al obtener promoción: {e}"}), 500

#------------------- A C T U A L I Z A R -------------------
@bp.route("/<int:id_promocion>", methods=["PUT"])
@solo_dueno
def actualizar_promocion(id_promocion):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if not verificar_dueno():
        return jsonify({"error": "Solo el dueño puede actualizar promociones"}), 403
    
    datos = request.get_json()
    print("Datos recibidos:", datos)  # Debug: quita después
    
    descripcion = datos.get("descripcion")
    descuento = datos.get("descuento")
    tipo_descuento = datos.get("tipo_descuento")
    fecha_inicio = datos.get("fecha_inicio")
    fecha_fin = datos.get("fecha_fin")
    id_categoria = datos.get("id_categoria")
    id_metodo_pago = datos.get("id_metodo_pago")
    id_producto = datos.get("id_producto")
    activo = datos.get("activo")
    
    if tipo_descuento and tipo_descuento not in ['porcentaje', 'fijo']:
        return jsonify({"error": "Tipo de descuento inválido"}), 400
    
    fields = []
    values = []
    if descripcion is not None and str(descripcion).strip() != '':
        fields.append("descripcion = %s")
        values.append(descripcion)
    if descuento is not None and str(descuento).strip() != '':
        fields.append("descuento = %s")
        values.append(float(descuento))  # Convierte a float para evitar errores de tipo
    if tipo_descuento is not None and str(tipo_descuento).strip() != '':
        fields.append("tipo_descuento = %s")
        values.append(tipo_descuento)
    if fecha_inicio is not None and str(fecha_inicio).strip() != '':
        fields.append("fecha_inicio = %s")
        values.append(fecha_inicio)
    if fecha_fin is not None and str(fecha_fin).strip() != '':
        fields.append("fecha_fin = %s")
        values.append(fecha_fin)
    if id_categoria is not None and str(id_categoria).strip() != '':
        fields.append("id_categoria = %s")
        values.append(int(id_categoria))  # Convierte a int si es necesario
    if id_metodo_pago is not None and str(id_metodo_pago).strip() != '':
        fields.append("id_metodo_pago = %s")
        values.append(int(id_metodo_pago))
    if id_producto is not None and str(id_producto).strip() != '':
        fields.append("id_producto = %s")
        values.append(int(id_producto))
    if activo is not None:
        fields.append("activo = %s")
        values.append(activo)
    
    if not fields:
        return jsonify({"error": "No se proporcionaron campos para actualizar"}), 400
    
    query = f"UPDATE promociones SET {', '.join(fields)} WHERE id_promocion = %s"
    values.append(id_promocion)
    print("Query:", query, "Values:", values)  # Debug: quita después
    
    try:
        g.db_cursor.execute(query, values)
        g.db.commit()
        return jsonify({"mensaje": "Promoción actualizada"}), 200
    except Exception as err:
        g.db.rollback()
        print("Error en UPDATE:", str(err))  # Debug: quita después
        return jsonify({"error": f"Error al actualizar promoción: {err}"}), 500  # Cambiado de 501

#------------------- E L I M I N A R -------------------
@bp.route("/<int:id_promocion>", methods=["DELETE"])
@solo_dueno
def eliminar_promocion(id_promocion):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if not verificar_dueno():
        return jsonify({"error": "Solo el dueño puede eliminar promociones"}), 403
    
    try:
        g.db_cursor.execute("DELETE FROM promociones WHERE id_promocion = %s", (id_promocion,))
        g.db.commit()
        return jsonify({"mensaje": "Promoción eliminada"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al eliminar promoción: {err}"}), 500

#------------------- D E S A C T I V A R -------------------
@bp.route("/<int:id_promocion>/desactivar", methods=["PATCH"])
def desactivar_promocion(id_promocion):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if not verificar_dueno():
        return jsonify({"error": "Solo el dueño puede desactivar promociones"}), 403
    
    try:
        g.db_cursor.execute("UPDATE promociones SET activo = FALSE WHERE id_promocion = %s", (id_promocion,))
        g.db.commit()
        return jsonify({"mensaje": "Promoción desactivada"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al desactivar promoción: {err}"}), 500

#------------------- A C T I V A R -------------------
@bp.route("/<int:id_promocion>/activar", methods=["PATCH"])
def activar_promocion(id_promocion):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if not verificar_dueno():
        return jsonify({"error": "Solo el dueño puede activar promociones"}), 403
    
    try:
        g.db_cursor.execute("UPDATE promociones SET activo = TRUE WHERE id_promocion = %s", (id_promocion,))
        g.db.commit()
        return jsonify({"mensaje": "Promoción activada"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al activar promoción: {err}"}), 500