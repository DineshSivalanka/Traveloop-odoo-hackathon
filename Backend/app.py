from flask import Flask, request, jsonify
from db import connect_db

app = Flask(__name__)

@app.route("/users", methods=["GET"])
def get_users():
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM users;")
    users = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(users)

@app.route("/users", methods=["POST"])
def add_user():
    data = request.get_json()

    name = data["name"]
    email = data["email"]
    password = data["password"]

    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, password)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "User added successfully"}

@app.route("/trips", methods=["POST"])
def create_trip():
    data = request.get_json()

    user_id = data["user_id"]
    title = data["title"]
    description = data["description"]
    start_date = data["start_date"]
    end_date = data["end_date"]

    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO trips (user_id, title, description, start_date, end_date) VALUES (%s, %s, %s, %s, %s)",
        (user_id, title, description, start_date, end_date)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Trip created"}

@app.route("/trips", methods=["GET"])
def get_trips():
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM trips;")
    trips = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(trips)

@app.route("/stops", methods=["POST"])
def add_stop():
    data = request.get_json()

    trip_id = data["trip_id"]
    city_name = data["city_name"]
    arrival_date = data["arrival_date"]
    departure_date = data["departure_date"]
    stop_order = data["stop_order"]

    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO trip_stops (trip_id, city_name, arrival_date, departure_date, stop_order) VALUES (%s, %s, %s, %s, %s)",
        (trip_id, city_name, arrival_date, departure_date, stop_order)
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Stop added"}

@app.route("/stops/<int:trip_id>", methods=["GET"])
def get_stops(trip_id):
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM trip_stops WHERE trip_id = %s ORDER BY stop_order;", (trip_id,))
    stops = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(stops)

@app.route("/activities", methods=["POST"])
def add_activity():
    data = request.get_json()

    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO activities (stop_id, activity_name, activity_date, estimated_cost, notes) VALUES (%s, %s, %s, %s, %s)",
        (
            data["stop_id"],
            data["activity_name"],
            data["activity_date"],
            data["estimated_cost"],
            data["notes"]
        )
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Activity added"}

@app.route("/activities/<int:stop_id>", methods=["GET"])
def get_activities(stop_id):
    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM activities WHERE stop_id = %s;",
        (stop_id,)
    )
    activities = cur.fetchall()

    cur.close()
    conn.close()

    return jsonify(activities)

if __name__ == "__main__":
    app.run(debug=True)
