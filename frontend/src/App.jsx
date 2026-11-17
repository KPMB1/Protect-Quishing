import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScannerPage from './pages/ScannerPage';
import ResultsPage from './pages/ResultsPage';
import AboutPage from './pages/AboutPage';
import { getSystemHealth } from './services/api';
import { AlertCircle, WifiOff } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('scanner'); // 'scanner', 'results', 'about'
  const [scanResult, setScanResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'healthy', 'offline', 'checking'

  // Probe backend health status on mount
  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const res = await getSystemHealth();
      if (res.status === 'healthy') {
        setBackendStatus('healthy');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  const handleScanComplete = (result) => {
    setScanResult(result);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setCurrentView('scanner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050811] text-slate-100 selection:bg-cyan-500 selection:text-black font-sans">
      
      {/* Top Header */}
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      {/* Backend Offline Banner (if backend is not running) */}
      {backendStatus === 'offline' && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-xs font-mono text-amber-200 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Backend server not detected on port 5000. Please start the Flask API using <code>python backend/app.py</code>.
          </span>
          <button 
            onClick={checkBackend} 
            className="underline ml-2 hover:text-white cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'scanner' && (
          <ScannerPage onScanComplete={handleScanComplete} />
        )}

        {currentView === 'results' && (
          <ResultsPage 
            scanResult={scanResult} 
            onScanAgain={handleScanAgain} 
          />
        )}

        {currentView === 'about' && (
          <AboutPage setCurrentView={setCurrentView} />
        )}
      </main>

      {/* Bottom Footer */}
      <Footer setCurrentView={setCurrentView} />

    </div>
  );
}
