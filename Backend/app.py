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

if __name__ == "__main__":
    app.run(debug=True)
