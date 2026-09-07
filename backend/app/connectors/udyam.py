from flask import Blueprint, request, jsonify

udyam_bp = Blueprint('udyam_connector', __name__, url_prefix='/api/verify/udyam')

UDYAM_DATABASE = {
    'UDYAM-TN-02-0012345': {
        'status': 'REGISTERED',
        'udyam_no': 'UDYAM-TN-02-0012345',
        'enterprise_name': 'ABC Engineering Pvt Ltd',
        'category': 'Small',
        'major_activity': 'Manufacturing',
        'valid': True
    },
    'UDYAM-MH-18-0098765': {
        'status': 'REGISTERED',
        'udyam_no': 'UDYAM-MH-18-0098765',
        'enterprise_name': 'XYZ Industrial Solutions',
        'category': 'Medium',
        'major_activity': 'Services / Manufacturing',
        'valid': True
    }
}

def query_udyam(udyam_no):
    if not udyam_no:
        return {'status': 'NOT_REGISTERED', 'message': 'No Udyam registration provided'}
    udyam_no = udyam_no.strip().upper()
    if udyam_no in UDYAM_DATABASE:
        return UDYAM_DATABASE[udyam_no]
    if udyam_no.startswith('UDYAM-'):
        return {
            'status': 'REGISTERED',
            'udyam_no': udyam_no,
            'enterprise_name': 'Registered MSME Enterprise',
            'category': 'Small',
            'valid': True
        }
    return {'status': 'NOT_FOUND', 'message': 'Udyam registration not found on portal'}

@udyam_bp.route('', methods=['POST'])
def verify_udyam():
    data = request.get_json() or {}
    udyam_no = data.get('udyam_no')
    result = query_udyam(udyam_no)
    return jsonify(result), 200
