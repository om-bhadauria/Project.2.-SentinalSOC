import React from 'react';
import LiveAlertsPanel from '../components/widgets/LiveAlertsPanel';
import AttackTimeline from '../components/widgets/AttackTimeline';

const AlertsPage = () => {
  return (
    <div className="flex flex-col gap-6 h-full pb-20 mt-4 md:mt-0">
      <div className="mb-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Global Threat Feed</h1>
        <p className="text-sm text-textMuted">Live stream of all detected security events across the organization.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[500px]">
        <div className="lg:col-span-3 flex flex-col h-full">
           <LiveAlertsPanel />
        </div>
        <div className="lg:col-span-2 flex flex-col h-full">
           <AttackTimeline />
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
