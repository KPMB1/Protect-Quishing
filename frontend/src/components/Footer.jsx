import React from 'react';
import { Shield, Lock, EyeOff, AlertTriangle } from 'lucide-react';

export default function Footer({ setCurrentView }) {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#040711] text-slate-400 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-wider">QR SHIELD</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md">
              QR Shield is an advanced cybersecurity defensive platform engineered to inspect, 
              decode, and analyze embedded URLs in QR codes without exposing users to phishing vectors, 
              malicious redirect loops, or drive-by payload downloads.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="px-2 py-1 rounded bg-slate-800/80 text-emerald-400 border border-emerald-900/40 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" /> No Storage
              </span>
              <span className="px-2 py-1 rounded bg-slate-800/80 text-cyan-400 border border-cyan-900/40 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Safe Heuristics
              </span>
              <span className="px-2 py-1 rounded bg-slate-800/80 text-amber-400 border border-amber-900/40 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Never Visits URLs
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-semibold">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button 
                  onClick={() => setCurrentView('scanner')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  QR Code Scanner
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentView('about')}
                  className="hover:text-cyan-400 transition-colors"
                >
                  About QR Shield
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setCurrentView('about');
                    setTimeout(() => {
                      document.getElementById('quishing-faq')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Understanding Quishing
                </button>
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-semibold">
              Security Notice
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              QR Shield operates with strict zero-knowledge telemetry. No scanned images, QR payloads, 
              or analysis outputs are permanently stored in databases or logs.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Designed for Cybersecurity Demonstration & Research.
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div>
            © {new Date().getFullYear()} QR SHIELD. Built with Python, OpenCV & React.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Client-Safe Architecture</span>
            <span>•</span>
            <span>Zero Tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
