import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Alerts = ({ alerts }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Global Threat Feed</h1>
        <p className="text-sm text-textMuted">Live stream of all detected security events across the organization.</p>
      </div>

      <div className="flex-1 glass-panel border border-panel-border rounded-lg p-6 min-h-[500px]">
        {alerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-textMuted italic">
            No active alerts. System is quiet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {alerts.map(alert => (
              <div key={alert.id} className="bg-darkBg border-l-4 border-l-danger border border-panel-border p-4 rounded shadow-sm relative group flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-danger w-5 h-5 shrink-0" />
                    <h3 className="font-semibold text-white">Malicious URL Detected</h3>
                  </div>
                  <span className="text-xs text-textMuted shrink-0">
                    {alert.time}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-textMuted mr-2">Target URL:</span>
                    <span className="text-white break-all">{alert.url}</span>
                  </div>
                  <div>
                    <span className="text-textMuted mr-2">Status:</span>
                    <span className="text-danger font-bold uppercase">{alert.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
