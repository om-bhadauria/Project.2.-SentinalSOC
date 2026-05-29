import React, { useMemo } from 'react';
import useStore from '../../store/useStore';
import { Users, AlertOctagon, TrendingUp, ShieldAlert, ShieldCheck } from 'lucide-react';

const UserRiskTable = () => {
  const userRisks = useStore(state => state.userRisks);
  
  const activeUsers = useMemo(() => {
    // If no dynamic user risks, show empty list to reflect real data state
    return [...userRisks].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  }, [userRisks]);

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
          <Users size={20} className="text-warning" />
          User Risk Scoring
        </h2>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-textMuted gap-2">
            <ShieldCheck size={32} className="text-accent/50" />
            <p className="text-sm">No anomalous user activity detected.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[400px]">
            <thead>
              <tr className="text-[10px] text-textMuted tracking-wider uppercase border-b border-white/10">
                <th className="pb-2 font-medium">User / Account</th>
                <th className="pb-2 font-medium">Risk Score</th>
                <th className="pb-2 font-medium text-right">Rapid Action</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((u) => (
                <tr key={u.user} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-2 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-white font-mono">{u.user}</span>
                      <span className="text-[10px] text-textMuted">Last seen: {new Date(u.lastActivity).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-700 rounded-full h-1.5 max-w-[80px]">
                        <div 
                          className={`h-1.5 rounded-full ${u.riskScore > 75 ? 'bg-danger' : u.riskScore > 50 ? 'bg-warning' : 'bg-accent'}`} 
                          style={{ width: `${u.riskScore}%` }}
                        ></div>
                      </div>
                      <span className={`font-mono text-xs font-bold ${u.riskScore > 75 ? 'text-danger' : u.riskScore > 50 ? 'text-warning' : 'text-accent'}`}>
                         {u.riskScore}
                      </span>
                      {u.riskScore > 50 && <TrendingUp size={14} className="text-danger" />}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right">
                    <RequireMFAButton user={u.user} score={u.riskScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Extracted button for clean state management if needed
const RequireMFAButton = ({ user, score }) => {
   const requireMfa = useStore(state => state.requireMfa);
   
   return (
     <button 
       onClick={() => requireMfa(user)}
       className="text-xs bg-black/40 border border-white/10 hover:border-accent hover:text-accent px-3 py-1.5 rounded transition-all uppercase font-semibold text-textMuted inline-flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-accent ml-auto"
     >
       {score > 75 ? <><ShieldAlert size={14}/> Reset MFA</> : 'Verify'}
     </button>
   );
}

export default UserRiskTable;
