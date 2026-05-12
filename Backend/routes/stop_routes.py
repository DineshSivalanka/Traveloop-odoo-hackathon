from flask import Blueprint, request, jsonify
from models.stop_model import (
    get_stops_by_trip, get_stop_by_id,
    add_stop, update_stop, delete_stop, reorder_stops
)

stop_bp = Blueprint("stop", __name__)

# GET /stops/<trip_id>
@stop_bp.route("/stops/<int:trip_id>", methods=["GET"])
def list_stops(trip_id):
    return jsonify(get_stops_by_trip(trip_id)), 200

# GET /stops/detail/<stop_id>
@stop_bp.route("/stops/detail/<int:stop_id>", methods=["GET"])
def get_stop(stop_id):
    stop = get_stop_by_id(stop_id)
    if stop:
        return jsonify(stop), 200
    return jsonify({"error": "Stop not found"}), 404

# POST /stops
@stop_bp.route("/stops", methods=["POST"])
def create_stop():
    d = request.get_json(force=True, silent=True) or {}
    trip_id = d.get("trip_id")
    city_name = d.get("city_name")

    if not trip_id or not city_name:
        return jsonify({"error": "trip_id and city_name are required"}), 400

    try:
        stop_id = add_stop(
            trip_id        = trip_id,
            city_name      = city_name,
            city_id        = d.get("city_id"),
            arrival_date   = d.get("arrival_date"),
            departure_date = d.get("departure_date"),
            stop_order     = d.get("stop_order", 1),
            notes          = d.get("notes", "")
        )
        return jsonify({"stop_id": stop_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT /stops/<stop_id>
@stop_bp.route("/stops/<int:stop_id>", methods=["PUT"])
def edit_stop(stop_id):
    d = request.get_json()
    update_stop(
        stop_id,
        d.get("city_name"), d.get("arrival_date"),
        d.get("departure_date"), d.get("stop_order", 1),
        d.get("notes", "")
    )
    return jsonify({"message": "Stop updated"}), 200

# DELETE /stops/item/<stop_id>
@stop_bp.route("/stops/item/<int:stop_id>", methods=["DELETE"])
def remove_stop(stop_id):
    delete_stop(stop_id)
    return jsonify({"message": "Stop deleted"}), 200

# PUT /stops/reorder/<trip_id>
@stop_bp.route("/stops/reorder/<int:trip_id>", methods=["PUT"])
def reorder(trip_id):
    d = request.get_json()
    ordered_ids = d.get("ordered_ids", [])
    reorder_stops(trip_id, ordered_ids)
    return jsonify({"message": "Stops reordered"}), 200
