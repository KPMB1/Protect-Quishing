import React, { useState } from 'react';
import { Upload, Camera, Shield, Zap, EyeOff, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import CameraScanner from '../components/CameraScanner';

export default function ScannerPage({ onScanComplete }) {
  const [scanMode, setScanMode] = useState('upload'); // 'upload' or 'camera'

  return (
    <div className="space-y-12 py-4">
      
      {/* HERO SECTION */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        
        {/* Cybersecurity pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>ADVANCED QUISHING DEFENSE SYSTEM</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Protect Yourself from{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            QR Code Phishing
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Scan any QR code and analyze its embedded URL to identify potential phishing threats before visiting the website.
        </p>
      </div>

      {/* MAIN SCANNER CONTAINER */}
      <div className="max-w-3xl mx-auto">
        
        {/* Mode Selector Tabs */}
        <div className="flex p-1.5 rounded-2xl bg-slate-900/90 border border-cyan-900/40 mb-6 shadow-xl">
          <button
            onClick={() => setScanMode('upload')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer ${
              scanMode === 'upload'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/30 text-cyan-300 border border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload QR Code</span>
          </button>

          <button
            onClick={() => setScanMode('camera')}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold tracking-wide transition-all cursor-pointer ${
              scanMode === 'camera'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/30 text-cyan-300 border border-cyan-400/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Scan Using Camera</span>
          </button>
        </div>

        {/* Selected Scanner Interface */}
        <div className="transition-all duration-300">
          {scanMode === 'upload' ? (
            <ImageUploader onScanComplete={onScanComplete} />
          ) : (
            <CameraScanner onScanComplete={onScanComplete} />
          )}
        </div>

      </div>

      {/* DEFENSE HIGHLIGHTS GRID */}
      <div className="max-w-6xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h3 className="text-sm font-mono uppercase tracking-widest text-cyan-400 font-semibold">
            Defensive Pipeline Overview
          </h3>
          <p className="text-xl font-bold text-white mt-1">
            How QR Shield Dissects Hidden Threats
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="cyber-card p-6 border-slate-800/80 hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Multi-Engine Computer Vision
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Decodes distorted, low-contrast, or photographed QR codes using OpenCV computer vision algorithms and Pyzbar symbology decoders.
            </p>
          </div>

          <div className="cyber-card p-6 border-slate-800/80 hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Static Phishing Heuristics
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Scrutinizes IP host addresses, homograph typosquatting, deceptive subdomains, URL shorteners, and credential phishing keywords without visiting target servers.
            </p>
          </div>

          <div className="cyber-card p-6 border-slate-800/80 hover:border-cyan-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <EyeOff className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Zero Retention Architecture
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Strict privacy by design. No accounts, no database, no session cookies, and zero scan history kept. Your scanned data vanishes immediately after analysis.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
