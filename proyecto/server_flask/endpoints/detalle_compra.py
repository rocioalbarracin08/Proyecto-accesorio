from flask import Blueprint, request, jsonify, g

bp = Blueprint('detalle_factura', __name__, url_prefix='/detalle_factura')


# 🟢 INSERTAR (POST)
@bp.route("/insertar/compra", methods=["POST"])
def agregaCompra():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        # Soportar dos formatos:
        # 1) Un solo detalle (compatibilidad previa)
        # 2) Payload con campos de factura y 'items': [ { nombre_producto, cantidad, precio_unitario, subtotal, producto_id }, ... ]
        id_factura = datos.get("id_factura")
        mail = datos.get("mail") or datos.get("email")
        nombre = datos.get("nombre")
        apellido = datos.get("apellido")
        entrega = datos.get("entrega")
        direccion = datos.get("direccion")
        ciudad = datos.get("ciudad")
        provincia = datos.get("provincia")
        codigo_postal = datos.get("codigo_postal") or datos.get("codigoPostal")
        total = datos.get("total")

        items = datos.get("items")

        if items and isinstance(items, list):
            # Insertar cada item como una fila en detalle_factura
            for item in items:
                nombre_producto = item.get("nombre_producto")
                cantidad = item.get("cantidad")
                precio_unitario = item.get("precio_unitario")
                subtotal = item.get("subtotal")

                if not all([id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido]):
                    return jsonify({"error": "Faltan campos obligatorios en uno de los items"}), 400

                g.db_cursor.execute(
                    """
                    INSERT INTO detalle_factura 
                    (id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido, direccion, ciudad, provincia, codigo_postal, total)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido, direccion, ciudad, provincia, codigo_postal, total)
                )

            g.db.commit()
            return jsonify({"mensaje": "Compra(s) agregada(s) exitosamente"}), 201

        else:
            # Compatibilidad con payload simple (un solo detalle)
            nombre_producto = datos.get("nombre_producto")
            cantidad = datos.get("cantidad")
            precio_unitario = datos.get("precio_unitario")
            subtotal = datos.get("subtotal")

            if not all([id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido]):
                return jsonify({"error": "Faltan campos obligatorios"}), 400

            g.db_cursor.execute(
                """
                INSERT INTO detalle_factura 
                (id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido, direccion, ciudad, provincia, codigo_postal, total)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido, direccion, ciudad, provincia, codigo_postal, total)
            )
            g.db.commit()
            return jsonify({"mensaje": "Compra agregada exitosamente"}), 201

    except Exception as e:
        g.db.rollback()
        return jsonify({"error": str(e)}), 500


# 🔵 OBTENER (GET)
@bp.route("/obtener", methods=["GET"])
def obtenerCompras():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Si se pasa un parámetro id_factura, filtramos por esa factura
        id_factura = request.args.get("id_factura")

        if id_factura:
            g.db_cursor.execute("SELECT * FROM detalle_factura WHERE id_factura = %s", (id_factura,))
        else:
            g.db_cursor.execute("SELECT * FROM detalle_factura")

        filas = g.db_cursor.fetchall()

        # Si no hay resultados
        if not filas:
            return jsonify({"mensaje": "No se encontraron registros"}), 404

        # Convertimos los resultados en diccionarios legibles
        columnas = [col[0] for col in g.db_cursor.description]
        resultados = [dict(zip(columnas, fila)) for fila in filas]

        return jsonify(resultados), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
from flask import Blueprint, request, jsonify, g

bp = Blueprint('detalle_factura', __name__, url_prefix='/detalle_factura')


# 🟢 INSERTAR (POST)
@bp.route("/insertar/compra", methods=["POST"])
def agregaCompra():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        print("Payload recibido en /detalle_factura/insertar/compra:", datos)
        # Soportar dos formatos:
        # 1) Un solo detalle (compatibilidad previa)
        # 2) Payload con campos de factura y 'items': [ { nombre_producto, cantidad, precio_unitario, subtotal, producto_id }, ... ]
        id_factura = datos.get("id_factura")
        mail = datos.get("mail") or datos.get("email")
        nombre = datos.get("nombre")
        apellido = datos.get("apellido")
        entrega = datos.get("entrega")
        direccion = datos.get("direccion")
        ciudad = datos.get("ciudad")
        provincia = datos.get("provincia")
        codigo_postal = datos.get("codigo_postal") or datos.get("codigoPostal")
        total = datos.get("total")

        items = datos.get("items")

        if items and isinstance(items, list):
            # Intentar obtener las columnas reales de la tabla para evitar errores 1054
            try:
                g.db_cursor.execute("SHOW COLUMNS FROM detalle_factura")
                cols_result = g.db_cursor.fetchall()
                # Puede devolver lista de dicts (dictionary=True) o tuplas según el cursor
                columnas_tabla = [r.get('Field') if isinstance(r, dict) else r[0] for r in cols_result]
                columnas_tabla_set = set(columnas_tabla)
            except Exception as e:
                print("No fue posible obtener columnas de detalle_factura:", e)
                columnas_tabla_set = set()

            # Insertar cada item como una fila en detalle_factura usando solo columnas existentes
            for item in items:
                producto_id = item.get("producto_id") or item.get("productoId") or item.get("id")
                nombre_producto = item.get("nombre_producto")
                cantidad = item.get("cantidad")
                precio_unitario = item.get("precio_unitario") or item.get("precio")
                subtotal = item.get("subtotal") or (cantidad * precio_unitario if cantidad and precio_unitario else None)

                guardar_formulario = (entrega == 'sucursal')

                if guardar_formulario:
                    if not all([id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido]):
                        return jsonify({"error": f"Faltan campos obligatorios en uno de los items (sucursal): {item}"}), 400
                else:
                    if not all([id_factura, nombre_producto, cantidad, precio_unitario, subtotal]):
                        return jsonify({"error": f"Faltan campos obligatorios en uno de los items: {item}"}), 400

                valores_map = {
                    'id_factura': id_factura,
                    'producto_id': producto_id,
                    'nombre_producto': nombre_producto,
                    'cantidad': cantidad,
                    'precio_unitario': precio_unitario,
                    'subtotal': subtotal,
                    'mail': mail if guardar_formulario else None,
                    'nombre': nombre if guardar_formulario else None,
                    'apellido': apellido if guardar_formulario else None,
                    'telefono': datos.get('telefono') if guardar_formulario else None,
                    'direccion': direccion if guardar_formulario else None,
                    'ciudad': ciudad if guardar_formulario else None,
                    'provincia': provincia if guardar_formulario else None,
                    'codigo_postal': codigo_postal if guardar_formulario else None,
                    'total': total,
                }

                # Elegir qué columnas existen en la tabla y construir el INSERT dinámico
                posibles_columnas = ['id_factura', 'producto_id', 'nombre_producto', 'cantidad', 'precio_unitario', 'subtotal', 'mail', 'nombre', 'apellido', 'telefono', 'direccion', 'ciudad', 'provincia', 'codigo_postal', 'total']
                columnas_para_insert = [c for c in posibles_columnas if c in columnas_tabla_set]

                # Si la columna id_factura existe pero el valor no es un entero válido, la excluimos
                if 'id_factura' in columnas_para_insert:
                    if id_factura is None:
                        # Dejarla si queremos insertar NULL; si no, excluir para no forzar un NULL en columna NOT NULL
                        pass
                    else:
                        try:
                            # Intentar convertir a entero
                            valores_map['id_factura'] = int(id_factura)
                        except Exception:
                            # No es un entero válido -> remover id_factura del INSERT para evitar error 1366
                            columnas_para_insert = [c for c in columnas_para_insert if c != 'id_factura']

                if not columnas_para_insert:
                    return jsonify({"error": "No se encontraron columnas válidas en la tabla detalle_factura"}), 500

                placeholders = ','.join(['%s'] * len(columnas_para_insert))
                cols_sql = ','.join(columnas_para_insert)
                parametros = tuple(valores_map[c] for c in columnas_para_insert)

                try:
                    g.db_cursor.execute(f"INSERT INTO detalle_factura ({cols_sql}) VALUES ({placeholders})", parametros)
                except Exception as e:
                    print(f"Error insertando en detalle_factura: {e}")
                    raise

            g.db.commit()
            return jsonify({"mensaje": "Compra(s) agregada(s) exitosamente"}), 201

        else:
            # Compatibilidad con payload simple (un solo detalle)
            nombre_producto = datos.get("nombre_producto")
            cantidad = datos.get("cantidad")
            precio_unitario = datos.get("precio_unitario")
            subtotal = datos.get("subtotal")

            if not all([id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido]):
                return jsonify({"error": "Faltan campos obligatorios"}), 400
            # Intentamos insertar también con producto_id vacío para compatibilidad
            try:
                g.db_cursor.execute(
                    """
                    INSERT INTO detalle_factura 
                    (id_factura, producto_id, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido, direccion, ciudad, provincia, codigo_postal, total)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (id_factura, None, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido, direccion, ciudad, provincia, codigo_postal, total)
                )
            except Exception:
                g.db_cursor.execute(
                    """
                    INSERT INTO detalle_factura 
                    (id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido, direccion, ciudad, provincia, codigo_postal, total)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (id_factura, nombre_producto, cantidad, precio_unitario, subtotal, mail, nombre, apellido, direccion, ciudad, provincia, codigo_postal, total)
                )
            g.db.commit()
            return jsonify({"mensaje": "Compra agregada exitosamente"}), 201

    except Exception as e:
        g.db.rollback()
        return jsonify({"error": str(e)}), 500


# 🔵 OBTENER (GET)
@bp.route("/obtener", methods=["GET"])
def obtenerCompras():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Si se pasa un parámetro id_factura, filtramos por esa factura
        id_factura = request.args.get("id_factura")

        if id_factura:
            g.db_cursor.execute("SELECT * FROM detalle_factura WHERE id_factura = %s", (id_factura,))
        else:
            g.db_cursor.execute("SELECT * FROM detalle_factura")

        filas = g.db_cursor.fetchall()

        # Si no hay resultados
        if not filas:
            return jsonify({"mensaje": "No se encontraron registros"}), 404

        # Convertimos los resultados en diccionarios legibles
        columnas = [col[0] for col in g.db_cursor.description]
        resultados = [dict(zip(columnas, fila)) for fila in filas]

        return jsonify(resultados), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
