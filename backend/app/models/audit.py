from datetime import datetime
from app import db

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(255), nullable=False)
    entity = db.Column(db.String(255), nullable=True)  # 'tender:1', 'bidder:2', etc.
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'entity': self.entity,
            'timestamp': self.timestamp.strftime('%H:%M:%S') if self.timestamp else '',
            'full_timestamp': self.timestamp.isoformat() if self.timestamp else '',
            'details': self.details
        }
