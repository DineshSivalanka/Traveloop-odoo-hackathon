from flask import Flask, request, jsonify
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
CORS(app, resources={r"/*": {"origins": "*"}}, allow_headers=["Content-Type", "Authorization"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        return response, 200

@app.after_request
def add_cors_headers(response):
    response.headers.setdefault("Access-Control-Allow-Origin", "*")
    response.headers.setdefault("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
    response.headers.setdefault("Access-Control-Allow-Headers", "Content-Type,Authorization")
    return response

# Register all blueprints with /api prefix
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(city_bp, url_prefix='/api')
app.register_blueprint(trip_bp, url_prefix='/api')
app.register_blueprint(stop_bp, url_prefix='/api')
app.register_blueprint(activity_bp, url_prefix='/api')
app.register_blueprint(checklist_bp, url_prefix='/api')
app.register_blueprint(note_bp, url_prefix='/api')
app.register_blueprint(dashboard_bp, url_prefix='/api')

# ── API Aliases for Frontend Compatibility ──────────────────
@app.route("/users", methods=["POST"])
def users_alias():
    from routes.user_routes import signup
    return signup()

@app.route("/full_trip/<int:trip_id>", methods=["GET"])
def full_trip_alias(trip_id):
    from routes.trip_routes import full_trip
    return full_trip(trip_id)

@app.route("/api/full_trip/<int:trip_id>", methods=["GET"])
def full_trip_api_alias(trip_id):
    from routes.trip_routes import full_trip
    return full_trip(trip_id)

@app.route("/checklist", methods=["POST"])
def checklist_alias():
    from routes.checklist_routes import add_item
    return add_item()

@app.route("/api/checklist", methods=["POST"])
def api_checklist_alias():
    from routes.checklist_routes import add_item
    return add_item()

@app.route("/notes", methods=["POST"])
def notes_alias():
    from routes.note_routes import create_note
    return create_note()

@app.errorhandler(Exception)
def handle_unexpected_error(error):
    app.logger.exception(error)
    response = jsonify({"error": str(error)})
    response.status_code = 500
    return response

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
