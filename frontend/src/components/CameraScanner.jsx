import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, RefreshCw, AlertCircle, Eye, ShieldCheck } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { analyzeUrl } from '../services/api';

export default function CameraScanner({ onScanComplete, onError }) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [cameraError, setCameraError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const scannerRef = useRef(null);
  const scannerContainerId = 'qr-reader-region';

  // Enumerate available cameras on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera ('environment') on mobile if available
          const backCam = devices.find((d) => 
            d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setCameraError('No video camera detected on your device.');
        }
      })
      .catch((err) => {
        setCameraError('Could not access camera devices. Please grant camera permissions.');
      });

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (cameraIdToUse) => {
    const camId = cameraIdToUse || selectedCameraId;
    if (!camId) {
      setCameraError('Please select a camera to start.');
      return;
    }

    setCameraError(null);

    try {
      if (scannerRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        camId,
        config,
        async (decodedText, decodedResult) => {
          // Detected a QR code!
          await stopCamera();
          handleScannedData(decodedText);
        },
        (errorMessage) => {
          // Normal frame scanning progress (no QR in frame yet)
        }
      );

      setIsScanning(true);
    } catch (err) {
      setIsScanning(false);
      setCameraError(`Camera initialization failed: ${err?.message || err}`);
      onError?.(err?.message || 'Failed to start camera.');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        // cleanup swallow
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleScannedData = async (text) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeUrl(text);
      setIsAnalyzing(false);
      onScanComplete(result);
    } catch (err) {
      setIsAnalyzing(false);
      const msg = err.message || 'Failed to analyze scanned QR payload.';
      setCameraError(msg);
      onError?.(msg);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Camera Viewport Frame */}
      <div className="relative cyber-card p-4 sm:p-6 flex flex-col items-center justify-center min-h-[360px] overflow-hidden">
        
        {/* Analyzing Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-[#070b14]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
            <div className="animate-scan-line" />
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin mb-4" />
            <h4 className="font-mono text-cyan-300 font-semibold text-lg animate-pulse">
              ANALYZING DETECTED QR CODE...
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Evaluating URL reputation and checking for phishing patterns
            </p>
          </div>
        )}

        {/* Live Reader Container */}
        <div 
          id={scannerContainerId} 
          className={`w-full max-w-sm rounded-xl overflow-hidden relative ${!isScanning ? 'hidden' : 'block'}`}
          style={{ minHeight: '300px' }}
        />

        {/* Viewfinder Overlay when Scanning */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-64 h-64 border-2 border-cyan-400/60 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              {/* Corner brackets */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400" />
              
              {/* Scanning laser line */}
              <div className="animate-scan-line" />

              <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-mono text-cyan-300 tracking-wider uppercase bg-black/40 py-0.5">
                Targeting QR Code Matrix
              </div>
            </div>
          </div>
        )}

        {/* Idle Placeholder when camera is stopped */}
        {!isScanning && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-900/20">
              <Camera className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                Live QR Video Scanner
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mt-1">
                Point your webcam or mobile camera at any QR code to analyze its URL in real-time.
              </p>
            </div>

            <button
              onClick={() => startCamera()}
              disabled={cameras.length === 0}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-5 h-5 text-slate-950" />
              <span>START CAMERA SCANNER</span>
            </button>
          </div>
        )}

      </div>

      {/* Controls Bar */}
      {cameras.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Camera Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider shrink-0">
              Camera:
            </label>
            <select
              value={selectedCameraId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedCameraId(newId);
                if (isScanning) {
                  startCamera(newId);
                }
              }}
              className="bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-full sm:w-64 font-mono"
            >
              {cameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label || `Camera ${c.id.substring(0, 5)}...`}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {isScanning ? (
              <button
                onClick={stopCamera}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 text-xs font-mono font-medium transition-all"
              >
                <CameraOff className="w-4 h-4" />
                <span>Stop Camera</span>
              </button>
            ) : (
              <button
                onClick={() => startCamera()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-mono font-medium transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Start Camera</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* Error state */}
      {cameraError && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Camera Notice</div>
            <div className="text-xs text-rose-200/80 mt-0.5">{cameraError}</div>
          </div>
        </div>
      )}

    </div>
  );
}
