from flask import Blueprint, request, jsonify

nsic_bp = Blueprint('nsic_connector', __name__, url_prefix='/api/verify/nsic')

def query_nsic(nsic_no):
    if not nsic_no:
        return {'status': 'NOT_APPLICABLE', 'message': 'No NSIC registration'}
    nsic_no = nsic_no.strip().upper()
    if nsic_no.startswith('NSIC/'):
        return {
            'status': 'REGISTERED',
            'nsic_no': nsic_no,
            'stores_category': 'Mechanical & Electrical Machinery',
            'valid_until': '2027-06-30',
            'emd_exemption': True
        }
    return {'status': 'NOT_FOUND', 'message': 'NSIC certificate not located'}

@nsic_bp.route('', methods=['POST'])
def verify_nsic():
    data = request.get_json() or {}
    nno = data.get('nsic_no')
    return jsonify(query_nsic(nno)), 200
