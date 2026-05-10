from flask import Blueprint, request, jsonify
from models.user_model import create_user, get_user_by_email

user_bp = Blueprint("user", __name__)

@user_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    user_id = create_user(data["name"], data["email"], data["password"])
    return jsonify({"user_id": user_id})


@user_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    user = get_user_by_email(data["email"])

    if user and user[3] == data["password"]:
        return jsonify({"user_id": user[0]})
    else:
        return jsonify({"error": "Invalid credentials"}), 401
