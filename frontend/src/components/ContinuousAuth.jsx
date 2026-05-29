import React, { useState, useEffect } from 'react';
import { Fingerprint, ShieldAlert, ShieldCheck, AlertOctagon } from 'lucide-react';

const ContinuousAuth = () => {
  const [riskScore, setRiskScore] = useState(10);
  const [sessionStatus, setSessionStatus] = useState('Secure');

  useEffect(() => {
    // Start session and begin behavior evaluation on load
    const interval = setInterval(() => {
      setRiskScore(prev => {
        // Halt if session is already terminated
        if (prev >= 80) return prev; 
        
        // Randomly simulate behavior changes (mostly stable, occasionally spikes)
        const randomChange = Math.random() > 0.8 ? (Math.floor(Math.random() * 20) + 5) : Math.floor(Math.random() * 5) - 3;
        const newScore = Math.min(100, Math.max(0, prev + randomChange));
        
        if (newScore >= 80) {
          setSessionStatus('Terminated');
        } else if (newScore >= 50) {
          setSessionStatus('Warning');
        } else {
          setSessionStatus('Secure');
        }
        
        return newScore;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const resetSession = () => {
    setRiskScore(10);
    setSessionStatus('Secure');
  };

  return (
    <div className="bg-darkBg p-6 rounded-xl border border-panel-border max-w-4xl mx-auto mt-10 text-white relative">
      <div className="flex flex-col items-center mb-8">
        <Fingerprint className={`w-12 h-12 mb-3 ${sessionStatus === 'Terminated' ? 'text-danger' : sessionStatus === 'Warning' ? 'text-warning' : 'text-accent'}`} />
        <h2 className="text-2xl font-bold tracking-wider mb-2">Continuous Authentication Active</h2>
        <p className="text-sm text-textMuted text-center min-h-[20px]">
          {sessionStatus === 'Terminated' ? 'Session compromised.' : 'Session monitoring initialized.'}
        </p>
      </div>

      {sessionStatus === 'Terminated' && (
        <div className="bg-danger/10 border-l-4 border-danger p-4 mb-8 rounded shadow-sm flex items-center gap-4 animate-pulse">
          <AlertOctagon className="w-8 h-8 text-danger flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-danger">High Risk Detected</h3>
            <p className="text-sm text-danger/80">Anomaly threshold exceeded. Simulating logout procedures.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-lg border border-panel-border flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-textMuted uppercase mb-6 tracking-widest">Risk Score</h3>
          <div className="relative flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-panel-border/30" />
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray="439.8"
                strokeDashoffset={439.8 - (439.8 * riskScore) / 100}
                className={`transition-all duration-1000 ease-out ${
                  riskScore >= 80 ? 'text-danger' : riskScore >= 50 ? 'text-warning' : 'text-accent'
                }`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{riskScore}%</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-lg border border-panel-border flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-textMuted uppercase mb-6 tracking-widest">Session Status</h3>
          <div className="flex items-center gap-4 mb-8">
            {sessionStatus === 'Secure' && <ShieldCheck className="text-accent w-10 h-10" />}
            {sessionStatus === 'Warning' && <ShieldAlert className="text-warning w-10 h-10" />}
            {sessionStatus === 'Terminated' && <AlertOctagon className="text-danger w-10 h-10" />}
            
            <span className={`text-3xl font-bold uppercase tracking-wider ${
              sessionStatus === 'Secure' ? 'text-accent' : 
              sessionStatus === 'Warning' ? 'text-warning' : 
              'text-danger'
            }`}>{sessionStatus}</span>
          </div>

          <p className="text-sm text-textMuted mb-6 flex-grow">
            {sessionStatus === 'Secure' ? 'Behavior matches baseline. No anomalies detected in current session.' : 
             sessionStatus === 'Warning' ? 'Anomalous behavior detected. Monitoring closely for further risks.' : 
             'Risk score critical. Session forcefully terminated due to continuous auth failure.'}
          </p>

          <button 
             onClick={sessionStatus === 'Terminated' ? resetSession : undefined}
             disabled={sessionStatus !== 'Terminated'}
             className={`w-full text-center px-4 py-3 rounded text-sm font-bold transition-all border ${
               sessionStatus === 'Terminated' 
                 ? 'bg-panel-border/30 hover:bg-panel-border text-white border-panel-border' 
                 : 'bg-black/20 text-textMuted border-panel-border/50 cursor-not-allowed'
             }`}
          >
            {sessionStatus === 'Terminated' ? 'Reset Simulation' : 'Active Logging...'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContinuousAuth;
