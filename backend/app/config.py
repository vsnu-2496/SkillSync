"""
app/config.py – Centralised configuration loaded from .env file.
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MongoDB connection string
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/skillsync")

    # Secret key used to sign JWT tokens – MUST be changed in production
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")

    # Directory where uploaded PDF files are temporarily stored
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")

    # Maximum file upload size: 16 MB
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 16 * 1024 * 1024))

    # Allowed resume file types
    ALLOWED_EXTENSIONS = {"pdf"}
