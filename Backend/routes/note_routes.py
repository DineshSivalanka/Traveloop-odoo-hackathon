from flask import Blueprint, request, jsonify
from models.note_model import get_trip_notes, add_trip_note, update_trip_note, delete_trip_note

note_bp = Blueprint("note", __name__)

# GET /notes/<trip_id>?stop_id=<n>
@note_bp.route("/notes/<int:trip_id>", methods=["GET"])
def fetch_notes(trip_id):
    stop_id = request.args.get("stop_id", type=int)
    return jsonify(get_trip_notes(trip_id, stop_id)), 200

# POST /notes
@note_bp.route("/notes", methods=["POST"])
def add_note():
    d = request.get_json()
    result = add_trip_note(
        trip_id   = d["trip_id"],
        note_text = d["note_text"],
        stop_id   = d.get("stop_id")
    )
    return jsonify(result), 201

# PUT /notes/<note_id>
@note_bp.route("/notes/<int:note_id>", methods=["PUT"])
def edit_note(note_id):
    d = request.get_json()
    update_trip_note(note_id, d["note_text"])
    return jsonify({"message": "Note updated"}), 200

# DELETE /notes/<note_id>
@note_bp.route("/notes/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    delete_trip_note(note_id)
    return jsonify({"status": "success"}), 200
