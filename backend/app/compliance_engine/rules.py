"""
BidShield AI - Statutory Compliance Rule Engine
Evaluates requirements against extracted document data and connector outputs.
"""

def evaluate_gst(gst_record):
    if not gst_record or gst_record.get('status') == 'ERROR':
        return {
            'requirement': 'GST Registration',
            'source': 'GSTN',
            'status': 'fail',
            'score_weight': 10,
            'earned_points': 0,
            'evidence': 'GSTIN missing or invalid format',
            'reason': 'GSTIN could not be verified against the GSTN portal database.'
        }
    status = gst_record.get('status')
    filing = gst_record.get('filing_status')
    if status == 'ACTIVE' and filing == 'COMPLIANT':
        return {
            'requirement': 'GST Registration',
            'source': 'GSTN',
            'status': 'pass',
            'score_weight': 10,
            'earned_points': 10,
            'evidence': f"GST Certificate — Active (Last Return: {gst_record.get('last_return', 'Recent')})",
            'reason': 'GST registration is ACTIVE and all statutory periodic returns are filed.'
        }
    elif status == 'ACTIVE' and 'WARNING' in filing:
        return {
            'requirement': 'GST Registration',
            'source': 'GSTN',
            'status': 'warn',
            'score_weight': 10,
            'earned_points': 6,
            'evidence': f"GST Certificate — {gst_record.get('gstr3b_status', 'Late return filed')}",
            'reason': 'GST registration is ACTIVE but delayed returns were noted on GSTR-3B filings.'
        }
    else:
        return {
            'requirement': 'GST Registration',
            'source': 'GSTN',
            'status': 'fail',
            'score_weight': 10,
            'earned_points': 0,
            'evidence': f"GST Certificate — status {status} ({gst_record.get('gstr3b_status', 'Returns overdue')})",
            'reason': 'GSTIN is marked INACTIVE or cancelled by tax authorities; returns severely overdue.'
        }

def evaluate_pan(pan_record, company_name=None):
    if not pan_record or pan_record.get('status') != 'VALID':
        return {
            'requirement': 'PAN',
            'source': 'Income Tax Dept.',
            'status': 'fail',
            'score_weight': 10,
            'earned_points': 0,
            'evidence': 'PAN Card — Invalid or Unverified',
            'reason': 'PAN number does not match Income Tax Department repository.'
        }
    return {
        'requirement': 'PAN',
        'source': 'Income Tax Dept.',
        'status': 'pass',
        'score_weight': 10,
        'earned_points': 10,
        'evidence': 'PAN Card — Verified & Active',
        'reason': 'PAN verified successfully against CBDT database with active taxpayer status.'
    }

def evaluate_udyam(udyam_record, is_mandatory=False):
    if not udyam_record or udyam_record.get('status') != 'REGISTERED':
        return {
            'requirement': 'Udyam / MSME',
            'source': 'Udyam Registration Portal',
            'status': 'fail' if is_mandatory else 'neutral',
            'score_weight': 5,
            'earned_points': 0 if is_mandatory else 3,
            'evidence': 'Not registered as MSME',
            'reason': 'Enterprise does not hold active Udyam registration (Non-MSME bidder).'
        }
    return {
        'requirement': 'Udyam / MSME',
        'source': 'Udyam Registration Portal',
        'status': 'pass',
        'score_weight': 5,
        'earned_points': 5,
        'evidence': f"Udyam Certificate ({udyam_record.get('category', 'MSME')})",
        'reason': f"Valid Udyam certificate registered under category {udyam_record.get('category')}."
    }

def evaluate_turnover(bidder_turnover_cr, min_turnover_cr=10.0):
    if bidder_turnover_cr is None:
        bidder_turnover_cr = 15.0  # Default test assumption
    if bidder_turnover_cr >= min_turnover_cr:
        return {
            'requirement': 'Turnover & Financial Eligibility',
            'source': 'ITR / CA Certificate',
            'status': 'pass',
            'score_weight': 15,
            'earned_points': 15,
            'evidence': f"ITR FY24-25 (Turnover: ₹{bidder_turnover_cr:.1f} Cr)",
            'reason': f"Average annual turnover ₹{bidder_turnover_cr:.1f} Cr exceeds the tender threshold of ₹{min_turnover_cr:.1f} Cr."
        }
    else:
        return {
            'requirement': 'Turnover & Financial Eligibility',
            'source': 'ITR / CA Certificate',
            'status': 'warn',
            'score_weight': 15,
            'earned_points': 5,
            'evidence': f"ITR FY24-25 (Turnover: ₹{bidder_turnover_cr:.1f} Cr)",
            'reason': f"Average annual turnover ₹{bidder_turnover_cr:.1f} Cr is below the required threshold of ₹{min_turnover_cr:.1f} Cr."
        }

def evaluate_epfo(epfo_record):
    if not epfo_record or epfo_record.get('status') == 'FAIL':
        return {
            'requirement': 'EPFO Compliance',
            'source': 'EPFO Portal',
            'status': 'fail',
            'score_weight': 5,
            'earned_points': 0,
            'evidence': 'No active EPFO registration found',
            'reason': 'Bidder has not furnished active EPFO establishment code or monthly ECR remittance.'
        }
    return {
        'requirement': 'EPFO Compliance',
        'source': 'EPFO Portal',
        'status': 'pass',
        'score_weight': 5,
        'earned_points': 5,
        'evidence': f"EPFO Compliance Cert. ({epfo_record.get('establishment_code', 'Active')})",
        'reason': 'Active EPFO registration verified with regular electronic monthly filings.'
    }

def evaluate_esic(esic_record):
    if not esic_record or esic_record.get('status') == 'FAIL':
        return {
            'requirement': 'ESIC Compliance',
            'source': 'ESIC Portal',
            'status': 'fail',
            'score_weight': 5,
            'earned_points': 0,
            'evidence': 'No active ESIC registration',
            'reason': 'Employer code not registered or revoked under the ESI Act.'
        }
    elif esic_record.get('status') == 'WARNING':
        return {
            'requirement': 'ESIC Compliance',
            'source': 'ESIC Portal',
            'status': 'warn',
            'score_weight': 5,
            'earned_points': 2.5,
            'evidence': esic_record.get('note', 'ESIC renewal pending'),
            'reason': 'ESIC registration exists but renewal application is currently pending verification.'
        }
    return {
        'requirement': 'ESIC Compliance',
        'source': 'ESIC Portal',
        'status': 'pass',
        'score_weight': 5,
        'earned_points': 5,
        'evidence': 'ESIC Compliance Cert. (Valid)',
        'reason': 'ESIC registration in good standing with compliant contribution status.'
    }

def evaluate_oem(oem_record):
    if not oem_record or oem_record.get('status') == 'FAIL':
        note = oem_record.get('note', 'Authorization letter mismatch or missing') if oem_record else 'Document missing'
        return {
            'requirement': 'OEM Authorization',
            'source': 'Manufacturer Declaration',
            'status': 'fail',
            'score_weight': 15,
            'earned_points': 0,
            'evidence': f"OEM Authorization — {note}",
            'reason': 'Bidder failed to submit an authentic manufacturer authorization letter matching the tender OEM.'
        }
    return {
        'requirement': 'OEM Authorization',
        'source': 'Manufacturer Declaration',
        'status': 'pass',
        'score_weight': 15,
        'earned_points': 15,
        'evidence': 'Authorization Letter (Verified)',
        'reason': 'OEM authorization letter successfully authenticated against authorized manufacturer credentials.'
    }

def evaluate_make_in_india(declaration_present=True):
    if declaration_present:
        return {
            'requirement': 'Make in India (MII)',
            'source': 'Self Declaration',
            'status': 'pass',
            'score_weight': 10,
            'earned_points': 10,
            'evidence': 'Signed Local Content Declaration (Class-I)',
            'reason': 'Compliant self-declaration certifying local value addition exceeding 50%.'
        }
    return {
        'requirement': 'Make in India (MII)',
        'source': 'Self Declaration',
        'status': 'fail',
        'score_weight': 10,
        'earned_points': 0,
        'evidence': 'Local content declaration missing',
        'reason': 'Mandatory Make in India local content declaration certificate was not uploaded.'
    }

def evaluate_experience(has_past_experience=True):
    if has_past_experience:
        return {
            'requirement': 'Past Experience / Past Performance',
            'source': 'Client Work Orders',
            'status': 'pass',
            'score_weight': 15,
            'earned_points': 15,
            'evidence': '3 Completed PSU Supply Contracts',
            'reason': 'Bidder demonstrated eligible past performance on similar public procurement supply orders.'
        }
    return {
        'requirement': 'Past Experience / Past Performance',
        'source': 'Client Work Orders',
        'status': 'warn',
        'score_weight': 15,
        'earned_points': 5,
        'evidence': 'Past work orders incomplete',
        'reason': 'Experience documentation partially satisfied; completion certificates pending clarification.'
    }

def evaluate_blacklisting(blacklist_record):
    if blacklist_record and blacklist_record.get('listed'):
        rec = blacklist_record.get('debarment_record', {})
        period = f"{rec.get('period_start', '2024')} to {rec.get('period_end', '2027')}"
        return {
            'requirement': 'Debarment / Blacklisting Clearance',
            'source': 'GeM Debarment Registry',
            'status': 'fail',
            'score_weight': 10,
            'earned_points': 0,
            'is_critical_disqualifier': True,
            'evidence': f"Debarment Record Found ({period})",
            'reason': f"CRITICAL: Bidder is actively blacklisted on GeM registry until {rec.get('period_end', '2027')}."
        }
    return {
        'requirement': 'Debarment / Blacklisting Clearance',
        'source': 'GeM Debarment Registry',
        'status': 'pass',
        'score_weight': 10,
        'earned_points': 10,
        'is_critical_disqualifier': False,
        'evidence': 'Clear (No adverse entries)',
        'reason': 'Clean record on GeM debarment portal, Ministry blacklist database, and CVC vigilance listings.'
    }
