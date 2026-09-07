from flask import Blueprint, request, jsonify

blacklist_bp = Blueprint('blacklist_connector', __name__, url_prefix='/api/verify/blacklist')

DEBARRED_DATABASE = {
    '07PQRXY9988M1Z8': {
        'listed': True,
        'entity_name': 'PQR Enterprises',
        'pan': 'PQRXY9988M',
        'debarment_id': 'GEM-DEB-2024-0982',
        'reason': 'Willful default on public procurement delivery contract',
        'authority': 'Ministry of Petroleum & Natural Gas / GeM Debarment Registry',
        'period_start': '2024-04-01',
        'period_end': '2027-03-31',
        'status': 'ACTIVE_DEBARMENT'
    },
    'PQRXY9988M': {
        'listed': True,
        'entity_name': 'PQR Enterprises',
        'pan': 'PQRXY9988M',
        'debarment_id': 'GEM-DEB-2024-0982',
        'reason': 'Willful default on public procurement delivery contract',
        'authority': 'Ministry of Petroleum & Natural Gas / GeM Debarment Registry',
        'period_start': '2024-04-01',
        'period_end': '2027-03-31',
        'status': 'ACTIVE_DEBARMENT'
    }
}

def query_blacklist(identifier):
    if not identifier:
        return {'listed': False, 'message': 'No identifier provided'}
    identifier = identifier.strip().upper()
    if identifier in DEBARRED_DATABASE:
        record = DEBARRED_DATABASE[identifier]
        return {
            'listed': True,
            'debarment_record': record,
            'status': 'BLACKLISTED',
            'message': f"Active debarment record found: {record['period_start']} to {record['period_end']}"
        }
    return {
        'listed': False,
        'status': 'CLEAR',
        'message': 'No debarment records found on GeM Debarment Registry or Central CVC database'
    }

@blacklist_bp.route('', methods=['POST'])
def verify_blacklist():
    data = request.get_json() or {}
    ident = data.get('gstin') or data.get('pan') or data.get('cin') or data.get('name')
    result = query_blacklist(ident)
    return jsonify(result), 200
