import React, { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useStore from '../store/useStore';
import AuditTrailPanel from '../components/widgets/AuditTrailPanel';
import ReviewQueuePanel from '../components/widgets/ReviewQueuePanel';
import RuleEnginePanel from '../components/widgets/RuleEnginePanel';
import {
  Ban,
  BookOpen,
  Box,
  Code2,
  Database,
  FileClock,
  Globe2,
  HardDrive,
  KeyRound,
  ListChecks,
  Network,
  PackageCheck,
  Search,
  Server,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Terminal,
  Users,
  Wifi,
} from 'lucide-react';

const activityRows = [
  { trust: 64, email: 'john134@gmail.com', timestamp: '12:03:45', event: 'Page View', ip: '34.123.170.104', ipType: 'Datacenter', device: 'GNU/Linux', country: 'US' },
  { trust: 99, email: 'james25@gmail.com', timestamp: '12:02:26', event: 'Page View', ip: '51.81.245.138', ipType: 'Spam list', device: 'Windows', country: 'US' },
  { trust: 0, email: 'botaccount12@hotmail.com', timestamp: '11:09:09', event: 'Page Error', ip: '193.34.213.150', ipType: 'Datacenter', device: 'Mac', country: 'PL' },
  { trust: 0, email: 'botaccount16@gmail.com', timestamp: '2 actions', event: 'Page Error', ip: '65.49.20.69', ipType: 'Datacenter', device: 'GNU/Linux', country: 'US' },
  { trust: 71, email: 'dev.charlie@sentinel.soc', timestamp: '10:41:18', event: 'Login', ip: '203.0.113.18', ipType: 'Proxy', device: 'Windows', country: 'SG' },
  { trust: 22, email: 'finance.diana@sentinel.soc', timestamp: '09:18:54', event: 'Password Reset', ip: '198.51.100.77', ipType: 'Suspicious', device: 'Chrome', country: 'BR' },
];

const chartData = [
  { time: '00:00', pageView: 0, login: 0, error: 0 },
  { time: '02:00', pageView: 1, login: 0, error: 0 },
  { time: '04:00', pageView: 2, login: 1, error: 0 },
  { time: '06:00', pageView: 2, login: 1, error: 2 },
  { time: '08:00', pageView: 17, login: 0, error: 0 },
  { time: '10:00', pageView: 9, login: 2, error: 1 },
  { time: '12:00', pageView: 5, login: 0, error: 24 },
];

export const ActivityPage = () => (
  <PageShell
    icon={<ListChecks size={22} />}
    title="Activity Explorer"
    subtitle="Tirreno-style event search, filters, risk signals, and activity timeline."
  >
    <div className="glass-panel p-5">
      <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
        <div className="flex min-h-[44px] items-center gap-3 rounded-lg border border-panel-border bg-black/35 px-3 text-textMuted">
          <Search size={18} />
          <input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none" placeholder="Search User ID, Last name, IP, ASN" />
        </div>
        <FilterBox value="333" />
        <FilterBox value="12:11:38 UTC+01:00" />
      </div>

      <div className="h-[280px] rounded-lg border border-white/10 bg-[#120f1d] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="time" stroke="#8b949e" fontSize={12} />
            <YAxis stroke="#8b949e" fontSize={12} />
            <Tooltip contentStyle={{ background: '#0f1115', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }} />
            <Area dataKey="pageView" stroke="#00ffcc" fill="#00ffcc22" strokeWidth={2} name="Page View" />
            <Area dataKey="login" stroke="#ffaa00" fill="#ffaa0022" strokeWidth={2} name="Login" />
            <Area dataKey="error" stroke="#ff4d7d" fill="#ff4d7d22" strokeWidth={2} name="Page Error" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-lg border border-white/10 bg-black/25">
        <div className="border-b border-white/10 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-white">Activities <span className="text-textMuted">21</span></h3>
            <div className="hidden min-h-[38px] items-center gap-2 rounded-md border border-white/10 bg-black/35 px-3 text-sm text-textMuted md:flex">
              <Search size={15} />
              User ID, Timestamp, IP, HTTP Code
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {['D04 Rare browser device', 'B17 Single country', 'desktop', 'bot', 'smartphone'].map((chip) => (
              <span key={chip} className="rounded border border-white/10 bg-white/[0.06] px-2 py-1 text-xs text-gray-300">{chip}</span>
            ))}
          </div>
        </div>
        <ActivityTable />
      </div>
    </div>
  </PageShell>
);

export const ManualReviewPage = () => (
  <PageShell icon={<ShieldAlert size={22} />} title="Manual Review" subtitle="Accounts and sessions waiting for analyst approval.">
    <div className="h-[640px]"><ReviewQueuePanel /></div>
  </PageShell>
);

export const BlacklistPage = () => (
  <CollectionPage
    icon={<Ban size={22} />}
    title="Blacklist"
    subtitle="Blocked users, domains, IP ranges, and infrastructure indicators."
    columns={['Indicator', 'Type', 'Reason', 'Status']}
    rows={[
      ['185.220.101.42', 'IP', 'Credential stuffing source', 'Blocked'],
      ['secure-login-suspicious.cloud', 'Domain', 'Phishing kit', 'Blocked'],
      ['api-key-prod-07', 'API key', 'Abuse threshold exceeded', 'Rate-limited'],
    ]}
  />
);

export const UsersPage = () => {
  const userRisks = useStore(state => state.userRisks);
  return (
    <CollectionPage
      icon={<Users size={22} />}
      title="Users"
      subtitle="User entities, risk scores, and identity posture."
      columns={['User', 'Risk Score', 'Last Activity', 'Decision']}
      rows={userRisks.map(user => [user.user, user.riskScore, new Date(user.lastActivity).toLocaleTimeString(), user.riskScore > 75 ? 'Review' : 'Monitor'])}
    />
  );
};

export const IpAddressesPage = () => (
  <CollectionPage
    icon={<Server size={22} />}
    title="IP Addresses"
    subtitle="Source addresses, infrastructure classes, and block decisions."
    columns={['IP Address', 'Country', 'Type', 'Risk']}
    rows={activityRows.map(row => [row.ip, row.country, row.ipType, row.trust < 30 ? 'High' : 'Medium'])}
  />
);

export const CountriesPage = () => (
  <CollectionPage
    icon={<Globe2 size={22} />}
    title="Countries"
    subtitle="Geographic concentration of suspicious activity."
    columns={['Country', 'Events', 'Risk', 'Dominant Signal']}
    rows={[
      ['United States', 87, 'Medium', 'Datacenter traffic'],
      ['Singapore', 31, 'High', 'Impossible travel'],
      ['Brazil', 24, 'High', 'Phishing callback'],
      ['Poland', 18, 'Medium', 'Page errors'],
    ]}
  />
);

export const NetworksPage = () => (
  <CollectionPage
    icon={<Wifi size={22} />}
    title="Networks"
    subtitle="ASN, datacenter, proxy, and spam-list network intelligence."
    columns={['Network', 'ASN', 'Class', 'Risk']}
    rows={[
      ['OVH SAS', 'AS16276', 'Datacenter', 'High'],
      ['Tor Exit Relay', 'AS9009', 'Proxy', 'Critical'],
      ['Cloudfront Edge', 'AS16509', 'CDN', 'Low'],
      ['Unknown Residential', 'AS13445', 'Residential', 'Medium'],
    ]}
  />
);

export const ResourcesPage = () => (
  <CollectionPage
    icon={<Database size={22} />}
    title="Resources"
    subtitle="Protected resources and abuse-prone application surfaces."
    columns={['Resource', 'Requests', 'Abuse Signal', 'Protection']}
    rows={[
      ['/login', '18.4k', 'Credential stuffing', 'Adaptive MFA'],
      ['/api/orders', '7.2k', 'Scraping', 'Rate limit'],
      ['/password-reset', '1.1k', 'MFA fatigue', 'Step-up auth'],
      ['/admin', '333', 'Privilege probing', 'Blocklist'],
    ]}
  />
);

export const FieldHistoryPage = () => (
  <PageShell icon={<FileClock size={22} />} title="Field History" subtitle="Sensitive data changes with before/after values.">
    <div className="h-[640px]"><AuditTrailPanel /></div>
  </PageShell>
);

export const RulesPage = () => (
  <PageShell icon={<Network size={22} />} title="Rules" subtitle="Detection rules, thresholds, and abuse categories.">
    <div className="h-[640px]"><RuleEnginePanel /></div>
  </PageShell>
);

export const ApiPage = () => (
  <ApiIngestionPage />
);

export const SettingsPage = () => {
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);
  return (
    <PageShell icon={<Settings size={22} />} title="Settings" subtitle="Workspace controls and alert filtering.">
      <div className="glass-panel max-w-3xl p-5">
        <ToggleRow label="Notifications" active={settings.enableNotifications} onClick={() => updateSettings({ enableNotifications: !settings.enableNotifications })} />
        {Object.entries(settings.severityFilters).map(([severity, active]) => (
          <ToggleRow
            key={severity}
            label={`${severity.charAt(0).toUpperCase()}${severity.slice(1)} alerts`}
            active={active}
            onClick={() => updateSettings({ severityFilters: { ...settings.severityFilters, [severity]: !active } })}
          />
        ))}
      </div>
    </PageShell>
  );
};

export const LogbookPage = () => {
  const notifications = useStore(state => state.notifications);
  return (
    <CollectionPage
      icon={<BookOpen size={22} />}
      title="Logbook"
      subtitle="Analyst notes, notifications, and system decisions."
      columns={['Time', 'Message', 'Type', 'Read']}
      rows={notifications.map(item => [new Date(item.timestamp).toLocaleTimeString(), item.message, item.type, item.read ? 'Yes' : 'No'])}
    />
  );
};

export const SingleUserPage = () => {
  const userRisks = useStore(state => state.userRisks);
  const alerts = useStore(state => state.alerts);
  const user = userRisks[0] || { user: 'admin@sentinel.soc', riskScore: 92, lastActivity: new Date().toISOString() };
  const userAlerts = alerts.filter(alert => alert.targetUser === user.user || alert.user === user.user);

  return (
    <PageShell icon={<Users size={22} />} title="Single User View" subtitle="Behavior patterns, connected identities, risk score, and activity timeline for one account.">
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-textMuted">User entity</p>
              <h2 className="mt-2 text-2xl font-bold text-white">{user.user}</h2>
              <p className="mt-1 text-sm text-textMuted">Last activity: {new Date(user.lastActivity).toLocaleString()}</p>
            </div>
            <span className={`rounded-lg px-3 py-2 text-xl font-bold ${user.riskScore > 80 ? 'bg-danger/10 text-danger border border-danger/30' : 'bg-warning/10 text-warning border border-warning/30'}`}>
              {user.riskScore}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <MiniCard label="Connected emails" value="3" />
            <MiniCard label="Devices" value="5" />
            <MiniCard label="Countries" value="4" />
            <MiniCard label="Review state" value="Manual" />
          </div>

          <div className="mt-5 rounded-lg border border-white/10 bg-black/25 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-textMuted">Behavior Signals</p>
            {['Rare browser device', 'Single country mismatch', 'MFA fatigue attempt', 'Privileged resource access'].map((signal) => (
              <div key={signal} className="mb-2 flex items-center justify-between rounded border border-white/10 bg-white/[0.03] px-3 py-2 last:mb-0">
                <span className="text-sm text-gray-300">{signal}</span>
                <span className="text-xs font-bold text-warning">active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">User Activity Timeline</h3>
          <div className="space-y-3">
            {(userAlerts.length ? userAlerts : alerts.slice(0, 4)).map((alert) => (
              <div key={alert.id} className="rounded-lg border border-white/10 bg-black/25 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${alert.severity === 'critical' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>{alert.severity}</span>
                  <span className="text-xs text-textMuted">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="font-semibold text-white">{alert.title}</p>
                <p className="mt-1 text-sm text-textMuted">{alert.description || alert.recommendedResponse}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export const PresetRulesPage = () => (
  <PageShell icon={<PackageCheck size={22} />} title="Preset Rules" subtitle="Ready-made detections for account takeover, fraud, bots, insider threat, and API abuse.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[
        ['Account takeover', 'Detect credential theft and suspicious login behavior.', 'Identity'],
        ['Credential stuffing', 'Detect password spray and reused credential attacks.', 'Authentication'],
        ['Content spam', 'Catch abusive submissions and bot-created content.', 'Product abuse'],
        ['Account registration', 'Score risky signups and disposable identities.', 'Fraud'],
        ['Fraud prevention', 'Flag payment, promo, and marketplace abuse.', 'Commerce'],
        ['Insider threat', 'Monitor privilege escalation and sensitive field access.', 'Workforce'],
        ['Bot detection', 'Separate automated behavior from normal users.', 'Automation'],
        ['Dormant account', 'Catch sudden activity from long-idle accounts.', 'Identity'],
        ['Multi-accounting', 'Cluster linked accounts and shared devices.', 'Fraud'],
        ['Promo abuse', 'Detect coupon farming and policy bypasses.', 'Commerce'],
        ['API protection', 'Detect scraping, token abuse, and rate-limit bypass.', 'API'],
        ['High-risk regions', 'Weight events by geography and network context.', 'Geo risk'],
      ].map(([name, desc, category]) => (
        <div key={name} className="glass-panel p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold text-white">{name}</h3>
            <span className="rounded border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">{category}</span>
          </div>
          <p className="text-sm leading-6 text-textMuted">{desc}</p>
          <div className="mt-4 h-2 rounded-full bg-gray-800">
            <div className="h-2 rounded-full bg-accent" style={{ width: `${55 + (name.length % 35)}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </PageShell>
);

export const BuiltForPage = () => (
  <PageShell icon={<Box size={22} />} title="Built For" subtitle="Application security use cases inspired by tirreno's product-focused threat model.">
    <div className="grid gap-4 lg:grid-cols-2">
      {[
        ['Self-hosted and legacy apps', 'Embed audit trails and account protection without rebuilding the product.'],
        ['SaaS and digital platforms', 'Prevent cross-tenant leakage, privilege escalation, and data exfiltration.'],
        ['E-commerce and marketplaces', 'Detect payment fraud, fake reviews, promo abuse, and carding attacks.'],
        ['Mission critical applications', 'Protect sensitive workflows and air-gapped style deployments.'],
        ['ICS and command systems', 'Monitor malicious commands and unauthorized access to operational systems.'],
        ['Non-human identities', 'Track API keys, service accounts, bots, and machine identity compromise.'],
        ['API-first applications', 'Protect against scraping, bypassed rate limits, and unauthorized access.'],
      ].map(([title, detail]) => (
        <div key={title} className="glass-panel p-5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-textMuted">{detail}</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const DeploymentPage = () => (
  <PageShell icon={<HardDrive size={22} />} title="Deployment & Requirements" subtitle="A local, presentation-friendly version of the README installation and runtime checklist.">
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="glass-panel p-5">
        <h3 className="mb-4 text-lg font-semibold text-white">Requirements</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['Frontend', 'React + Vite'],
            ['Backend', 'Node/Express demo API'],
            ['Database target', 'PostgreSQL / MongoDB ready'],
            ['Google Maps', 'Optional API key'],
            ['Storage model', 'Event timeline and audit trail'],
            ['Deployment', 'Docker-ready architecture'],
          ].map(([label, value]) => <MiniCard key={label} label={label} value={value} />)}
        </div>
      </div>

      <div className="glass-panel p-5">
        <h3 className="mb-4 text-lg font-semibold text-white">Quickstart</h3>
        <CodeBlock code={`npm install
npm run dev

# Optional Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_key_here

# Demo login
admin@sentinel.soc / SentinelDemo123!`} />
      </div>
    </div>
  </PageShell>
);

const ApiIngestionPage = () => {
  const addEvent = useStore(state => state.addEvent);
  const addDemoApiEvent = () => {
    addEvent({
      id: crypto.randomUUID(),
      type: 'api_abuse',
      severity: 'high',
      timestamp: new Date().toISOString(),
      source_ip: '45.83.12.190',
      target_user: 'api-key-prod-07',
      system: 'API Gateway',
      description: 'SDK event received: unusual request burst and token reuse detected.',
    });
  };

  return (
    <PageShell icon={<KeyRound size={22} />} title="SDKs & API" subtitle="Send product events with full context and immediately score them inside the dashboard.">
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-panel p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white"><Code2 size={18} className="text-accent" /> Event Ingestion</h3>
          <CodeBlock code={`fetch('/api/events', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer sk_demo' },
  body: JSON.stringify({
    user_id: 'admin@sentinel.soc',
    event: 'login_failed',
    ip: '185.220.101.42',
    device: 'GNU/Linux',
    resource: '/login'
  })
})`} />
          <button onClick={addDemoApiEvent} className="mt-4 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-darkBg">
            Simulate API Event
          </button>
        </div>

        <div className="glass-panel p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white"><Terminal size={18} className="text-warning" /> SDK Coverage</h3>
          <div className="grid gap-3">
            {['NodeJS', 'Python', 'PHP', 'WordPress'].map((sdk) => (
              <div key={sdk} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <span className="font-semibold text-white">{sdk}</span>
                <span className="rounded border border-accent/25 bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">Ready</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

const ActivityTable = () => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[760px] text-left text-sm">
      <thead>
        <tr className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-textMuted">
          <th className="p-3">Trust score & email</th>
          <th className="p-3">Timestamp</th>
          <th className="p-3">Event type</th>
          <th className="p-3">IP</th>
          <th className="p-3">IP type</th>
          <th className="p-3">Device</th>
        </tr>
      </thead>
      <tbody>
        {activityRows.map((row) => (
          <tr key={`${row.email}-${row.ip}`} className="border-b border-white/5 hover:bg-white/[0.03]">
            <td className="p-3">
              <span className={`mr-2 rounded px-1.5 py-0.5 text-xs font-bold ${row.trust < 30 ? 'bg-danger text-white' : row.trust > 80 ? 'bg-accent text-darkBg' : 'bg-warning text-darkBg'}`}>{row.trust}</span>
              <span className="font-mono text-white">{row.email}</span>
            </td>
            <td className="p-3 text-textMuted">{row.timestamp}</td>
            <td className="p-3 text-gray-300">{row.event}</td>
            <td className="p-3 font-mono text-gray-300">{row.country} {row.ip}</td>
            <td className="p-3"><span className="rounded border border-warning/30 bg-warning/10 px-2 py-1 text-xs text-warning">{row.ipType}</span></td>
            <td className="p-3 text-gray-300">{row.device}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CollectionPage = ({ icon, title, subtitle, columns, rows }) => {
  const [query, setQuery] = useState('');
  const filteredRows = rows.filter(row => row.join(' ').toLowerCase().includes(query.toLowerCase()));

  return (
    <PageShell icon={icon} title={title} subtitle={subtitle}>
      <div className="glass-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-h-[42px] max-w-xl flex-1 items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 text-textMuted">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
              placeholder={`Search ${title.toLowerCase()}`}
            />
          </div>
          <span className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-bold text-accent">{filteredRows.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.16em] text-textMuted">
                {columns.map(column => <th key={column} className="p-4">{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr key={`${row[0]}-${idx}`} className="border-b border-white/5 hover:bg-white/[0.03]">
                  {row.map((cell, cellIdx) => (
                    <td key={`${cell}-${cellIdx}`} className={`p-4 ${cellIdx === 0 ? 'font-mono text-white' : 'text-gray-300'}`}>{cell}</td>
                  ))}
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-textMuted" colSpan={columns.length}>No matching records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
};

const PageShell = ({ icon, title, subtitle, children }) => (
  <div className="flex flex-col gap-5 pb-20">
    <div className="flex items-start gap-3 border-l-2 border-accent pl-4">
      <div className="mt-1 text-accent">{icon}</div>
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-textMuted">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

const FilterBox = ({ value }) => (
  <div className="flex min-h-[44px] items-center rounded-lg border border-panel-border bg-black/35 px-4 font-mono text-sm text-gray-300">{value}</div>
);

const MiniCard = ({ label, value }) => (
  <div className="rounded-lg border border-white/10 bg-black/25 p-3">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-textMuted">{label}</p>
    <p className="mt-2 font-semibold text-white">{value}</p>
  </div>
);

const CodeBlock = ({ code }) => (
  <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/45 p-4 text-xs leading-6 text-gray-200">
    <code>{code}</code>
  </pre>
);

const ToggleRow = ({ label, active, onClick }) => (
  <button onClick={onClick} className="flex w-full items-center justify-between border-b border-white/10 py-4 text-left last:border-b-0">
    <span className="font-semibold text-white">{label}</span>
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-accent/10 text-accent border border-accent/30' : 'bg-white/5 text-textMuted border border-white/10'}`}>
      {active ? 'Enabled' : 'Disabled'}
    </span>
  </button>
);

const pageMap = {
  'manual-review': ManualReviewPage,
  blacklist: BlacklistPage,
  activity: ActivityPage,
  users: UsersPage,
  'single-user': SingleUserPage,
  'ip-addresses': IpAddressesPage,
  countries: CountriesPage,
  networks: NetworksPage,
  resources: ResourcesPage,
  'field-history': FieldHistoryPage,
  rules: RulesPage,
  'preset-rules': PresetRulesPage,
  api: ApiPage,
  'built-for': BuiltForPage,
  deployment: DeploymentPage,
  settings: SettingsPage,
  logbook: LogbookPage,
};

const TirrenoPageRouter = ({ page }) => {
  const Page = pageMap[page] || ActivityPage;
  return <Page />;
};

export default TirrenoPageRouter;
