from flask import Blueprint
from app.utils.helpers import success_response

verification_bp = Blueprint('verification_routes', __name__, url_prefix='/api/connectors')

@verification_bp.route('/status', methods=['GET'])
def get_connectors_status():
    connectors = [
        {'name': 'GSTN', 'endpoint': '/api/verify/gst', 'mode': 'Synthetic Test Dataset', 'status': 'Connected', 'latency_ms': 42},
        {'name': 'Income Tax / PAN', 'endpoint': '/api/verify/pan', 'mode': 'Synthetic Test Dataset', 'status': 'Connected', 'latency_ms': 38},
        {'name': 'Udyam Registration', 'endpoint': '/api/verify/udyam', 'mode': 'Synthetic Test Dataset', 'status': 'Connected', 'latency_ms': 55},
        {'name': 'MCA21', 'endpoint': '/api/verify/mca', 'mode': 'Synthetic Test Dataset', 'status': 'Connected', 'latency_ms': 61},
        {'name': 'EPFO', 'endpoint': '/api/verify/epfo', 'mode': 'Synthetic Test Dataset', 'status': 'Connected', 'latency_ms': 49},
        {'name': 'ESIC', 'endpoint': '/api/verify/esic', 'mode': 'Synthetic Test Dataset', 'status': 'Connected', 'latency_ms': 44},
        {'name': 'GeM Debarment Registry', 'endpoint': '/api/verify/blacklist', 'mode': 'Synthetic Test Dataset', 'status': 'Connected', 'latency_ms': 31},
        {'name': 'DPIIT Startup India', 'endpoint': '/api/verify/startup', 'mode': 'Synthetic Test Dataset', 'status': 'Connected', 'latency_ms': 50},
        {'name': 'NSIC Database', 'endpoint': '/api/verify/nsic', 'mode': 'Synthetic Test Dataset', 'status': 'Connected', 'latency_ms': 52}
    ]
    return success_response(connectors)
