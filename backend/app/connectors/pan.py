from flask import Blueprint, request, jsonify

pan_bp = Blueprint('pan_connector', __name__, url_prefix='/api/verify/pan')

PAN_DATABASE = {
    'ABCDE1234F': {
        'status': 'VALID',
        'pan': 'ABCDE1234F',
        'holder_name': 'ABC Engineering Pvt Ltd',
        'category': 'Company',
        'aadhaar_seeded': True,
        'tax_compliance': 'COMPLIANT'
    },
    'XYZAB5678K': {
        'status': 'VALID',
        'pan': 'XYZAB5678K',
        'holder_name': 'XYZ Industrial Solutions',
        'category': 'Company',
        'aadhaar_seeded': True,
        'tax_compliance': 'COMPLIANT'
    },
    'PQRXY9988M': {
        'status': 'VALID',
        'pan': 'PQRXY9988M',
        'holder_name': 'PQR Enterprises',
        'category': 'Proprietorship',
        'aadhaar_seeded': True,
        'tax_compliance': 'AUDIT_FLAGGED'
    }
}

def query_pan(pan, claimed_name=None):
    if not pan:
        return {'status': 'ERROR', 'message': 'PAN missing'}
    pan = pan.strip().upper()
    record = PAN_DATABASE.get(pan)
    if record:
        name_match = True
        if claimed_name:
            name_match = claimed_name.lower() in record['holder_name'].lower() or record['holder_name'].lower() in claimed_name.lower()
        return {
            'status': record['status'],
            'pan': record['pan'],
            'holder_name': record['holder_name'],
            'category': record['category'],
            'name_match': name_match,
            'tax_compliance': record['tax_compliance']
        }
    if len(pan) == 10 and pan[:5].isalpha() and pan[5:9].isdigit() and pan[9].isalpha():
        return {
            'status': 'VALID',
            'pan': pan,
            'holder_name': claimed_name or 'Verified Taxpayer',
            'category': 'Company',
            'name_match': True,
            'tax_compliance': 'COMPLIANT'
        }
    return {'status': 'INVALID', 'message': 'Invalid PAN format or not found'}

@pan_bp.route('', methods=['POST'])
def verify_pan():
    data = request.get_json() or {}
    pan = data.get('pan')
    name = data.get('name')
    result = query_pan(pan, name)
    return jsonify(result), 200
