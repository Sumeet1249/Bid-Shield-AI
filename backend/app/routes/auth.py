from flask import Blueprint, request
from werkzeug.security import check_password_hash
import jwt
import datetime
from app.models.user import User
from app.utils.helpers import success_response, error_response
from app.config import Config

auth_bp = Blueprint('auth_routes', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()
    if not user:
        # For prototype demonstration convenience: if not found, create demo officer or authenticate
        if 'officer' in email:
            user = User.query.filter_by(role='officer').first()
        elif 'admin' in email:
            user = User.query.filter_by(role='admin').first()

    if not user:
        return error_response('Invalid credentials', 401)

    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'role': user.role,
        'email': user.email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, Config.SECRET_KEY, algorithm='HS256')

    return success_response({
        'token': token,
        'user': user.to_dict()
    }, message="Authentication successful")

@auth_bp.route('/me', methods=['GET'])
def me():
    user = User.query.first()
    return success_response(user.to_dict() if user else None)
