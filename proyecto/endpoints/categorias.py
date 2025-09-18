#Hacer importaciones necesarias

@app.route("/categorias") #Para el boton de navegacón
def categorias():
    conexion =  obtener_conexion()
    if conexion is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor(dictionary=True)  # Para devolver como diccionarios
    cursor.execute("SELECT categoria FROM categoria")  # Ajusta según tu tabla
    
    categorias = cursor.fetchall()  # Lista de dicts con las categorías
    
    cursor.close()
    conexion.close()
    return jsonify(categorias)