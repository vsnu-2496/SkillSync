"""
app/__init__.py – Flask application factory.
Creates and configures the Flask app instance.
"""
import os
from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import jwt, db_connect

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable Cross-Origin Resource Sharing so the React frontend can call the API
    CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

    # Initialize JWT extension
    jwt.init_app(app)

    # Connect to MongoDB
    db_connect(app)

    # Register all route blueprints
    from .routes.auth import auth_bp
    from .routes.resume import resume_bp
    from .routes.career import career_bp
    from .routes.skill_gap import skill_gap_bp
    from .routes.courses import courses_bp
    from .routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp,      url_prefix="/api/auth")
    app.register_blueprint(resume_bp,    url_prefix="/api/resume")
    app.register_blueprint(career_bp,    url_prefix="/api/careers")
    app.register_blueprint(skill_gap_bp, url_prefix="/api/skills")
    app.register_blueprint(courses_bp,   url_prefix="/api/courses")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    # Create the uploads folder if it doesn't exist
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    return app
