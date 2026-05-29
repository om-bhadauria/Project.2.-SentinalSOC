import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  Activity,
  AlertTriangle,
  Ban,
  BookOpen,
  Box,
  ChevronDown,
  ClipboardList,
  Database,
  FileClock,
  Fingerprint,
  Globe2,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  Link as LinkIcon,
  ListChecks,
  Menu,
  Network,
  Server,
  Settings,
  Shield,
  Users,
  Wifi,
  X,
} from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    command: true,
    product: true,
    framework: true,
    modules: false,
  });

  const activeThreats = useStore(state => state.metrics.activeThreats);
  const incidentsCount = useStore(state => state.metrics.totalIncidents);
  const reviewCount = useStore(state => state.reviewQueue.length);

  const groups = [
    {
      id: 'command',
      label: 'Command',
      items: [
        { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { to: '/alerts', icon: <AlertTriangle size={18} />, label: 'Threat Alerts', count: activeThreats },
        { to: '/incidents', icon: <Activity size={18} />, label: 'Incidents', count: incidentsCount },
        { to: '/activity', icon: <ListChecks size={18} />, label: 'Activity' },
      ],
    },
    {
      id: 'product',
      label: 'Product Security',
      items: [
        { to: '/manual-review', icon: <ClipboardList size={18} />, label: 'Manual Review', count: reviewCount },
        { to: '/blacklist', icon: <Ban size={18} />, label: 'Blacklist', count: 3 },
        { to: '/users', icon: <Users size={18} />, label: 'Users' },
        { to: '/single-user', icon: <Users size={18} />, label: 'Single User' },
        { to: '/rules', icon: <Network size={18} />, label: 'Rules' },
        { to: '/preset-rules', icon: <Shield size={18} />, label: 'Preset Rules' },
      ],
    },
    {
      id: 'framework',
      label: 'Intelligence',
      items: [
        { to: '/ip-addresses', icon: <Server size={18} />, label: 'IP Addresses' },
        { to: '/countries', icon: <Globe2 size={18} />, label: 'Countries' },
        { to: '/networks', icon: <Wifi size={18} />, label: 'Networks' },
        { to: '/resources', icon: <Database size={18} />, label: 'Resources' },
        { to: '/field-history', icon: <FileClock size={18} />, label: 'Field History' },
        { to: '/api', icon: <KeyRound size={18} />, label: 'SDKs & API' },
      ],
    },
    {
      id: 'modules',
      label: 'Tools & Admin',
      items: [
        { to: '/risk', icon: <Users size={18} />, label: 'Users & Risk' },
        { to: '/scanner', icon: <LinkIcon size={18} />, label: 'URL Scanner' },
        { to: '/adaptive-auth', icon: <Shield size={18} />, label: 'Adaptive Auth' },
        { to: '/behavior', icon: <Activity size={18} />, label: 'Behavior Monitor' },
        { to: '/continuous-auth', icon: <Fingerprint size={18} />, label: 'Continuous Auth' },
        { to: '/built-for', icon: <Box size={18} />, label: 'Built For' },
        { to: '/deployment', icon: <HardDrive size={18} />, label: 'Deployment' },
        { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
        { to: '/logbook', icon: <BookOpen size={18} />, label: 'Logbook' },
      ],
    },
  ];

  const toggleGroup = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 left-4 z-50 p-2 glass-panel rounded-lg text-white cursor-pointer"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm cursor-pointer"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`w-72 h-screen glass-panel rounded-none border-y-0 border-l-0 border-r flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} bg-[#090d13]/95 md:bg-[#090d13]/82`}>
        <div className="px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/25 bg-accent/10">
              <Shield className="text-accent w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider text-white">Sentinel<span className="text-accent">SOC</span></h1>
              <p className="text-[11px] uppercase tracking-[0.2em] text-textMuted">Security Console</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar" aria-label="Main Navigation">
          {groups.map(group => (
            <NavGroup
              key={group.id}
              group={group}
              isOpen={openGroups[group.id]}
              onToggle={() => toggleGroup(group.id)}
              onItemClick={() => setIsOpen(false)}
            />
          ))}
        </nav>

        <div className="p-4 shrink-0">
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold text-white">System Status</span>
              <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_rgba(0,255,204,0.9)]"></span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <span className="text-textMuted">Mode</span>
              <span className="text-right font-semibold text-accent">Online</span>
              <span className="text-textMuted">Version</span>
              <span className="text-right font-mono text-accent">v2.1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const NavGroup = ({ group, isOpen, onToggle, onItemClick }) => (
  <div className="mb-3">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-textMuted transition-colors hover:bg-white/[0.04] hover:text-white"
    >
      {group.label}
      <ChevronDown size={15} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="mt-1 flex flex-col gap-1">
        {group.items.map(item => (
          <NavItem key={item.to} {...item} onClick={onItemClick} />
        ))}
      </div>
    )}
  </div>
);

const NavItem = ({ to, icon, label, count, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) => `group flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer ${
      isActive
        ? 'bg-accent/10 text-white border border-accent/25 shadow-[inset_3px_0_0_rgba(0,255,204,0.85)]'
        : 'border border-transparent text-textMuted hover:bg-white/[0.055] hover:text-white'
    }`}
  >
    <div className="flex min-w-0 items-center gap-3">
      <span className="shrink-0 opacity-90 group-hover:opacity-100">{icon}</span>
      <span className="truncate text-sm font-medium">{label}</span>
    </div>
    {count > 0 && (
      <span
        className={`${count > 10 ? 'bg-danger' : 'bg-warning/90'} ml-2 shrink-0 text-darkBg text-[10px] font-bold px-2 py-0.5 rounded-full`}
        aria-label={`${count} unresolved items`}
      >
        {count}
      </span>
    )}
  </NavLink>
);

export default Sidebar;
