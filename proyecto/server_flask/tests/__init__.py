from flask import Flask

def create_app(test_config=None):
    app = Flask(__name__)

    if test_config:
        app.config.update(test_config)



    # Importa y registra tiendas desde endpoints/
    from server_flask.endpoints.tiendas import bp as tiendas_bp # Cambia aquí: apunta a endpoints.tiendas
    app.register_blueprint(tiendas_bp)  # Registra el blueprint

    # Importa y registra compras desde endpoints/
    from server_flask.endpoints.detalle_compra import bp as detalle_compra_bp
    app.register_blueprint(detalle_compra_bp)



    return app