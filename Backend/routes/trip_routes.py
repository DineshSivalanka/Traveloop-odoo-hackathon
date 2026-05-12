from flask import Blueprint, request, jsonify
from models.trip_model import (
    create_trip, get_trips_by_user, get_trip_by_id,
    update_trip, delete_trip, make_trip_public, revoke_trip_public,
    get_trip_by_token, get_trip_budget_breakdown, get_full_trip
)

trip_bp = Blueprint("trip", __name__)

# POST /trips
@trip_bp.route("/trips", methods=["POST"])
def add_trip():
    d = request.get_json()
    trip_id = create_trip(
        user_id          = d["user_id"],
        title            = d["title"],
        description      = d.get("description", ""),
        start_date       = d.get("start_date"),
        end_date         = d.get("end_date"),
        budget           = d.get("budget", 0),
        cover_image_url  = d.get("cover_image_url", "")
    )
    return jsonify({"trip_id": trip_id}), 201

# GET /trips/<user_id>
@trip_bp.route("/trips/<int:user_id>", methods=["GET"])
def list_trips(user_id):
    return jsonify(get_trips_by_user(user_id)), 200

# GET /trips/detail/<trip_id>
@trip_bp.route("/trips/detail/<int:trip_id>", methods=["GET"])
def get_trip(trip_id):
    trip = get_trip_by_id(trip_id)
    if trip:
        return jsonify(trip), 200
    return jsonify({"error": "Trip not found"}), 404

# PUT /trips/<trip_id>
@trip_bp.route("/trips/<int:trip_id>", methods=["PUT"])
def edit_trip(trip_id):
    d = request.get_json()
    update_trip(
        trip_id, d["title"], d.get("description", ""),
        d.get("start_date"), d.get("end_date"),
        d.get("budget", 0), d.get("cover_image_url", "")
    )
    return jsonify({"message": "Trip updated"}), 200

# DELETE /trips/<trip_id>
@trip_bp.route("/trips/<int:trip_id>", methods=["DELETE"])
def remove_trip(trip_id):
    delete_trip(trip_id)
    return jsonify({"message": "Trip deleted"}), 200

# POST /trips/<trip_id>/share  → makes trip public
@trip_bp.route("/trips/<int:trip_id>/share", methods=["POST"])
def share_trip(trip_id):
    token = make_trip_public(trip_id)
    if token:
        return jsonify({"share_token": token, "share_url": f"/public/{token}"}), 200
    return jsonify({"error": "Trip not found"}), 404

# DELETE /trips/<trip_id>/share → makes trip private
@trip_bp.route("/trips/<int:trip_id>/share", methods=["DELETE"])
def unshare_trip(trip_id):
    revoke_trip_public(trip_id)
    return jsonify({"message": "Trip is now private"}), 200

# GET /public/<token>  → public read-only view
@trip_bp.route("/public/<string:token>", methods=["GET"])
def public_trip(token):
    trip = get_trip_by_token(token)
    if trip:
        return jsonify(trip), 200
    return jsonify({"error": "Trip not found or not public"}), 404

# GET /trips/<trip_id>/budget
@trip_bp.route("/trips/<int:trip_id>/budget", methods=["GET"])
def budget_breakdown(trip_id):
    return jsonify(get_trip_budget_breakdown(trip_id)), 200

# GET /trips/<trip_id>/full
@trip_bp.route("/trips/<int:trip_id>/full", methods=["GET"])
def full_trip(trip_id):
    try:
        return jsonify(get_full_trip(trip_id)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
