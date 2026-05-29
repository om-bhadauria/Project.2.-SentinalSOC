import React, { useMemo } from 'react';
import useStore from '../../store/useStore';
import { Fingerprint, Cpu, HardDrive, Network, Globe } from 'lucide-react';

const DeviceInspector = () => {
  const alerts = useStore(state => state.alerts);

  const deviceData = useMemo(() => {
    if (alerts.length === 0) {
       return {
         system: 'STANDBY',
         ip: '0.0.0.0',
         os: 'Unknown',
         browser: 'Unknown',
         confidence: 0,
         hash: '-----'
       };
    }
    
    // Grab the most recent active alert
    const activeAlerts = alerts.filter(a => !a.resolved);
    const target = activeAlerts.length > 0 ? activeAlerts[0] : alerts[0];
    
    // Hash generator based on system string length
    const hash = crypto.randomUUID().split('-')[0] + '...';
    
    // Confidence based on severity
    let confidence = 40;
    if (target.severity === 'critical') confidence = 95;
    if (target.severity === 'high') confidence = 85;
    if (target.severity === 'medium') confidence = 65;

    return {
       system: target.system,
       ip: target.source || 'Unknown',
       os: target.system.includes('SRV') ? 'Windows Server 2022' : 'Windows 11 (10.0.22621)',
       browser: target.system.includes('SRV') ? 'Background Service' : 'Chrome 120.0',
       confidence: confidence,
       hash: hash
    };
  }, [alerts]);

  return (
    <div className="glass-panel p-5 flex flex-col h-full bg-darkBg/50 relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 opacity-5">
        <Fingerprint size={180} />
      </div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2 text-white">
          <Fingerprint size={20} className="text-purple-400" />
          Device Sandbox Inspector
        </h2>
        <span className="text-xs font-mono bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30">FP: {deviceData.hash}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
        <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
          <div className="flex items-center gap-2 text-textMuted text-xs uppercase tracking-wider">
            <Cpu size={14} /> OS / System
          </div>
          <div className="text-sm font-semibold text-gray-200 truncate">{deviceData.system}</div>
        </div>
        <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
          <div className="flex items-center gap-2 text-textMuted text-xs uppercase tracking-wider">
            <Globe size={14} /> Profile
          </div>
          <div className="text-sm font-semibold text-gray-200 truncate">{deviceData.os}</div>
        </div>
        <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
          <div className="flex items-center gap-2 text-textMuted text-xs uppercase tracking-wider">
            <Network size={14} /> Origin IP
          </div>
          <div className="text-sm font-semibold text-gray-200 font-mono text-danger">{deviceData.ip}</div>
        </div>
        <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex flex-col gap-1">
          <div className="flex items-center gap-2 text-textMuted text-xs uppercase tracking-wider">
            <HardDrive size={14} /> Fingerprint
          </div>
          <div className="text-sm font-semibold text-gray-200 font-mono truncate">{deviceData.hash}</div>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="flex items-center justify-between text-xs text-textMuted mb-1">
          <span>Anomaly Confidence</span>
          <span className={`${deviceData.confidence > 75 ? 'text-danger' : 'text-warning'} font-bold text-sm`}>{deviceData.confidence}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className={`${deviceData.confidence > 75 ? 'bg-danger' : 'bg-warning'} h-2 rounded-full transition-all duration-500`} style={{ width: `${deviceData.confidence}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default DeviceInspector;
