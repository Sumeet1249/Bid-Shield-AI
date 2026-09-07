from datetime import datetime, date
from werkzeug.security import generate_password_hash
from app import db
from app.models.user import User
from app.models.tender import Tender
from app.models.bidder import Bidder
from app.models.document import Document
from app.models.compliance import ComplianceResult
from app.models.verification import VerificationResult
from app.models.audit import AuditLog

def seed_database():
    """Seeds the SQLite database with initial SIH demonstration dataset."""
    db.create_all()

    # Check if data already exists
    if User.query.first():
        return

    print("Seeding BidShield AI demonstration database...")

    # 1. Users
    officer = User(
        name='Officer Sharma',
        email='officer@cpcl.gem.gov.in',
        password_hash=generate_password_hash('password123'),
        role='officer'
    )
    admin = User(
        name='Admin GeM',
        email='admin@gem.gov.in',
        password_hash=generate_password_hash('admin123'),
        role='admin'
    )
    db.session.add_all([officer, admin])
    db.session.commit()

    # 2. Tenders
    tender1 = Tender(
        tender_number='CPCL/2026/PROC/001',
        title='Industrial Equipment Procurement',
        organization='Chennai Petroleum Corporation Limited',
        department='Materials & Procurement',
        value=420000000.00,
        min_turnover=100000000.00,
        deadline=date(2026, 9, 25),
        requirements_json={
            'gst': True,
            'pan': True,
            'udyam': False,
            'oem': True,
            'make_in_india': True,
            'epfo': True,
            'esic': True,
            'startup_india': False,
            'blacklisting_clear': True
        },
        status='reviewing',
        created_by=officer.id
    )

    tender2 = Tender(
        tender_number='MDL/2026/PROC/014',
        title='Marine Grade Structural Steel Plates',
        organization='Mazagon Dock Shipbuilders',
        department='Procurement & Logistics',
        value=185000000.00,
        min_turnover=50000000.00,
        deadline=date(2026, 8, 30),
        status='completed',
        created_by=officer.id
    )

    tender3 = Tender(
        tender_number='NTPC/2026/PROC/077',
        title='High Voltage Transformer Auxiliary Systems',
        organization='NTPC Limited',
        department='Power Generation Engineering',
        value=640000000.00,
        min_turnover=200000000.00,
        deadline=date(2026, 10, 15),
        status='draft',
        created_by=officer.id
    )

    db.session.add_all([tender1, tender2, tender3])
    db.session.commit()

    # 3. Bidders for CPCL Tender
    b1 = Bidder(
        tender_id=tender1.id,
        company_name='ABC Engineering Pvt Ltd',
        gstin='19ABCDE1234F1Z5',
        pan='ABCDE1234F',
        cin='U29100TN2015PTC098211',
        udyam_no='UDYAM-TN-02-0012345',
        score=96.0,
        risk='LOW',
        verification_status='verified'
    )
    b2 = Bidder(
        tender_id=tender1.id,
        company_name='XYZ Industrial Solutions',
        gstin='27XYZAB5678K1Z2',
        pan='XYZAB5678K',
        cin='U27310MH2012PTC231044',
        udyam_no='UDYAM-MH-18-0098765',
        score=71.0,
        risk='MEDIUM',
        verification_status='pending'
    )
    b3 = Bidder(
        tender_id=tender1.id,
        company_name='PQR Enterprises',
        gstin='07PQRXY9988M1Z8',
        pan='PQRXY9988M',
        cin=None,
        udyam_no=None,
        score=39.0,
        risk='HIGH',
        verification_status='pending'
    )
    db.session.add_all([b1, b2, b3])
    db.session.commit()

    # 4. Audit Trail
    audit_events = [
        ('09:41:21', 'Tender <b>CPCL/2026/PROC/001</b> created by Officer Sharma', 'tender:CPCL/2026/PROC/001'),
        ('09:43:05', 'Bidder <b>ABC Engineering Pvt Ltd</b> added', 'bidder:ABC'),
        ('09:43:41', 'Bidder <b>XYZ Industrial Solutions</b> added', 'bidder:XYZ'),
        ('09:44:02', 'Bidder <b>PQR Enterprises</b> added', 'bidder:PQR'),
        ('09:45:17', 'Documents uploaded for all 3 bidders (18 files)', 'documents:batch'),
        ('09:45:32', 'OCR completed on all uploaded documents', 'ocr:batch'),
        ('09:46:11', 'GST verification run — 3 bidders queried', 'connector:gstn'),
        ('09:46:18', 'PAN verification run — 3 bidders queried', 'connector:pan'),
        ('09:46:44', 'MCA21 cross-check run — entity name comparison', 'connector:mca21'),
        ('09:47:02', 'Discrepancy detected — <b>PQR Enterprises</b> entity name mismatch', 'bidder:PQR'),
        ('09:47:09', 'Blacklisting check — <b>PQR Enterprises</b> flagged on debarment registry', 'bidder:PQR'),
        ('09:47:35', 'AI risk assessment generated for all bidders', 'engine:compliance'),
        ('09:48:10', 'Officer review pending on 2 of 3 bidders', 'officer:queue')
    ]

    for t_str, text, ent in audit_events:
        log = AuditLog(
            user_id=officer.id,
            action=text,
            entity=ent,
            details=text,
            timestamp=datetime.utcnow()
        )
        db.session.add(log)

    db.session.commit()
    print("Database successfully seeded with SIH demo data.")
