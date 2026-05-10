from flask import Blueprint, request, jsonify
from models.user_model import (
    create_user, verify_login,
    get_user_profile, update_user_profile,
    get_all_users
)

user_bp = Blueprint("user", __name__)

# POST /signup
@user_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    try:
        result = create_user(name, email, password)
        return jsonify(result), 201
    except Exception as e:
        if "unique" in str(e).lower():
            return jsonify({"error": "Email already registered"}), 409
        return jsonify({"error": str(e)}), 500

# POST /login
@user_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = verify_login(email, password)
    if user:
        return jsonify(user), 200
    return jsonify({"error": "Invalid email or password"}), 401

# GET /profile/<user_id>
@user_bp.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    profile = get_user_profile(user_id)
    if profile:
        return jsonify(profile), 200
    return jsonify({"error": "User not found"}), 404

# PUT /profile/<user_id>
@user_bp.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    data       = request.get_json()
    name       = data.get("name", "").strip()
    password   = data.get("password")
    avatar_url = data.get("avatar_url")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    update_user_profile(user_id, name, password, avatar_url)
    return jsonify({"message": "Profile updated successfully"}), 200

# GET /admin/users  (admin only)
@user_bp.route("/admin/users", methods=["GET"])
def list_users():
    users = get_all_users()
    return jsonify(users), 200
