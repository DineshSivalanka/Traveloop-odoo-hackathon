from flask import Blueprint, jsonify
from models.dashboard_model import get_dashboard_data, get_admin_analytics

dashboard_bp = Blueprint("dashboard", __name__)

# GET /dashboard/<user_id>
@dashboard_bp.route("/dashboard/<int:user_id>", methods=["GET"])
def dashboard(user_id):
    data = get_dashboard_data(user_id)
    return jsonify(data), 200

# GET /admin/analytics
@dashboard_bp.route("/admin/analytics", methods=["GET"])
def analytics():
    data = get_admin_analytics()
    return jsonify(data), 200
