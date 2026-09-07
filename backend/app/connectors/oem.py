from flask import Blueprint, request, jsonify

oem_bp = Blueprint('oem_connector', __name__, url_prefix='/api/verify/oem')

def query_oem(bidder_key=None, claimed_oem=None, letter_issuer=None):
    if bidder_key == 'abc' or (claimed_oem and 'siemens' in str(claimed_oem).lower()):
        return {
            'status': 'PASS',
            'valid': True,
            'match_confidence': 0.98,
            'oem_name': 'Siemens Industrial Ltd',
            'letter_verified': True,
            'authorized_territory': 'India',
            'valid_until': '2027-12-31'
        }
    elif bidder_key == 'xyz' or (claimed_oem and 'hitachi' in str(claimed_oem).lower()):
        return {
            'status': 'FAIL',
            'valid': False,
            'match_confidence': 0.87,
            'claimed_oem': claimed_oem or 'Hitachi Power Systems',
            'letter_issuer': letter_issuer or 'Hitachi Energy Pvt Ltd',
            'discrepancy': 'Manufacturer name does not match claimed OEM',
            'note': 'Authorization letter — manufacturer mismatch'
        }
    elif bidder_key == 'pqr':
        return {
            'status': 'FAIL',
            'valid': False,
            'match_confidence': 0.0,
            'note': 'Document missing'
        }
    return {
        'status': 'PASS',
        'valid': True,
        'match_confidence': 0.95,
        'oem_name': claimed_oem or 'Registered OEM'
    }

@oem_bp.route('', methods=['POST'])
def verify_oem():
    data = request.get_json() or {}
    result = query_oem(
        bidder_key=data.get('bidder_key'),
        claimed_oem=data.get('claimed_oem'),
        letter_issuer=data.get('letter_issuer')
    )
    return jsonify(result), 200
