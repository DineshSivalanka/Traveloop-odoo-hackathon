from flask import Blueprint, request, jsonify
from models.activity_model import (
    get_activities_by_city, search_master_activities, get_city_categories,
    get_activities_for_stop, add_activity, delete_activity
)

activity_bp = Blueprint("activity", __name__)

# ── Activity Master (catalogue) ──────────────────────────────

# GET /activities/master/city/<city_id>
@activity_bp.route("/activities/master/city/<int:city_id>", methods=["GET"])
def by_city(city_id):
    category = request.args.get("category")
    max_cost = request.args.get("max_cost", type=float)
    activities = get_activities_by_city(city_id)
    if category:
        activities = [a for a in activities if a["category"] == category]
    if max_cost is not None:
        activities = [a for a in activities if a["base_cost"] <= max_cost]
    return jsonify(activities), 200

# GET /activities/master/search?q=...&category=...&max_cost=...
@activity_bp.route("/activities/master/search", methods=["GET"])
def search_activities():
    q        = request.args.get("q", "").strip()
    category = request.args.get("category")
    max_cost = request.args.get("max_cost", type=float)
    return jsonify(search_master_activities(q, category, max_cost)), 200

# GET /activities/master/categories/<city_id>
@activity_bp.route("/activities/master/categories/<int:city_id>", methods=["GET"])
def categories(city_id):
    return jsonify(get_city_categories(city_id)), 200

# ── User Activities (per stop) ───────────────────────────────

# GET /activities/<stop_id>
@activity_bp.route("/activities/<int:stop_id>", methods=["GET"])
def list_activities(stop_id):
    return jsonify(get_activities_for_stop(stop_id)), 200

# POST /activities
@activity_bp.route("/activities", methods=["POST"])
def create_activity():
    d = request.get_json()
    act_id = add_activity(
        stop_id        = d["stop_id"],
        activity_name  = d["activity_name"],
        category       = d.get("category", ""),
        activity_date  = d.get("activity_date"),
        estimated_cost = d.get("estimated_cost", 0),
        duration_hours = d.get("duration_hours", 1),
        notes          = d.get("notes", "")
    )
    return jsonify({"activity_id": act_id}), 201

# DELETE /activities/<activity_id>
@activity_bp.route("/activities/<int:activity_id>", methods=["DELETE"])
def remove_activity(activity_id):
    delete_activity(activity_id)
    return jsonify({"message": "Activity deleted"}), 200
