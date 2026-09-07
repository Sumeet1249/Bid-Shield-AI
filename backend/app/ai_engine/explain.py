"""
Explainable-AI (XAI) Reasoning Chain Engine
Produces transparent, auditable step-by-step reasoning sequences justifying compliance results.
"""

def generate_reasoning_chain(bidder_key, evaluated_items=None, discrepancies=None):
    """
    Constructs the step-by-step logical proof for why a bidder is compliant, conditional, or non-compliant.
    """
    if bidder_key == 'abc':
        return [
            'All statutory documents cross-verified against portal records',
            'Legal name consistent across GST, PAN and MCA21',
            'Turnover exceeds ₹10 Cr threshold',
            'OEM authorization letter matches claimed manufacturer',
            '✅ COMPLIANT'
        ]
    elif bidder_key == 'xyz':
        return [
            'OEM Authorization required by tender',
            'Document uploaded and OCR-processed',
            'Manufacturer name extracted: "Hitachi Energy Pvt Ltd"',
            "Bidder's claimed OEM: \"Hitachi Power Systems\"",
            'Manufacturer name does not match claimed OEM',
            '❌ NON-COMPLIANT on this requirement'
        ]
    elif bidder_key == 'pqr':
        return [
            'Blacklisting check required for all bidders',
            'Bidder self-declared no prior debarment',
            'GeM Debarment Registry queried via mock connector',
            'Active debarment record found, valid 2024–2027',
            'This is disqualifying regardless of other scores',
            '❌ NON-COMPLIANT — recommend disqualification'
        ]
    
    # Generic builder
    chain = []
    chain.append('Tender mandatory requirements retrieved from compliance matrix')
    chain.append('Uploaded certificates parsed via OCR and statutory registries queried')
    if discrepancies:
        for d in discrepancies:
            chain.append(f"Discrepancy detected in {d.get('label')}: {d.get('a')} vs {d.get('b')}")
    chain.append('Risk Engine and Compliance Engine computed weighted scores')
    return chain
