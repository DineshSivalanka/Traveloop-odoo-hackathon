from flask import Blueprint, request, jsonify
from models.user_model import (
    create_user, verify_login,
    get_user_profile, update_user_profile, delete_user,
    get_all_users, check_email_exists,
    get_saved_destinations, add_saved_destination, remove_saved_destination
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
    language   = data.get("language", "English")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    update_user_profile(user_id, name, password, avatar_url, language)
    return jsonify({"message": "Profile updated successfully"}), 200

# DELETE /profile/<user_id>
@user_bp.route("/profile/<int:user_id>", methods=["DELETE"])
def remove_user(user_id):
    delete_user(user_id)
    return jsonify({"message": "Account deleted successfully"}), 200

# Saved Destinations
@user_bp.route("/saved/<int:user_id>", methods=["GET"])
def list_saved(user_id):
    return jsonify(get_saved_destinations(user_id)), 200

@user_bp.route("/saved", methods=["POST"])
def save_city():
    d = request.get_json()
    add_saved_destination(d["user_id"], d["city_id"])
    return jsonify({"message": "City saved"}), 201

@user_bp.route("/saved/<int:user_id>/<int:city_id>", methods=["DELETE"])
def unsave_city(user_id, city_id):
    remove_saved_destination(user_id, city_id)
    return jsonify({"message": "City removed from saved list"}), 200

# GET /admin/users  (admin only)
@user_bp.route("/admin/users", methods=["GET"])
def list_users():
    users = get_all_users()
    return jsonify(users), 200

# POST /forgot-password
@user_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data  = request.get_json()
    email = data.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    check_email_exists(email)
    return jsonify({"message": "If this email is registered, a reset link has been sent."}), 200
