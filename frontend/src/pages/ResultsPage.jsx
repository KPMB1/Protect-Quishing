import React from 'react';
import { 
  ShieldCheck, AlertTriangle, ShieldAlert, RotateCcw, 
  ExternalLink, FileSearch, ArrowLeft, CheckCircle2, Crosshair, Bug, Zap, Skull, Cpu 
} from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import AnalysisDetails from '../components/AnalysisDetails';
import RecommendationsCard from '../components/RecommendationsCard';
import AttackClassificationCard from '../components/AttackClassificationCard';

export default function ResultsPage({ scanResult, onScanAgain }) {
  if (!scanResult) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400">No scan result available.</p>
        <button
          onClick={onScanAgain}
          className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm"
        >
          Return to Scanner
        </button>
      </div>
    );
  }

  const riskAssessment = scanResult.risk_assessment || {};
  const status = riskAssessment.status || 'SAFE';
  const score = riskAssessment.score || 0;
  const statusText = riskAssessment.status_text || status;
  const summary = riskAssessment.summary || '';

  const attackTypes = riskAssessment.attack_types || scanResult?.analysis?.attack_types || [];
  const primaryAttack = riskAssessment.primary_attack || scanResult?.analysis?.primary_attack || attackTypes[0];

  const isMalicious = status === 'MALICIOUS';
  const isSuspicious = status === 'SUSPICIOUS';
  const isSafe = status === 'SAFE';

  let bannerBg = 'from-emerald-950/40 via-emerald-900/20 to-transparent border-emerald-500/40 text-emerald-300';
  let statusBadge = 'bg-emerald-950 border-emerald-500 text-emerald-400';
  let StatusIcon = ShieldCheck;

  if (isMalicious) {
    bannerBg = 'from-rose-950/50 via-rose-900/25 to-transparent border-rose-500/50 text-rose-300';
    statusBadge = 'bg-rose-950 border-rose-500 text-rose-400';
    StatusIcon = ShieldAlert;
  } else if (isSuspicious) {
    bannerBg = 'from-amber-950/50 via-amber-900/25 to-transparent border-amber-500/50 text-amber-300';
    statusBadge = 'bg-amber-950 border-amber-500 text-amber-400';
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="space-y-8 py-4 max-w-6xl mx-auto">
      
      {/* Top Navigation & Return */}
      <div className="flex items-center justify-between">
        <button
          onClick={onScanAgain}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO SCANNER</span>
        </button>

        <button
          onClick={onScanAgain}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500 text-xs font-mono text-slate-300 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scan Another QR Code</span>
        </button>
      </div>

      {/* Primary Security Status Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border bg-gradient-to-r shadow-2xl ${bannerBg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${statusBadge}`}>
                <StatusIcon className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xs font-mono tracking-widest text-slate-300 uppercase block">
                  Security Assessment Status
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  <span>{statusText}</span>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
                    Score: {score}/100
                  </span>
                </h2>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
              {summary}
            </p>

            {/* DIRECT ATTACK TYPE HIGHLIGHT INSIDE ASSESSMENT AREA */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold shrink-0">
                Threat Attack Type:
              </span>
              
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-mono font-bold flex items-center gap-2 shadow-lg ${
                  isMalicious 
                    ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-rose-950/40' 
                    : isSuspicious 
                    ? 'bg-amber-950/90 border-amber-500 text-amber-300 shadow-amber-950/40' 
                    : 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-emerald-950/40'
                }`}>
                  <Crosshair className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>
                    {primaryAttack?.name || (isSafe ? 'Benign QR Payload' : 'Quishing (QR Phishing)')}
                  </span>
                </span>

                {primaryAttack?.mitre && primaryAttack.mitre !== 'N/A' && (
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-semibold">
                    {primaryAttack.mitre.split('(')[0].trim()}
                  </span>
                )}
              </div>
            </div>

            {/* Secondary Attack Vectors if multiple detected */}
            {attackTypes.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider">Additional Vectors:</span>
                {attackTypes.slice(1).map((att, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700/80 text-slate-300 text-[11px]">
                    {att.name.split('(')[0].trim()}
                  </span>
                ))}
              </div>
            )}

          </div>

          {/* Quick Risk Gauge */}
          <div className="shrink-0 self-center md:self-auto">
            <RiskGauge score={score} status={status} statusText={statusText} />
          </div>

        </div>
      </div>

      {/* Cyber Threat Attack Classification Detail Card */}
      <AttackClassificationCard 
        attackTypes={attackTypes}
        primaryAttack={primaryAttack}
        status={status}
      />

      {/* Analysis Details (URL, Checks breakdown, Method) */}
      <AnalysisDetails scanResult={scanResult} />

      {/* Recommendations Card */}
      <RecommendationsCard 
        riskAssessment={riskAssessment} 
        onScanAgain={onScanAgain} 
      />

    </div>
  );
}
