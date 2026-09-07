from app.connectors.gstn import query_gstn
from app.connectors.pan import query_pan
from app.connectors.blacklist import query_blacklist
from app.connectors.mca21 import query_mca21

def test_gstn_connector_abc():
    res = query_gstn('19ABCDE1234F1Z5')
    assert res['status'] == 'ACTIVE'
    assert 'ABC Engineering' in res['legal_name']

def test_gstn_connector_pqr_inactive():
    res = query_gstn('07PQRXY9988M1Z8')
    assert res['status'] == 'INACTIVE'
    assert 'OVERDUE' in res['filing_status']

def test_blacklist_connector_pqr():
    res = query_blacklist('07PQRXY9988M1Z8')
    assert res['listed'] is True
    assert res['status'] == 'BLACKLISTED'

def test_blacklist_connector_abc_clear():
    res = query_blacklist('19ABCDE1234F1Z5')
    assert res['listed'] is False
    assert res['status'] == 'CLEAR'
