from flask import Blueprint, request
from app import db
from app.models.document import Document
from app.models.bidder import Bidder
from app.ai_engine.ocr import process_document_ocr
from app.utils.helpers import success_response, error_response, log_audit

documents_bp = Blueprint('documents_routes', __name__, url_prefix='/api')

@documents_bp.route('/bidders/<int:bidder_id>/documents', methods=['GET'])
def list_documents(bidder_id):
    docs = Document.query.filter_by(bidder_id=bidder_id).all()
    return success_response([d.to_dict() for d in docs])

@documents_bp.route('/bidders/<int:bidder_id>/documents', methods=['POST'])
def upload_document(bidder_id):
    bidder = Bidder.query.get(bidder_id)
    if not bidder:
        return error_response('Bidder not found', 404)

    data = request.get_json() or {}
    doc_type = data.get('document_type', 'Compliance Certificate')
    filename = data.get('filename', 'document.pdf')

    ocr_result = process_document_ocr(filename=filename, document_type=doc_type)

    doc = Document(
        bidder_id=bidder.id,
        document_type=doc_type,
        filename=filename,
        verification_status='pass',
        confidence=ocr_result['confidence'],
        extracted_data={'text': ocr_result['text']}
    )
    db.session.add(doc)
    db.session.commit()

    log_audit(
        action=f"Document <b>{doc.filename}</b> ({doc.document_type}) uploaded for {bidder.company_name}",
        entity=f"document:{doc.id}"
    )

    return success_response(doc.to_dict(), "Document processed and recorded", 201)
