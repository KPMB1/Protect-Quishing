import React, { useState, useRef } from 'react';
import { Upload, FileImage, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { scanQrFile, analyzeUrl } from '../services/api';

const QUICK_SAMPLES = [
  {
    name: 'Safe Google',
    type: 'SAFE',
    color: 'emerald',
    url: 'https://www.google.com'
  },
  {
    name: 'PayPal Phishing',
    type: 'MALICIOUS',
    color: 'rose',
    url: 'http://paypa1-security-verification.com/login'
  },
  {
    name: 'Direct IP Host',
    type: 'SUSPICIOUS',
    color: 'amber',
    url: 'http://192.168.1.100/admin-login'
  },
  {
    name: 'Shortened Link',
    type: 'SUSPICIOUS',
    color: 'amber',
    url: 'https://bit.ly/3xyzABC'
  },
  {
    name: 'Microsoft Spoof',
    type: 'MALICIOUS',
    color: 'rose',
    url: 'http://login.microsoft.com.account-update.xyz/token'
  }
];

export default function ImageUploader({ onScanComplete, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Check file format
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp)$/i)) {
      const err = 'Invalid file format. Please upload a PNG, JPG, JPEG, or WEBP image.';
      setUploadError(err);
      onError?.(err);
      return;
    }

    // Check size (16MB)
    if (file.size > 16 * 1024 * 1024) {
      const err = 'File is too large. Maximum supported image size is 16MB.';
      setUploadError(err);
      onError?.(err);
      return;
    }

    setUploadError(null);
    setIsProcessing(true);

    try {
      const result = await scanQrFile(file);
      setIsProcessing(false);
      onScanComplete(result);
    } catch (err) {
      setIsProcessing(false);
      const msg = err.message || 'Failed to decode QR code. Please ensure the QR code is clear.';
      setUploadError(msg);
      onError?.(msg);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleQuickSample = async (sample) => {
    setUploadError(null);
    setIsProcessing(true);
    try {
      const result = await analyzeUrl(sample.url);
      setIsProcessing(false);
      onScanComplete(result);
    } catch (err) {
      setIsProcessing(false);
      setUploadError(err.message || 'Sample analysis failed.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleQuickSample ? handleDragOver : undefined}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`relative cyber-card p-8 sm:p-12 text-center border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
            : 'border-cyan-800/40 hover:border-cyan-500/60 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {/* Scan Animation overlay when processing */}
        {isProcessing && (
          <div className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <div className="animate-scan-line" />
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin mb-4" />
            <h4 className="font-mono text-cyan-300 font-semibold text-lg animate-pulse">
              DECODING & ANALYZING PAYLOAD...
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Executing static phishing heuristics & threat intelligence checks
            </p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform">
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">
              Drag & Drop your QR Code Image here
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              or <span className="text-cyan-400 font-medium underline underline-offset-4">browse files</span> from your computer
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800/70 border border-slate-700/60">PNG</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/70 border border-slate-700/60">JPG</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/70 border border-slate-700/60">JPEG</span>
            <span className="px-2 py-0.5 rounded bg-slate-800/70 border border-slate-700/60">WEBP</span>
            <span className="text-slate-400">• Up to 16MB</span>
          </div>
        </div>
      </div>

      {/* Error notification if any */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Scan Error</div>
            <div className="text-xs text-rose-200/80 mt-0.5">{uploadError}</div>
          </div>
        </div>
      )}

      {/* One-Click Demo Samples for University Presentation / Immediate Testing */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Instant Test Scenarios (Demo Presets)
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Click any preset to simulate an immediate QR payload scan without uploading files:
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_SAMPLES.map((sample, i) => (
            <button
              key={i}
              type="button"
              disabled={isProcessing}
              onClick={(e) => {
                e.stopPropagation();
                handleQuickSample(sample);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                sample.color === 'emerald'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50 hover:border-emerald-400'
                  : sample.color === 'amber'
                  ? 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/50 hover:border-amber-400'
                  : 'bg-rose-950/40 text-rose-300 border-rose-500/30 hover:bg-rose-900/50 hover:border-rose-400'
              }`}
            >
              <span>{sample.name}</span>
              <span className="ml-1.5 opacity-60">[{sample.type}]</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
