from flask import Flask

def create_app(test_config=None):
    app = Flask(__name__)

    if test_config:
        app.config.update(test_config)

    # Registra users (ya estaba)
    from .routes import users  # Asume que users sigue en routes/
    app.register_blueprint(users.bp)

    # Importa y registra tiendas desde endpoints/
    from .routes import tiendas # Cambia aquí: apunta a endpoints.tiendas
    app.register_blueprint(tiendas.bp)  # Registra el blueprint

    # Importa y registra compras desde endpoints/
    from .routes import detalle_compra
    app.register_blueprint(detalle_compra.bp)



    return app