from datetime import datetime
from app import db

class VerificationResult(db.Model):
    __tablename__ = 'verification_results'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    bidder_id = db.Column(db.Integer, db.ForeignKey('bidders.id'), nullable=False)
    verification_type = db.Column(db.String(50), nullable=False)  # 'gst', 'pan', 'mca', 'udyam', 'epfo', etc.
    source = db.Column(db.String(100), nullable=False)  # 'GSTN', 'Income Tax Dept.', 'MCA21', etc.
    status = db.Column(db.String(50), nullable=False)  # 'pass', 'warning', 'fail'
    result = db.Column(db.JSON, nullable=True)  # Raw connector response
    confidence = db.Column(db.Float, default=1.0)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'bidder_id': self.bidder_id,
            'verification_type': self.verification_type,
            'source': self.source,
            'status': self.status,
            'result': self.result,
            'confidence': self.confidence,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
