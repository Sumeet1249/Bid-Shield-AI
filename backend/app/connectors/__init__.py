from app.connectors.gstn import gstn_bp, query_gstn
from app.connectors.pan import pan_bp, query_pan
from app.connectors.udyam import udyam_bp, query_udyam
from app.connectors.mca21 import mca21_bp, query_mca21
from app.connectors.epfo_esic import epfo_esic_bp, query_epfo, query_esic
from app.connectors.startup_india import startup_india_bp, query_startup_india
from app.connectors.nsic import nsic_bp, query_nsic
from app.connectors.oem import oem_bp, query_oem
from app.connectors.blacklist import blacklist_bp, query_blacklist

connector_blueprints = [
    gstn_bp,
    pan_bp,
    udyam_bp,
    mca21_bp,
    epfo_esic_bp,
    startup_india_bp,
    nsic_bp,
    oem_bp,
    blacklist_bp
]

__all__ = [
    'connector_blueprints',
    'query_gstn',
    'query_pan',
    'query_udyam',
    'query_mca21',
    'query_epfo',
    'query_esic',
    'query_startup_india',
    'query_nsic',
    'query_oem',
    'query_blacklist'
]
