# NOTA PARA LAS CLASES CON DB CONEXION: EVE HACE UNA RUTAS y yo otras
from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv 
import os

load_dotenv() #Libreria que lee el archivo .env

app = Flask(__name__)

#-----------------------------------------------------------
# Función para OBTENER la conexión a la base de datos MySQL
def obtener_conexion():
    try: #Código a probar
        conexion = mysql.connector.connect(
        host = os.getenv("DB_HOST"), 
        port = 3306,    
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
    


#@app.route("/api/register")
#def registrarse():


#@app.route("/api/login", methods=('GET', 'POST'))
#def login():
    
@app.route("/api/Agregar")
def agregarProductos():
    try:
        conexion =  obtener_conexion()
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
    conexion =  obtener_conexion()
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
    nombre = datos.get("nombre") #obtiene el nombre del empleado
    apellido = datos.get("apellido") #obtiene el apellido del empleado
    email = datos.get("email") #obtiene el email del empleado
    id_tienda = datos.get("id_tienda") #obtiene el id de la
    puesto_trabajo = datos.get("puesto_trabajo") #obtiene el puesto de trabajo del empleado
    telefono = datos.get("telefono") #obtiene el telefono del empleado

    conexion = obtener_conexion()
    if conexion is None: 
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor()
    try:
        cursor.execute( #inserta la direccion del empleado
            "INSERT INTO empleados (nombre, apellido, email, id_tienda, puesto_trabajo, telefono) VALUES (%s, %s, %s, %s, %s, %s)",
            (nombre, apellido,email, id_tienda, puesto_trabajo, telefono)
        )
        conexion.commit()
        return jsonify({"mensaje": "email de empleado agregado"}), 201 #201 significa que se creó un recurso
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conexion.close()

@app.route("/api/productos", methods=["POST"]) #ruta para agregar empleados
def cambiar_producto():
    name = request.json.get("name")
    id_categoria = request.json.get("id_categoria")
    precio = request.json.get("precio")
    id_producto = request.json.get("id")

    obtener_conexion
    conexion = obtener_conexion()
    if conexion is None: 
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    cursor = conexion.cursor()
    try:
        cursor.execute( #inserta nuevos datos para la tabla productos
            """UPDATE productos SET name = %s , id_categoria = %s, precio = %s WHERE id_producto = %s""",
            (name, id_categoria,precio, id_producto)
        )
        conexion.commit()
        return jsonify({"mensaje": "pudiste modificar las columnas de la tabla productos"}), 201 #201 significa que se creó un recurso
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conexion.close()



if __name__ == '__main__':
    app.run(debug=True)