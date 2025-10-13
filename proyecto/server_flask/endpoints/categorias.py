from flask import Blueprint, request, jsonify, g

bp = Blueprint('categoria', __name__, url_prefix='/categoria')

########################### M O S T R A R TODAS ###########################
@bp.route("/")
def categorias():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        # Corrección: Selecciona TODAS las columnas necesarias para el frontend
        g.db_cursor.execute("SELECT id_category, categoria, img_url FROM categoria")
        categorias = g.db_cursor.fetchall()
        return jsonify(categorias)  # Devuelve array de dicts: [{"id_category":1, "categoria":"Electrónicos", "img_url":"url.jpg"}, ...]
    except Exception as e:
        return jsonify({"error": f"Hubo un problema al consultar las categorías: {e}"}), 500

########################### Mostrar por ID ###########################
@bp.route("/<int:id_category>", methods=['GET'])
def mostrarSegunId(id_category):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("SELECT id_category, categoria, img_url FROM categoria WHERE id_category = %s", (id_category,))
        categoria = g.db_cursor.fetchone()
        if categoria:
            return jsonify(categoria)
        else:
            return jsonify({"mensaje": "Categoría no encontrada"}), 404
    except Exception as e:
        return jsonify({"error": f"Hubo un problema al consultar la categoría: {e}"}), 500

########################### B O R R A R ###########################
@bp.route("/<int:id_category>", methods=['DELETE'])
def borrarRegistro(id_category):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        g.db_cursor.execute("DELETE FROM categoria WHERE id_category = %s", (id_category,))
        g.db.commit()
        return jsonify({"mensaje": "Categoría eliminada"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al eliminar la categoría: {err}"}), 500

########################### C R E A R ###########################
@bp.route("/", methods=['POST'])
def crearCategoria():
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    if request.method == 'POST':
        datos = request.get_json()
        categoria_nombre = datos.get("categoria")  # Usa "categoria" consistente
        img_url = datos.get("img_url", "")  # Opcional: permite enviar URL de imagen

        try:
            # Corrección: Inserta en columna 'categoria' y 'img_url'
            g.db_cursor.execute(
                "INSERT INTO categoria (categoria, img_url) VALUES (%s, %s)", 
                (categoria_nombre, img_url)
            )
            g.db.commit()
            return jsonify({"mensaje": "Categoría creada exitosamente."}), 201  # 201 para creación
        except Exception as err:
            g.db.rollback()
            return jsonify({"error": f"Error al crear la categoría: {err}"}), 500


########################### M O D I F I C A R ###########################
@bp.route("/<int:id_category>", methods=['PUT'])  # Usa PUT para update completo, ruta con ID
def modificarCategoria(id_category):
    if g.db_cursor is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    try:
        datos = request.get_json()
        categoria_nombre = datos.get("categoria")
        img_url = datos.get("img_url", "")  # Opcional
        if not categoria_nombre:
            return jsonify({"error": "Nombre de categoría requerido"}), 400

        # Corrección: Usa 'categoria' e 'id_category'
        g.db_cursor.execute(
            "UPDATE categoria SET categoria = %s, img_url = %s WHERE id_category = %s", 
            (categoria_nombre, img_url, id_category)
        )
        g.db.commit()
        return jsonify({"mensaje": "Categoría modificada"}), 200
    except Exception as err:
        g.db.rollback()
        return jsonify({"error": f"Error al modificar la categoría: {err}"}), 500