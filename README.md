# 🛡️ BidShield AI

**AI-Powered Integrated Bid Compliance Verification Platform for Government Procurement**

[![Smart India Hackathon 2024](https://img.shields.io/badge/SIH-2024-blue)](https://www.sih.gov.in/)
[![Problem Statement](https://img.shields.io/badge/PS-26100-green)](https://www.sih.gov.in/)
[![Python](https://img.shields.io/badge/Python-3.14+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1+-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Problem Statement

**ID:** 26100  
**Title:** AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement

Government procurement officers currently spend **days** manually verifying bidders across **8+ disconnected government portals** (GSTN, PAN, MCA21, EPFO, ESIC, GeM Debarment Registry, etc.). This manual process is:
- ⏱️ **Time-consuming** (3-5 days per tender)
- 🐛 **Error-prone** (human oversight risks)
- 📉 **Inefficient** (repetitive data entry)
- 🔍 **Limited** (difficult to detect sophisticated fraud)

**BidShield AI automates this entire verification process in seconds.**

---

## 🚀 Features

### ✨ Core Capabilities

- **🤖 AI Document Verification**: Auto-analyze GST, PAN, CIN, Udyam, and financial documents in seconds
- **📊 100-Point Compliance Scoring**: Weighted scoring across eligibility, documents, blacklist checks, and past performance
- **🌐 Multi-Portal Integration**: Seamless verification across 8+ government statutory portals
- **🔍 Intelligent Discrepancy Detection**: Identifies name variations, document mismatches, and authorization conflicts
- **⚠️ Risk Classification**: Automatic LOW/MEDIUM/HIGH risk categorization
- **🧠 Explainable AI (XAI)**: Plain-language reasoning chains with evidence-based recommendations
- **📝 Immutable Audit Trail**: Tamper-proof, timestamped logs of all actions and decisions
- **👨‍💼 Human-in-the-Loop**: Final legal decision always remains with procurement officer

### 🔗 Integrated Government Portals

| Portal | Purpose | Verification |
|--------|---------|--------------|
| **GSTN** | GST Registration | Active status, GSTR-3B filings |
| **CBDT** | PAN Verification | Entity validation |
| **MCA21** | Company Registry | Legal entity, CIN verification |
| **Udyam** | MSME Registration | Registration status |
| **EPFO** | Labor Compliance | Employee provident fund |
| **ESIC** | Labor Compliance | Employee insurance |
| **GeM Registry** | Debarment Check | Blacklisting verification |
| **DPIIT** | Startup India | Startup recognition |
| **NSIC** | NSIC Database | Small-scale industry |

---

## 🏗️ Architecture

### 5-Layer System Design

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

### 🔄 Verification Pipeline (6 Stages)

```
1. OCR 🧾          → Extract text from uploaded documents
2. Text Extraction 📝  → Parse structured data
3. Entity Extraction 🔎 → Identify GST, PAN, CIN, dates, amounts
4. Field Validation ✅  → Validate against tender requirements
5. Cross-Verification 🌐 → Query 8+ government portals
6. Compliance Engine ⚙️  → Generate score, risk level, recommendations
```

---

## 📦 Installation

### Prerequisites

- Python 3.10+ (tested on Python 3.14)
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/Sumeet1249/Bid-Shield-AI.git
cd Bid-Shield-AI

# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
python run.py
```

The backend will start at `http://127.0.0.1:5000`

### Frontend Setup

Simply open `frontend/index.html` in your web browser. The frontend will automatically connect to the backend API.

Alternatively, serve it with a local server:

```bash
cd frontend
python -m http.server 8080
```

Then visit `http://localhost:8080`

---

## 🎮 Usage

### Demo Login Credentials

**Procurement Officer:**
- Email: `officer@cpcl.gem.gov.in`
- Password: `password123`

**Bidder:**
- Email: `bidder@abc.com`
- Password: `password123`

### Demo Workflow

1. **Login** as Procurement Officer
2. **View Dashboard** with active tenders and metrics
3. **Select Tender** (e.g., CPCL/2026/PROC/001)
4. **View Bidders** registered for the tender
5. **Run Verification** on any bidder
6. **Watch Pipeline** execute in real-time
7. **Review Results** with score, risk level, and recommendations
8. **Make Decision** (Approve/Request Clarification/Reject)
9. **Check Audit Trail** for complete transparency

### Pre-configured Test Cases

#### 🟢 **Case 1: ABC Engineering Pvt Ltd (Fully Compliant)**
- **Score:** 96/100
- **Risk:** LOW
- **Status:** All documents verified, no discrepancies
- **Recommendation:** ✅ Approved for technical evaluation

#### 🟡 **Case 2: XYZ Industrial Solutions (Medium Risk)**
- **Score:** 71/100
- **Risk:** MEDIUM
- **Issue:** OEM authorization mismatch
  - Claimed: "Hitachi Power Systems"
  - Letter from: "Hitachi Energy Pvt Ltd"
- **Recommendation:** ⚠️ Manual verification required

#### 🔴 **Case 3: PQR Enterprises (High Risk)**
- **Score:** 39/100
- **Risk:** HIGH
- **Issues:**
  - ❌ INACTIVE GST status
  - ❌ Active debarment (2024-2027)
  - ❌ Missing EPFO registration
- **Recommendation:** ❌ Reject bid

---

## 📁 Project Structure

```
bid-shield-ai-main/
├── backend/
│   ├── app/
│   │   ├── ai_engine/          # AI processing modules
│   │   │   ├── ocr.py          # OCR document processing
│   │   │   ├── nlp_extract.py  # NLP requirement extraction
│   │   │   ├── entity_extract.py  # Entity extraction
│   │   │   ├── cross_verify.py    # Discrepancy detection
│   │   │   └── explain.py      # Explainable AI reasoning
│   │   ├── compliance_engine/  # Scoring & risk assessment
│   │   │   ├── rules.py        # Evaluation rules
│   │   │   ├── scoring.py      # 100-point scoring system
│   │   │   └── risk.py         # Risk classification
│   │   ├── connectors/         # Government portal integrations
│   │   │   ├── gstn.py         # GST verification
│   │   │   ├── pan.py          # PAN verification
│   │   │   ├── mca21.py        # Company registry
│   │   │   ├── udyam.py        # MSME registration
│   │   │   ├── epfo_esic.py    # Labor compliance
│   │   │   ├── oem.py          # OEM authorization
│   │   │   └── blacklist.py    # Debarment registry
│   │   ├── models/             # Database models
│   │   │   ├── user.py         # User model
│   │   │   ├── tender.py       # Tender model
│   │   │   ├── bidder.py       # Bidder model
│   │   │   ├── document.py     # Document model
│   │   │   ├── verification.py # Verification result model
│   │   │   ├── compliance.py   # Compliance model
│   │   │   └── audit.py        # Audit trail model
│   │   ├── routes/             # API endpoints
│   │   │   ├── auth.py         # Authentication
│   │   │   ├── tenders.py      # Tender management
│   │   │   ├── bidders.py      # Bidder management
│   │   │   ├── documents.py    # Document handling
│   │   │   ├── verification.py # Verification routes
│   │   │   ├── reports.py      # Reporting
│   │   │   └── audit.py        # Audit trail
│   │   ├── utils/              # Utility functions
│   │   ├── dummy_data/         # Seed data for demo
│   │   ├── config.py           # Configuration
│   │   └── __init__.py         # App factory
│   ├── tests/                  # Unit tests
│   ├── uploads/                # Document uploads
│   ├── run.py                  # Application entry point
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── index.html              # Main UI
│   ├── css/
│   │   └── style.css           # Styling
│   └── js/
│       ├── app.js              # Main application logic
│       ├── components.js       # UI components
│       ├── pipeline.js         # Verification pipeline UI
│       └── three_hero.js       # 3D visualization
├── docs/
│   ├── architecture.md         # System architecture
│   ├── api-contract.md         # API documentation
│   └── demo-script.md          # Demo presentation guide
├── README.md                   # This file
└── LICENSE                     # MIT License
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication

### Tender Management
- `GET /api/tenders` - List all tenders
- `POST /api/tenders` - Create new tender
- `GET /api/tenders/:id` - Get tender details
- `POST /api/tenders/:id/extract` - Extract requirements from RFP

### Bidder Verification
- `POST /api/bidders/:id/verify` - Run complete verification pipeline
- `POST /api/bidders/:id/decision` - Record officer decision

### Portal Connectors
- `POST /api/verify/gst` - GST verification
- `POST /api/verify/pan` - PAN verification
- `POST /api/verify/udyam` - Udyam verification
- `POST /api/verify/mca` - MCA21 verification
- `POST /api/verify/epfo` - EPFO verification
- `POST /api/verify/esic` - ESIC verification
- `POST /api/verify/oem` - OEM authorization verification
- `POST /api/verify/blacklist` - Debarment check

### System
- `GET /api/health` - Health check
- `GET /api/connectors/status` - Connector status

Full API documentation available in [`docs/api-contract.md`](docs/api-contract.md)

---

## 🧪 Testing

```bash
cd backend
pytest tests/
```

---

## 🎯 Innovation Highlights

1. **🤖 AI-Powered Automation**: Reduces verification time from days to seconds
2. **🔗 Multi-Portal Integration**: Seamless connection to 8+ government systems
3. **🧠 Explainable AI**: Transparent reasoning chains for every decision
4. **⚖️ Human-in-the-Loop**: Maintains human oversight for legal decisions
5. **🔍 Intelligent Discrepancy Detection**: Catches subtle inconsistencies and fraud attempts
6. **📊 Risk-Based Prioritization**: Officers focus on high-risk cases first
7. **🔐 Immutable Audit Trail**: Complete transparency and accountability
8. **🎨 Intuitive UI**: Real-time pipeline visualization with Three.js

---

## 🛣️ Roadmap

### Phase 1: Core Platform (Current)
- ✅ Mock connector framework
- ✅ AI verification pipeline
- ✅ Compliance scoring engine
- ✅ Web dashboard

### Phase 2: Production Integration
- 🔄 Live government portal APIs (with proper authorization)
- 🔄 Advanced OCR with deep learning
- 🔄 NLP with transformer models
- 🔄 Real-time fraud detection

### Phase 3: Scale & Performance
- 📅 Microservices architecture
- 📅 Kubernetes deployment
- 📅 Horizontal scaling
- 📅 Performance optimization

### Phase 4: Advanced Features
- 📅 Geo-tagged site evidence (photo/video uploads)
- 📅 Blockchain-based audit trail
- 📅 Mobile app for field officers
- 📅 Citizen evidence submission portal
- 📅 AI chatbot for bidder assistance

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Project developed for Smart India Hackathon 2024**

- Problem Statement: #26100
- Category: Software
- Theme: Smart Automation

---

## 📞 Contact

For questions, suggestions, or collaboration opportunities:

- **GitHub**: [@Sumeet1249](https://github.com/Sumeet1249)
- **Project Link**: [https://github.com/Sumeet1249/Bid-Shield-AI](https://github.com/Sumeet1249/Bid-Shield-AI)

---

## 🙏 Acknowledgments

- Smart India Hackathon 2024 organizing committee
- Government e-Marketplace (GeM) for problem statement
- All open-source contributors whose libraries made this possible

---

## 📸 Screenshots

### Login Screen with 3D Portal Visualization
![Login Screen](docs/screenshots/login.png)

### Executive Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Verification Pipeline
![Pipeline](docs/screenshots/pipeline.png)

### Compliance Results
![Results](docs/screenshots/results.png)

---

## ⚠️ Disclaimer

This is a **prototype** developed for the Smart India Hackathon 2024. The portal connectors use **synthetic test datasets** for demonstration purposes. For production deployment, proper authorization and integration with actual government APIs would be required.

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐!

[![Star History Chart](https://api.star-history.com/svg?repos=Sumeet1249/Bid-Shield-AI&type=Date)](https://star-history.com/#Sumeet1249/Bid-Shield-AI&Date)

---

<div align="center">

**Made with ❤️ for Smart India Hackathon 2024**

[⬆ Back to Top](#-bidshield-ai)

</div>
