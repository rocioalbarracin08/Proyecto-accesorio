from flask import Flask, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

# Función para obtener la conexión a la base de datos MySQL
def obtener_conexion():
    try:
        conexion = mysql.connector.connect(
            host = "10.9.120.5",     
            puerto = "3306",  
            user = "accesorio",               # El usuario que usas en phpMyAdmin
            password = "accesoio1234",  
            database = "accesorios"           # El nombre de la base de datos que usas en phpMyAdmin
        )
        if conexion.is_connected():
            print("Conexión exitosa a la base de datos")
            return conexion
    except Error as e:
        print(f"Error al conectar a la base de datos: {e}")
        return None


# Ruta para obtener datos desde la base de datos
@app.route('/usuarios', methods=['GET'])
def obtener_usuarios():
    conexion = obtener_conexion() #Abrimos conexión
    if conexion is None:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    cursor = conexion.cursor(dictionary=True)
    cursor.execute("SELECT * FROM usuarios")  # Suponiendo que tienes una tabla 'usuarios'
    
    usuarios = cursor.fetchall()  # Obtiene todos los registros de la consulta
    
    # Cerrar el cursor y la conexión
    cursor.close()
    conexion.close()
    
    return jsonify(usuarios)

if __name__ == '__main__':
    app.run(debug=True)
