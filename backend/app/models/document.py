from datetime import datetime
from app import db

class Document(db.Model):
    __tablename__ = 'documents'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    bidder_id = db.Column(db.Integer, db.ForeignKey('bidders.id'), nullable=False)
    document_type = db.Column(db.String(100), nullable=False)  # 'GST Certificate', 'PAN Card', etc.
    filename = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=True)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    verification_status = db.Column(db.String(50), default='pending')  # 'pending', 'pass', 'warning', 'fail'
    confidence = db.Column(db.Float, default=1.0)
    extracted_data = db.Column(db.JSON, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'bidder_id': self.bidder_id,
            'document_type': self.document_type,
            'filename': self.filename,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'verification_status': self.verification_status,
            'confidence': self.confidence,
            'extracted_data': self.extracted_data
        }
