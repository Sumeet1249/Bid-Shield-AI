from flask import Blueprint, request, jsonify

epfo_esic_bp = Blueprint('epfo_esic_connector', __name__)

LABOR_DATABASE = {
    'ABC Engineering Pvt Ltd': {
        'epfo': {
            'status': 'COMPLIANT',
            'establishment_code': 'TN/MAS/0091823/000',
            'filing_status': 'REGULAR',
            'last_ecr_month': 'August 2026',
            'active_members': 142
        },
        'esic': {
            'status': 'COMPLIANT',
            'employer_code': '51000876540001001',
            'compliance_status': 'COMPLIANT',
            'valid_until': '2027-03-31'
        }
    },
    'XYZ Industrial Solutions': {
        'epfo': {
            'status': 'COMPLIANT',
            'establishment_code': 'MH/PUN/0045129/000',
            'filing_status': 'REGULAR',
            'last_ecr_month': 'August 2026',
            'active_members': 88
        },
        'esic': {
            'status': 'WARNING',
            'employer_code': '31000912340001001',
            'compliance_status': 'RENEWAL_PENDING',
            'valid_until': '2026-08-31',
            'note': 'ESIC — renewal pending'
        }
    },
    'PQR Enterprises': {
        'epfo': {
            'status': 'FAIL',
            'establishment_code': None,
            'compliance_status': 'NOT_REGISTERED',
            'note': 'No active EPFO registration found'
        },
        'esic': {
            'status': 'WARNING',
            'employer_code': '11000678900001001',
            'compliance_status': 'UNDER_REVIEW',
            'note': 'Registration under review'
        }
    }
}

def query_epfo(company_name, establishment_id=None):
    if company_name in LABOR_DATABASE:
        return LABOR_DATABASE[company_name]['epfo']
    return {
        'status': 'COMPLIANT',
        'establishment_code': establishment_id or 'DL/CPM/0011223/000',
        'filing_status': 'REGULAR'
    }

def query_esic(company_name, esic_no=None):
    if company_name in LABOR_DATABASE:
        return LABOR_DATABASE[company_name]['esic']
    return {
        'status': 'COMPLIANT',
        'employer_code': esic_no or '11000000000001001',
        'compliance_status': 'COMPLIANT'
    }

@epfo_esic_bp.route('/api/verify/epfo', methods=['POST'])
def verify_epfo():
    data = request.get_json() or {}
    name = data.get('company_name') or data.get('name')
    est_id = data.get('establishment_id')
    return jsonify(query_epfo(name, est_id)), 200

@epfo_esic_bp.route('/api/verify/esic', methods=['POST'])
def verify_esic():
    data = request.get_json() or {}
    name = data.get('company_name') or data.get('name')
    esic_no = data.get('esic_no')
    return jsonify(query_esic(name, esic_no)), 200
