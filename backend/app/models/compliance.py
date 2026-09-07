from app import db

class ComplianceResult(db.Model):
    __tablename__ = 'compliance_results'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    bidder_id = db.Column(db.Integer, db.ForeignKey('bidders.id'), nullable=False)
    requirement = db.Column(db.String(100), nullable=False)  # 'GST', 'PAN', 'OEM Authorization', etc.
    status = db.Column(db.String(50), nullable=False)  # 'pass', 'warning', 'fail'
    score = db.Column(db.Float, default=0.0)  # Weighted points contribution
    reason = db.Column(db.Text, nullable=True)  # Explainable-AI reasoning text
    evidence = db.Column(db.String(255), nullable=True)  # Document / source reference

    def to_dict(self):
        return {
            'id': self.id,
            'bidder_id': self.bidder_id,
            'requirement': self.requirement,
            'status': self.status,
            'score': self.score,
            'reason': self.reason,
            'evidence': self.evidence
        }
