import React, { useState } from 'react';
import { 
  Skull, AlertOctagon, Terminal, ShieldAlert, Cpu, 
  Layers, ExternalLink, Zap, Info, Bug, Crosshair 
} from 'lucide-react';

export default function AttackClassificationCard({ attackTypes = [], primaryAttack = null, status = 'SAFE' }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const attacks = attackTypes && attackTypes.length > 0 
    ? attackTypes 
    : primaryAttack 
    ? [primaryAttack] 
    : [];

  if (attacks.length === 0) return null;

  const currentAttack = attacks[selectedIdx] || attacks[0];
  const isSafe = status === 'SAFE' && currentAttack.code === 'BENIGN';

  // Severity color schemes
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50';
      case 'high':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/40';
      case 'medium':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      case 'low':
        return 'bg-sky-950/60 text-sky-300 border-sky-500/40';
      default:
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
    }
  };

  const getAttackIcon = (code) => {
    switch (code) {
      case 'QUISHING':
        return Crosshair;
      case 'QRLJACKING':
        return Zap;
      case 'INTRANET_PIVOTING':
        return Cpu;
      case 'MALWARE_DROPPER':
        return Skull;
      case 'PAYLOAD_INJECTION':
        return Terminal;
      case 'TYPOSQUATTING':
        return AlertOctagon;
      case 'LINK_MASKING':
        return Layers;
      default:
        return Info;
    }
  };

  const IconComponent = getAttackIcon(currentAttack.code);

  return (
    <div className={`cyber-card p-6 sm:p-7 border relative overflow-hidden ${
      isSafe 
        ? 'border-emerald-500/30 bg-emerald-950/10' 
        : 'border-rose-500/30 bg-gradient-to-br from-slate-900/90 via-[#0b1120] to-[#070b14]'
    }`}>
      
      {/* Background glow reticle */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isSafe 
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-400' 
              : 'bg-rose-950/70 border-rose-500/40 text-rose-400'
          }`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase block">
              Cyber Threat Classification Engine
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <span>Identified Attack Vector:</span>
              <span className={isSafe ? 'text-emerald-400' : 'text-rose-400'}>
                {currentAttack.name}
              </span>
            </h3>
          </div>
        </div>

        {/* MITRE ATT&CK & Severity Tags */}
        <div className="flex flex-wrap items-center gap-2">
          {currentAttack.mitre && currentAttack.mitre !== 'N/A' && (
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
              MITRE ATT&CK: {currentAttack.mitre}
            </span>
          )}
          <span className={`px-2.5 py-1 rounded-md border text-xs font-mono font-bold uppercase tracking-wider ${getSeverityBadge(currentAttack.severity)}`}>
            {currentAttack.severity} SEVERITY
          </span>
        </div>
      </div>

      {/* Multi-Attack Vector Selector Tabs (if more than 1 attack vector identified) */}
      {attacks.length > 1 && (
        <div className="mt-4 pt-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-1">Matched Attack Vectors:</span>
          {attacks.map((att, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedIdx === idx
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400 font-bold'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {idx + 1}. {att.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      )}

      {/* Attack Anatomy & Technical Details */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Description box */}
        <div className="md:col-span-2 space-y-3 bg-black/40 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Bug className="w-3.5 h-3.5 text-rose-400" />
            <span className="uppercase tracking-wider font-semibold">Threat Anatomy & Attack Behavior:</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {currentAttack.description}
          </p>
        </div>

        {/* Mechanism breakdown */}
        <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Exploitation Subtype
            </span>
            <div className="text-xs sm:text-sm font-mono font-semibold text-cyan-300">
              {currentAttack.subtype || 'Direct Phishing Vector'}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="text-rose-400 font-mono font-bold">Threat Action: </span>
            {isSafe ? 'No hostile execution.' : 'Immediate user caution required.'}
          </div>
        </div>

      </div>

    </div>
  );
}
