"""
app/extensions.py – Initialise Flask extensions (JWT, MongoDB).
Kept separate to avoid circular imports.
"""
from flask_jwt_extended import JWTManager
import mongoengine

# JWT manager instance – initialised with app in __init__.py
jwt = JWTManager()

def db_connect(app):
    """Connect MongoEngine to the configured MongoDB URI."""
    mongoengine.connect(host=app.config["MONGO_URI"])
