from flask import Blueprint, request, jsonify
from models.note_model import add_note, get_notes_by_trip, delete_note

note_bp = Blueprint("note", __name__)

@note_bp.route("/notes", methods=["POST"])
def create_note():
    d = request.get_json(force=True, silent=True) or {}
    trip_id = d.get("trip_id")
    content = d.get("content") or d.get("note_text")

    if not trip_id or not content:
        return jsonify({"error": "trip_id and content are required"}), 400

    try:
        note_id = add_note(trip_id, content, d.get("stop_id"))
        return jsonify({"note_id": note_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@note_bp.route("/notes/<int:trip_id>", methods=["GET"])
def list_notes(trip_id):
    try:
        return jsonify(get_notes_by_trip(trip_id)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@note_bp.route("/notes/<int:note_id>", methods=["DELETE"])
def remove_note(note_id):
    try:
        delete_note(note_id)
        return jsonify({"message": "Note deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
