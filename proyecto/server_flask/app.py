
from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv 
import os
from flask_cors import CORS
from flask import g
from flask_mail import Mail

from server_flask.utils.config import SECRET_KEY

load_dotenv() #Libreria que lee el archivo .env

app = Flask(__name__) #"__name__" variable especial que se reemplaza por el nombre del archivo

# Configuración de Flask-Mail (lee del .env)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))  # Convierte a int, por defecto 587
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'  # Convierte string a bool
app.config['MAIL_USE_SSL'] = False  # No uso SSL si uso TLS (común para puerto 587)
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')  # Remitente por defecto (opcional, usa el username)

db_config = {
            "host" : os.getenv("DB_HOST"), 
            "port" : os.getenv("DB_PORT"),    
            "user" : os.getenv("DB_USER"),  
            "password" : os.getenv("DB_PASSWORD"),  
            "database" : os.getenv("DB_NAME")}

print(db_config)
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
        g.db.close() #Flask cierra el cursor | Para no generar fallas en la ejecución de los endpoints 
        #close(): método proporcionado por el conector "mysql.connector"
    if hasattr(g, 'db_cursor') and g.db_cursor is not None: 
        g.db_cursor.close()
#-----------------------------------------------------------

from server_flask.endpoints.categorias import bp as categoria_bp
from server_flask.endpoints.clientes import bp as clientes_bp
from server_flask.endpoints.empleados import bp as empleados_bp
from server_flask.endpoints.login_register import bp as usuarios_bp
from server_flask.endpoints.productos import bp as productos_bp
from server_flask.endpoints.promociones import bp as promociones_bp
from server_flask.endpoints.inventario import bp as inventario_bp
from server_flask.endpoints.tiendas import bp as tiendas_bp
from server_flask.endpoints.nosotros import bp as info_bp
from server_flask.endpoints.ventas import bp as ventas_bp
from server_flask.endpoints.metodos_pagos import bp as metodos_pagos_bp 

from server_flask.extensions import mail

def create_app(test_config = None):

    CORS(app, resources={r"/*": {"origins": "http://localhost:5173", "supports_credentials": True}}) #Permite que el frontend (localhost:5173, de React) hable con el backend (localhost:5000, Flask)
    #CORS es global

    # Registra el Blueprint
    app.register_blueprint(categoria_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(productos_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(empleados_bp)
    app.register_blueprint(tiendas_bp)
    app.register_blueprint(inventario_bp)
    app.register_blueprint(promociones_bp)
    app.register_blueprint(info_bp)
    app.register_blueprint(ventas_bp)
    app.register_blueprint(metodos_pagos_bp)

    mail.init_app(app)
    return app

app = create_app()
import logging
logging.basicConfig(level=logging.DEBUG)
app.logger.setLevel(logging.DEBUG)
