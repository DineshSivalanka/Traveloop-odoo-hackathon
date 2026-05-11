from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

from routes.user_routes      import user_bp
from routes.city_routes      import city_bp
from routes.trip_routes      import trip_bp
from routes.stop_routes      import stop_bp
from routes.activity_routes  import activity_bp
from routes.checklist_routes import checklist_bp
from routes.note_routes      import note_bp
from routes.dashboard_routes import dashboard_bp

app = Flask(__name__)
CORS(app)

# Register all blueprints
app.register_blueprint(user_bp)
app.register_blueprint(city_bp)
app.register_blueprint(trip_bp)
app.register_blueprint(stop_bp)
app.register_blueprint(activity_bp)
app.register_blueprint(checklist_bp)
app.register_blueprint(note_bp)
app.register_blueprint(dashboard_bp)

# ── API Aliases for Frontend Compatibility ──────────────────
@app.route("/users", methods=["POST"])
def users_alias():
    from routes.user_routes import signup
    return signup()

@app.route("/full_trip/<int:trip_id>", methods=["GET"])
def full_trip_alias(trip_id):
    from routes.trip_routes import full_trip
    return full_trip(trip_id)

@app.route("/checklist", methods=["POST"])
def checklist_alias():
    from routes.checklist_routes import add_item
    return add_item()

@app.route("/notes", methods=["POST"])
def notes_alias():
    from routes.note_routes import add_note
    return add_note()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
