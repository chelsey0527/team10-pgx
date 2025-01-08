from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for cross-origin requests

    from .routes import autogen_routes
    app.register_blueprint(autogen_routes, url_prefix="/autogen")

    return app
