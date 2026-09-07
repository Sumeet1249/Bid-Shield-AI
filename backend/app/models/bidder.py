from datetime import datetime
from app import db

class Bidder(db.Model):
    __tablename__ = 'bidders'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tender_id = db.Column(db.Integer, db.ForeignKey('tenders.id'), nullable=False)
    company_name = db.Column(db.String(255), nullable=False)
    gstin = db.Column(db.String(50), nullable=False)
    pan = db.Column(db.String(50), nullable=False)
    cin = db.Column(db.String(50), nullable=True)
    udyam_no = db.Column(db.String(50), nullable=True)
    startup_id = db.Column(db.String(50), nullable=True)
    nsic_no = db.Column(db.String(50), nullable=True)
    score = db.Column(db.Float, default=0.0)
    risk = db.Column(db.String(20), default='PENDING')  # 'LOW', 'MEDIUM', 'HIGH', 'PENDING'
    verification_status = db.Column(db.String(50), default='pending')  # 'pending', 'verified', 'approved', 'rejected', 'clarification_requested'
    decision = db.Column(db.String(50), nullable=True)
    decision_notes = db.Column(db.Text, nullable=True)
    decision_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    documents = db.relationship('Document', backref='bidder', cascade='all, delete-orphan', lazy=True)
    verifications = db.relationship('VerificationResult', backref='bidder', cascade='all, delete-orphan', lazy=True)
    compliance_items = db.relationship('ComplianceResult', backref='bidder', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'tender_id': self.tender_id,
            'company_name': self.company_name,
            'gstin': self.gstin,
            'pan': self.pan,
            'cin': self.cin,
            'udyam_no': self.udyam_no,
            'startup_id': self.startup_id,
            'nsic_no': self.nsic_no,
            'score': self.score,
            'risk': self.risk,
            'verification_status': self.verification_status,
            'decision': self.decision,
            'decision_notes': self.decision_notes,
            'decision_at': self.decision_at.isoformat() if self.decision_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
