class RiskScorer:
    @staticmethod
    def calculate_risk(analysis_result: dict) -> dict:
        """
        Calculates the normalized risk score (0-100), assigns the security category
        (SAFE, SUSPICIOUS, MALICIOUS), and compiles actionable recommendations.
        """
        raw_score = analysis_result.get("raw_score", 0)
        checks = analysis_result.get("checks", [])
        threat_intel = analysis_result.get("threat_intel", {})

        # Normalize score between 0 and 100
        score = min(max(raw_score, 0), 100)

        # Force MALICIOUS if verified threat intelligence confirms malware/phishing
        if threat_intel.get("is_malicious"):
            classification = "MALICIOUS"
            score = max(score, 85)
            badge_color = "red"
            status_text = "MALICIOUS"
            summary = "Confirmed active phishing or malware threat identified by global cybersecurity intelligence."
        elif score >= 70:
            classification = "MALICIOUS"
            badge_color = "red"
            status_text = "MALICIOUS"
            summary = "Critical phishing characteristics detected. High probability of deceptive attack or credential theft."
        elif score >= 31:
            classification = "SUSPICIOUS"
            badge_color = "orange"
            status_text = "SUSPICIOUS"
            summary = "Potentially dangerous characteristics detected. Exercise caution and do not disclose sensitive info."
        else:
            classification = "SAFE"
            badge_color = "green"
            status_text = "SAFE"
            summary = "No significant indicators of phishing or malicious intent identified. Always exercise standard diligence."

        # Compile warnings and critical issues
        vulnerabilities = [c for c in checks if c.get("status") in ("warning", "danger")]
        passed_checks = [c for c in checks if c.get("status") == "passed"]
        attack_types = analysis_result.get("attack_types", [])
        primary_attack = analysis_result.get("primary_attack") or (attack_types[0] if attack_types else None)

        # Actionable recommendations
        recommendations = []
        if classification == "MALICIOUS":
            recommendations.append("Do NOT open or proceed to this website under any circumstance.")
            recommendations.append("If you have already entered login details or personal information, immediately change your passwords from a secure device.")
            recommendations.append("Report this QR code or physical poster to the venue security or building administration.")
        elif classification == "SUSPICIOUS":
            recommendations.append("Verify the organization's official website directly by typing their known domain in your browser.")
            recommendations.append("Never submit passwords, bank credentials, or two-factor authentication codes.")
            recommendations.append("Be wary of urgent language, unexpected invoices, or login prompts.")
        else:
            recommendations.append("Double check that the destination domain matches the service you expect.")
            recommendations.append("Verify that your browser displays a valid TLS/SSL security certificate.")
            recommendations.append("Keep your browser and mobile operating system updated with the latest security patches.")

        return {
            "status": classification,
            "badge_color": badge_color,
            "status_text": status_text,
            "score": score,
            "summary": summary,
            "primary_attack": primary_attack,
            "attack_types": attack_types,
            "vulnerabilities_count": len(vulnerabilities),
            "vulnerabilities": vulnerabilities,
            "passed_checks": passed_checks,
            "all_checks": checks,
            "recommendations": recommendations
        }
