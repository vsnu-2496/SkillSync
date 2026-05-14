"""
routes/auth.py – Handles student registration, login, and profile management.
Blueprint prefix: /api/auth
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import bcrypt

from app.models.user import User

# Create the blueprint
auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    POST /api/auth/register
    Register a new student account.
    Body: { name, email, password, interests?, college?, degree?, year? }
    """
    data = request.get_json()

    # Basic validation
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    # Check if email already exists
    if User.objects(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 409

    # Hash the password before storing
    hashed_pw = generate_password_hash(data["password"])

    # Create and save the new user
    user = User(
        name          = data.get("name", ""),
        email         = data["email"],
        password_hash = hashed_pw,
        interests     = data.get("interests", []),
        college       = data.get("college", ""),
        degree        = data.get("degree", ""),
        year          = data.get("year", ""),
    )
    user.save()

    # Generate JWT token so the user is immediately logged in
    token = create_access_token(identity=str(user.id))

    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    POST /api/auth/login
    Authenticate a student and return a JWT token.
    Body: { email, password }
    """
    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    # Find the user by email
    user = User.objects(email=data["email"]).first()

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # Check Node-style 'password' field (bcrypt) or Python-style 'password_hash' (werkzeug)
    is_valid = False
    if hasattr(user, 'password') and user.password:
        try:
            # Bcrypt comparison
            if bcrypt.checkpw(data["password"].encode('utf-8'), user.password.encode('utf-8')):
                is_valid = True
        except Exception as e:
            print(f"Bcrypt check failed: {e}")

    if not is_valid and hasattr(user, 'password_hash') and user.password_hash:
        if check_password_hash(user.password_hash, data["password"]):
            is_valid = True

    if not is_valid:
        return jsonify({"error": "Invalid email or password"}), 401

    # Create a JWT token valid for the default expiration period
    token = create_access_token(identity=str(user.id))

    return jsonify({"token": token, "user": user.to_dict()}), 200


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()                                # Requires a valid JWT token
def get_profile():
    """
    GET /api/auth/profile
    Return the authenticated student's profile.
    """
    user_id = get_jwt_identity()
    user    = User.objects(id=user_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user.to_dict()), 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """
    PUT /api/auth/profile
    Update the authenticated student's profile fields.
    Body: { name?, interests?, college?, degree?, year? }
    """
    user_id = get_jwt_identity()
    user    = User.objects(id=user_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    # Update only the fields that were provided
    if "name"      in data: user.name      = data["name"]
    if "interests" in data: user.interests = data["interests"]
    if "college"   in data: user.college   = data["college"]
    if "degree"    in data: user.degree    = data["degree"]
    if "year"      in data: user.year      = data["year"]

    user.save()

    return jsonify(user.to_dict()), 200
