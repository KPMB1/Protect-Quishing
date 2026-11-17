import React from 'react';
import { ShieldCheck, AlertOctagon, RotateCcw, Lightbulb, CheckCircle } from 'lucide-react';

export default function RecommendationsCard({ riskAssessment, onScanAgain }) {
  const recommendations = riskAssessment?.recommendations || [];
  const status = riskAssessment?.status || 'SAFE';

  const isMalicious = status === 'MALICIOUS';
  const isSuspicious = status === 'SUSPICIOUS';

  let headerColor = 'text-emerald-400';
  let bannerBg = 'bg-emerald-950/20 border-emerald-500/30';

  if (isMalicious) {
    headerColor = 'text-rose-400';
    bannerBg = 'bg-rose-950/30 border-rose-500/40';
  } else if (isSuspicious) {
    headerColor = 'text-amber-400';
    bannerBg = 'bg-amber-950/20 border-amber-500/30';
  }

  return (
    <div className={`cyber-card p-6 border ${bannerBg}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
            <Lightbulb className={`w-5 h-5 ${headerColor}`} />
          </div>
          <div>
            <h3 className={`text-base font-bold ${headerColor}`}>
              Cybersecurity Recommendations & Next Steps
            </h3>
            <p className="text-xs text-slate-400">
              Prescribed defensive actions for this scanned link.
            </p>
          </div>
        </div>

        {/* Scan Again Button */}
        <button
          onClick={onScanAgain}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase font-mono shadow-md shadow-cyan-500/20 transition-all cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-slate-950" />
          <span>Scan Another QR Code</span>
        </button>
      </div>

      {/* List of recommended actions */}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
            <div className="mt-0.5">
              <CheckCircle className={`w-4 h-4 shrink-0 ${headerColor}`} />
            </div>
            <p className="leading-relaxed">
              {rec}
            </p>
          </div>
        ))}
      </div>

      {/* Important University Cybersecurity Disclaimer */}
      <div className="mt-6 p-3.5 rounded-lg bg-black/40 border border-slate-800 text-[11px] text-slate-400 font-mono">
        <span className="text-cyan-400 font-bold">NOTE: </span>
        QR Shield analyzes structural artifacts, domain ownership records, and threat feeds safely without loading executable code or executing remote web scripts.
      </div>
    </div>
  );
}
