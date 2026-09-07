from app.routes.auth import auth_bp
from app.routes.tenders import tenders_bp
from app.routes.bidders import bidders_bp
from app.routes.documents import documents_bp
from app.routes.verification import verification_bp
from app.routes.reports import reports_bp
from app.routes.audit import audit_bp

route_blueprints = [
    auth_bp,
    tenders_bp,
    bidders_bp,
    documents_bp,
    verification_bp,
    reports_bp,
    audit_bp
]

__all__ = ['route_blueprints']
