# BidShield AI — 5-Minute SIH Hackathon Demo Script

**Problem Statement ID:** 26100  
**Title:** AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement

## Demonstration Sequence for Judges

### 1. Opening on Login Screen (0:00 – 0:45)
- **Visual**: Point to the interactive Three.js 3D portal network.
- **Narrative**:
  > "Respected judges, GeM procurement officers currently spend days manually toggling between 8+ disconnected government portals — GSTN, PAN, MCA21, EPFO, ESIC, and debarment registries — to verify a single tender's bidders. Our 3D visual represents the multi-portal integration network that BidShield AI coordinates seamlessly behind the scenes."
- **Action**: Select role **Procurement Officer** and click **Sign in**.

### 2. Executive Dashboard (0:45 – 1:30)
- **Visual**: 4 metric stat cards and recent tenders table.
- **Narrative**:
  > "Once signed in, Officer Sharma sees a high-level operational command center: active tenders, bids currently under review, and immediate counts of high-risk bidders flagged by our AI."
- **Action**: Click on tender **CPCL/2026/PROC/001** (Chennai Petroleum Corporation Limited).

### 3. Tender Matrix & Requirements (1:30 – 2:15)
- **Visual**: AI-extracted Compliance Matrix and Registered Bidders list.
- **Narrative**:
  > "When the RFP document is uploaded, our NLP engine automatically extracts eligibility criteria — turnover thresholds, mandatory GST/PAN/OEM clauses, and statutory exemptions — establishing the ground truth without manual data entry."

### 4. Bidder 1: Fully Compliant Case (2:15 – 3:00)
- **Action**: Open **ABC Engineering Pvt Ltd** and click **Run verification**.
- **Visual**: 6-step animated horizontal pipeline (`OCR` → `Text Extraction` → `Entity Extraction` → `Field Validation` → `Cross-Verification` → `Compliance Engine`) with real-time JSON connector logs.
- **Narrative**:
  > "Watch the verification pipeline execute. The system queries mock GSTN, CBDT, MCA21, and EPFO APIs. For ABC Engineering, everything matches cleanly. The score gauge animates to **96/100 (LOW RISK)**, with a plain-language verdict: 'Eligible for technical evaluation'."

### 5. Bidder 2: Discrepancy & Conflict Detection (3:00 – 3:45)
- **Action**: Return and open **XYZ Industrial Solutions** → click **Run verification**.
- **Visual**: Score drops to **71/100 (MEDIUM RISK)**. The Discrepancy Card highlights:
  - *Claimed OEM*: Hitachi Power Systems
  - *Authorization Letter Issuer*: Hitachi Energy Pvt Ltd (87% confidence mismatch).
- **Narrative**:
  > "Here is our Discrepancy Detection in action. While statutory filings are active, the bidder claimed Hitachi Power Systems, but their authorization letter was issued by Hitachi Energy Pvt Ltd. The AI flags this conflict clearly and recommends targeted manual verification before advancing."

### 6. Bidder 3: Critical Blacklisting Hit & Inactive GST (3:45 – 4:30)
- **Action**: Open **PQR Enterprises** → click **Run verification**.
- **Visual**: Score plummets to **39/100 (HIGH RISK)** with red warning badges.
- **Narrative**:
  > "For PQR Enterprises, the bidder declared 'No prior debarment', but our cross-check against the GeM Debarment Registry caught an active 2024–2027 blacklisting record, in addition to an INACTIVE GSTIN. This triggers an immediate critical disqualifier recommendation."

### 7. Human-in-the-Loop & Immutable Audit Trail (4:30 – 5:00)
- **Action**: Click **Reject** on PQR Enterprises. Switch to **Audit Trail** tab in the sidebar.
- **Visual**: Timestamped log item recorded instantly: *'Rejected: PQR Enterprises — recorded in audit trail by Officer Sharma'*.
- **Closing**:
  > "Crucially, BidShield AI is an explainable decision-support tool. The AI provides transparent reasoning chains and evidence, but the legal decision always remains with the human Procurement Officer, backed by a tamper-proof, timestamped audit trail. Thank you!"
