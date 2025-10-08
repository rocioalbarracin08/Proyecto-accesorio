
# NOTA PARA LAS CLASES CON DB CONEXION: EVE HACE UNA RUTAS y yo otras
from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv 
import os
# Importa el Blueprint para la categoría
#from proyecto.server_flask.endpoints.categorias import bp as categoria_bp

from server_flask.endpoints.categorias import bp as categoria_bp
from server_flask.endpoints.login_register import bp as usuarios_bp

#print("Blueprint categoría importado correctamente")
from flask_cors import CORS

from flask import g

load_dotenv() #Libreria que lee el archivo .env

app = Flask(__name__) #"__name__" variable especial que se reemplaza por el nombre del archivo
db_config = {
            "host" : os.getenv("DB_HOST"), 
            "port" : os.getenv("DB_PORT"),    
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

def create_app(test_config = None):

    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}) #Permite que el frontend (localhost:3000) hable con el backend (localhost:5000)

    # Registra el Blueprint
    app.register_blueprint(categoria_bp)
    app.register_blueprint(usuarios_bp)

    return app

app = create_app() 
