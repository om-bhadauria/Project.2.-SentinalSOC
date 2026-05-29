import React from 'react';
import { Target, Zap } from 'lucide-react';
import { apiFetch } from '../lib/apiClient';

const DemoActions = () => {
  const triggerFailedLogins = async () => {
    // Fire 3 failed logins to trigger correlation rule
    for (let i=0; i<3; i++) {
        await apiFetch('/login', {
            method: 'POST',
            body: JSON.stringify({ email: 'victim@example.com', password: 'wrongpassword' })
        });
    }
  };

  const triggerMaliciousUrl = async () => {
    await apiFetch('/scan/url', {
        method: 'POST',
        body: JSON.stringify({ url: 'http://evil.com/phishing-login' })
    });
  };

  return (
    <div className="bg-cyber-800 border border-cyber-700 rounded-lg p-4 flex flex-col">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-cyber-warn" /> Simulation Console
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Use these buttons to trigger rules in the SentinelSOC backend and populate the live alerts feed.
      </p>
      
      <div className="grid grid-cols-1 gap-3 mt-auto">
        <button 
          onClick={triggerFailedLogins}
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 transition-colors text-white py-2 px-4 rounded text-sm font-medium"
        >
          <Target className="w-4 h-4 text-cyber-warn" /> Simulate Brute Force (Logins)
        </button>
        
        <button 
          onClick={triggerMaliciousUrl}
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 transition-colors text-white py-2 px-4 rounded text-sm font-medium"
        >
          <Target className="w-4 h-4 text-cyber-warn" /> Simulate Phishing Click
        </button>
      </div>
    </div>
  );
};

export default DemoActions;
