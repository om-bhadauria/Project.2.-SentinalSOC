import React, { useState } from 'react';
import { ShieldAlert, PlayCircle, Loader2 } from 'lucide-react';
import api from '../lib/apiClient';

export default function CyberAttackSimulator() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const triggerEvent = async (endpoint, payload, actionMessage) => {
    try {
      setStatus(`Executing: ${actionMessage}...`);
      await api.post(endpoint.replace(/^\/api/, ''), payload);
    } catch (e) {
      console.error(e);
      setStatus(`Error: ${actionMessage}`);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setStatus('Initializing simulation...');
    
    await triggerEvent('/api/activity', { userId: 'demo_user', eventType: 'malicious_url_scanned' }, 'Phishing link detected');
    await delay(1200);
    
    await triggerEvent('/api/activity', { userId: 'demo_user', eventType: 'high_risk_device_alert' }, 'Suspicious login detected');
    await delay(1200);
    
    await triggerEvent('/api/activity', { userId: 'demo_user', eventType: 'behavior_anomaly' }, 'Abnormal user activity');
    await delay(1200);
    
    setStatus('Simulation completed! Correlating alerts...');
    setLoading(false);
    setTimeout(() => setStatus(''), 4000);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-red-900/50 shadow-[0_0_20px_rgba(239,68,68,0.1)] p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <h3 className="font-bold text-white mb-4 text-sm flex items-center border-b border-slate-800 pb-3 relative z-10">
          <ShieldAlert className="w-4 h-4 mr-2 text-red-500" /> Cyber Attack Simulator
      </h3>
      <p className="text-xs text-slate-400 mb-4 relative z-10">
         Deploy a coordinated attack sequence to test the threat correlation engine.
      </p>
      <button 
        onClick={handleSimulate}
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 px-4 rounded transition-colors disabled:opacity-50 relative z-10 shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
        {loading ? 'Simulating Attack...' : 'Simulate Attack'}
      </button>
      {status && (
         <div className="mt-4 p-2 bg-slate-950/50 rounded border border-slate-800 text-xs text-center text-slate-300 font-mono relative z-10">
            {status}
         </div>
      )}
    </div>
  );
}
