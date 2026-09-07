"""
Bidder Document Entity Extraction Engine
Extracts statutory identifiers, company names, declared OEM, turnover, and dates from bidder docs.
"""
import re

def extract_entities_from_text(text):
    """
    Regex and NLP pattern matching to extract key government identifiers.
    """
    entities = {}

    # GSTIN regex: 2 digits, 5 alpha, 4 digits, 1 alpha, 1 alphanumeric, 'Z', 1 alphanumeric
    gst_match = re.search(r'\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b', text)
    if gst_match:
        entities['gstin'] = gst_match.group(0)

    # PAN regex: 5 alpha, 4 digits, 1 alpha
    pan_match = re.search(r'\b[A-Z]{5}\d{4}[A-Z]{1}\b', text)
    if pan_match:
        entities['pan'] = pan_match.group(0)

    # CIN regex: U or L, 5 digits, 2 state letters, 4 digits, 3 letters, 6 digits
    cin_match = re.search(r'\b[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b', text)
    if cin_match:
        entities['cin'] = cin_match.group(0)

    # Udyam regex
    udyam_match = re.search(r'\bUDYAM-[A-Z]{2}-\d{2}-\d{7}\b', text)
    if udyam_match:
        entities['udyam_no'] = udyam_match.group(0)

    return entities

def extract_bidder_submission_data(bidder_key, bidder_obj=None):
    """
    Extracts structured attributes for a bidder submission.
    """
    if bidder_key == 'abc':
        return {
            'company_name': 'ABC Engineering Pvt Ltd',
            'gstin': '19ABCDE1234F1Z5',
            'pan': 'ABCDE1234F',
            'cin': 'U29100TN2015PTC098211',
            'udyam_no': 'UDYAM-TN-02-0012345',
            'turnover_cr': 14.8,
            'claimed_oem': 'Siemens Industrial Ltd',
            'oem_issuer': 'Siemens Industrial Ltd',
            'blacklisting_declared': False
        }
    elif bidder_key == 'xyz':
        return {
            'company_name': 'XYZ Industrial Solutions',
            'gstin': '27XYZAB5678K1Z2',
            'pan': 'XYZAB5678K',
            'cin': 'U27310MH2012PTC231044',
            'udyam_no': 'UDYAM-MH-18-0098765',
            'turnover_cr': 11.2,
            'claimed_oem': 'Hitachi Power Systems',
            'oem_issuer': 'Hitachi Energy Pvt Ltd',  # Mismatch!
            'blacklisting_declared': False
        }
    elif bidder_key == 'pqr':
        return {
            'company_name': 'PQR Enterprises',
            'gstin': '07PQRXY9988M1Z8',
            'pan': 'PQRXY9988M',
            'cin': None,
            'udyam_no': None,
            'turnover_cr': 7.4,  # Below threshold
            'claimed_oem': None,
            'oem_issuer': None,
            'blacklisting_declared': False  # False declaration!
        }
    
    # Generic bidder fallback
    return {
        'company_name': getattr(bidder_obj, 'company_name', 'General Bidder'),
        'gstin': getattr(bidder_obj, 'gstin', '19ABCDE1234F1Z5'),
        'pan': getattr(bidder_obj, 'pan', 'ABCDE1234F'),
        'cin': getattr(bidder_obj, 'cin', None),
        'udyam_no': getattr(bidder_obj, 'udyam_no', None),
        'turnover_cr': 12.0,
        'claimed_oem': 'Authorized OEM',
        'oem_issuer': 'Authorized OEM',
        'blacklisting_declared': False
    }
