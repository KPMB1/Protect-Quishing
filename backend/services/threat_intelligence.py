import base64
import requests
import logging
from config import Config

logger = logging.getLogger(__name__)

class ThreatIntelligenceService:
    @staticmethod
    def check_url(url: str) -> dict:
        """
        Coordinates external threat intelligence checks without visiting the target URL.
        Returns aggregate threat intelligence status.
        """
        results = {
            "google_safe_browsing": ThreatIntelligenceService.check_google_safe_browsing(url),
            "virustotal": ThreatIntelligenceService.check_virustotal(url),
        }
        
        is_malicious = False
        is_suspicious = False
        reasons = []

        gsb = results["google_safe_browsing"]
        if gsb.get("is_threat"):
            is_malicious = True
            reasons.append(f"Google Safe Browsing identified this URL as {gsb.get('threat_type')}")

        vt = results["virustotal"]
        if vt.get("malicious_count", 0) > 0:
            if vt.get("malicious_count", 0) >= 3:
                is_malicious = True
                reasons.append(f"VirusTotal: {vt['malicious_count']} security vendors flagged this URL as malicious")
            else:
                is_suspicious = True
                reasons.append(f"VirusTotal: {vt['malicious_count']} security vendors flagged this URL as suspicious")

        return {
            "checked": gsb.get("checked") or vt.get("checked"),
            "is_malicious": is_malicious,
            "is_suspicious": is_suspicious,
            "reasons": reasons,
            "details": results
        }

    @staticmethod
    def check_google_safe_browsing(url: str) -> dict:
        api_key = Config.GOOGLE_SAFE_BROWSING_API_KEY
        if not api_key:
            return {"configured": False, "checked": False, "message": "API key not configured."}

        endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
        payload = {
            "client": {
                "clientId": "qr-shield-detector",
                "clientVersion": "1.0.0"
            },
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}]
            }
        }

        try:
            response = requests.post(endpoint, json=payload, timeout=5)
            if response.status_code == 200:
                data = response.json()
                matches = data.get("matches", [])
                if matches:
                    threat_type = matches[0].get("threatType", "THREAT")
                    return {
                        "configured": True,
                        "checked": True,
                        "is_threat": True,
                        "threat_type": threat_type,
                        "matches": matches
                    }
                return {
                    "configured": True,
                    "checked": True,
                    "is_threat": False,
                    "message": "No threats detected by Google Safe Browsing."
                }
            else:
                return {"configured": True, "checked": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            logger.warning(f"Google Safe Browsing check error: {e}")
            return {"configured": True, "checked": False, "error": str(e)}

    @staticmethod
    def check_virustotal(url: str) -> dict:
        api_key = Config.VIRUSTOTAL_API_KEY
        if not api_key:
            return {"configured": False, "checked": False, "message": "API key not configured."}

        try:
            # VirusTotal v3 uses URL-safe base64 without '=' padding
            url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
            endpoint = f"https://www.virustotal.com/api/v3/urls/{url_id}"
            headers = {"x-apikey": api_key, "Accept": "application/json"}

            response = requests.get(endpoint, headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                malicious = stats.get("malicious", 0)
                suspicious = stats.get("suspicious", 0)
                harmless = stats.get("harmless", 0)
                return {
                    "configured": True,
                    "checked": True,
                    "malicious_count": malicious,
                    "suspicious_count": suspicious,
                    "harmless_count": harmless,
                    "stats": stats
                }
            elif response.status_code == 404:
                return {
                    "configured": True,
                    "checked": True,
                    "malicious_count": 0,
                    "suspicious_count": 0,
                    "message": "URL not previously indexed in VirusTotal database."
                }
            else:
                return {"configured": True, "checked": False, "error": f"HTTP {response.status_code}"}
        except Exception as e:
            logger.warning(f"VirusTotal check error: {e}")
            return {"configured": True, "checked": False, "error": str(e)}
