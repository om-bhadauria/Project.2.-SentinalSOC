import React from 'react';
import { DateTime } from 'luxon';

const AlertsPanel = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 italic text-sm">
        No active alerts. System is quiet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto pr-2">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-cyber-900 border-l-4 p-3 rounded shadow-sm relative group flex flex-col gap-2"
          style={{
            borderLeftColor: alert.severity === 'CRITICAL' ? '#ef4444' : 
                             alert.severity === 'HIGH' ? '#f59e0b' : '#0ea5e9'
          }}>
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-sm text-slate-200">{alert.title}</h3>
            <span className="text-xs text-slate-400 shrink-0">
              {DateTime.fromMillis(alert.timestamp).toRelative()}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{alert.description}</p>
          <div className="flex gap-2 text-[10px] text-slate-500 mt-2">
            <span className="bg-cyber-800 px-1.5 py-0.5 rounded">User: {alert.user || 'Unknown'}</span>
            <span className="bg-cyber-800 px-1.5 py-0.5 rounded">Source: {alert.source || 'Unknown'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertsPanel;
