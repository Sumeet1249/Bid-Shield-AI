from flask import Blueprint, request, jsonify

gstn_bp = Blueprint('gstn_connector', __name__, url_prefix='/api/verify/gst')

# Dummy database of known test GSTINs for SIH demonstration
GSTN_DATABASE = {
    '19ABCDE1234F1Z5': {
        'status': 'ACTIVE',
        'legal_name': 'ABC Engineering Pvt Ltd',
        'trade_name': 'ABC Engineering',
        'taxpayer_type': 'Regular',
        'filing_status': 'COMPLIANT',
        'last_return': '2026-08-31',
        'gstr3b_status': 'FILED',
        'gstr1_status': 'FILED',
        'annual_return': 'FILED'
    },
    '27XYZAB5678K1Z2': {
        'status': 'ACTIVE',
        'legal_name': 'XYZ Industrial Solutions',
        'trade_name': 'XYZ Solutions',
        'taxpayer_type': 'Regular',
        'filing_status': 'WARNING_LATE_RETURNS',
        'last_return': '2026-07-31',
        'gstr3b_status': 'LATE_FILING (1 return delayed)',
        'gstr1_status': 'FILED',
        'annual_return': 'FILED'
    },
    '07PQRXY9988M1Z8': {
        'status': 'INACTIVE',
        'legal_name': 'PQR Enterprises',
        'trade_name': 'PQR Enterprises',
        'taxpayer_type': 'Regular',
        'filing_status': 'OVERDUE',
        'last_return': '2025-11-30',
        'gstr3b_status': '3 returns overdue',
        'gstr1_status': 'OVERDUE',
        'annual_return': 'NOT_FILED'
    }
}

def query_gstn(gstin):
    """Internal connector lookup function."""
    if not gstin:
        return {'status': 'ERROR', 'message': 'GSTIN missing'}
    gstin = gstin.strip().upper()
    if gstin in GSTN_DATABASE:
        return GSTN_DATABASE[gstin]
    # Default fallback for arbitrary GSTIN format (15 characters)
    if len(gstin) == 15 and gstin[:2].isdigit():
        return {
            'status': 'ACTIVE',
            'legal_name': 'Unknown Verified Entity',
            'taxpayer_type': 'Regular',
            'filing_status': 'COMPLIANT',
            'last_return': '2026-08-31'
        }
    return {'status': 'NOT_FOUND', 'message': 'Invalid or unlisted GSTIN'}

@gstn_bp.route('', methods=['POST'])
def verify_gst():
    data = request.get_json() or {}
    gstin = data.get('gstin')
    result = query_gstn(gstin)
    return jsonify(result), 200 if result.get('status') != 'ERROR' else 400
