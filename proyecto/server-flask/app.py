# NOTA PARA LAS CLASES CON DB CONEXION: EVE HACE UNA RUTAS y yo otras
from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv 
import os

from flask_cors import CORS

from flask import g

load_dotenv() #Libreria que lee el archivo .env

app = Flask(__name__) #"__name__" variable especial que se reemplaza por el nombre del archivo

CORS(app) #Permite que el frontend (localhost:3000) hable con el backend (localhost:5000)

db_config = {
        "host" : os.getenv("DB_HOST"), 
        "port" : 3306,    
        "user" : os.getenv("DB_USER"),               # El usuario que usas en phpMyAdmin
        "password" : os.getenv("DB_PASSWORD"),  
        "database" : os.getenv("DB_NAME") }

#-----------------------------------------------------------
# Función para la conexión a la base de datos MySQL
@app.conexion_db #Lo uso por ser un decorador util para el contexto de aplicación y contexto de solicitud
def conexion_db():
    """Establece la conexión a la base de datos antes de cada solicitud."""
    try:
        g.db = mysql.connector.connect(db_config)
        g.db_cursor = g.db.cursor(dictionary=True)
    except mysql.connector.Error as err:
        g.db = None
        g.db_cursor = None
        print(f"Error de conexión: {err}")


# limpiar y cerrar los recursos que se abrieron al inicio de una solicitud
@app.teardown_request
def teardown_request(exception):
    """Cierra la conexión después de cada solicitud."""
    if hasattr(g, 'db') and g.db is not None:
        g.db.close()
#-----------------------------------------------------------


if __name__ == '__main__':
    app.run(debug=True) #debug -> Para el reinicio de nuestro automático cuando se detecten cambios en el código
    # Mientras estamos en modo desarrollo usamos el debug


@app.route("/api/carrito/<int:carrito_id>/agregar", methods = ['POST'])
def carrito(carritoId):
    
    # request.get_json() convierte el body JSON del fetch en un diccionario de Python
    data = request.get_json()

    # .get("clave") accede a un valor dentro de ese diccionario
    producto_id = data.get("producto_id")  # viene del JSON que mandaste en fetch
    cantidad = data.get("cantidad")        # igual

    return jsonify({
        "producto_id": producto_id,
        "cantidad": cantidad
    })
    
    
@app.route("/api/Agregar")
def agregarProductos():
    try:
        conexion =  conexion_db()
        if conexion is None:
            return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

        cursor = conexion.cursor(dictonary=True)
        cursor.execute("INSERT INTO productos (name, id_categoria, precio) VALUES (?, ?, ?)")

        cursor.close()
        conexion.close()
        
        return True
    except: 
        None

@app.route("/empleados") #Para el boton de navegacón
def empleados():
    conexion =  conexion_db()
    if conexion is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor(dictionary=True)  # Para devolver como diccionarios
    cursor.execute("SELECT nombre FROM empleados")  # Ajusta según tu tabla
    
    empleados = cursor.fetchall()  # Lista de dicts con las categorías
    
    cursor.close()
    conexion.close()
    return jsonify(empleados)

@app.route("/api/empleados", methods=["POST"]) #ruta para agregar empleados
def agregar_empleado():
    datos = request.get_json() #obtiene los datos en formato json
    direccion = datos.get("direccion") #obtiene la direccion del empleado

    conexion = conexion_db()
    if conexion is None: 
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor()
    try:
        cursor.execute( #inserta la direccion del empleado
            "INSERT INTO empleados (direccion) VALUES (?)",
            (direccion,)
        )
        conexion.commit()
        return jsonify({"mensaje": "direccion de empleado agregado"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conexion.close()




if __name__ == '__main__':
    app.run(debug=True)