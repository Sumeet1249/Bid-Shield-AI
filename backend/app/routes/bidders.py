from flask import Blueprint, request
from datetime import datetime
from app import db
from app.models.bidder import Bidder
from app.models.tender import Tender
from app.models.verification import VerificationResult
from app.models.compliance import ComplianceResult
from app.models.audit import AuditLog
from app.connectors.gstn import query_gstn
from app.connectors.pan import query_pan
from app.connectors.udyam import query_udyam
from app.connectors.mca21 import query_mca21
from app.connectors.epfo_esic import query_epfo, query_esic
from app.connectors.oem import query_oem
from app.connectors.blacklist import query_blacklist
from app.compliance_engine import (
    evaluate_gst,
    evaluate_pan,
    evaluate_udyam,
    evaluate_turnover,
    evaluate_epfo,
    evaluate_esic,
    evaluate_oem,
    evaluate_make_in_india,
    evaluate_experience,
    evaluate_blacklisting,
    calculate_compliance_score,
    classify_risk,
    generate_recommendation
)
from app.ai_engine.cross_verify import detect_discrepancies
from app.ai_engine.explain import generate_reasoning_chain
from app.utils.helpers import success_response, error_response, log_audit

bidders_bp = Blueprint('bidders_routes', __name__)

def get_bidder_key(name):
    lower = (name or '').lower()
    if 'abc' in lower:
        return 'abc'
    elif 'xyz' in lower:
        return 'xyz'
    elif 'pqr' in lower:
        return 'pqr'
    return 'generic'

@bidders_bp.route('/api/tenders/<int:tender_id>/bidders', methods=['POST'])
def add_bidder(tender_id):
    tender = Tender.query.get(tender_id)
    if not tender:
        return error_response('Tender not found', 404)

    data = request.get_json() or {}
    company_name = data.get('company_name')
    gstin = data.get('gstin')
    pan = data.get('pan')

    if not company_name or not gstin or not pan:
        return error_response('Company name, GSTIN, and PAN are required', 400)

    bidder = Bidder(
        tender_id=tender_id,
        company_name=company_name,
        gstin=gstin,
        pan=pan,
        cin=data.get('cin'),
        udyam_no=data.get('udyam_no'),
        startup_id=data.get('startup_id'),
        nsic_no=data.get('nsic_no')
    )
    db.session.add(bidder)
    db.session.commit()

    log_audit(
        action=f"Bidder <b>{bidder.company_name}</b> added to tender {tender.tender_number}",
        entity=f"bidder:{bidder.id}"
    )

    return success_response(bidder.to_dict(), "Bidder registered", 201)

@bidders_bp.route('/api/bidders/<int:bidder_id>', methods=['GET'])
def get_bidder(bidder_id):
    bidder = Bidder.query.get(bidder_id)
    if not bidder:
        return error_response('Bidder not found', 404)
    return success_response(bidder.to_dict())

@bidders_bp.route('/api/bidders/<int:bidder_id>/verify', methods=['POST'])
def run_verification(bidder_id):
    bidder = Bidder.query.get(bidder_id)
    if not bidder:
        return error_response('Bidder not found', 404)

    key = get_bidder_key(bidder.company_name)

    # 1. Query Mock Connectors
    gst_res = query_gstn(bidder.gstin)
    pan_res = query_pan(bidder.pan, bidder.company_name)
    mca_res = query_mca21(bidder.cin, bidder.company_name)
    udyam_res = query_udyam(bidder.udyam_no)
    epfo_res = query_epfo(bidder.company_name)
    esic_res = query_esic(bidder.company_name)
    oem_res = query_oem(bidder_key=key)
    blacklist_res = query_blacklist(bidder.gstin or bidder.pan)

    # 2. Evaluate Compliance Rules
    items = []
    items.append(evaluate_gst(gst_res))
    items.append(evaluate_pan(pan_res, bidder.company_name))
    items.append(evaluate_udyam(udyam_res))
    items.append(evaluate_turnover(14.8 if key == 'abc' else (11.2 if key == 'xyz' else 7.4), 10.0))
    items.append(evaluate_epfo(epfo_res))
    items.append(evaluate_esic(esic_res))
    items.append(evaluate_oem(oem_res))
    items.append(evaluate_make_in_india(True))
    items.append(evaluate_experience(key != 'pqr'))
    items.append(evaluate_blacklisting(blacklist_res))

    # 3. Calculate Score & Risk
    score_result = calculate_compliance_score(items)
    score = score_result['score']
    has_critical = score_result['has_critical_disqualifier']
    risk_info = classify_risk(score, has_critical)

    # 4. Cross-Verification & Discrepancies
    connector_bundle = {
        'gst': gst_res,
        'pan': pan_res,
        'mca': mca_res,
        'blacklist': blacklist_res
    }
    discrepancies, risk_pills = detect_discrepancies(key, {}, connector_bundle)

    # 5. Explainable Reasoning & Recommendation
    explain_chain = generate_reasoning_chain(key, items, discrepancies)
    recommendation = generate_recommendation(risk_info['band'], items, discrepancies)

    # 6. Update Bidder Model
    bidder.score = score
    bidder.risk = risk_info['band']
    bidder.verification_status = 'verified'
    db.session.commit()

    # Log to audit trail
    log_audit(
        action=f"AI verification pipeline completed for <b>{bidder.company_name}</b> (Score: {score}/100, Risk: {risk_info['band']})",
        entity=f"bidder:{bidder.id}",
        details=f"Evaluated 10 requirements across 7 mock government connectors."
    )

    # Build matrix in the format frontend expects: [Requirement, Source, Status, Evidence]
    matrix_rows = [
        [i['requirement'], i['source'], i['status'], i['evidence']]
        for i in items
    ]

    response_payload = {
        'bidder_id': bidder.id,
        'company_name': bidder.company_name,
        'score': score,
        'risk': risk_info['band'],
        'risk_label': f"{risk_info['band']} RISK",
        'matrix': matrix_rows,
        'discrepancies': discrepancies,
        'risks': risk_pills,
        'explain': explain_chain,
        'recTitle': risk_info['rec_title'],
        'recTitleColor': risk_info['rec_title_color'],
        'reasons': recommendation['reasons'],
        'action': recommendation['action'],
        'disclaimer': recommendation['disclaimer']
    }

    return success_response(response_payload, "Verification pipeline executed successfully")

@bidders_bp.route('/api/bidders/<int:bidder_id>/compliance', methods=['GET'])
def get_compliance(bidder_id):
    # Delegate to verify calculation
    return run_verification(bidder_id)

@bidders_bp.route('/api/bidders/<int:bidder_id>/decision', methods=['POST'])
def record_decision(bidder_id):
    bidder = Bidder.query.get(bidder_id)
    if not bidder:
        return error_response('Bidder not found', 404)

    data = request.get_json() or {}
    decision = data.get('decision')  # 'Approved', 'Clarification requested', 'Rejected'
    officer_name = data.get('officer_name', 'Officer Sharma')
    notes = data.get('notes', '')

    if not decision:
        return error_response('Decision action is required', 400)

    bidder.decision = decision
    bidder.decision_notes = notes
    bidder.decision_at = datetime.utcnow()
    bidder.verification_status = decision.lower()
    db.session.commit()

    log_audit(
        action=f"Officer decision recorded: <b>{decision}</b> for bidder <b>{bidder.company_name}</b> by {officer_name}",
        entity=f"bidder:{bidder.id}",
        details=notes or f"Final human-in-the-loop decision: {decision}"
    )

    return success_response({
        'bidder_id': bidder.id,
        'decision': decision,
        'officer_name': officer_name,
        'recorded_at': bidder.decision_at.isoformat()
    }, f"Decision recorded: {decision}")
