// frontend/src/components/BehaviorMonitor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Activity, MousePointerClick, UserX, AlertOctagon, RefreshCw } from 'lucide-react';
import useStore from '../store/useStore';

const BehaviorMonitor = () => {
  // Stats
  const [totalClicks, setTotalClicks] = useState(0);
  const [pageSwitches, setPageSwitches] = useState(0);
  const [timeBetweenClicks, setTimeBetweenClicks] = useState(0);
  const [activitySpeed, setActivitySpeed] = useState('0.0 c/s');
  
  // Status
  const [status, setStatus] = useState('Normal'); // 'Normal', 'Suspicious', 'Dangerous'
  
  // Tracking state
  const [clickTimestamps, setClickTimestamps] = useState([]);
  const [pageSwitchTimestamps, setPageSwitchTimestamps] = useState([]);
  const addNotification = useStore(state => state.addNotification);
  const [localAlerts, setLocalAlerts] = useState([]);

  // Continuously update activity speed
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setClickTimestamps(prev => {
        const recent = prev.filter(t => now - t < 5000); // look at last 5 seconds
        const speed = (recent.length / 5).toFixed(1);
        setActivitySpeed(`${speed} c/s`);
        return recent;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalClick = useCallback(() => {
    const now = Date.now();
    setTotalClicks(prev => prev + 1);
    
    setClickTimestamps(prev => {
      if (prev.length > 0) {
        setTimeBetweenClicks(now - prev[prev.length - 1]);
      }
      
      const newClicks = [...prev, now];
      const recentIn3s = newClicks.filter(t => now - t < 3000);
      
      // If >5 clicks in 3 seconds -> suspicious
      if (recentIn3s.length > 10) {
        setStatus('Dangerous');
        recordAlert('Dangerous: Extreme click rate');
      } else if (recentIn3s.length > 5 && status !== 'Dangerous') {
         setStatus('Suspicious');
         recordAlert('Suspicious: >5 Clicks in 3s');
      }
      
      return newClicks;
    });
  }, [status]);

  const handlePageSwitch = (e) => {
    e.stopPropagation();
    const now = Date.now();
    setPageSwitches(prev => prev + 1);
    
    setPageSwitchTimestamps(prev => {
      const recent = [...prev, now].filter(t => now - t < 10000); // 10s window
      if (recent.length > 4) {
        setStatus('Dangerous');
        recordAlert('Dangerous: Abnormal Page Switches');
      } else if (recent.length > 2 && status !== 'Dangerous') {
        setStatus('Suspicious');
        recordAlert('Suspicious: Rapid Page Switching');
      }
      return recent;
    });
  };

  const handleRepeatedAction = (e) => {
    e.stopPropagation();
    setStatus('Dangerous');
    recordAlert('Dangerous: Repeated automated actions detected');
  };

  const recordAlert = (reason) => {
    const newAlert = {
      id: Date.now() + Math.random(),
      reason,
      time: new Date().toLocaleTimeString()
    };
    setLocalAlerts(prev => [newAlert, ...prev]);
    
    addNotification({
       message: `Behavior Anomaly: ${reason}`,
       type: 'high'
    });
  };

  const resetSimulation = () => {
    setTotalClicks(0);
    setPageSwitches(0);
    setTimeBetweenClicks(0);
    setActivitySpeed('0.0 c/s');
    setStatus('Normal');
    setClickTimestamps([]);
    setPageSwitchTimestamps([]);
    setLocalAlerts([]);
  };

  return (
    <div className="bg-darkBg p-6 rounded-xl border border-panel-border max-w-4xl mx-auto mt-10 text-white" onClick={handleGlobalClick}>
      <div className="flex flex-col items-center mb-8">
        <Activity className="text-blue-400 w-10 h-10 mb-2" />
        <h2 className="text-xl font-bold tracking-wider">Behavior Monitoring Demo</h2>
        <p className="text-sm text-textMuted mt-1">Real-time user action tracking & anomaly detection</p>
        <p className="text-xs text-textMuted mt-2 italic bg-black/50 px-3 py-1 rounded">Click anywhere inside this panel to simulate user activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="glass-panel p-4 rounded-lg flex flex-col items-center justify-center text-center border border-panel-border">
            <MousePointerClick className="text-textMuted mb-2 w-6 h-6" />
            <h3 className="text-2xl font-bold">{totalClicks}</h3>
            <span className="text-xs text-textMuted uppercase tracking-wider">Total Clicks</span>
         </div>
         <div className="glass-panel p-4 rounded-lg flex flex-col items-center justify-center text-center border border-panel-border">
            <Activity className="text-blue-400 mb-2 w-6 h-6" />
            <h3 className="text-2xl font-bold text-white">{activitySpeed}</h3>
            <span className="text-xs text-textMuted uppercase tracking-wider">Activity Speed</span>
         </div>
         <div className={`glass-panel p-4 rounded-lg flex flex-col items-center justify-center text-center border ${
            status === 'Normal' ? 'border-accent/50 bg-accent/10' : 
            status === 'Suspicious' ? 'border-warning/50 bg-warning/10' : 
            'border-danger/50 bg-danger/10'
         }`}>
            <h3 className={`text-2xl font-bold uppercase ${
               status === 'Normal' ? 'text-accent' : 
               status === 'Suspicious' ? 'text-warning' : 
               'text-danger'
            }`}>{status}</h3>
            <span className="text-xs text-textMuted uppercase tracking-wider mt-2">Current Status</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Left: Simulation Controls */}
         <div className="glass-panel p-6 rounded-lg border border-panel-border flex flex-col gap-4">
            <h3 className="font-semibold text-lg border-b border-panel-border pb-2">Simulation Controls</h3>
            
            <div className="flex items-center justify-between bg-black/30 p-3 rounded">
               <span className="text-sm">Simulate Page Switch</span>
               <button 
                 onClick={handlePageSwitch}
                 className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 px-3 py-1 rounded text-xs font-semibold"
               >
                 Switch Page
               </button>
            </div>
            
            <div className="flex items-center justify-between bg-black/30 p-3 rounded">
               <span className="text-sm">Simulate Repeated Action</span>
               <button 
                 onClick={handleRepeatedAction}
                 className="bg-warning/20 hover:bg-warning/30 text-warning border border-warning/50 px-3 py-1 rounded text-xs font-semibold"
               >
                 Run Action
               </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-xs text-textMuted border-t border-panel-border pt-4">
               <div className="flex justify-between">
                  <span>Page Switches:</span> 
                  <span className="text-white font-bold">{pageSwitches}</span>
               </div>
               <div className="flex justify-between">
                  <span>Last Click Gap:</span> 
                  <span className="text-white font-bold">{timeBetweenClicks > 0 ? `${timeBetweenClicks}ms` : 'N/A'}</span>
               </div>
            </div>

            <button 
               onClick={(e) => { e.stopPropagation(); resetSimulation(); }}
               className="mt-4 flex items-center justify-center gap-2 text-xs text-textMuted hover:text-white"
            >
               <RefreshCw className="w-3 h-3" /> Reset Metrics
            </button>
         </div>

         {/* Right: Local Event Log */}
         <div className="glass-panel p-6 rounded-lg border border-panel-border flex flex-col h-64">
             <h3 className="font-semibold text-lg border-b border-panel-border pb-2 mb-4">Anomaly Log</h3>
             <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                 {localAlerts.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-textMuted text-sm italic pb-10">
                       No behavioral anomalies detected.
                    </div>
                 ) : (
                    localAlerts.map(alert => (
                       <div key={alert.id} className="bg-warning/10 border-l-2 border-warning p-2 rounded text-xs">
                          <div className="flex justify-between text-textMuted mb-1">
                             <span>{alert.time}</span>
                          </div>
                          <p className="text-warning font-semibold">{alert.reason}</p>
                       </div>
                    ))
                 )}
             </div>
         </div>
      </div>
    </div>
  );
};

export default BehaviorMonitor;
