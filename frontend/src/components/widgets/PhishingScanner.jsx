import React, { useState, useRef, useEffect } from 'react';
import useStore from '../../store/useStore';
import { Search, Globe, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { apiFetch } from '../../lib/apiClient';

const PhishingScanner = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  const addEvent = useStore(state => state.addEvent);
  const sampleUrls = [
    { url: 'https://secure-login-suspicious.cloud', risk: 'High', tone: 'text-danger' },
    { url: 'https://payroll-verify-bad.net', risk: 'Critical', tone: 'text-danger' },
    { url: 'https://m365-session-review.susp.io', risk: 'Medium', tone: 'text-warning' },
  ];

  const normalizeScanResult = (job) => {
    const details = typeof job.details === 'string' ? JSON.parse(job.details) : (job.details || {});
    const score = Number(details.score || 0);
    const isBad = job.verdict === 'malicious' || score >= 70;

    return {
      jobId: job.job_id,
      status: job.status,
      score,
      probability: isBad ? (score >= 90 ? 'Critical' : 'High') : 'Low',
      threat: details.threat || (isBad ? 'Malicious indicators detected.' : 'No identifiable threats found.'),
      domain: new URL(job.url.startsWith('http') ? job.url : `https://${job.url}`).hostname,
      isBad,
    };
  };

  const waitForScanResult = async (jobId) => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await new Promise(resolve => setTimeout(resolve, attempt === 0 ? 600 : 1200));
      const response = await apiFetch(`/scan-result/${jobId}`);
      const job = response.data;

      if (job.status === 'completed') {
        return normalizeScanResult(job);
      }

      if (job.status === 'failed') {
        throw new Error('Scan job failed during processing.');
      }
    }

    throw new Error('Scan is still pending. Try refreshing the result in a few seconds.');
  };

  const performScan = async (targetUrl) => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    const logAlertToStore = (scanR) => {
        if (!scanR.isBad) return;
        addEvent({
            id: crypto.randomUUID(),
            type: 'phishing_attempt',
            severity: scanR.score > 80 ? 'critical' : 'high',
            timestamp: new Date().toISOString(),
            source_ip: scanR.domain,
            target_user: 'system_scan',
            system: 'PhishingScanner',
            description: scanR.threat
        });
    };

    try {
      const queued = await apiFetch('/scan/url', {
        method: 'POST',
        body: JSON.stringify({ url: targetUrl }),
      });

      const jobId = queued.data?.job_id;
      if (!jobId) {
        throw new Error('Backend did not return a scan job id.');
      }

      const scanData = await waitForScanResult(jobId);

      setResult(scanData);
      logAlertToStore(scanData);
    } catch (err) {
      console.error("Scan failed:", err);
      setError(err.message || "An unexpected error occurred during scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    performScan(url);
  };

  // Optional: Auto-scan debounce when URL changes significantly
  useEffect(() => {
      if (url.length > 10 && (url.startsWith('http') || url.includes('.'))) {
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
              // uncomment to enable auto-scan
              // performScan(url);
          }, 800);
      }
      return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); }
  }, [url]);

  return (
    <div className="glass-panel p-5 flex flex-col h-full bg-darkBg/80">
       <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
          <Search size={20} className="text-blue-400" />
          Phishing URL Scanner
        </h2>
      </div>

      <form onSubmit={handleScanSubmit} className="flex gap-2 mb-2 w-full">
        <div className="relative flex-1">
          <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" aria-hidden="true" />
          <input 
            type="text" 
            aria-label="URL to scan"
            placeholder="Paste suspicious URL here..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-white"
          />
        </div>
        <button 
          type="submit"
          aria-label="Submit URL for scanning"
          disabled={isScanning || !url}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center min-w-[100px] shadow-[0_0_10px_rgba(37,99,235,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {isScanning ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" aria-label="Scanning"></div> : 'Scan'}
        </button>
      </form>
      
      {error && <p className="text-[10px] text-warning px-1 font-mono">{error}</p>}

      <div className="my-3 rounded-lg border border-white/10 bg-black/25 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-textMuted">Recent suspicious URLs</p>
          <span className="text-[10px] font-semibold text-accent">Seeded</span>
        </div>
        <div className="space-y-2">
          {sampleUrls.map((item) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setUrl(item.url)}
              className="flex w-full items-center justify-between gap-3 rounded-md border border-white/5 bg-white/[0.03] px-3 py-2 text-left text-xs transition-colors hover:border-accent/30 hover:bg-white/[0.06]"
            >
              <span className="min-w-0 truncate font-mono text-gray-300">{item.url}</span>
              <span className={`shrink-0 font-bold ${item.tone}`}>{item.risk}</span>
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className={`mt-2 p-4 rounded-lg border flex flex-col gap-3 animate-slide-in ${result.isBad ? 'bg-danger/10 border-danger/30' : 'bg-accent/10 border-accent/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {result.isBad ? <ShieldAlert className="text-danger" size={24} /> : <ShieldCheck className="text-accent" size={24} />}
              <span className={`font-bold text-lg ${result.isBad ? 'text-danger' : 'text-accent'}`}>
                {result.probability} Risk
              </span>
            </div>
            <div className={`text-2xl font-mono font-bold ${result.isBad ? 'text-danger' : 'text-accent'}`}>{result.score}/100</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs border-b border-white/10 pb-1">
              <span className="text-textMuted">Domain</span>
              <span className="text-white font-mono">{result.domain}</span>
            </div>
            <div className="pt-1">
              <span className="text-xs text-textMuted block mb-1">Threat Analysis</span>
              <p className="text-sm font-mono text-gray-300 leading-tight">
                {result.threat}
              </p>
            </div>
          </div>
        </div>
      )}

      {!result && !isScanning && (
         <div className="flex-1 flex flex-col items-center justify-center text-textMuted border-2 border-dashed border-white/10 rounded-lg mt-2 p-4 text-center">
            <Lock size={24} className="mb-2 opacity-50" />
            <p className="text-xs">Enter a URL to initiate Deep Scan</p>
         </div>
      )}
    </div>
  );
};

export default PhishingScanner;
