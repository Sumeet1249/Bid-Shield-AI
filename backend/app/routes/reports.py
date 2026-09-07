from flask import Blueprint, jsonify, render_template_string
from app.models.bidder import Bidder
from app.utils.helpers import success_response, error_response

reports_bp = Blueprint('reports_routes', __name__, url_prefix='/api/reports')

@reports_bp.route('/<int:bidder_id>', methods=['GET'])
def generate_report(bidder_id):
    bidder = Bidder.query.get(bidder_id)
    if not bidder:
        return error_response('Bidder not found', 404)

    tender = bidder.tender
    report_data = {
        'report_title': 'GeM Bid Compliance Verification Summary Report',
        'generated_for': bidder.company_name,
        'tender_number': tender.tender_number if tender else 'N/A',
        'tender_title': tender.title if tender else 'N/A',
        'gstin': bidder.gstin,
        'pan': bidder.pan,
        'cin': bidder.cin,
        'score': bidder.score,
        'risk_band': bidder.risk,
        'officer_decision': bidder.decision or 'Pending Officer Decision',
        'decision_notes': bidder.decision_notes or 'None',
        'verified_connectors': ['GSTN', 'Income Tax CBDT', 'MCA21', 'EPFO', 'ESIC', 'GeM Debarment Registry'],
        'compliance_officer': 'Officer Sharma',
        'disclaimer': 'AI-generated decision support report. Procurement Officer retains legal responsibility for disqualification decisions.'
    }
    return success_response(report_data)
