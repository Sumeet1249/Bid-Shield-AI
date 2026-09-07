def classify_risk(score, has_critical_disqualifier=False):
    """
    Classifies risk band into LOW, MEDIUM, or HIGH according to Section 6.3.
    Critical disqualifiers force HIGH risk regardless of point total.
    """
    if has_critical_disqualifier or score < 60:
        return {
            'band': 'HIGH',
            'meaning': 'Non-compliant / disqualifying issues found',
            'color': '#F2555A',
            'rec_title': 'Non-Compliant',
            'rec_title_color': 'var(--danger, #F2555A)'
        }
    elif score < 85:
        return {
            'band': 'MEDIUM',
            'meaning': 'Conditionally compliant, targeted manual checks required',
            'color': '#F5A623',
            'rec_title': 'Conditionally Compliant',
            'rec_title_color': 'var(--warn, #F5A623)'
        }
    else:
        return {
            'band': 'LOW',
            'meaning': 'Fully compliant, minimal officer review needed',
            'color': '#33D17E',
            'rec_title': 'Fully Compliant',
            'rec_title_color': 'var(--success, #33D17E)'
        }

def generate_recommendation(risk_band, evaluated_items, discrepancies=None):
    """
    Generates plain-language reasons and suggested next action for the Procurement Officer.
    """
    reasons = []
    actions = []
    
    passed_items = [i for i in evaluated_items if i.get('status') == 'pass']
    warn_items = [i for i in evaluated_items if i.get('status') == 'warn']
    fail_items = [i for i in evaluated_items if i.get('status') == 'fail']

    if risk_band == 'LOW':
        for item in passed_items[:6]:
            reasons.append(f"✓ {item['requirement']} verified against {item['source']}")
        reasons.append("✓ No adverse entries found on blacklisting/debarment portals")
        action = "Eligible for technical evaluation. No manual verification required."
    elif risk_band == 'MEDIUM':
        for item in passed_items[:4]:
            reasons.append(f"✓ {item['requirement']} verified")
        for item in warn_items:
            reasons.append(f"⚠ {item['requirement']}: {item['reason']}")
        for item in fail_items:
            reasons.append(f"⚠ {item['requirement']}: requires officer attention")
        if discrepancies:
            for d in discrepancies:
                reasons.append(f"⚠ Discrepancy noted: {d.get('label')} ({d.get('conf', 'High')} confidence)")
        action = "Proceed to manual verification of highlighted requirements before advancing this bid."
    else:
        for item in fail_items:
            reasons.append(f"✗ {item['requirement']}: {item['reason']}")
        if discrepancies:
            for d in discrepancies:
                reasons.append(f"✗ Conflict detected: {d.get('label')}")
        action = "Recommend disqualification. Critical compliance failures or blacklisting records detected."

    return {
        'reasons': reasons,
        'action': action,
        'disclaimer': 'AI-generated risk assessment. Final qualification / disqualification decision must be made by the Procurement Officer.'
    }
