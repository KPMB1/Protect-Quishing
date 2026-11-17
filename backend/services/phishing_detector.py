import re
import ipaddress
from urllib.parse import urlparse
import tldextract
from services.threat_intelligence import ThreatIntelligenceService

# Initialize tldextract with offline snapshot to avoid network calls
tld_extractor = tldextract.TLDExtract(suffix_list_urls=None)

# Known High-Risk and Free TLDs frequently abused in phishing
SUSPICIOUS_TLDS = {
    "xyz", "top", "tk", "ml", "ga", "cf", "gq", "work", "click", "loan", 
    "zip", "mov", "quest", "buzz", "cam", "surf", "fit", "racing", "date",
    "review", "country", "stream", "download", "accountant", "science"
}

# Common URL Shortener Domains
KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly",
    "adf.ly", "bit.do", "cutt.ly", "tiny.cc", "rb.gy", "shorturl.at", "bl.ink",
    "v.gd", "qr.ae", "trib.al", "s.id", "t.ly", "lnkd.in", "rebrand.ly"
}

# High-Target Brands for Typosquatting / Impersonation
TARGET_BRANDS = [
    "google", "microsoft", "apple", "amazon", "paypal", "netflix", "facebook",
    "instagram", "whatsapp", "telegram", "chase", "wellsfargo", "bankofamerica",
    "citibank", "binance", "coinbase", "metamask", "linkedin", "twitter",
    "outlook", "yahoo", "dropbox", "adobe", "spotify", "steam", "icloud"
]

# Sensitive phishing intent keywords
SENSITIVE_KEYWORDS = {
    "login", "signin", "verify", "verification", "update", "account",
    "banking", "secure", "security", "wallet", "confirm", "invoice",
    "password", "credential", "authenticate", "authorize", "support",
    "billing", "recover", "suspension", "reactivate", "kyc"
}

# Levenshtein distance for typosquatting detection
def levenshtein_distance(s1: str, s2: str) -> int:
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

# Normalize common character substitutions (leetspeak)
def normalize_leetspeak(s: str) -> str:
    substitutions = {
        '0': 'o', '1': 'l', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b',
        'vv': 'w', 'rn': 'm'
    }
    res = s
    for k, v in substitutions.items():
        res = res.replace(k, v)
    return res


class PhishingDetector:
    @staticmethod
    def analyze(raw_url: str) -> dict:
        """
        Executes static heuristic and structural analysis on the target URL
        without making outbound network connections to the destination host.
        """
        if not raw_url or not isinstance(raw_url, str):
            raise ValueError("Invalid URL string provided.")

        raw_url = raw_url.strip()
        
        # Standardize scheme if missing for parsing purposes
        has_explicit_scheme = raw_url.startswith("http://") or raw_url.startswith("https://")
        normalized_url = raw_url if has_explicit_scheme else f"http://{raw_url}"
        
        parsed = urlparse(normalized_url)
        extracted = tld_extractor(normalized_url)
        
        domain = (extracted.domain or "").lower()
        subdomain = (extracted.subdomain or "").lower()
        suffix = (extracted.suffix or "").lower()
        registered_domain = (extracted.registered_domain or "").lower()
        netloc = parsed.netloc.lower()
        path = parsed.path
        query = parsed.query

        checks = []
        raw_score = 0

        # --- 1. HTTPS Availability Check ---
        is_https = parsed.scheme.lower() == "https"
        if not is_https:
            checks.append({
                "check": "Protocol Security",
                "risk": "Low",
                "penalty": 15,
                "status": "warning",
                "title": "Unencrypted HTTP Protocol",
                "description": "The URL uses plain HTTP instead of encrypted HTTPS. Communications sent to this site are vulnerable to interception.",
                "recommendation": "Do not enter passwords, credit cards, or personal credentials on unencrypted HTTP pages."
            })
            raw_score += 15
        else:
            checks.append({
                "check": "Protocol Security",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": "Encrypted HTTPS Protocol",
                "description": "The URL utilizes Transport Layer Security (HTTPS) to encrypt data in transit.",
                "recommendation": "Always check for the padlock icon in the browser."
            })

        # --- 2. IP Address as Hostname ---
        is_ip_host = False
        ip_obj = None
        host_no_port = netloc.split(":")[0]
        try:
            ip_obj = ipaddress.ip_address(host_no_port)
            is_ip_host = True
        except ValueError:
            pass

        if is_ip_host:
            is_private_or_loopback = ip_obj.is_private or ip_obj.is_loopback
            ip_penalty = 45 if is_private_or_loopback else 35
            ip_type_desc = "local loopback / private intranet" if is_private_or_loopback else "raw public"
            checks.append({
                "check": "Host Identity",
                "risk": "High",
                "penalty": ip_penalty,
                "status": "danger",
                "title": f"Direct {'Local / Private' if is_private_or_loopback else 'Raw'} IP Address ({host_no_port})",
                "description": f"The URL points directly to a {ip_type_desc} IP address ({host_no_port}) instead of a verified registered domain. Legitimate web services never use direct IP links in consumer QR codes, and local IPs frequently indicate rogue phishing listener kits (e.g. GoPhish, SET) or intranet attack vectors.",
                "recommendation": "Avoid visiting websites addressed directly by IP address unless explicitly verified with network administrators."
            })
            raw_score += ip_penalty
        else:
            checks.append({
                "check": "Host Identity",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": "Standard Domain Host",
                "description": f"The URL uses a regular domain name ({registered_domain or netloc}).",
                "recommendation": "Ensure the domain name corresponds to the organization you intend to interact with."
            })

        # --- 3. Port Security Check ---
        parsed_port = parsed.port
        if parsed_port and parsed_port not in (80, 443):
            checks.append({
                "check": "Port Security",
                "risk": "Medium",
                "penalty": 20,
                "status": "warning",
                "title": f"Non-Standard Port Usage (:{parsed_port})",
                "description": f"The URL specifies a custom port (:{parsed_port}) rather than standard web ports (80 or 443). Rogue phishing kits, backdoor web shells, and temporary local attack listeners frequently operate on non-standard ports (such as 8080, 8000, 8888, 4444).",
                "recommendation": "Legitimate consumer services rarely expose non-standard ports in QR codes. Verify the destination before proceeding."
            })
            raw_score += 20
        else:
            checks.append({
                "check": "Port Security",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": "Standard Web Port",
                "description": "The URL operates over standard web communication ports.",
                "recommendation": "No action required."
            })

        # --- 4. URL Length Check ---
        url_len = len(raw_url)
        if url_len > 120:
            checks.append({
                "check": "URL Length",
                "risk": "Medium",
                "penalty": 20,
                "status": "warning",
                "title": f"Abnormally Long URL ({url_len} chars)",
                "description": "The URL is unusually long (>120 characters). Attackers often bloat URLs with encoded payloads or token structures to obscure the true landing destination.",
                "recommendation": "Inspect query parameters carefully for token harvesting or redirect chains."
            })
            raw_score += 20
        elif url_len > 75:
            checks.append({
                "check": "URL Length",
                "risk": "Low",
                "penalty": 10,
                "status": "warning",
                "title": f"Elevated URL Length ({url_len} chars)",
                "description": "The URL is moderately long (>75 characters), typical of tracking strings or parameterized redirects.",
                "recommendation": "Verify whether destination parameters point to secondary domains."
            })
            raw_score += 10
        else:
            checks.append({
                "check": "URL Length",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": f"Normal URL Length ({url_len} chars)",
                "description": "URL length is well within standard concise thresholds.",
                "recommendation": "No action required."
            })

        # --- 4. URL Shortener Detection ---
        is_shortener = registered_domain in KNOWN_SHORTENERS or netloc in KNOWN_SHORTENERS
        if is_shortener:
            checks.append({
                "check": "URL Obfuscation",
                "risk": "Medium",
                "penalty": 25,
                "status": "warning",
                "title": f"URL Shortener Detected ({registered_domain})",
                "description": f"The QR code points to a link shortening service ({registered_domain}). Shortened URLs deliberately mask the ultimate destination website, a primary tactic in QR phishing (Quishing).",
                "recommendation": "Do not scan or open shortened QR codes in public places. Expand or preview the shortlink using a safe link inspector before proceeding."
            })
            raw_score += 25
        else:
            checks.append({
                "check": "URL Obfuscation",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": "Direct Domain (Not Shortened)",
                "description": "No recognized URL shortening or redirection proxy detected.",
                "recommendation": "Proceed with standard domain verification."
            })

        # --- 5. Suspicious Subdomains & Subdomain Depth ---
        subdomain_parts = [p for p in subdomain.split(".") if p]
        subdomain_depth = len(subdomain_parts)
        nested_brand_in_subdomain = None
        for brand in TARGET_BRANDS:
            if brand in subdomain:
                if brand != domain:
                    nested_brand_in_subdomain = brand
                    break

        if nested_brand_in_subdomain:
            checks.append({
                "check": "Subdomain Structure",
                "risk": "High",
                "penalty": 40,
                "status": "danger",
                "title": f"Brand Impersonation in Subdomain ({nested_brand_in_subdomain})",
                "description": f"The subdomain contains the brand keyword '{nested_brand_in_subdomain}', but the actual registered root domain is '{registered_domain}'. This is a classic phishing trick to deceive users reading only the left portion of the link.",
                "recommendation": f"Notice that you are NOT visiting {nested_brand_in_subdomain}.com; you are visiting {registered_domain}."
            })
            raw_score += 40
        elif subdomain_depth >= 3:
            checks.append({
                "check": "Subdomain Structure",
                "risk": "Medium",
                "penalty": 20,
                "status": "warning",
                "title": f"Excessive Subdomain Depth ({subdomain_depth} levels)",
                "description": f"The domain features {subdomain_depth} subdomain levels ({subdomain}). Deep subdomain nesting is frequently seen in malicious domain-generation algorithms (DGA) and deceptive redirects.",
                "recommendation": "Scrutinize the domain carefully."
            })
            raw_score += 20
        else:
            checks.append({
                "check": "Subdomain Structure",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": "Normal Domain Hierarchy",
                "description": f"Subdomain structure has {subdomain_depth} levels, consistent with standard web architecture.",
                "recommendation": "Standard verification."
            })

        # --- 6. Suspicious Characters & Obfuscation ---
        suspicious_chars_found = []
        if "@" in raw_url:
            suspicious_chars_found.append("Embedded '@' symbol (Browser URL Userinfo spoofing)")
        if raw_url.count("//") > 1:
            suspicious_chars_found.append("Multiple double-slashes '//' in URL path")
        if re.search(r"%[0-9a-fA-F]{2}", raw_url):
            hex_matches = re.findall(r"%[0-9a-fA-F]{2}", raw_url)
            if len(hex_matches) > 3 or "%00" in raw_url or "%2e" in raw_url.lower():
                suspicious_chars_found.append(f"Heavy hex/URL-encoding ({len(hex_matches)} encoded bytes)")
        if "xn--" in netloc:
            suspicious_chars_found.append("Punycode / Internationalized Domain Name (IDN) detected (Potential Homograph Spoofing)")
        
        try:
            netloc.encode("ascii")
        except UnicodeEncodeError:
            suspicious_chars_found.append("Non-ASCII / Unicode characters in domain name (Homoglyph Attack risk)")

        if suspicious_chars_found:
            checks.append({
                "check": "Character & Encoding Analysis",
                "risk": "High" if "@" in raw_url or "xn--" in netloc else "Medium",
                "penalty": 30 if ("@" in raw_url or "xn--" in netloc) else 15,
                "status": "danger" if ("@" in raw_url or "xn--" in netloc) else "warning",
                "title": "Suspicious Characters / Obfuscation Found",
                "description": "; ".join(suspicious_chars_found),
                "recommendation": "Do not click links using '@' or disguised Unicode characters, as modern browsers may route you to a completely different destination than shown."
            })
            raw_score += 30 if ("@" in raw_url or "xn--" in netloc) else 15
        else:
            checks.append({
                "check": "Character & Encoding Analysis",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": "Clean Character Set",
                "description": "No deceptive URL spoofing characters, multiple slashes, or punycode anomalies detected.",
                "recommendation": "No action required."
            })

        # --- 7. Typosquatting & Brand Impersonation in Root Domain ---
        typosquat_match = None
        matched_target = None

        if domain:
            domain_tokens = re.split(r"[-_]", domain)
            
            for target in TARGET_BRANDS:
                if domain == target:
                    # Exact brand name
                    break

                # Check tokens in compound/hyphenated domain (e.g. paypal-security -> 'paypal')
                if target in domain_tokens:
                    typosquat_match = f"Brand name '{target}' used in compound/hyphenated domain '{domain}'"
                    matched_target = target
                    break

                # Check leetspeak tokens (e.g. 'paypa1' -> 'paypal')
                for token in domain_tokens:
                    token_normalized = normalize_leetspeak(token)
                    if token_normalized == target and token != target:
                        typosquat_match = f"Leetspeak substitution detected: '{token}' mimics brand '{target}'"
                        matched_target = target
                        break

                    dist = levenshtein_distance(token, target)
                    if dist == 1 and len(token) >= 4 and abs(len(token) - len(target)) <= 1:
                        typosquat_match = f"Domain token '{token}' is a 1-character typo of brand '{target}'"
                        matched_target = target
                        break

                if typosquat_match:
                    break

                # Whole domain normalization
                whole_normalized = normalize_leetspeak(domain)
                if whole_normalized == target and domain != target:
                    typosquat_match = f"Domain '{domain}' uses leetspeak substitution to mimic brand '{target}'"
                    matched_target = target
                    break

                dist_whole = levenshtein_distance(domain, target)
                if dist_whole in (1, 2) and abs(len(domain) - len(target)) <= 2:
                    typosquat_match = f"Domain '{domain}' is {dist_whole} character(s) away from trusted brand '{target}'"
                    matched_target = target
                    break

        if typosquat_match:
            checks.append({
                "check": "Brand Protection & Typosquatting",
                "risk": "High",
                "penalty": 45,
                "status": "danger",
                "title": f"Typosquatting Detected: Impersonating '{matched_target.capitalize()}'",
                "description": typosquat_match,
                "recommendation": f"This site is masquerading as {matched_target.capitalize()}. Do NOT enter any login credentials or financial details."
            })
            raw_score += 45
        else:
            checks.append({
                "check": "Brand Protection & Typosquatting",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": "No Direct Brand Typosquatting",
                "description": "Domain name does not mimic known high-value brand names.",
                "recommendation": "Always confirm the brand's authentic web address."
            })

        # --- 8. Suspicious TLD (Top-Level Domain) Patterns ---
        if suffix in SUSPICIOUS_TLDS:
            checks.append({
                "check": "TLD Reputation",
                "risk": "Medium",
                "penalty": 25,
                "status": "warning",
                "title": f"High-Risk Top-Level Domain (.{suffix})",
                "description": f"The top-level domain '.{suffix}' is statistically associated with high rates of malicious spam, disposable phishing sites, and free registration abuse.",
                "recommendation": "Exercise elevated caution when scanning QR codes leading to non-standard or cheap domain registries."
            })
            raw_score += 25
        else:
            checks.append({
                "check": "TLD Reputation",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": f"Standard Top-Level Domain (.{suffix or 'unknown'})",
                "description": f"The TLD '.{suffix}' is a conventional or country-code domain.",
                "recommendation": "Standard caution applies."
            })

        # --- 9. Sensitive Phishing Intent Keywords in Path / Query ---
        detected_keywords = []
        combined_path_query = (path + " " + query).lower()
        for kw in SENSITIVE_KEYWORDS:
            if kw in combined_path_query or kw in domain or kw in subdomain:
                detected_keywords.append(kw)

        if detected_keywords and not (domain in TARGET_BRANDS and suffix in ["com", "net", "org"]):
            checks.append({
                "check": "Sensitive Action Keywords",
                "risk": "Low" if len(detected_keywords) == 1 else "Medium",
                "penalty": 20 if len(detected_keywords) > 1 else 10,
                "status": "warning",
                "title": f"Credential / Banking Keywords Detected ({', '.join(detected_keywords[:4])})",
                "description": f"URL contains keywords frequently targeted by credential harvesters ({', '.join(detected_keywords[:5])}).",
                "recommendation": "Never provide login credentials or 2FA codes following a QR code scan."
            })
            raw_score += 20 if len(detected_keywords) > 1 else 10

        # --- 10. External Threat Intelligence Integration ---
        threat_intel = ThreatIntelligenceService.check_url(raw_url)
        if threat_intel.get("is_malicious"):
            checks.append({
                "check": "Threat Intelligence",
                "risk": "Critical",
                "penalty": 80,
                "status": "danger",
                "title": "Confirmed Malicious in Global Threat Database",
                "description": "; ".join(threat_intel.get("reasons", ["Confirmed malware or phishing distribution site."])),
                "recommendation": "DO NOT OPEN THIS LINK. It is actively cataloged as a malicious phishing or malware delivery vector."
            })
            raw_score += 80
        elif threat_intel.get("is_suspicious"):
            checks.append({
                "check": "Threat Intelligence",
                "risk": "High",
                "penalty": 40,
                "status": "danger",
                "title": "Flagged by Threat Intelligence Vendors",
                "description": "; ".join(threat_intel.get("reasons", ["Flagged by security vendor scanners."])),
                "recommendation": "Avoid visiting this site as multiple security vendors have raised warnings."
            })
            raw_score += 40
        elif threat_intel.get("checked"):
            checks.append({
                "check": "Threat Intelligence",
                "risk": "None",
                "penalty": 0,
                "status": "passed",
                "title": "Clean in Threat Intelligence Feeds",
                "description": "No active threat detections found in connected threat intelligence databases.",
                "recommendation": "Maintain standard cybersecurity hygiene."
            })

        # --- Cyber Threat Attack Classification ---
        attack_types = PhishingDetector.identify_attack_types(
            raw_url, parsed, extracted, checks, threat_intel, raw_score
        )

        return {
            "url": raw_url,
            "parsed": {
                "scheme": parsed.scheme or ("https" if raw_url.startswith("https") else "http"),
                "domain": domain,
                "subdomain": subdomain,
                "registered_domain": registered_domain,
                "suffix": suffix,
                "path": path,
                "is_ip": is_ip_host
            },
            "checks": checks,
            "raw_score": raw_score,
            "threat_intel": threat_intel,
            "attack_types": attack_types,
            "primary_attack": attack_types[0] if attack_types else None
        }

    @staticmethod
    def identify_attack_types(raw_url: str, parsed, extracted, checks, threat_intel, raw_score: int) -> list:
        attacks = []
        raw_url_lower = raw_url.lower()
        netloc = parsed.netloc.lower()
        path = parsed.path.lower()
        query = parsed.query.lower()
        full_path = (path + " " + query).lower()

        # 1. Payload Injection Attacks (XSS, SQLi, Command Injection)
        injection_patterns = [
            (r"<script[\s>]|javascript:|vbscript:|onerror\s*=|onload\s*=", "Cross-Site Scripting (XSS) in QR Payload"),
            (r"union\s+select|select\s+.+\s+from|'\s*or\s*'1'\s*=\s*'1", "SQL Injection (SQLi) in QR Payload"),
            (r";\s*(?:rm\s+-|cat\s+/|curl\s+|wget\s+|bash|powershell|cmd\.exe)|\$\([^\)]+\)|`[^`]+`", "Command Injection / Shell Execution")
        ]
        for pattern, inj_type in injection_patterns:
            if re.search(pattern, raw_url_lower):
                attacks.append({
                    "name": "Injection Attacks (XSS, SQLi, Command Injection)",
                    "code": "PAYLOAD_INJECTION",
                    "subtype": inj_type,
                    "severity": "Critical",
                    "mitre": "T1059 (Command & Scripting Interpreter)",
                    "description": f"The QR code contains executable script or shell injection patterns ({inj_type}). Applications scanning this matrix could execute malicious code without sanitization."
                })
                break

        # 2. Intranet Pivoting & Rogue Phishing Listener (SSRF / Localhost)
        host_no_port = netloc.split(":")[0]
        is_loopback_or_private = False
        try:
            ip_obj = ipaddress.ip_address(host_no_port)
            if ip_obj.is_loopback or ip_obj.is_private:
                is_loopback_or_private = True
        except ValueError:
            if host_no_port in ("localhost", "127.0.0.1", "::1"):
                is_loopback_or_private = True

        if is_loopback_or_private:
            attacks.append({
                "name": "Intranet Pivoting & Rogue Phishing Listener (Local Attack Kit)",
                "code": "INTRANET_PIVOTING",
                "subtype": "SSRF / Rogue Local Phishing Kit (GoPhish, SET)",
                "severity": "High",
                "mitre": "T1090 (Proxy) / T1210 (Exploitation of Remote Services)",
                "description": f"The QR code points directly to a local loopback/private host ({host_no_port}) on port {parsed.port or 'default'}. Attackers use local phishing listeners (such as GoPhish or the Social-Engineer Toolkit SET) or intranet pivot vectors to target services on the victim's local device or internal corporate network."
            })

        # 3. Malware Propagation (Drive-By Downloads & Droppers)
        malware_extensions = [".exe", ".apk", ".dmg", ".scr", ".bat", ".ps1", ".msi", ".iso", ".vbs", ".jar", ".zip"]
        found_ext = next((ext for ext in malware_extensions if path.endswith(ext) or ext in query), None)
        is_threat_malware = threat_intel.get("is_malicious") and "MALWARE" in str(threat_intel)
        if found_ext or is_threat_malware:
            attacks.append({
                "name": "Malware Propagation (Drive-By Downloads)",
                "code": "MALWARE_DROPPER",
                "subtype": f"Direct Binary Dropper ({found_ext})" if found_ext else "Threat Database Flagged Malware",
                "severity": "Critical",
                "mitre": "T1204.002 (User Execution: Malicious File)",
                "description": f"The QR code links directly to an executable binary or payload dropper ({found_ext or 'malware archive'}). Scanning triggers automated download and execution of rogue mobile APKs or PC trojans."
            })

        # 4. QRLjacking (Quick Response Login / Session Hijacking)
        qrljacking_triggers = ["qr_login", "qrlogin", "session_id", "session_token", "auth_code", "oauth/authorize", "token=", "sid=", "discord.com/ra/", "web.whatsapp.com/qr", "/token"]
        is_qrljacking = any(trigger in full_path for trigger in qrljacking_triggers)
        if is_qrljacking:
            attacks.append({
                "name": "QRLjacking (Session Hijacking)",
                "code": "QRLJACKING",
                "subtype": "Quick Response Login Interception",
                "severity": "High",
                "mitre": "T1539 (Steal Web Session Cookie) / T1556 (Modify Authentication Process)",
                "description": "Exploits 'Login with QR Code' mechanisms (WhatsApp Web, Discord, banking portals). Attackers clone authentic login QR codes to trick victims into scanning and approving the attacker's login session."
            })

        # 5. Brand Impersonation & Typosquatting (Social Engineering)
        has_typosquatting = any(c.get("check") == "Brand Protection & Typosquatting" and c.get("status") == "danger" for c in checks)
        has_subdomain_spoof = any(c.get("check") == "Subdomain Structure" and c.get("status") == "danger" for c in checks)
        if has_typosquatting or has_subdomain_spoof:
            attacks.append({
                "name": "Brand Impersonation & Typosquatting",
                "code": "TYPOSQUATTING",
                "subtype": "Homoglyph / Subdomain Spoofing",
                "severity": "High",
                "mitre": "T1583.001 (Acquire Infrastructure: Domains)",
                "description": "Masquerades as recognized trusted brands (PayPal, Microsoft, Google, Banking) using visually identical letters or deceptive subdomains to harvest sensitive credentials."
            })

        # 6. URL Obfuscation & Link Masking (Multi-Hop Redirection)
        is_shortener = any(c.get("check") == "URL Obfuscation" and c.get("status") == "warning" for c in checks)
        open_redirect_params = ["redirect=", "url=", "next=", "dest=", "target=", "r="]
        has_open_redirect = any(param in query for param in open_redirect_params)
        if is_shortener or has_open_redirect:
            attacks.append({
                "name": "URL Obfuscation & Link Masking",
                "code": "LINK_MASKING",
                "subtype": "Shortener Gateway / Open Redirection",
                "severity": "Medium",
                "mitre": "T1027 (Obfuscated/Encoded Information)",
                "description": "Hides the true destination behind link-shortening gateways (bit.ly, tinyurl) or open redirects, preventing users and mobile cameras from inspecting the real destination domain."
            })

        # 7. Quishing (QR Phishing / Credential Theft)
        has_cred_keywords = any(c.get("check") == "Sensitive Action Keywords" for c in checks)
        if has_cred_keywords or (raw_score >= 35 and not any(a["code"] in ("INTRANET_PIVOTING", "PAYLOAD_INJECTION") for a in attacks)):
            attacks.append({
                "name": "Quishing (QR Phishing / Credential Harvesting)",
                "code": "QUISHING",
                "subtype": "Social Engineering Login Theft",
                "severity": "High" if raw_score >= 70 else "Medium",
                "mitre": "T1566.002 (Phishing: Spearphishing Link)",
                "description": "Visual social engineering attack designed to bypass Secure Email Gateways (SEGs) and lead victims to fake authentication or banking portals."
            })

        # 8. Physical Tampering (Barcode Overlays)
        if raw_score >= 50:
            attacks.append({
                "name": "Physical Tampering (Barcode Overlays)",
                "code": "PHYSICAL_OVERLAY",
                "subtype": "Physical Vector Masquerading",
                "severity": "Medium",
                "mitre": "T1566 (Phishing Delivery Vector)",
                "description": "Adhesive sticker attacks where threat actors paste malicious QR codes directly over genuine payment QR codes on parking meters, restaurants, and public flyers."
            })

        # Default fallback if clean
        if not attacks:
            attacks.append({
                "name": "Benign Navigation Link",
                "code": "BENIGN",
                "subtype": "Standard Web Destination",
                "severity": "None",
                "mitre": "N/A",
                "description": "No recognized malicious attack patterns, injection sequences, or social engineering indicators detected."
            })

        return attacks
