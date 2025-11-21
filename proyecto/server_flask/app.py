from flask import Flask, jsonify, request, g
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv 
import os
import pandas as pd
import matplotlib.pyplot as plt
from flask_cors import CORS
from flask_mail import Mail
from server_flask.utils.config import SECRET_KEY
from proyecto.server_flask.utils.extensions import mail

load_dotenv()

db_config = {
    "host": os.getenv("DB_HOST"), 
    "port": os.getenv("DB_PORT"),    
    "user": os.getenv("DB_USER"),  
    "password": os.getenv("DB_PASSWORD"),  
    "database": os.getenv("DB_NAME")
}

def create_app(config=None):
    app = Flask(__name__)

    # Configuración de Mail
    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

    if config:
        app.config.update(config)

    # Inicializar CORS
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173", "supports_credentials": True}})

    # Conexión DB en cada request
    @app.before_request
    def conexion_db():
        try:
            g.db = mysql.connector.connect(**db_config)
            g.db_cursor = g.db.cursor(dictionary=True)
        except mysql.connector.Error as Error:
            g.db = None
            g.db_cursor = None
            print(f"Error de conexión: {Error}")

    @app.teardown_request
    def teardown_request(exception):
        if getattr(g, 'db_cursor', None):
            g.db_cursor.close()
        if getattr(g, 'db', None):
            g.db.close()

    # Importar blueprints
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
    from server_flask.endpoints.asistencia import bp as asistencia_bp 

    # Registrar blueprints
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
    app.register_blueprint(asistencia_bp)

    mail.init_app(app)

    return app
