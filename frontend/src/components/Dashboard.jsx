import React from 'react';
import LiveAlertsPanel from './widgets/LiveAlertsPanel';
import AttackTimeline from './widgets/AttackTimeline';
import UserRiskTable from './widgets/UserRiskTable';
import PhishingScanner from './widgets/PhishingScanner';
import DeviceInspector from './widgets/DeviceInspector';
import SecurityActionControls from './widgets/SecurityActionControls';
import SecurityInsightsPanel from './widgets/SecurityInsightsPanel';
import RuleEnginePanel from './widgets/RuleEnginePanel';
import ReviewQueuePanel from './widgets/ReviewQueuePanel';
import AuditTrailPanel from './widgets/AuditTrailPanel';
import GoogleThreatMap from './widgets/GoogleThreatMap';
import { ActivityChart, SeverityChart } from './widgets/ChartsWidgets';
import IncidentDashboard from './widgets/IncidentDashboard';
import useStore from '../store/useStore';
import { Activity, AlertTriangle, LockKeyhole, Radar, ShieldCheck, Siren, Zap } from 'lucide-react';

const Dashboard = () => {
  const metrics = useStore(state => state.metrics);
  const alerts = useStore(state => state.alerts);
  const simulationActive = useStore(state => state.simulationActive);
  const activeAlerts = alerts.filter(alert => !alert.resolved);
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;
  const posture = activeAlerts.length === 0 ? 'Secure' : criticalAlerts > 0 ? 'Critical' : 'Elevated';

  return (
    <div className="flex flex-col gap-6 pb-20">
      <section className="command-hero relative overflow-hidden rounded-lg border border-panel-border bg-[#090d13] p-5 md:p-6">
        <div className="relative z-10 grid gap-5 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                posture === 'Critical' ? 'border-danger/40 bg-danger/10 text-danger' :
                posture === 'Elevated' ? 'border-warning/40 bg-warning/10 text-warning' :
                'border-accent/40 bg-accent/10 text-accent'
              }`}>
                <Radar size={14} />
                {posture} posture
              </span>
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-textMuted">
                {simulationActive ? 'Simulation active' : 'Monitoring standby'}
              </span>
            </div>
            <h1 className="text-2xl font-bold leading-tight text-white md:text-4xl">
              Security Operations Command
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-textMuted">
              Unified cybersecurity command center for live detections, fraud-style account review, identity risk, incident response, and product abuse defense.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
            <HeroSignal icon={<ShieldCheck size={18} />} label="Coverage" value="99.8%" tone="text-accent" />
            <HeroSignal icon={<Siren size={18} />} label="Critical" value={criticalAlerts} tone="text-danger" />
            <HeroSignal icon={<Activity size={18} />} label="Events" value={metrics.totalLoginAttempts} tone="text-blue-300" />
            <HeroSignal icon={<Zap size={18} />} label="MTTR" value={`${metrics.avgResponseTime}m`} tone="text-warning" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<LockKeyhole size={20} />} title="Login Attempts" value={metrics.totalLoginAttempts} trend="Identity events reviewed" tone="accent" />
        <StatCard icon={<ShieldCheck size={20} />} title="Blocked Logins" value={metrics.blockedLoginAttempts} trend="Access attempts prevented" tone="danger" alert={metrics.blockedLoginAttempts > 0} />
        <StatCard icon={<AlertTriangle size={20} />} title="Active Alerts" value={metrics.activeThreats} trend="Items requiring triage" tone="warning" alert={metrics.activeThreats > 0} />
        <StatCard icon={<Siren size={20} />} title="Incidents" value={metrics.totalIncidents} trend="Correlated investigations" tone="blue" />
      </div>

      <SectionHeader eyebrow="Threat Operations" title="Live Detection Surface" detail="Monitor active alerts, global telemetry, and event progression in one operational row." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="h-[560px] xl:col-span-3">
          <LiveAlertsPanel />
        </div>
        <div className="h-[560px] xl:col-span-6">
          <GoogleThreatMap />
        </div>
        <div className="h-[560px] xl:col-span-3">
          <AttackTimeline />
        </div>
      </div>

      <SectionHeader eyebrow="Investigation" title="Incident Workbench" detail="Prioritize incidents, inspect analyst guidance, and review risk distribution without leaving the dashboard." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="h-[430px] xl:col-span-3">
          <IncidentDashboard />
        </div>
        <div className="h-[430px] xl:col-span-3">
          <SecurityInsightsPanel />
        </div>
        <div className="h-[430px] xl:col-span-3">
          <ActivityChart />
        </div>
        <div className="h-[430px] xl:col-span-3">
          <SeverityChart />
        </div>
        <div className="h-[430px] xl:col-span-6">
          <UserRiskTable />
        </div>
        <div className="h-[430px] xl:col-span-3">
          <DeviceInspector />
        </div>
        <div className="h-[430px] xl:col-span-3">
          <AuditTrailPanel />
        </div>
      </div>

      <SectionHeader eyebrow="Product Abuse Defense" title="Fraud, Bots, and Account Review" detail="Tirreno-inspired controls for abuse rules, manual review queues, phishing probes, and account-level decisioning." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <div className="h-[430px] xl:col-span-4">
          <PhishingScanner />
        </div>
        <div className="h-[430px] xl:col-span-4">
          <RuleEnginePanel />
        </div>
        <div className="h-[430px] xl:col-span-4">
          <ReviewQueuePanel />
        </div>
      </div>

      <SectionHeader eyebrow="Response" title="SOAR Playbooks" detail="Execute containment actions for the active investigation." />
      <div className="min-h-[250px]">
        <SecurityActionControls />
      </div>
    </div>
  );
};

const toneClasses = {
  accent: 'text-accent border-accent/25 bg-accent/10',
  danger: 'text-danger border-danger/25 bg-danger/10',
  warning: 'text-warning border-warning/25 bg-warning/10',
  blue: 'text-blue-300 border-blue-400/25 bg-blue-400/10',
};

const StatCard = ({ icon, title, value, trend, tone, alert }) => (
  <div className={`glass-panel relative overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 ${alert ? 'border-danger/40 shadow-[0_0_24px_rgba(255,77,77,0.12)]' : ''}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-textMuted">{title}</h3>
        <div className="mt-3 text-3xl font-bold tracking-normal text-white">{value}</div>
      </div>
      <div className={`rounded-lg border p-2 ${toneClasses[tone]}`}>
        {icon}
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
      <p className="text-xs text-textMuted">{trend}</p>
      <span className={`h-2 w-2 rounded-full ${alert ? 'bg-danger animate-pulse' : 'bg-accent'}`}></span>
    </div>
  </div>
);

const HeroSignal = ({ icon, label, value, tone }) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
    <div className={`mb-2 ${tone}`}>{icon}</div>
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">{label}</p>
    <p className="mt-1 text-2xl font-bold text-white">{value}</p>
  </div>
);

const SectionHeader = ({ eyebrow, title, detail }) => (
  <div className="flex flex-col gap-1 border-l-2 border-accent pl-4">
    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <p className="max-w-3xl text-sm text-textMuted">{detail}</p>
  </div>
);

export default Dashboard;
