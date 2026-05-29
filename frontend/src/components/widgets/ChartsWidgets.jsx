import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, ShieldAlert } from 'lucide-react';

import useStore from '../../store/useStore';

const COLORS = ['#ff4d4d', '#ffaa00', '#00ffcc', '#8b949e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-darkBg/90 border border-panel-border p-3 rounded-lg shadow-lg backdrop-blur-md">
        <p className="font-mono text-xs text-textMuted mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((p, idx) => (
            <p key={idx} className="text-sm font-semibold flex items-center justify-between gap-4">
              <span style={{ color: p.color }}>{p.name}:</span>
              <span className="text-white">{p.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ActivityChart = () => {
  const events = useStore(state => state.events);

  // Bucket the last N events or just create a mock rolling history appended with new events
  const chartData = useMemo(() => {
    // If we have no events, show flatline
    if (events.length === 0) {
      return Array.from({length: 7}).map((_, i) => ({ time: `T-${6-i}`, attempts: 0, blocked: 0 }));
    }
    
    const buckets = Array.from({length: 7}).map((_, i) => ({
      time: `T-${6-i}`,
      attempts: 0,
      blocked: 0
    }));

    events.slice(0, 42).forEach((event, index) => {
      const bucketIndex = Math.max(0, 6 - Math.floor(index / 6));
      buckets[bucketIndex].attempts += event.severity === 'critical' ? 4 : event.severity === 'high' ? 3 : 2;
      if (['ip_blocked', 'credential_stuffing', 'phishing_attempt'].includes(event.type)) {
        buckets[bucketIndex].blocked += event.severity === 'critical' ? 2 : 1;
      }
    });

    return buckets;
  }, [events]);

  return (
    <div className="glass-panel p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
          <Activity size={20} className="text-accent" />
          Attack Attempts Over Time
        </h2>
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff4d4d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ff4d4d" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ffcc" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#00ffcc" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="attempts" stroke="#ff4d4d" fillOpacity={1} fill="url(#colorAttempts)" name="Total Attempts" strokeWidth={2} />
            <Area type="monotone" dataKey="blocked" stroke="#00ffcc" fillOpacity={1} fill="url(#colorBlocked)" name="Blocked" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const SeverityChart = () => {
  const alerts = useStore(state => state.alerts);

  const severityData = useMemo(() => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    alerts.forEach(a => {
      const cat = a.severity.charAt(0).toUpperCase() + a.severity.slice(1);
      if (counts[cat] !== undefined) counts[cat]++;
    });
    return [
      { name: 'Critical', value: counts.Critical },
      { name: 'High', value: counts.High },
      { name: 'Medium', value: counts.Medium },
      { name: 'Low', value: counts.Low }
    ];
  }, [alerts]);

  return (
     <div className="glass-panel p-5 flex flex-col h-full">
       <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold tracking-wide flex items-center gap-2">
          <ShieldAlert size={20} className="text-warning" />
          Incident Severity Distribution
        </h2>
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={severityData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
            <XAxis type="number" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} hide />
            <YAxis dataKey="name" type="category" stroke="#8b949e" fontSize={12} tickLine={false} axisLine={false} width={70} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
               {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
     </div>
  );
}
