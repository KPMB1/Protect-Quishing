import React from 'react';
import { 
  Shield, AlertTriangle, EyeOff, Lock, Server, Cpu, 
  HelpCircle, CheckCircle2, ArrowRight, ExternalLink 
} from 'lucide-react';

export default function AboutPage({ setCurrentView }) {
  return (
    <div className="space-y-12 py-4 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>CYBERSECURITY AWARENESS & EDUCATION</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          About QR Shield & Quishing Defense
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Understanding the emerging threat landscape of QR code phishing (Quishing) and how modern heuristic analysis mitigates visual vector attacks.
        </p>
      </div>

      {/* What is Quishing? */}
      <div id="quishing-faq" className="cyber-card p-6 sm:p-8 space-y-4 border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            What is QR Code Phishing ("Quishing")?
          </h2>
        </div>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Quick Response (QR) codes are ubiquitous, two-dimensional barcodes that encode text, contact cards, 
          Wi-Fi credentials, and website URLs. Because the human eye cannot read or interpret QR code patterns, 
          users rely entirely on their smartphone or webcam cameras to decode them.
        </p>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          In a <strong>Quishing attack</strong>, threat actors replace legitimate QR codes with malicious ones, 
          or embed malicious QR codes within corporate phishing emails, paper invoices, parking meters, and retail flyers. 
          When scanned, the victim's device is redirected to credential-harvesting phishing sites, malicious app store downloads, 
          or malware distribution servers.
        </p>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs sm:text-sm text-cyan-300 font-mono">
          🚨 <strong>Why Quishing Bypasses Traditional Email Filters:</strong> Traditional Secure Email Gateways (SEGs) inspect text links and HTML tags in incoming emails. Because a QR code is simply an image file without plain text links in the email body, it frequently bypasses automated email security scanners completely.
        </div>
      </div>

      {/* Anatomy of Attack Vectors */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          Common Real-World Quishing Vectors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="cyber-card p-5 border-slate-800">
            <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              1. Physical Sticker Overlays
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Criminals place adhesive sticker QR codes directly over legitimate payment QR codes on parking meters, electric vehicle charging stations, and restaurant menus to siphon credit card details.
            </p>
          </div>

          <div className="cyber-card p-5 border-slate-800">
            <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              2. Corporate 2FA / Password Reset Mails
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Attackers send corporate emails pretending to be IT Support or Microsoft 365, prompting employees to scan a QR code on their personal smartphone to "re-authenticate 2FA" or "update credentials".
            </p>
          </div>

          <div className="cyber-card p-5 border-slate-800">
            <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              3. URL Shortener Masking
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hiding destination websites behind shortened links (e.g. bit.ly or tinyurl) inside QR codes prevents users from previewing the real landing domain.
            </p>
          </div>

          <div className="cyber-card p-5 border-slate-800">
            <h4 className="font-bold text-slate-100 text-sm mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              4. Brand Impersonation & Typosquatting
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Registering deceptive domains mimicking trusted brands (e.g. <code>paypa1-security.com</code> or <code>login.microsoft.com.account-update.xyz</code>) to harvest credentials.
            </p>
          </div>

        </div>
      </div>

      {/* How QR Shield Works */}
      <div className="cyber-card p-6 sm:p-8 space-y-6 border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            How QR Shield Protects You
          </h2>
        </div>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          QR Shield acts as a defensive air-gap between physical or digital QR codes and your web browser. 
          The application follows strict defensive cybersecurity principles:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Never Visits Target URLs:</strong> Zero SSRF or remote payload fetching; prevents tracking beacons and malicious script execution.</span>
          </div>

          <div className="flex items-start gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>10-Point Structural Diagnostic:</strong> Checks HTTPS, IP hosts, URL length, shorteners, subdomains, character spoofing, typosquatting, and sensitive intent keywords.</span>
          </div>

          <div className="flex items-start gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Zero Retention:</strong> No databases (No MongoDB, No SQL), no user logins, and no persistent scan logs.</span>
          </div>

          <div className="flex items-start gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Threat Intelligence Ready:</strong> Seamlessly hooks into Google Safe Browsing and VirusTotal APIs when configured.</span>
          </div>
        </div>

        {/* Start Scanning CTA */}
        <div className="pt-4 border-t border-slate-800 flex justify-center">
          <button
            onClick={() => setCurrentView('scanner')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <span>TRY THE SCANNER NOW</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

    </div>
  );
}
