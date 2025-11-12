import pytest
from server_flask.app import create_app
from flask import request, jsonify, g


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

