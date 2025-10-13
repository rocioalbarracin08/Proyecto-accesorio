# NOTA PARA LAS CLASES CON DB CONEXION: EVE HACE UNA RUTAS y yo otras
from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv 
from flask_cors import CORS
import os

load_dotenv() #Libreria que lee el archivo .env

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])  # Esto habilita CORS para todas las rutas y orígenes

#-----------------------------------------------------------
# Función para OBTENER la conexión a la base de datos MySQL
def obtener_conexion():
    try: #Código a probar
        conexion = mysql.connector.connect(
        host = os.getenv("DB_HOST"), 
        port = "3306",    
        user = os.getenv("DB_USER"),               # El usuario que usas en phpMyAdmin
        password = os.getenv("DB_PASSWORD"),  
        database = os.getenv("DB_NAME")           # El nombre de la base de datos que usas en phpMyAdmin
        )
        if conexion.is_connected():
            print("Conexión exitosa a la base de datos")
            return conexion
        
    except Error as e: # "e" = mysql.connector.Error, y contiene detalles sobre el error
        print(f"Error al conectar a la base de datos: {e}")
        return None
#-----------------------------------------------------------
# Ruta para obtener datos desde la base de datos

if __name__ == '__main__':
    app.run(debug=True)

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


#---------------------------PRODUCTOS------------------------------------
@app.route("/api/accesorio")
def accesorio():
    conexion =  obtener_conexion()
    if conexion is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT p.id_producto, p.name, p.precio, c.categoria from productos p JOIN categoria c ON p.id_categoria = c.id_category")

    accesorio = cursor.fetchall()

    cursor.close()
    conexion.close()

    return jsonify(accesorio),200


@app.route("/empleados") #Para probar con una consulta
def empleados():
    conexion =  obtener_conexion()
    if conexion is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor(dictionary=True)  # Para devolver como diccionarios
    cursor.execute("SELECT nombre FROM empleados")  # Ajusta según tu tabla
    
    empleados = cursor.fetchall()  # Lista de dicts con las categorías
    
    cursor.close()
    conexion.close()
    return jsonify(empleados)


app.run(debug=True)