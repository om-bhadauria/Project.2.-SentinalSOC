import React from 'react';
import useStore from '../../store/useStore';
import { ClipboardList, UserCheck } from 'lucide-react';

const ReviewQueuePanel = () => {
  const reviewQueue = useStore(state => state.reviewQueue);
  const requireMfa = useStore(state => state.requireMfa);

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden border-warning/20 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-wide text-white">
            <ClipboardList size={20} className="text-warning" />
            Review Queue
          </h2>
          <p className="mt-1 text-xs text-textMuted">Accounts flagged by thresholds</p>
        </div>
        <span className="rounded-md border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-bold text-warning">
          {reviewQueue.length} pending
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
        {reviewQueue.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-textMuted">
            <UserCheck size={30} className="text-accent/60" />
            <p className="text-sm">No users waiting for review.</p>
          </div>
        ) : (
          reviewQueue.map((item) => (
            <div key={item.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm font-semibold text-white">{item.user}</p>
                  <p className="mt-1 text-xs text-textMuted">{item.reason}</p>
                </div>
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${item.score > 85 ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                  {item.score}
                </span>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {item.signals.map((signal) => (
                  <span key={signal} className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-gray-300">
                    {signal}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-textMuted">{item.status}</span>
                <button
                  onClick={() => requireMfa(item.user)}
                  className="rounded-md border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-accent hover:text-darkBg"
                >
                  Enforce MFA
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewQueuePanel;
