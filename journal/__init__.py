from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .models import db
from .routes import trades_bp
from .auth import auth_bp
from .telegram_routes import telegram_bp
from .extensions import socketio
import os

def create_app(config_object='journal.config.DevelopmentConfig'):
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    socketio.init_app(app, cors_allowed_origins="*")

    # Register blueprints
    app.register_blueprint(trades_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(telegram_bp, url_prefix='/api/telegram')

    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()

    return app

def create_production_app():
    return create_app('journal.config.ProductionConfig')
