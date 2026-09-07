from datetime import datetime
import json
from app import db

class Tender(db.Model):
    __tablename__ = 'tenders'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tender_number = db.Column(db.String(100), unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    organization = db.Column(db.String(255), nullable=False)
    department = db.Column(db.String(255), nullable=True)
    value = db.Column(db.Numeric(15, 2), nullable=True)
    min_turnover = db.Column(db.Numeric(15, 2), nullable=True)
    deadline = db.Column(db.Date, nullable=True)
    requirements_json = db.Column(db.JSON, nullable=True)
    status = db.Column(db.String(50), default='draft')  # 'draft', 'reviewing', 'completed'
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    bidders = db.relationship('Bidder', backref='tender', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'tender_number': self.tender_number,
            'title': self.title,
            'organization': self.organization,
            'department': self.department,
            'value': float(self.value) if self.value else None,
            'min_turnover': float(self.min_turnover) if self.min_turnover else None,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'requirements_json': self.requirements_json,
            'status': self.status,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'bidders_count': len(self.bidders) if self.bidders else 0
        }
