import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, Copy, Check, ExternalLink, 
  Shield, Globe, Lock, Unlock, Server, AlertOctagon, Terminal, FileCode
} from 'lucide-react';

export default function AnalysisDetails({ scanResult }) {
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'vulnerabilities', 'passed'

  const extractedData = scanResult?.extracted_data || '';
  const isUrl = scanResult?.is_url;
  const analysis = scanResult?.analysis || {};
  const riskAssessment = scanResult?.risk_assessment || {};
  const thumbnail = scanResult?.thumbnail_base64;
  const decodeMethod = scanResult?.decode_method;

  const allChecks = riskAssessment?.all_checks || [];
  const vulnerabilities = riskAssessment?.vulnerabilities || [];
  const passedChecks = riskAssessment?.passed_checks || [];
  const primaryAttack = riskAssessment?.primary_attack || scanResult?.analysis?.primary_attack;

  const handleCopy = () => {
    if (!extractedData) return;
    navigator.clipboard.writeText(extractedData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayedChecks = activeFilter === 'vulnerabilities' 
    ? vulnerabilities 
    : activeFilter === 'passed' 
    ? passedChecks 
    : allChecks;

  return (
    <div className="space-y-6">
      
      {/* Extracted URL Banner */}
      <div className="cyber-card p-5 sm:p-6 border-cyan-500/30">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Decoded QR Payload ({isUrl ? 'Web URL' : 'Plain Text'})
              </span>
              {decodeMethod && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  Engine: {decodeMethod}
                </span>
              )}
            </div>

            {/* URL String with Monospace styling */}
            <div className="font-mono text-sm sm:text-base text-white break-all bg-slate-950/80 px-4 py-2.5 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-cyan-200">{extractedData}</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-sans transition-all shrink-0 cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Quick Threat Vector Tag */}
            {primaryAttack && primaryAttack.code !== 'BENIGN' && (
              <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                <span className="text-slate-400">Classified Attack:</span>
                <span className="px-2.5 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold">
                  {primaryAttack.name}
                </span>
                {primaryAttack.mitre && (
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[11px]">
                    {primaryAttack.mitre.split('(')[0].trim()}
                  </span>
                )}
              </div>
            )}

            {/* Security Warning: Do NOT visit */}
            <div className="flex items-center gap-2 text-xs text-amber-400/90 pt-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                <strong>Defensive Warning:</strong> Never directly visit or paste unknown QR URLs into your browser without verification.
              </span>
            </div>
          </div>

          {/* Thumbnail preview if available */}
          {thumbnail && (
            <div className="shrink-0 flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-slate-700 bg-black p-1 shadow-md">
                <img 
                  src={thumbnail} 
                  alt="Scanned QR Code" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1">Uploaded Matrix</span>
            </div>
          )}

        </div>
      </div>

      {/* Security Analysis Checks Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Security Diagnostic Engine Breakdown
          </h3>
          <p className="text-xs text-slate-400">
            Automated evaluation of 10 structural, cryptographic, and heuristic threat vectors.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({allChecks.length})
          </button>
          <button
            onClick={() => setActiveFilter('vulnerabilities')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeFilter === 'vulnerabilities'
                ? 'bg-rose-500/20 text-rose-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Anomalies ({vulnerabilities.length})
          </button>
          <button
            onClick={() => setActiveFilter('passed')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              activeFilter === 'passed'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Passed ({passedChecks.length})
          </button>
        </div>
      </div>

      {/* Individual Checks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedChecks.map((check, index) => {
          const isDanger = check.status === 'danger';
          const isWarning = check.status === 'warning';
          const isPassed = check.status === 'passed';

          let borderClass = 'border-emerald-500/20 bg-emerald-950/10';
          let statusBadgeClass = 'bg-emerald-950 text-emerald-400 border-emerald-500/40';
          let StatusIcon = CheckCircle2;

          if (isDanger) {
            borderClass = 'border-rose-500/40 bg-rose-950/20';
            statusBadgeClass = 'bg-rose-950 text-rose-400 border-rose-500/50';
            StatusIcon = XCircle;
          } else if (isWarning) {
            borderClass = 'border-amber-500/30 bg-amber-950/15';
            statusBadgeClass = 'bg-amber-950 text-amber-400 border-amber-500/40';
            StatusIcon = AlertTriangle;
          }

          return (
            <div 
              key={index} 
              className={`p-4 rounded-xl border transition-all ${borderClass} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 shrink-0 ${
                      isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                    }`} />
                    <span className="font-semibold text-sm text-slate-100">
                      {check.title}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold ${statusBadgeClass}`}>
                    {check.risk === 'None' ? 'PASSED' : `${check.risk} RISK`}
                  </span>
                </div>

                <p className="text-xs text-slate-300/90 leading-relaxed mb-3">
                  {check.description}
                </p>
              </div>

              {/* Recommendation Note if flagged */}
              {check.recommendation && (
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
                  <span className="text-cyan-400 font-mono font-semibold shrink-0">Advice:</span>
                  <span>{check.recommendation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
