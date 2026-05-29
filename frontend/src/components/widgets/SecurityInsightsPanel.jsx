import React, { useMemo } from 'react';
import useStore from '../../store/useStore';
import { BrainCircuit, CheckCircle2, Gauge, Network, Target } from 'lucide-react';

const SecurityInsightsPanel = () => {
  const alerts = useStore(state => state.alerts);
  const incidents = useStore(state => state.incidents);
  const userRisks = useStore(state => state.userRisks);

  const insights = useMemo(() => {
    const activeAlerts = alerts.filter(alert => !alert.resolved);
    const critical = activeAlerts.filter(alert => alert.severity === 'critical').length;
    const highRiskUsers = userRisks.filter(user => user.riskScore >= 70).length;
    const activeIncidents = incidents.filter(incident => incident.status === 'active').length;
    const topUser = [...userRisks].sort((a, b) => b.riskScore - a.riskScore)[0];
    const priority = critical > 0 ? 'Critical' : activeAlerts.length > 2 ? 'High' : 'Normal';

    return {
      activeAlerts,
      critical,
      highRiskUsers,
      activeIncidents,
      topUser,
      priority,
      confidence: Math.min(98, 68 + activeAlerts.length * 5 + critical * 8),
    };
  }, [alerts, incidents, userRisks]);

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden border-blue-400/20 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-wide text-white">
            <BrainCircuit size={20} className="text-blue-300" />
            SOC Intelligence
          </h2>
          <p className="mt-1 text-xs text-textMuted">Risk-based triage summary</p>
        </div>
        <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${
          insights.priority === 'Critical'
            ? 'border-danger/40 bg-danger/10 text-danger'
            : insights.priority === 'High'
              ? 'border-warning/40 bg-warning/10 text-warning'
              : 'border-accent/40 bg-accent/10 text-accent'
        }`}>
          {insights.priority}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InsightMetric icon={<Target size={16} />} label="Active cases" value={insights.activeIncidents} tone="text-warning" />
        <InsightMetric icon={<Gauge size={16} />} label="Confidence" value={`${insights.confidence}%`} tone="text-accent" />
        <InsightMetric icon={<Network size={16} />} label="High-risk users" value={insights.highRiskUsers} tone="text-danger" />
        <InsightMetric icon={<CheckCircle2 size={16} />} label="Noise reduced" value="72%" tone="text-blue-300" />
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-textMuted">Analyst focus</p>
        <p className="text-sm leading-6 text-gray-300">
          {insights.topUser
            ? `${insights.topUser.user} is the highest-risk entity. Prioritize identity containment before endpoint follow-up.`
            : 'No high-confidence entity risk detected. Continue monitoring telemetry.'}
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Recommended playbook</p>
        <ol className="space-y-1 text-xs leading-5 text-gray-300">
          <li>1. Contain suspicious identities.</li>
          <li>2. Block malicious infrastructure.</li>
          <li>3. Review incident entity graph.</li>
        </ol>
      </div>
    </div>
  );
};

const InsightMetric = ({ icon, label, value, tone }) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
    <div className={`mb-2 ${tone}`}>{icon}</div>
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-textMuted">{label}</p>
    <p className="mt-1 text-xl font-bold text-white">{value}</p>
  </div>
);

export default SecurityInsightsPanel;
