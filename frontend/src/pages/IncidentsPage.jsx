import React from 'react';
import IncidentDashboard from '../components/widgets/IncidentDashboard';

const IncidentsPage = () => {
  return (
    <div className="flex flex-col gap-6 h-full pb-20 mt-4 md:mt-0">
      <div className="mb-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Incident Management</h1>
        <p className="text-sm text-textMuted">Correlated alerts and complex multi-stage attacks requiring analyst response.</p>
      </div>

      <div className="flex-1 min-h-[600px]">
        <IncidentDashboard />
      </div>
    </div>
  );
};

export default IncidentsPage;
