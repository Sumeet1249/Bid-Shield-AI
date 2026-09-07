from flask import Blueprint, request, jsonify

mca21_bp = Blueprint('mca21_connector', __name__, url_prefix='/api/verify/mca')

MCA_DATABASE = {
    'U29100TN2015PTC098211': {
        'cin': 'U29100TN2015PTC098211',
        'legal_name': 'ABC Engineering Pvt Ltd',
        'company_category': 'Company limited by Shares',
        'class_of_company': 'Private',
        'status': 'ACTIVE',
        'incorporation_date': '2015-06-12',
        'paid_up_capital_cr': 12.5,
        'directors': ['R. Sharma', 'V. Raman']
    },
    'U27310MH2012PTC231044': {
        'cin': 'U27310MH2012PTC231044',
        'legal_name': 'XYZ Industrial Solutions',
        'company_category': 'Company limited by Shares',
        'class_of_company': 'Private',
        'status': 'ACTIVE',
        'incorporation_date': '2012-03-24',
        'paid_up_capital_cr': 8.0,
        'directors': ['A. Kulkarni', 'S. Joshi']
    },
    'PQR_MOCK_CIN': {
        'cin': 'U51909DL2018PTC334512',
        'legal_name': 'P.Q.R. Enterprises Pvt Ltd',  # Discrepancy with GST legal name 'PQR Enterprises'
        'company_category': 'Company limited by Shares',
        'class_of_company': 'Private',
        'status': 'ACTIVE',
        'incorporation_date': '2018-09-10',
        'paid_up_capital_cr': 1.5,
        'directors': ['P. Q. Roy']
    }
}

def query_mca21(cin=None, company_name=None):
    if cin and cin in MCA_DATABASE:
        return MCA_DATABASE[cin]
    
    if company_name and 'pqr' in company_name.lower():
        return MCA_DATABASE['PQR_MOCK_CIN']

    for record in MCA_DATABASE.values():
        if company_name and company_name.lower() in record['legal_name'].lower():
            return record

    if cin and len(cin) == 21:
        return {
            'cin': cin,
            'legal_name': company_name or 'Active Registered Company',
            'status': 'ACTIVE',
            'incorporation_date': '2018-01-01'
        }
    return {'status': 'NOT_FOUND', 'message': 'Company CIN not registered on MCA21'}

@mca21_bp.route('', methods=['POST'])
def verify_mca():
    data = request.get_json() or {}
    cin = data.get('cin')
    company_name = data.get('company_name')
    result = query_mca21(cin, company_name)
    return jsonify(result), 200
