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
@app.before_request #Lo uso por ser un decorador util para el contexto de aplicación y contexto de solicitud
def conexion_db():
    """Establece la conexión a la base de datos antes de cada solicitud."""
    try:
        g.db = mysql.connector.connect(**db_config) #intentando establecer una conexión a la base de datos
        #Con ** Desempaquetamos el diccionario, pasando las claves como parámetros de palabra clave

        g.db_cursor = g.db.cursor(dictionary=True) #ACA DECLARAMOS CURSOR! | Cursor: objeto para ejecutar la sentencias SQL

    except mysql.connector.Error as Error: #Capturamos el rror si no funciono la conexion a la db
        #"as Error" -> almacena la información del error en la variable Error
        g.db = None #Se asigna nose a "g.db" por el error
        g.db_cursor = None
        print(f"Error de conexión: {Error}") #se imprime el mensaje de error


# limpiar y cerrar los recursos que se abrieron al inicio de una solicitud
@app.teardown_request
def teardown_request(exception):
    """Cierra la conexión después de cada solicitud."""
    if hasattr(g, 'db') and g.db is not None: #hasattr es una función de python y permite comprobar si un objeto tiene un atributo sin causar un error si no lo tiene
        g.db.close()
        #close() es un método proporcionado por el conector "mysql.connector"
#-----------------------------------------------------------

#RO
def create_app():
    app = Flask(__name__)

    # Importa el Blueprint para la categoría
    from proyecto.server_flask.endpoints.categorias import bp as categoria_bp
    print("Blueprint categoría importado correctamente")


    # Registra el Blueprint
    app.register_blueprint(categoria_bp)

    return app




#EVE
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

    app = create_app() #lA FUNCIÓN crete_app() devuelve la instancia de la aplicación Flask, en lugar de crearla directamente al importar el archivo.

    app.run(debug=True) #debug -> Para el reinicio de nuestro automático cuando se detecten cambios en el código
    # Mientras estamos en modo desarrollo usamos el debug