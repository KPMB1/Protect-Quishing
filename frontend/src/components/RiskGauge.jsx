import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskGauge({ score = 0, status = 'SAFE', statusText = 'SAFE' }) {
  // Clamp score between 0 and 100
  const normalizedScore = Math.min(Math.max(Math.round(score), 0), 100);

  // Determine colors based on status
  let colorClass = 'text-emerald-400';
  let strokeColor = '#10b981';
  let glowClass = 'cyber-glow-green';
  let bgBadge = 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400';
  let Icon = ShieldCheck;

  if (status === 'MALICIOUS' || normalizedScore >= 70) {
    colorClass = 'text-rose-500';
    strokeColor = '#f43f5e';
    glowClass = 'cyber-glow-red';
    bgBadge = 'bg-rose-950/70 border-rose-500/40 text-rose-400';
    Icon = ShieldAlert;
  } else if (status === 'SUSPICIOUS' || normalizedScore >= 31) {
    colorClass = 'text-amber-400';
    strokeColor = '#fbbf24';
    glowClass = 'cyber-glow-orange';
    bgBadge = 'bg-amber-950/70 border-amber-500/40 text-amber-400';
    Icon = AlertTriangle;
  }

  // Semi-circle SVG calculation
  const radius = 70;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // Half circle arc
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className={`cyber-card p-6 flex flex-col items-center justify-center text-center relative overflow-hidden ${glowClass}`}>
      
      {/* Background ambient gradient */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${strokeColor} 0%, transparent 70%)`
        }}
      />

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase mb-4 ${bgBadge}`}>
        <Icon className="w-4 h-4" />
        <span>{statusText}</span>
      </div>

      {/* Semi-circular Speedometer SVG */}
      <div className="relative w-48 h-28 flex items-center justify-center">
        <svg viewBox="0 0 160 90" className="w-full h-full overflow-visible">
          {/* Background Arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Score Arc */}
          <path
            d="M 10 80 A 70 70 0 0 1 150 80"
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 6px ${strokeColor})`
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute bottom-0 flex flex-col items-center">
          <span className={`text-4xl font-extrabold font-mono tracking-tight ${colorClass}`}>
            {normalizedScore}
          </span>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest -mt-1">
            Risk Score / 100
          </span>
        </div>
      </div>

      {/* Classification Summary */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 w-full text-center">
        <div className="text-xs text-slate-300 font-medium">
          {status === 'SAFE' && 'Threat evaluation: Clean structure detected'}
          {status === 'SUSPICIOUS' && 'Threat evaluation: Anomalous indicators detected'}
          {status === 'MALICIOUS' && 'Threat evaluation: High-confidence phishing detected'}
        </div>
        <div className="text-[11px] text-slate-400 font-mono mt-1">
          Scale: 0-30 Safe | 31-69 Suspicious | 70-100 Malicious
        </div>
      </div>

    </div>
  );
}
