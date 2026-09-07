import pytest
from app.compliance_engine.rules import (
    evaluate_gst,
    evaluate_pan,
    evaluate_oem,
    evaluate_blacklisting
)
from app.compliance_engine.scoring import calculate_compliance_score
from app.compliance_engine.risk import classify_risk

def test_gst_rule_pass():
    record = {'status': 'ACTIVE', 'filing_status': 'COMPLIANT', 'last_return': '2026-08-31'}
    res = evaluate_gst(record)
    assert res['status'] == 'pass'
    assert res['earned_points'] == 10

def test_gst_rule_inactive_fail():
    record = {'status': 'INACTIVE', 'filing_status': 'OVERDUE'}
    res = evaluate_gst(record)
    assert res['status'] == 'fail'
    assert res['earned_points'] == 0

def test_blacklisting_critical_flag():
    record = {'listed': True, 'debarment_record': {'period_start': '2024', 'period_end': '2027'}}
    res = evaluate_blacklisting(record)
    assert res['status'] == 'fail'
    assert res['is_critical_disqualifier'] is True

def test_scoring_and_risk_bands():
    # 96 points -> LOW
    items_low = [{'earned_points': 10} for _ in range(9)] + [{'earned_points': 6}]
    score_res = calculate_compliance_score(items_low)
    assert score_res['score'] == 96
    risk_low = classify_risk(score_res['score'])
    assert risk_low['band'] == 'LOW'

    # 71 points -> MEDIUM
    items_med = [{'earned_points': 10} for _ in range(7)] + [{'earned_points': 1}]
    score_res2 = calculate_compliance_score(items_med)
    assert score_res2['score'] == 71
    risk_med = classify_risk(score_res2['score'])
    assert risk_med['band'] == 'MEDIUM'

    # Blacklisted -> HIGH
    risk_blacklisted = classify_risk(80, has_critical_disqualifier=True)
    assert risk_blacklisted['band'] == 'HIGH'
