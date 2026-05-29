import React from 'react';
import UserRiskTable from '../components/widgets/UserRiskTable';
import DeviceInspector from '../components/widgets/DeviceInspector';

const RiskPage = () => {
  return (
    <div className="flex flex-col gap-6 h-full pb-20 mt-4 md:mt-0">
      <div className="mb-2 shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">User & Device Risk</h1>
        <p className="text-sm text-textMuted">Behavioral anomaly tracking and entity fingerprinting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        <div className="h-full">
           <UserRiskTable />
        </div>
        <div className="h-full">
           <DeviceInspector />
        </div>
      </div>
    </div>
  );
};

export default RiskPage;
