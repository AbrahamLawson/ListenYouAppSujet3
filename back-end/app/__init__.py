import sys
import time
from flask import Flask, request, g
from flask_cors import CORS
from .models import db
from flask_migrate import Migrate
from dotenv import load_dotenv
from .routes.playlist_routes import playlist_routes
from .routes.song_routes import song_routes
from .routes.spotify_routes import spotify_routes
from .config import Config

load_dotenv()

sys.stdout = sys.stderr = open(sys.stdout.fileno(), 'w', buffering=1)

def create_app():
    app = Flask(__name__)
    configure_app(app)
    initialize_database(app)
    initialize_migrate(app)
    register_blueprints(app)
    configure_logging()
    return app

def configure_app(app):
    app.config.from_object(Config)
    CORS(app)

def initialize_database(app):
    db.init_app(app)

def initialize_migrate(app):
    Migrate(app, db)

def register_blueprints(app):
    app.register_blueprint(playlist_routes)
    app.register_blueprint(song_routes)
    app.register_blueprint(spotify_routes)

def configure_logging():
    @app.before_request
    def before_request():
        g.start_time = time.time()

    @app.after_request
    def after_request(response):
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            print(f"Requête pour {request.path} a pris {duration:.2f} secondes")
        return response
