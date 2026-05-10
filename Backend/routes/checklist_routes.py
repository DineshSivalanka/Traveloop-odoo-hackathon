from flask import Blueprint, request, jsonify
from models.checklist_model import (
    get_checklist, add_checklist_item, toggle_checklist_item,
    delete_checklist_item, reset_checklist
)

checklist_bp = Blueprint("checklist", __name__)

# GET /checklists/<trip_id>
@checklist_bp.route("/checklists/<int:trip_id>", methods=["GET"])
def fetch_checklist(trip_id):
    return jsonify(get_checklist(trip_id)), 200

# POST /checklists
@checklist_bp.route("/checklists", methods=["POST"])
def add_item():
    d = request.get_json()
    item_id = add_checklist_item(d["trip_id"], d["item_name"], d.get("category", "General"))
    return jsonify({"item_id": item_id}), 201

# PUT /checklists/<item_id>  → toggle packed
@checklist_bp.route("/checklists/<int:item_id>", methods=["PUT"])
def toggle_item(item_id):
    d = request.get_json()
    toggle_checklist_item(item_id, d["is_packed"])
    return jsonify({"status": "success"}), 200

# DELETE /checklists/<item_id>
@checklist_bp.route("/checklists/<int:item_id>", methods=["DELETE"])
def delete_item(item_id):
    delete_checklist_item(item_id)
    return jsonify({"status": "success"}), 200

# POST /checklists/<trip_id>/reset
@checklist_bp.route("/checklists/<int:trip_id>/reset", methods=["POST"])
def reset_all(trip_id):
    reset_checklist(trip_id)
    return jsonify({"message": "Checklist reset"}), 200
