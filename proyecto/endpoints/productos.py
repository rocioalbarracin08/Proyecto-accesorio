# obtener, agregar, modificar y eliminar datos
# SELECT

from flask import Flask, jsonify
import mysql.connector
from mysql.connector import Error


from flask import (Blueprint)

bp = Blueprint('blog', __name__)

#-----------------------------------------------------------

#AGREGAR PRODUCTOS -> INSERT
@app.route("/api/accesorio")
def accesorio():
    conexion =  obtener_conexion()
    if conexion is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    cursor = conexion.cursor(dictonary=True)
    cursor.execute("SELECT p.id, p.name, p.precio c.nombre from productos p JOIN categoria c ON p.id_categoria = c.id_category")

    accesorio = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify(accesorio),200

if __name__ == '__main__':
    app.run(debug=True)

