from flask import Blueprint, jsonify
from models.dashboard_model import get_dashboard_data

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard/<int:user_id>", methods=["GET"])
def dashboard(user_id):
    data = get_dashboard_data(user_id)
    return jsonify(data)
