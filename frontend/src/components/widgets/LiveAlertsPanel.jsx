import React, { useState } from 'react';
import useStore from '../../store/useStore';
import { AlertCircle, ShieldCheck, X } from 'lucide-react';

const LiveAlertsPanel = () => {
  const alerts = useStore(state => state.alerts);
  const mitigateAlert = useStore(state => state.mitigateAlert);
  const settings = useStore(state => state.settings);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Filter out resolved alerts AND hide severities disabled in settings
  const activeAlerts = alerts
      .filter(a => !a.resolved)
      .filter(a => settings.severityFilters[a.severity] !== false);

  return (
    <div className="glass-panel p-5 flex flex-col h-full col-span-1 border-danger/30 xl:col-span-1 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-danger/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
          <AlertCircle size={20} className="text-danger" />
          Live Threat Alerts
        </h2>
        <span className="bg-danger/20 text-danger border border-danger/40 px-2 py-0.5 rounded text-xs font-bold animate-pulse">
          {activeAlerts.length} Detected
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar" role="log" aria-live="polite" aria-label="Live Threat Alerts Feed">
        {activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-textMuted gap-2">
            <ShieldCheck size={32} className="text-accent/50" aria-hidden="true" />
            <p className="text-sm">No active threats detected.</p>
          </div>
        ) : (
          activeAlerts.map((alert, idx) => (
            <div 
              key={alert.id} 
              tabIndex={0}
              onClick={() => setSelectedAlert(alert)}
              aria-label={`${alert.severity} alert: ${alert.title} affecting ${alert.targetUser}`}
              className={`p-3 rounded-lg border-l-4 bg-black/40 border-y border-r border-[#ffffff10] animate-slide-in focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer hover:bg-white/5
                ${alert.severity === 'critical' ? 'border-l-danger bg-danger/5' : 
                  alert.severity === 'high' ? 'border-l-[#ff4d4d]' : 
                  alert.severity === 'medium' ? 'border-l-warning' : 'border-l-accent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-sm text-white">{alert.title}</h3>
                <span className="text-[10px] text-textMuted uppercase tracking-wider">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-textMuted mb-2">Affected: <span className="text-gray-300 font-mono">{alert.targetUser}</span> on <span className="font-mono text-gray-400">{alert.system}</span></p>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <span className="text-xs bg-black/50 px-2 py-1 rounded text-gray-400">
                  {alert.source}
                </span>
                <button 
                   className="text-[10px] font-semibold text-accent hover:text-white transition-colors uppercase focus:outline-none focus:underline"
                   aria-label={`Action: ${alert.recommendedResponse}`}
                   onClick={(e) => { e.stopPropagation(); mitigateAlert(alert.id); }}
                >
                  {alert.recommendedResponse}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedAlert(null)}>
              <div className="bg-darkBg border border-white/10 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-in" onClick={e => e.stopPropagation()}>
                  <div className={`p-4 border-b border-white/10 flex justify-between items-center ${
                      selectedAlert.severity === 'critical' ? 'bg-danger/10' : 
                      selectedAlert.severity === 'high' ? 'bg-[#ff4d4d]/10' : 'bg-warning/10'
                  }`}>
                      <h3 className="font-bold text-lg text-white font-mono flex items-center gap-2">
                          <AlertCircle size={20} className={selectedAlert.severity === 'critical' ? 'text-danger' : 'text-warning'} />
                          {selectedAlert.id}
                      </h3>
                      <button onClick={() => setSelectedAlert(null)} className="text-textMuted hover:text-white"><X size={20} /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div>
                          <p className="text-xs text-textMuted uppercase tracking-wider mb-1">Threat Type</p>
                          <p className="text-lg font-semibold text-white">{selectedAlert.title}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black/40 p-3 rounded border border-white/5">
                              <p className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Target Account</p>
                              <p className="font-mono text-sm text-gray-200">{selectedAlert.targetUser}</p>
                          </div>
                          <div className="bg-black/40 p-3 rounded border border-white/5">
                              <p className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Target System</p>
                              <p className="font-mono text-sm text-gray-200">{selectedAlert.system}</p>
                          </div>
                          <div className="bg-black/40 p-3 rounded border border-white/5 col-span-2">
                              <p className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Source Origin</p>
                              <p className="font-mono text-sm text-danger">{selectedAlert.source}</p>
                          </div>
                          {selectedAlert.description && (
                            <div className="bg-black/40 p-3 rounded border border-white/5 col-span-2">
                                <p className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Payload Analysis</p>
                                <p className="font-mono text-xs text-warning">{selectedAlert.description}</p>
                            </div>
                          )}
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
                          <button onClick={() => setSelectedAlert(null)} className="px-4 py-2 rounded text-sm font-semibold text-textMuted hover:text-white transition-colors">Cancel</button>
                          <button onClick={() => { mitigateAlert(selectedAlert.id); setSelectedAlert(null); }} className="px-4 py-2 rounded text-sm font-bold bg-accent text-darkBg hover:bg-accent/80 transition-colors shadow-[0_0_10px_rgba(0,255,170,0.3)]">
                              Execute: {selectedAlert.recommendedResponse}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default LiveAlertsPanel;
