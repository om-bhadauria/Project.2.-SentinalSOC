import React, { useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { Users } from 'lucide-react';

export default function RiskScoreDashboard() {
  const { incidents } = useSocket();

  const userRisks = useMemo(() => {
    const risks = {};
    incidents.forEach(inc => {
       const u = inc.user || 'Unknown';
       if (!risks[u]) risks[u] = 0;
       risks[u] += inc.score * 10;
    });
    
    const calculatedRisks = Object.entries(risks)
       .map(([user, rawScore]) => ({
           user, 
           score: Math.min(Math.round(rawScore + 10), 100)
       }))
       .sort((a,b) => b.score - a.score)
       .slice(0, 5);

    // If no data, return default mocked for display purposes until data flows
    if (calculatedRisks.length === 0) {
        return [
            { user: 'alice', score: 92 },
            { user: 'bob', score: 65 },
            { user: 'charlie', score: 12 }
        ];
    }
    return calculatedRisks;
  }, [incidents]);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl p-5">
      <h3 className="font-bold text-white mb-4 text-sm flex items-center border-b border-slate-800 pb-3">
          <Users className="w-4 h-4 mr-2 text-purple-400" /> Dynamic Risk Score Dashboard
      </h3>
      <div className="space-y-3 mt-4">
          {userRisks.map((ur, i) => {
             let color = 'bg-emerald-400';
             let text = 'text-emerald-400';
             if (ur.score > 70) { color = 'bg-red-400'; text = 'text-red-400'; }
             else if (ur.score > 40) { color = 'bg-orange-400'; text = 'text-orange-400'; }

             return (
                 <div key={ur.user + i} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800/50 hover:bg-slate-800 hover:border-slate-700 transition-colors">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ur.user}`} alt="user" className="w-full h-full" />
                         </div>
                         <div>
                             <p className="text-xs font-bold text-white capitalize">{ur.user}</p>
                             <p className="text-[10px] text-slate-500">Live Assessment</p>
                         </div>
                     </div>
                     <div className="text-right">
                         <p className={`text-xs font-bold ${text}`}>{ur.score}%</p>
                         <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${ur.score}%` }}></div>
                         </div>
                     </div>
                 </div>
             )
          })}
      </div>
    </div>
  );
}
