from flask import Blueprint, request, jsonify

startup_india_bp = Blueprint('startup_india_connector', __name__, url_prefix='/api/verify/startup')

STARTUP_DATABASE = {
    'DIPP-10928': {
        'status': 'RECOGNIZED',
        'dipp_number': 'DIPP-10928',
        'entity_name': 'TechVision Instruments',
        'valid_until': '2029-05-14',
        'turnover_exemption_eligible': True
    }
}

def query_startup_india(startup_id):
    if not startup_id:
        return {'status': 'NOT_APPLICABLE', 'message': 'No Startup India ID provided'}
    startup_id = startup_id.strip().upper()
    if startup_id in STARTUP_DATABASE:
        return STARTUP_DATABASE[startup_id]
    if startup_id.startswith('DIPP'):
        return {
            'status': 'RECOGNIZED',
            'dipp_number': startup_id,
            'valid_until': '2028-12-31',
            'turnover_exemption_eligible': True
        }
    return {'status': 'NOT_FOUND', 'message': 'Startup registration not verified'}

@startup_india_bp.route('', methods=['POST'])
def verify_startup():
    data = request.get_json() or {}
    sid = data.get('startup_id')
    return jsonify(query_startup_india(sid)), 200
