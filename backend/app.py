import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from utils.validators import allowed_file, validate_image_stream, is_valid_url
from services.qr_decoder import QRDecoderService
from services.phishing_detector import PhishingDetector
from services.risk_scorer import RiskScorer

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for frontend interactions
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.after_request
def set_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "QR Shield Phishing Detector",
        "version": "1.0.0",
        "threat_intel_configured": bool(Config.GOOGLE_SAFE_BROWSING_API_KEY or Config.VIRUSTOTAL_API_KEY)
    }), 200

@app.route("/api/scan-file", methods=["POST"])
def scan_file():
    """Endpoint for uploading and decoding a QR code image file."""
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded. Please upload a QR code image."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"success": False, "error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "success": False, 
            "error": "Unsupported file format. Only PNG, JPG, JPEG, and WEBP images are supported."
        }), 400

    try:
        file_bytes = file.read()
        is_valid_img, img_err = validate_image_stream(file_bytes)
        if not is_valid_img:
            return jsonify({"success": False, "error": img_err}), 400

        # Decode QR Code
        decode_res = QRDecoderService.decode_image_bytes(file_bytes)
        if not decode_res.get("success"):
            return jsonify({
                "success": False,
                "error": decode_res.get("error", "Failed to detect QR code in image."),
                "thumbnail_base64": decode_res.get("thumbnail_base64")
            }), 422

        extracted_text = decode_res.get("data", "").strip()
        thumbnail = decode_res.get("thumbnail_base64")

        # Check if extracted text is a URL
        is_url = is_valid_url(extracted_text)

        # Run Phishing Analysis
        analysis = PhishingDetector.analyze(extracted_text)
        risk_assessment = RiskScorer.calculate_risk(analysis)

        return jsonify({
            "success": True,
            "extracted_data": extracted_text,
            "is_url": is_url,
            "decode_method": decode_res.get("method"),
            "thumbnail_base64": thumbnail,
            "analysis": analysis,
            "risk_assessment": risk_assessment
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"An error occurred during scanning: {str(e)}"}), 500

@app.route("/api/analyze-url", methods=["POST"])
def analyze_url():
    """Endpoint for analyzing a URL directly (e.g. from camera scan or direct input)."""
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"success": False, "error": "URL parameter is required."}), 400

    try:
        is_url = is_valid_url(url)
        analysis = PhishingDetector.analyze(url)
        risk_assessment = RiskScorer.calculate_risk(analysis)

        return jsonify({
            "success": True,
            "extracted_data": url,
            "is_url": is_url,
            "thumbnail_base64": data.get("thumbnail_base64"),
            "analysis": analysis,
            "risk_assessment": risk_assessment
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Failed to analyze URL: {str(e)}"}), 500

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"success": False, "error": "Uploaded image file exceeds maximum size limit (16MB)."}), 413

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "error": "API route not found."}), 404

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({"success": False, "error": "Internal server processing error."}), 500

if __name__ == "__main__":
    port = Config.PORT
    print(f"[*] QR Shield Backend starting on port {port}...")
    app.run(host="127.0.0.1", port=port, debug=Config.DEBUG, use_reloader=False)
