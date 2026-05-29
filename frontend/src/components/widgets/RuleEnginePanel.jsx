import React from 'react';
import useStore from '../../store/useStore';
import { Bot, Gauge, ShieldCheck } from 'lucide-react';

const fallbackRules = [
  { name: 'Account takeover', hits: 0, risk: 0, category: 'Identity' },
  { name: 'Credential stuffing', hits: 0, risk: 0, category: 'Authentication' },
  { name: 'Bot detection', hits: 0, risk: 0, category: 'Automation' },
  { name: 'API protection', hits: 0, risk: 0, category: 'Product abuse' },
];

const RuleEnginePanel = () => {
  const ruleStats = useStore(state => state.ruleStats);
  const rules = ruleStats.length ? ruleStats : fallbackRules;
  const averageRisk = Math.round(rules.reduce((sum, rule) => sum + rule.risk, 0) / rules.length);

  return (
    <div className="glass-panel flex h-full flex-col overflow-hidden border-accent/20 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-wide text-white">
            <Bot size={20} className="text-accent" />
            Rule Engine
          </h2>
          <p className="mt-1 text-xs text-textMuted">Product abuse and fraud detections</p>
        </div>
        <div className="rounded-lg border border-accent/20 bg-accent/10 p-2 text-accent">
          <ShieldCheck size={18} />
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-white/10 bg-black/25 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-textMuted">Risk threshold</span>
          <span className="text-xl font-bold text-white">{averageRisk}</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-800">
          <div className="h-2 rounded-full bg-accent" style={{ width: `${averageRisk}%` }}></div>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
        {rules.map((rule) => (
          <div key={rule.name} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{rule.name}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-textMuted">{rule.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-accent">{rule.hits}</p>
                <p className="text-[10px] text-textMuted">hits</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Gauge size={13} className={rule.risk > 80 ? 'text-danger' : rule.risk > 60 ? 'text-warning' : 'text-accent'} />
              <div className="h-1.5 flex-1 rounded-full bg-gray-800">
                <div
                  className={`h-1.5 rounded-full ${rule.risk > 80 ? 'bg-danger' : rule.risk > 60 ? 'bg-warning' : 'bg-accent'}`}
                  style={{ width: `${rule.risk}%` }}
                ></div>
              </div>
              <span className="w-8 text-right text-xs font-mono text-textMuted">{rule.risk}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RuleEnginePanel;
