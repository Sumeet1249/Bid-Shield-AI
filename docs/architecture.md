# BidShield AI — System Architecture
**Problem Statement ID:** 26100  
**Title:** AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement

## 1. Architectural Overview
BidShield AI is structured into five cohesive layers designed for high auditability, modularity, and compliance with public procurement integrity standards:

```
┌─────────────────────────────────────────────────────────────┐
│  1. Presentation Layer (Responsive Web Dashboard + Three.js) │
│     Login · Executive Dashboard · Tender & Bidder Views     │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON
┌──────────────────────────────▼──────────────────────────────┐
│  2. Application Modules (Flask REST API)                    │
│     Auth · Tender Module · Bidder Module · Audit Service    │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐ ┌─────────────▼───────────────┐
│  3. AI Verification Layer   │ │  4. Decision Layer          │
│     OCR · NLP Extraction    │ │     Compliance Rules Engine │
│     Entity Extraction       │ │     100-pt Weighted Scorer  │
│     Cross-Verification      │ │     Risk Classifier         │
│     Explainable-AI (XAI)    │ │     Plain-Language Advisory │
└──────────────┬──────────────┘ └─────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────────────────────▼───────────────┐
│  5. Integration & Governance Layer                          │
│     Mock Connectors: GSTN, PAN, Udyam, MCA21, EPFO, ESIC,   │
│     GeM Debarment Registry · Immutable SQLite Audit Trail   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Core Operational Flow
1. **Tender Ingestion & Matrix Extraction**: Procurement Officer uploads tender RFP documents. The NLP engine extracts turnover limits, statutory toggles, and mandatory criteria.
2. **Bidder Submission**: Bidder certificates (GST, PAN, MSME, OEM, EPFO, ESIC, declarations) are uploaded and parsed via OCR.
3. **Multi-Portal Cross-Verification**: Connectors query statutory registries (GSTN for active status and GSTR-3B filings, CBDT for PAN, MCA21 for legal entity names, EPFO/ESIC for labor compliance, and GeM Debarment Registry for blacklisting).
4. **Discrepancy & Conflict Detection**: The engine diff-checks document claims against portal records (e.g., mismatching OEM manufacturer names or entity name variations) and assigns confidence ratings.
5. **Weighted Scoring & Explainability**: A 100-point weighted model evaluates requirements, produces an Explainable-AI proof chain, and classifies risk into LOW (85–100), MEDIUM (60–84), or HIGH (<60).
6. **Human-in-the-Loop Decision**: The Procurement Officer reviews the findings and makes the final legal decision (*Approve*, *Request Clarification*, or *Reject*), all recorded in the tamper-proof audit trail.
