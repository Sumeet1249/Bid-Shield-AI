from flask import jsonify
from datetime import datetime
from app import db
from app.models.audit import AuditLog

def success_response(data=None, message="Success", status_code=200):
    payload = {
        'status': 'success',
        'message': message,
        'data': data
    }
    return jsonify(payload), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    payload = {
        'status': 'error',
        'message': message,
    }
    if errors:
        payload['errors'] = errors
    return jsonify(payload), status_code

def log_audit(action, entity=None, details=None, user_id=None):
    """Create an immutable audit log entry."""
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            details=details,
            timestamp=datetime.utcnow()
        )
        db.session.add(log)
        db.session.commit()
        return log
    except Exception as e:
        db.session.rollback()
        print(f"Error logging audit: {e}")
        return None
