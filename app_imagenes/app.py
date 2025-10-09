from flask import Flask, jsonify, request, url_for
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:5174"]) 

@app.route ("/api/okey", methods= ["GET"] )
def mensaje():
    print("hello word")
    return ({"url": url_for("static", filename= "broche.jpeg")})

   

