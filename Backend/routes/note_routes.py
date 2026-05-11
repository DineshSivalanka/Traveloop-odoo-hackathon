from flask import Blueprint, request, jsonify
from models.note_model import add_note, get_notes_by_trip, delete_note

note_bp = Blueprint("note", __name__)

@note_bp.route("/notes", methods=["POST"])
def create_note():
    d = request.get_json()
    note_id = add_note(d["trip_id"], d["content"], d.get("stop_id"))
    return jsonify({"note_id": note_id}), 201

@note_bp.route("/notes/<int:trip_id>", methods=["GET"])
def list_notes(trip_id):
    return jsonify(get_notes_by_trip(trip_id)), 200

@note_bp.route("/notes/<int:note_id>", methods=["DELETE"])
def remove_note(note_id):
    delete_note(note_id)
    return jsonify({"message": "Note deleted"}), 200
