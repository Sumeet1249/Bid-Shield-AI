from flask import Blueprint, request
from app import db
from app.models.audit import AuditLog
from app.utils.helpers import success_response

audit_bp = Blueprint('audit_routes', __name__, url_prefix='/api/audit')

@audit_bp.route('', methods=['GET'])
def list_audit_logs():
    entity = request.args.get('entity')
    query = AuditLog.query
    if entity:
        query = query.filter_by(entity=entity)
    logs = query.order_by(AuditLog.id.asc()).all()
    
    # Return formatted list matching frontend expectations
    data = [
        [l.timestamp.strftime('%H:%M:%S') if l.timestamp else '09:00:00', l.action]
        for l in logs
    ]
    return success_response({
        'logs': [l.to_dict() for l in logs],
        'items': data
    })
