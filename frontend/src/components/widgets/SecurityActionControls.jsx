import React from 'react';
import useStore from '../../store/useStore';
import { Lock, ShieldOff, ServerOff, CheckCircle, Shield, Workflow } from 'lucide-react';

const SecurityActionControls = () => {
  const requireMfa = useStore(state => state.requireMfa);
  const blockIp = useStore(state => state.blockIp);
  const quarantineDevice = useStore(state => state.quarantineDevice);

  return (
    <div className="glass-panel p-5 flex flex-col h-full bg-darkBg border-accent/20">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
            <Shield size={20} className="text-white" />
            Rapid Response Actions
          </h2>
          <p className="mt-1 text-xs text-textMuted">One-click containment playbooks for the active investigation.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-xs text-accent">
          <Workflow size={16} />
          SOAR-ready
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3 flex-1 content-start sm:grid-cols-2 lg:grid-cols-4">
        <ActionBtn 
          icon={<Lock size={16} />} 
          label="Lock User Account" 
          color="warning" 
          desc="Force logout and restrict access"
          onClick={() => requireMfa('global_target')}
        />
        <ActionBtn 
          icon={<ShieldOff size={16} />} 
          label="Block IP Address" 
          color="danger" 
          desc="Null route external IP at firewall"
          onClick={() => blockIp('192.168.1.xxx')}
        />
        <ActionBtn 
          icon={<ServerOff size={16} />} 
          label="Quarantine Device" 
          color="danger" 
          desc="Isolate host from internal network"
          onClick={() => quarantineDevice('Suspicious_Host')}
        />
        <ActionBtn 
          icon={<CheckCircle size={16} />} 
          label="Clear Data" 
          color="accent" 
          desc="Clear local incident data"
          onClick={() => useStore.getState().clearData()}
        />
      </div>
    </div>
  );
};

const ActionBtn = ({ icon, label, color, desc, onClick }) => {
  const colorClasses = {
    danger: 'text-danger hover:bg-danger hover:border-danger hover:text-white',
    warning: 'text-warning hover:bg-warning hover:border-warning hover:text-darkBg',
    accent: 'text-accent hover:bg-accent hover:border-accent hover:text-darkBg'
  };

  const bgClasses = {
    danger: 'bg-danger/10 border border-danger/20',
    warning: 'bg-warning/10 border border-warning/20',
    accent: 'bg-accent/10 border border-accent/20'
  };

  return (
    <button 
      onClick={onClick}
      className={`p-4 rounded-lg flex flex-col items-start gap-2 text-left transition-all duration-300 hover:-translate-y-0.5 ${bgClasses[color]} ${colorClasses[color]} group`}
    >
      <div className="flex items-center gap-2 font-bold text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-[10px] uppercase font-mono tracking-wider opacity-75 group-hover:opacity-95">
        {desc}
      </span>
    </button>
  );
};

export default SecurityActionControls;
