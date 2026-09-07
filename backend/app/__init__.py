from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register Connectors
    from app.connectors import connector_blueprints
    for bp in connector_blueprints:
        app.register_blueprint(bp)

    # Register Application Routes
    from app.routes import route_blueprints
    for bp in route_blueprints:
        app.register_blueprint(bp)

    # Health check route
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'healthy', 'service': 'BidShield AI API', 'version': '1.0.0'}

    return app
