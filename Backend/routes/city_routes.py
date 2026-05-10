from flask import Blueprint, request, jsonify
from models.city_model import add_city
from db import connect_db

city_bp = Blueprint("city", __name__)

@city_bp.route("/cities", methods=["POST"])
def create_city():
    data = request.json

    city_id = add_city(
        data["name"],
        data["country"],
        data["cost_index"]
    )

    return jsonify({"city_id": city_id})

@city_bp.route("/cities/search")
def search_city():
    query = request.args.get("q", "")

    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM cities WHERE name ILIKE %s",
        ('%' + query + '%',)
    )

    results = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(results)
