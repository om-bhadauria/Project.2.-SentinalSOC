import React from 'react';
import useStore from '../../store/useStore';
import { Layers, ShieldCheck, AlertTriangle, ArrowUpRight } from 'lucide-react';

const IncidentDashboard = () => {
  const incidents = useStore(state => state.incidents);
  const resolveIncident = useStore(state => state.resolveIncident);
  const escalateIncident = useStore(state => state.escalateIncident);

  const activeIncidents = incidents.filter(inc => inc.status === 'active');

  return (
    <div className="glass-panel p-5 flex flex-col h-full col-span-1 border-warning/30 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
          <Layers size={20} className="text-warning" />
          Active Incidents
        </h2>
        <span className="bg-warning/20 text-warning border border-warning/40 px-2 py-0.5 rounded text-xs font-bold">
          {activeIncidents.length} Multi-Stage
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar" role="feed" aria-label="Active Incidents Feed">
        {activeIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-textMuted gap-2">
            <ShieldCheck size={32} className="text-accent/50" aria-hidden="true" />
            <p className="text-sm">No correlated incidents.</p>
          </div>
        ) : (
          activeIncidents.map((incident, idx) => (
            <div 
              key={incident.id} 
              tabIndex={0}
              aria-label={`Incident ${incident.id}: ${incident.title}`}
              className={`p-4 rounded-lg border bg-black/40 animate-slide-in focus:outline-none focus:ring-2 focus:ring-accent
                ${incident.severity === 'critical' ? 'border-danger/50 shadow-[0_0_15px_rgba(255,77,77,0.1)]' : 
                  incident.severity === 'high' ? 'border-[#ff4d4d]/50' : 
                  'border-warning/50'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-white">
                    {incident.id}
                  </span>
                  {incident.severity === 'critical' && <AlertTriangle size={14} className="text-danger animate-pulse" />}
                </div>
                <span className="text-[10px] text-textMuted uppercase tracking-wider">{new Date(incident.timestamp).toLocaleTimeString()}</span>
              </div>
              
              <h3 className="font-semibold text-sm text-white mb-1">{incident.title}</h3>
              <p className="text-xs text-textMuted mb-3">
                 Target: <span className="font-mono text-gray-300">{incident.targetUser}</span> on <span className="font-mono text-gray-400">{incident.system}</span>
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                 <span className="text-xs text-gray-400">Related Alerts:</span>
                 <div className="flex gap-1 overflow-hidden">
                    {incident.relatedAlerts.slice(0, 3).map((aid, i) => (
                       <span key={i} className="w-2 h-4 bg-danger/50 rounded-sm inline-block" title={`Alert ID: ${aid}`}></span>
                    ))}
                    {incident.relatedAlerts.length > 3 && <span className="text-[10px] text-gray-500">+{incident.relatedAlerts.length - 3}</span>}
                 </div>
              </div>

              {incident.tactics && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {incident.tactics.map((tactic) => (
                    <span key={tactic} className="rounded border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {tactic}
                    </span>
                  ))}
                </div>
              )}

              {incident.nextBestAction && (
                <div className="mb-3 rounded-md border border-white/10 bg-white/[0.03] p-2">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-textMuted">Next best action</p>
                  <p className="text-xs leading-5 text-gray-300">{incident.nextBestAction}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                <div className="text-xs text-gray-400">
                   Assignee: <span className="text-white">{incident.assignedTo}</span>
                </div>
                <div className="flex gap-2">
                   {incident.severity !== 'critical' && (
                     <button 
                       onClick={() => escalateIncident(incident.id)}
                       className="text-[10px] font-semibold text-danger hover:text-red-400 transition-colors uppercase flex items-center gap-1 focus:outline-none"
                     >
                       Escalate <ArrowUpRight size={12}/>
                     </button>
                   )}
                   <button 
                     onClick={() => resolveIncident(incident.id)}
                     className="text-[10px] font-semibold text-accent hover:text-white transition-colors uppercase focus:outline-none"
                   >
                     Resolve
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IncidentDashboard;
