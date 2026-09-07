from flask import Blueprint, request
from datetime import datetime
from app import db
from app.models.tender import Tender
from app.models.bidder import Bidder
from app.ai_engine.nlp_extract import extract_tender_requirements
from app.utils.helpers import success_response, error_response, log_audit

tenders_bp = Blueprint('tenders_routes', __name__, url_prefix='/api/tenders')

@tenders_bp.route('', methods=['GET'])
def list_tenders():
    tenders = Tender.query.order_by(Tender.created_at.desc()).all()
    return success_response([t.to_dict() for t in tenders])

@tenders_bp.route('', methods=['POST'])
def create_tender():
    data = request.get_json() or {}
    tender_number = data.get('tender_number')
    title = data.get('title')
    organization = data.get('organization')

    if not tender_number or not title or not organization:
        return error_response('Tender number, title, and organization are required.', 400)

    # Check duplicate
    existing = Tender.query.filter_by(tender_number=tender_number).first()
    if existing:
        return error_response('Tender number already exists.', 409)

    tender = Tender(
        tender_number=tender_number,
        title=title,
        organization=organization,
        department=data.get('department', 'Procurement Division'),
        value=data.get('value', 10000000),
        min_turnover=data.get('min_turnover', 5000000),
        requirements_json=data.get('requirements_json', {}),
        status=data.get('status', 'draft')
    )
    db.session.add(tender)
    db.session.commit()

    log_audit(
        action=f"Tender <b>{tender.tender_number}</b> created",
        entity=f"tender:{tender.id}",
        details=f"Title: {tender.title}, Organization: {tender.organization}"
    )

    return success_response(tender.to_dict(), "Tender created successfully", 201)

@tenders_bp.route('/<int:tender_id>', methods=['GET'])
def get_tender(tender_id):
    tender = Tender.query.get(tender_id)
    if not tender:
        return error_response('Tender not found', 404)
    
    tender_data = tender.to_dict()
    # Include bidders
    tender_data['bidders'] = [b.to_dict() for b in tender.bidders]
    return success_response(tender_data)

@tenders_bp.route('/<int:tender_id>/extract', methods=['POST'])
def extract_requirements(tender_id):
    tender = Tender.query.get(tender_id)
    if not tender:
        return error_response('Tender not found', 404)
    
    extracted = extract_tender_requirements()
    tender.requirements_json = {
        'extracted': extracted['requirements_matrix'],
        'min_turnover_cr': extracted['min_turnover_cr']
    }
    db.session.commit()

    log_audit(
        action=f"AI requirement extraction completed for tender <b>{tender.tender_number}</b>",
        entity=f"tender:{tender.id}",
        details=f"Extracted {extracted['extracted_count']} compliance items"
    )

    return success_response(extracted, "AI extraction completed")
