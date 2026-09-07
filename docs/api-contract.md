# BidShield AI — REST API Contract

## 1. Authentication & System
### `POST /api/auth/login`
- **Request**:
```json
{
  "email": "officer@cpcl.gem.gov.in",
  "password": "password123"
}
```
- **Response**:
```json
{
  "status": "success",
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "id": 1,
      "name": "Officer Sharma",
      "email": "officer@cpcl.gem.gov.in",
      "role": "officer"
    }
  }
}
```

---

## 2. Tender Management
### `GET /api/tenders`
Returns all active tenders, organizations, values, and bidder counts.

### `POST /api/tenders`
Creates a new tender.

### `GET /api/tenders/:id`
Retrieves tender details, extracted requirements matrix, and registered bidders.

### `POST /api/tenders/:id/extract`
Triggers AI extraction on uploaded tender document to populate compliance criteria.

---

## 3. Bidder Verification & Evaluation
### `POST /api/bidders/:id/verify`
Runs the complete 6-stage AI verification pipeline across all statutory connectors.
- **Sample Response**:
```json
{
  "status": "success",
  "data": {
    "bidder_id": 1,
    "company_name": "ABC Engineering Pvt Ltd",
    "score": 96,
    "risk": "LOW",
    "risk_label": "LOW RISK",
    "matrix": [
      ["GST Registration", "GSTN", "pass", "GST Certificate — Active"],
      ["PAN", "Income Tax Dept.", "pass", "PAN Card — Verified & Active"],
      ["OEM Authorization", "Manufacturer Declaration", "pass", "Authorization Letter (Verified)"],
      ["Debarment / Blacklisting Clearance", "GeM Debarment Registry", "pass", "Clear (No adverse entries)"]
    ],
    "discrepancies": [],
    "risks": ["🟢 PAN verified", "🟢 MCA verified", "🟢 GST verified", "🟢 No blacklisting"],
    "explain": [
      "All statutory documents cross-verified against portal records",
      "Legal name consistent across GST, PAN and MCA21",
      "Turnover exceeds ₹10 Cr threshold",
      "OEM authorization letter matches claimed manufacturer",
      "✅ COMPLIANT"
    ],
    "recTitle": "Fully Compliant",
    "recTitleColor": "var(--success, #33D17E)",
    "reasons": [
      "✓ GST Registration verified against GSTN",
      "✓ PAN verified against Income Tax Dept.",
      "✓ No adverse entries found on blacklisting/debarment portals"
    ],
    "action": "Eligible for technical evaluation. No manual verification required."
  }
}
```

### `POST /api/bidders/:id/decision`
Records officer decision:
```json
{
  "decision": "Approved",
  "notes": "All statutory and OEM criteria satisfied."
}
```

---

## 4. Mock Portal Connector Endpoints
- `POST /api/verify/gst` (`{"gstin": "..."}`)
- `POST /api/verify/pan` (`{"pan": "..."}`)
- `POST /api/verify/udyam` (`{"udyam_no": "..."}`)
- `POST /api/verify/mca` (`{"cin": "..."}`)
- `POST /api/verify/epfo` (`{"company_name": "..."}`)
- `POST /api/verify/esic` (`{"company_name": "..."}`)
- `POST /api/verify/oem` (`{"claimed_oem": "...", "letter_issuer": "..."}`)
- `POST /api/verify/blacklist` (`{"pan": "...", "gstin": "..."}`)
