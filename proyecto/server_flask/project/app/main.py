from flask import Flask, jsonify, request

def create_app():
    app = Flask(__name__)

    @app.route("/ping")
    def ping():
        return jsonify({"message": "pong"}), 200

    @app.route("/users", methods=["POST"])
    def create_user():
        data = request.get_json()
        if not data.get("name"):
            return jsonify({"error": "Name required"}), 400
        return jsonify({"user": data}), 201

    return app
