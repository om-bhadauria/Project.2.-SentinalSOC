import React from 'react';
import useStore from '../../store/useStore';
import { Activity, CircleDashed, Terminal } from 'lucide-react';

const AttackTimeline = () => {
  const timelineEvents = useStore(state => state.timelineEvents);
  const simulationActive = useStore(state => state.simulationActive);

  return (
    <div className="glass-panel p-5 flex flex-col h-full xl:col-span-1 border-accent/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
          <Activity size={20} className="text-accent" />
          Real-time Timeline
        </h2>
        {simulationActive && (
          <span className="flex items-center gap-1 text-xs text-danger font-mono animate-pulse">
            <span className="w-2 h-2 rounded-full bg-danger"></span> RECORDING...
          </span>
        )}
      </div>

      <div className="relative flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Timeline connecting line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-panel-border/50"></div>

        {simulationActive && timelineEvents.length > 0 && (
          <div className="relative pl-10 mb-6 group">
            <div className="absolute left-0 w-8 h-8 rounded-full bg-darkBg border-2 border-dashed border-danger flex items-center justify-center animate-spin">
              <CircleDashed size={14} className="text-danger" />
            </div>
            <div className="bg-danger/10 border border-danger/30 rounded-lg p-3">
              <p className="text-xs text-danger font-mono animate-pulse font-semibold">ANALYZING ANOMALY VECTOR...</p>
            </div>
          </div>
        )}

        <div className="space-y-6" role="feed" aria-label="Attack Event Timeline" aria-busy={simulationActive}>
          {timelineEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-textMuted gap-2">
               <Terminal size={32} className="text-accent/30" aria-hidden="true" />
               <p className="text-sm font-mono">Awaiting events...</p>
            </div>
          ) : (
            timelineEvents.map((event, idx) => (
              <div 
                 key={event.id} 
                 className="relative pl-10 animate-slide-in focus:outline-none focus:ring-2 focus:ring-accent rounded-lg" 
                 style={{ animationDelay: `${idx * 100}ms` }}
                 tabIndex={0}
                 aria-label={`Timeline Event: ${event.type} at ${new Date(event.timestamp).toLocaleTimeString()}`}
              >
                <div className={`absolute left-0 w-8 h-8 rounded-full bg-darkBg border-2 flex items-center justify-center
                  ${event.severity === 'critical' ? 'border-danger' : 
                    event.severity === 'high' ? 'border-[#ff4d4d]' :
                    event.severity === 'medium' ? 'border-warning' : 'border-accent'}`}
                  aria-hidden="true"
                >
                  <div className={`w-3 h-3 rounded-full 
                    ${event.severity === 'critical' ? 'bg-danger animate-ping' : 
                      event.severity === 'high' ? 'bg-[#ff4d4d]' :
                      event.severity === 'medium' ? 'bg-warning' : 'bg-accent'}`}>
                  </div>
                </div>
                
                <div className="bg-panel border border-[#ffffff10] rounded-lg p-3 hover:bg-white/5 transition-colors cursor-default group">
                   <div className="flex justify-between items-center mb-1">
                     <h4 className={`text-sm font-semibold uppercase ${event.severity === 'critical' ? 'text-danger' : 'text-white'}`}>
                        {event.type.replace(/_/g, ' ')}
                     </h4>
                     <span className="text-[10px] text-gray-500 font-mono" aria-label="Timestamp">{new Date(event.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                   </div>
                   <p className="text-xs text-gray-400 font-mono mt-2">{event.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AttackTimeline;
