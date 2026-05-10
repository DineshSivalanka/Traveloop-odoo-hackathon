from flask import Blueprint, request, jsonify
from models.city_model import search_cities, get_all_cities, get_city_by_id, get_popular_cities

city_bp = Blueprint("city", __name__)

# GET /cities?q=paris  OR  /cities?region=Europe  OR  /cities
@city_bp.route("/cities", methods=["GET"])
def list_cities():
    q       = request.args.get("q", "").strip()
    region  = request.args.get("region", "").strip()
    country = request.args.get("country", "").strip()

    if q:
        return jsonify(search_cities(q)), 200
    return jsonify(get_all_cities(region or None, country or None)), 200

# GET /cities/search?q=tokyo
@city_bp.route("/cities/search", methods=["GET"])
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify([]), 200
    return jsonify(search_cities(q)), 200

# GET /cities/<city_id>
@city_bp.route("/cities/<int:city_id>", methods=["GET"])
def get_city(city_id):
    city = get_city_by_id(city_id)
    if city:
        return jsonify(city), 200
    return jsonify({"error": "City not found"}), 404

# GET /cities/popular
@city_bp.route("/cities/popular", methods=["GET"])
def popular():
    limit = int(request.args.get("limit", 6))
    return jsonify(get_popular_cities(limit)), 200
