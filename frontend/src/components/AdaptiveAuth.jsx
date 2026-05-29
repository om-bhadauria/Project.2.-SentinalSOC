// frontend/src/components/AdaptiveAuth.jsx
import React, { useState } from 'react';
import { Shield, Lock, User, AlertTriangle, Loader2 } from 'lucide-react';

const AdaptiveAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Real logic state
  const [deviceRecord, setDeviceRecord] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);

  // Results state
  const [riskLevel, setRiskLevel] = useState(null); // 'Low Risk', 'Medium Risk', 'High Risk'
  const [currentDetails, setCurrentDetails] = useState(null);
  const [alerts, setAlerts] = useState([]);

  // Fingerprint generator
  const generateDeviceFingerprint = () => {
    return `${navigator.userAgent}-${window.screen.width}x${window.screen.height}`;
  };

  // Location simulator
  const locations = ['India', 'USA', 'Russia', 'Unknown/Foreign'];
  const getRandomLocation = () => locations[Math.floor(Math.random() * locations.length)];

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Reset previous results
    setRiskLevel(null);
    setCurrentDetails(null);

    // Simulate network delay
    setTimeout(() => {
      let riskScore = 0; // 0-100 scale
      let details = { device: 'Matched', location: '', attempts: 0, score: 0 };

      // 1. Device Fingerprinting
      const currentDevice = generateDeviceFingerprint();
      if (!deviceRecord) {
        setDeviceRecord(currentDevice);
        details.device = 'New (Recorded)';
      } else if (deviceRecord !== currentDevice) {
        riskScore += 70; // Different -> High risk
        details.device = 'Mismatch';
      } else {
        details.device = 'Matched';
      }

      // 2. Location Analysis
      const loc = getRandomLocation();
      details.location = loc;
      if (!lastLocation) {
        setLastLocation(loc);
      } else if (lastLocation !== loc) {
        riskScore += 30; // Location changed -> increase risk
        setLastLocation(loc);
      }
      
      if (loc === 'Unknown/Foreign') {
        riskScore += 40; // Simulated risky location
      }

      // 3. Login Behavior Check
      const now = Date.now();
      // Keep attempts from the last 30 seconds for evaluation
      const recentAttempts = loginHistory.filter(t => now - t < 30000); 
      const newHistory = [...recentAttempts, now];
      setLoginHistory(newHistory);
      details.attempts = newHistory.length;

      if (newHistory.length > 3) {
        riskScore += 70; // >3 attempts in short time -> suspicious (High Risk)
      } else if (newHistory.length > 1) {
        const timeSinceLast = now - newHistory[newHistory.length - 2];
        if (timeSinceLast < 2000) {
          riskScore += 40; // Fast repeated login -> risky (Medium Risk)
        }
      }

      // 4. Final Risk Calculation
      let finalRisk = 'Low Risk';

      if (riskScore >= 70) {
        finalRisk = 'High Risk';
      } else if (riskScore >= 40) {
        finalRisk = 'Medium Risk';
      }

      details.score = riskScore;
      setRiskLevel(finalRisk);
      setCurrentDetails(details);

      // 6. Alert Generation
      if (finalRisk === 'High Risk') {
        const newAlert = {
          id: Date.now(),
          email: email,
          riskLevel: finalRisk,
          timestamp: new Date().toLocaleTimeString(),
          reason: `Dev: ${details.device} | Loc: ${details.location} | Att: ${details.attempts}`
        };
        setAlerts(prev => [newAlert, ...prev]);
      }

      setLoading(false);
    }, 1000); // 1s simulation
  };

  return (
    <div className="bg-darkBg p-6 rounded-xl border border-panel-border max-w-2xl mx-auto mt-10 text-white">
      <div className="flex flex-col items-center mb-8">
        <Shield className="text-accent w-10 h-10 mb-2" />
        <h2 className="text-xl font-bold tracking-wider">Adaptive Authentication Engine</h2>
        <p className="text-sm text-textMuted mt-1">Advanced multi-factor heuristic risk evaluation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Login Form */}
        <div className="glass-panel p-6 rounded-lg border border-panel-border">
          <h3 className="font-semibold text-lg mb-4">Login Attempt</h3>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">Email</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-textMuted" />
                 </div>
                 <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/50 border border-panel-border rounded text-white text-sm focus:outline-none focus:border-accent"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-textMuted" />
                 </div>
                 <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black/50 border border-panel-border rounded text-white text-sm focus:outline-none focus:border-accent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-accent/20 hover:bg-accent/30 text-accent border border-accent/50 py-2 rounded font-semibold text-sm transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Evaluate Login'}
            </button>
          </form>
        </div>

        {/* Right Column: Results & Alerts */}
        <div className="space-y-4">
          
          <div className="glass-panel p-6 rounded-lg border border-panel-border">
             <h3 className="font-semibold text-lg mb-4">Decision Engine Output</h3>
             
             {riskLevel && currentDetails ? (
               <div className="space-y-2">
                 {/* Upgraded Output UI */}
                 <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                    <span className="text-textMuted text-xs font-medium">Device:</span>
                    <span className="font-bold text-xs">{currentDetails.device}</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                    <span className="text-textMuted text-xs font-medium">Location:</span>
                    <span className="font-bold text-xs">{currentDetails.location}</span>
                 </div>
                 <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                    <span className="text-textMuted text-xs font-medium">Recent Attempts:</span>
                    <span className={`font-bold text-xs ${currentDetails.attempts > 3 ? 'text-danger' : 'text-white'}`}>
                      {currentDetails.attempts}
                    </span>
                 </div>
                 <div className="flex justify-between items-center bg-black/30 p-2 rounded mb-3">
                    <span className="text-textMuted text-xs font-medium">Risk Score:</span>
                    <span className={`font-bold text-xs ${currentDetails.score >= 70 ? 'text-danger' : currentDetails.score >= 40 ? 'text-warning' : 'text-accent'}`}>
                      {currentDetails.score}/100
                    </span>
                 </div>

                 <div className="border-t border-panel-border my-2"></div>

                 <div className="flex justify-between items-center p-2">
                    <span className="text-textMuted text-sm font-medium">Final Risk Level:</span>
                    <span className={`font-bold px-3 py-1 rounded text-xs uppercase ${
                      riskLevel === 'Low Risk' ? 'bg-accent/20 text-accent border border-accent/30' : 
                      riskLevel === 'Medium Risk' ? 'bg-warning/20 text-warning border border-warning/30' : 
                      'bg-danger/20 text-danger border border-danger/30'
                    }`}>
                      {riskLevel}
                    </span>
                 </div>
               </div>
             ) : (
                <div className="h-32 flex items-center justify-center">
                  <p className="text-textMuted text-sm italic">Waiting for login attempt...</p>
                </div>
             )}
          </div>

          <div className="glass-panel p-4 rounded-lg border border-panel-border">
             <div className="flex items-center gap-2 mb-3">
               <AlertTriangle className="w-4 h-4 text-danger" />
               <h3 className="font-semibold text-sm">High Risk Alerts ({alerts.length})</h3>
             </div>
             
             <div className="max-h-40 overflow-y-auto space-y-2">
               {alerts.length === 0 ? (
                 <p className="text-textMuted text-xs italic">No high-risk attempts logged yet.</p>
               ) : (
                 alerts.map(alert => (
                   <div key={alert.id} className="bg-danger/10 border-l-2 border-danger p-2 rounded text-xs">
                     <div className="flex justify-between text-textMuted mb-1">
                       <span>Time: {alert.timestamp}</span>
                       <span className="uppercase text-danger font-bold">{alert.riskLevel}</span>
                     </div>
                     <p>Blocked: <span className="text-white font-medium">{alert.email}</span></p>
                     <p className="text-[10px] mt-1 text-danger/70">{alert.reason}</p>
                   </div>
                 ))
               )}
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AdaptiveAuth;
