from flask import Blueprint, jsonify, request

bp = Blueprint('users', __name__, url_prefix='/users')


# Dummy in-memory users store for tests
USERS = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
]


@bp.route('/', methods=['GET'])
def list_users():
    return jsonify(USERS)


@bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    for u in USERS:
        if u['id'] == user_id:
            return jsonify(u)
    return jsonify({"error": "not found"}), 404


@bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json() or {}
    new_id = max(u['id'] for u in USERS) + 1
    user = {"id": new_id, "name": data.get('name', '')}
    USERS.append(user)
    return jsonify(user), 201
