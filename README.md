# QR SHIELD – QR Code Phishing Detector

> **Advanced Cybersecurity Defense System for Real-time QR Code Phishing (Quishing) Detection**  
> *Developed for University Cybersecurity Project Demonstration & Research*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](#)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-cyan.svg)](#)
[![Flask: 3.x](https://img.shields.io/badge/Flask-3.x-green.svg)](#)
[![React: 19](https://img.shields.io/badge/React-19-blue.svg)](#)
[![Tailwind: 4.x](https://img.shields.io/badge/Tailwind-4.x-sky.svg)](#)

---

## 1. Project Overview

**QR Shield** is a high-performance, web-based cybersecurity defensive application specifically designed to combat **Quishing (QR Code Phishing)**. 

Because human vision cannot decode the binary modules of a QR code, threat actors weaponize them to bypass Secure Email Gateways (SEGs) and deceive smartphone users into visiting credential-harvesting portals or malware distribution sites.

QR Shield functions as an **air-gap security analyzer**: it extracts embedded URLs from uploaded images or live video feeds and runs them through a multi-point static heuristic and threat intelligence engine **without ever opening or visiting the destination website** (preventing Server-Side Request Forgery - SSRF).

### Key Architectural Highlights
- ❌ **No Authentication / No Logins:** Direct, frictionless access.
- ❌ **No Database (No MongoDB / SQL):** Zero retention privacy model.
- ❌ **No History Stored:** Ephemeral, in-memory processing.
- 🛡️ **SSRF Immune:** The backend performs static parsing, lexical decomposition, and known threat lookups without making HTTP requests to suspect targets.
- ⚡ **Immediate Scan Results:** Decodes and evaluates risks instantaneously.

---

## 2. Technology Stack

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS v4, Custom Cybersecurity Dark HUD Theme
- **Icons:** Lucide React
- **Live Camera QR Engine:** `html5-qrcode`

### Backend
- **Framework:** Python Flask (REST API)
- **CORS Support:** `flask-cors`
- **Configuration:** `python-dotenv`

### QR Code Processing
- **Image Preprocessing:** OpenCV (`cv2`) with CLAHE, Otsu binarization, and sharpening
- **Symbology Decoders:** `pyzbar` with OpenCV `QRCodeDetector` fallback
- **Validation:** Pillow (`PIL`) for file integrity checks

### Security Analysis Engine
- **TLD Analysis:** `tldextract` (offline public suffix snapshot)
- **Brand Protection:** Levenshtein distance & Leetspeak normalization algorithms
- **Threat Intelligence:** Google Safe Browsing API v4 & VirusTotal API v3 (optional hooks)

---

## 3. Core Features

### 1. QR Code Image Upload
- Upload PNG, JPG, JPEG, and WEBP formats up to 16MB.
- Automatic image stream validation (rejects masquerading binaries or corrupt data).
- Decodes QR payloads and generates an in-memory thumbnail preview.

### 2. Live QR Code Camera Scanner
- Interactive webcam / mobile camera scanner with targeting reticle and cyber laser animation.
- Automatic device enumeration with rear/front camera selection.
- Real-time decoding and immediate redirection to threat diagnosis.

### 3. Phishing Detection Engine (10 Check Vectors)
1. **Protocol Security:** Identifies unencrypted HTTP vs. encrypted HTTPS. *(Note: Absence of HTTPS alone is never classified as malicious, but flagged as an interception risk)*.
2. **Host Identity:** Flags raw IP addresses (e.g. `192.168.1.1` or public IPs) used in consumer QR codes.
3. **URL Length Inspection:** Detects parameter bloat and obscured redirection chains (>75 & >120 chars).
4. **URL Shortener Detection:** Identifies link masking services (e.g., `bit.ly`, `tinyurl.com`, `t.co`, `cutt.ly`, etc.).
5. **Subdomain Hierarchy:** Detects excessive subdomain depth and nested brand spoofing (e.g., `paypal.com.account-update.xyz`).
6. **Character & Encoding Obfuscation:** Detects `@` browser userinfo spoofing, multiple `//` path delimiters, heavy hex encoding (`%20`, `%2e`), and Punycode/IDN homograph attacks (`xn--`).
7. **Brand Typosquatting:** Evaluates distance and leetspeak substitution (`0` for `o`, `1` for `l`, `rn` for `m`) against high-value targets (Google, PayPal, Microsoft, Apple, Amazon, Banking, etc.).
8. **TLD Reputation:** Flags high-risk top-level domains statistically abused in mass disposable phishing (`.xyz`, `.top`, `.tk`, `.zip`, `.mov`, etc.).
9. **Sensitive Intent Keywords:** Detects credential and banking harvesting strings (`login`, `verify`, `banking`, `wallet`, `token`).
10. **Threat Intelligence Feeds:** Global threat database lookups via Google Safe Browsing & VirusTotal APIs.

### 4. Security Risk Classification

| Status | Risk Score | Color | Description |
| :--- | :---: | :---: | :--- |
| **SAFE** | 0 – 30 | 🟢 Green | No significant indicators of phishing detected. |
| **SUSPICIOUS** | 31 – 69 | 🟠 Orange | Potentially dangerous characteristics or obfuscation detected. |
| **MALICIOUS** | 70 – 100 | 🔴 Red | High-confidence phishing characteristics or threat feed match. |

---

## 4. Folder Structure

```
QR-Shield/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx              # Cyber navigation bar with live status
│   │   │   ├── Footer.jsx              # Privacy notice, quishing awareness
│   │   │   ├── ImageUploader.jsx       # Drag & drop upload with demo presets
│   │   │   ├── CameraScanner.jsx       # Live HTML5 webcam scanner
│   │   │   ├── RiskGauge.jsx           # Circular SVG speedometer gauge
│   │   │   ├── AnalysisDetails.jsx     # Extracted URL & 10 check cards
│   │   │   └── RecommendationsCard.jsx # Actionable defensive instructions
│   │   ├── pages/
│   │   │   ├── ScannerPage.jsx         # Hero section & scanner switcher
│   │   │   ├── ResultsPage.jsx         # Full security diagnostic report
│   │   │   └── AboutPage.jsx           # Educational Quishing guide
│   │   ├── services/
│   │   │   └── api.js                  # Frontend API integration
│   │   ├── App.jsx                     # State machine & view router
│   │   ├── index.css                   # Tailwind v4 & cyber scanlines
│   │   └── main.jsx                    # React entrypoint
│   ├── package.json
│   ├── vite.config.js                  # Reverse proxy to backend
│   └── index.html
│
├── backend/
│   ├── services/
│   │   ├── qr_decoder.py               # Pyzbar & OpenCV enhanced decoder
│   │   ├── phishing_detector.py        # Static heuristic analysis engine
│   │   ├── risk_scorer.py              # Score normalizer & classifier
│   │   └── threat_intelligence.py      # Google Safe Browsing & VirusTotal APIs
│   ├── utils/
│   │   └── validators.py               # Image integrity & URL validation
│   ├── app.py                          # Flask REST API endpoints
│   ├── config.py                       # Configuration & environment variables
│   ├── requirements.txt                # Python dependencies
│   ├── test_detector.py                # Detection engine test suite
│   ├── test_qr_decoder.py              # QR decoding test suite
│   └── test_api.py                     # Flask API integration test suite
│
├── test_samples/                       # Pre-generated sample QR codes
│   ├── safe_google.png                 # Safe URL QR
│   ├── phishing_paypal.png             # Typosquatting Phishing QR
│   ├── suspicious_ip.png               # Direct IP Host QR
│   ├── shortened_url.png               # Bitly shortener QR
│   └── malicious_microsoft_spoof.png   # Subdomain Spoof QR
│
├── generate_test_samples.py            # Sample generator utility
├── .gitignore                          # Standard gitignore
└── README.md                           # Documentation
```

---

## 5. Installation & Setup Instructions

### Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** v18 or higher (v20+ recommended)
- **npm:** v9 or higher

---

### Step 1: Backend Installation & Setup

1. Open your terminal and navigate to the project root:
   ```bash
   cd "QR code phishing"
   ```

2. Install Python backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. *(Optional)* Configure Threat Intelligence API Keys:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   FLASK_DEBUG=True
   GOOGLE_SAFE_BROWSING_API_KEY=your_google_key_here
   VIRUSTOTAL_API_KEY=your_virustotal_key_here
   ```
   > *Note: If API keys are omitted, QR Shield operates seamlessly using its internal heuristic rules.*

4. Run backend tests to verify environment integrity:
   ```bash
   python backend/test_api.py
   ```

5. Start the Flask backend server:
   ```bash
   python backend/app.py
   ```
   *The backend will be running on `http://127.0.0.1:5000`.*

---

### Step 2: Frontend Installation & Setup

1. Open a **second terminal** and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:3000`.*

4. Open `http://localhost:3000` in your web browser.

---

## 6. How to Test the Application

### Method A: Using Instant Demo Presets (Fastest)
1. Open the homepage at `http://localhost:3000`.
2. Under the drag-and-drop box, click any of the **Instant Test Scenarios**:
   - **Safe Google:** Legitimate domain (`SAFE`, 0/100).
   - **PayPal Phishing:** Leetspeak substitution `paypa1-security-verification.com/login` (`MALICIOUS`, 80/100).
   - **Direct IP Host:** Direct IP address `192.168.1.100/admin-login` (`SUSPICIOUS`, 60/100).
   - **Shortened Link:** Bitly shortener `bit.ly/3xyzABC` (`SUSPICIOUS`, 25/100).
   - **Microsoft Spoof:** Deep subdomain spoof `login.microsoft.com.account-update.xyz` (`MALICIOUS`, 100/100).

### Method B: Uploading Generated Sample Images
1. Use the pre-generated QR code image files located in `test_samples/`:
   - `test_samples/safe_google.png`
   - `test_samples/phishing_paypal.png`
   - `test_samples/suspicious_ip.png`
   - `test_samples/shortened_url.png`
   - `test_samples/malicious_microsoft_spoof.png`
2. Drag and drop any image into the scanner area to observe real-time decoding and classification.

### Method C: Live Webcam / Smartphone Scanning
1. Switch to the **Scan Using Camera** tab.
2. Grant camera permissions in your browser.
3. Hold up any physical QR code or display one on your phone.
4. The scanner automatically detects the QR matrix and immediately presents the diagnostic report.

---

## 7. Security Best Practices Implemented

- **No Remote Fetching (SSRF Protection):** The server analyzes URL strings lexically; it never makes outbound requests to unknown user-supplied URLs.
- **Image Content Validation:** Uses Pillow byte verification to detect malicious file uploads (e.g. polyglot binaries or malicious script headers masquerading as images).
- **Strict Size Limits:** 16MB file upload cap with `413 Request Entity Too Large` handling.
- **Hardened HTTP Headers:** Injects `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and strict `Referrer-Policy`.
- **Zero Logging of Sensitive Scans:** No IP tracking, no geolocation recording, and zero persistent scan history.

---

## 8. License & Academic Attribution
Developed as an educational cybersecurity demonstration project on defensive engineering against QR-based social engineering attacks.
