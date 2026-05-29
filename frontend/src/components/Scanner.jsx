import React, { useState } from 'react';
import { Search, Loader2, ShieldAlert, ShieldCheck, AlertCircle } from 'lucide-react';

const Scanner = ({ addScanResult, scanResults }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    
    setTimeout(() => {
      let status = 'safe';
      const lowercaseUrl = url.toLowerCase();
      if (lowercaseUrl.includes('bad')) {
        status = 'malicious';
      } else if (lowercaseUrl.includes('susp')) {
        status = 'suspicious';
      }
      
      addScanResult({
        id: Date.now(),
        url,
        status,
        time: new Date().toLocaleTimeString()
      });
      
      setLoading(false);
      setUrl('');
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">URL Scanner</h1>
        <p className="text-sm text-textMuted">Scan URLs for malicious activity.</p>
      </div>

      <div className="glass-panel border border-panel-border rounded-lg p-6">
        <form onSubmit={handleScan} className="flex gap-2">
          <input 
            type="url" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 bg-darkBg border border-panel-border rounded px-4 py-3 text-white focus:outline-none focus:border-accent"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 px-6 py-3 rounded font-medium flex items-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5" /> Scan</>}
          </button>
        </form>
      </div>

      <div className="glass-panel border border-panel-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Scan History</h2>
        {scanResults.length === 0 ? (
          <p className="text-textMuted text-sm">No scans performed yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {scanResults.map(result => (
              <div key={result.id} className={`p-4 rounded border ${
                result.status === 'malicious' ? 'bg-danger/10 border-danger/50' : 
                result.status === 'suspicious' ? 'bg-warning/10 border-warning/50' : 
                'bg-accent/10 border-accent/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {result.status === 'malicious' && <ShieldAlert className="text-danger w-6 h-6 shrink-0" />}
                    {result.status === 'suspicious' && <AlertCircle className="text-warning w-6 h-6 shrink-0" />}
                    {result.status === 'safe' && <ShieldCheck className="text-accent w-6 h-6 shrink-0" />}
                    <div>
                      <h3 className="font-bold text-white mb-1">{result.url}</h3>
                      <p className="text-xs text-textMuted">Status: <span className={`uppercase font-semibold ${
                        result.status === 'malicious' ? 'text-danger' : 
                        result.status === 'suspicious' ? 'text-warning' : 
                        'text-accent'
                      }`}>{result.status}</span></p>
                    </div>
                  </div>
                  <span className="text-xs text-textMuted">{result.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanner;
