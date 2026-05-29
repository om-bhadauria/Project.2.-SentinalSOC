import React from 'react';
import useStore from '../../store/useStore';
import { FileClock } from 'lucide-react';

const AuditTrailPanel = () => {
  const auditTrail = useStore(state => state.auditTrail);

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden border-blue-400/20 p-5">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-wide text-white">
          <FileClock size={20} className="text-blue-300" />
          Field Audit Trail
        </h2>
        <p className="mt-1 text-xs text-textMuted">Sensitive product changes and actor context</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
        {auditTrail.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="rounded bg-blue-400/10 px-2 py-0.5 text-[10px] font-bold text-blue-300">{entry.id}</span>
              <span className="text-[10px] text-textMuted">{new Date(entry.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm font-semibold text-white">{entry.entity}</p>
            <p className="mt-1 text-xs text-textMuted">
              <span className="font-mono text-warning">{entry.field}</span> changed by <span className="font-mono text-gray-300">{entry.actor}</span>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded border border-white/10 bg-black/25 p-2">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-textMuted">Before</p>
                <p className="truncate font-mono text-gray-300">{entry.before}</p>
              </div>
              <div className="rounded border border-accent/20 bg-accent/5 p-2">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-accent">After</p>
                <p className="truncate font-mono text-gray-100">{entry.after}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditTrailPanel;
