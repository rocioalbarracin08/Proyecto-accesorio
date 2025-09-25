'''
from proyecto.app import obtener_conexion
from flask import Blueprint, url_for, request, session, jsonify
from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('roCant', __name__, url_prefix='/roCant')

@app.route("/agregarCant")
def AgregarCant():


@app.route("/modificarCant")
def AgregarCant():


@app.route("/borrarCant")
def AgregarCant():
    '''