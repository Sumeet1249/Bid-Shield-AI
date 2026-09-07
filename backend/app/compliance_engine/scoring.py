WEIGHT_CONFIG = {
    'gst': 10,
    'pan': 10,
    'udyam': 5,
    'turnover': 15,
    'epfo': 5,
    'esic': 5,
    'oem': 15,
    'make_in_india': 10,
    'experience': 15,
    'blacklisting': 10
}

def calculate_compliance_score(evaluated_items):
    """
    Computes total weighted compliance score (0 - 100) from evaluated requirement items.
    If a critical disqualifier is present (e.g. active blacklisting), caps or reduces score.
    """
    total_score = 0.0
    has_critical_disqualifier = False

    for item in evaluated_items:
        earned = item.get('earned_points', 0)
        total_score += earned
        if item.get('is_critical_disqualifier', False):
            has_critical_disqualifier = True

    final_score = round(min(100.0, max(0.0, total_score)), 1)
    return {
        'score': int(final_score),
        'raw_score': final_score,
        'has_critical_disqualifier': has_critical_disqualifier
    }
