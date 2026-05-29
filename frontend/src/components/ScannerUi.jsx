import React, { useState } from 'react';
import { Search, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { apiFetch } from '../lib/apiClient';

const ScannerUi = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null);
    try {
      const queued = await apiFetch('/scan/url', {
        method: 'POST',
        body: JSON.stringify({ url })
      });
      setResult({
        url,
        isMalicious: false,
        sources: { virusTotal: { positives: 0, total: 0 }, localAI: { score: 'queued' } },
        status: queued.data?.status || 'pending',
      });
    } catch (err) {
      console.error(err);
      setResult({ error: 'Scan failed to reach backend.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded-lg p-4 flex flex-col">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-cyber-neon" /> URL Threat Scanner
      </h2>
      
      <form onSubmit={handleScan} className="flex gap-2">
        <input 
          type="url" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 bg-cyber-900 border border-cyber-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyber-neon"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-cyber-neon hover:bg-sky-400 text-white px-4 py-2 rounded font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Scan'}
        </button>
      </form>

      {result && !result.error && (
        <div className={`mt-4 p-4 rounded border ${result.isMalicious ? 'bg-cyber-alert/10 border-cyber-alert/50' : 'bg-cyber-safe/10 border-cyber-safe/50'}`}>
          <div className="flex items-start gap-3">
            {result.isMalicious ? <ShieldAlert className="w-8 h-8 text-cyber-alert shrink-0" /> : <ShieldCheck className="w-8 h-8 text-cyber-safe shrink-0" />}
            <div>
              <h3 className={`font-bold ${result.isMalicious ? 'text-cyber-alert' : 'text-cyber-safe'}`}>
                {result.isMalicious ? 'Malicious Threat Detected' : 'No Threats Found'}
              </h3>
              <div className="text-sm text-slate-300 mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-slate-500">Target URL:</span>
                <span className="truncate" title={result.url}>{result.url}</span>
                
                <span className="text-slate-500">VirusTotal Score:</span>
                <span>{result.sources.virusTotal.positives} / {result.sources.virusTotal.total}</span>
                
                <span className="text-slate-500">AI Phishing Risk:</span>
                <span>{result.sources.localAI.score}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && result.error && (
        <div className="mt-4 p-3 bg-red-900/20 text-red-500 text-sm rounded border border-red-900/50">
          {result.error}
        </div>
      )}
    </div>
  );
};

export default ScannerUi;
