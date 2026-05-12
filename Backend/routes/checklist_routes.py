from flask import Blueprint, request, jsonify
from models.checklist_model import (
    get_checklist, add_checklist_item, toggle_checklist_item,
    delete_checklist_item, reset_checklist
)

checklist_bp = Blueprint("checklist", __name__)

# GET /checklists/<trip_id>
@checklist_bp.route("/checklists/<int:trip_id>", methods=["GET"])
def fetch_checklist(trip_id):
    try:
        return jsonify(get_checklist(trip_id)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST /checklists
@checklist_bp.route("/checklists", methods=["POST"])
def add_item():
    d = request.get_json(force=True, silent=True) or {}
    trip_id = d.get("trip_id")
    item_name = d.get("item_name")
    
    if not trip_id or not item_name:
        return jsonify({"error": "trip_id and item_name are required"}), 400
    
    try:
        item_id = add_checklist_item(trip_id, item_name, d.get("category", "General"))
        return jsonify({"item_id": item_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT /checklists/<item_id>  → toggle packed
@checklist_bp.route("/checklists/<int:item_id>", methods=["PUT"])
def toggle_item(item_id):
    d = request.get_json(force=True, silent=True) or {}
    is_packed = d.get("is_packed")
    
    if is_packed is None:
        return jsonify({"error": "is_packed is required"}), 400
    
    try:
        toggle_checklist_item(item_id, is_packed)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# DELETE /checklists/<item_id>
@checklist_bp.route("/checklists/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    try:
        delete_checklist_item(item_id)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST /checklists/<trip_id>/reset
@checklist_bp.route("/checklists/<int:trip_id>/reset", methods=["POST"])
def reset_all(trip_id):
    try:
        reset_checklist(trip_id)
        return jsonify({"message": "Checklist reset"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
