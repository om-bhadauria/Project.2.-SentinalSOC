import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import { simulator } from '../lib/simulator';
import { Search, ShieldAlert, Cpu, Settings, LogOut } from 'lucide-react';

import NotificationDropdown from './NotificationDropdown';
import SettingsPanel from './SettingsPanel';

const TopNav = ({ currentUser, onLogout }) => {
  const simulationActive = useStore(state => state.simulationActive);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || 'Security Operations';

  return (
    <>
    <header className="h-16 w-full fixed top-0 left-0 right-0 glass-panel rounded-none border-t-0 border-x-0 border-b flex items-center justify-between gap-4 px-4 md:pl-[19rem] md:pr-6 z-20 bg-[#090d13]/90 backdrop-blur-md">
      <div className="hidden min-w-0 items-center gap-4 md:flex">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Workspace</p>
          <h2 className="truncate text-sm font-semibold text-white">{pageTitle}</h2>
        </div>
        <div className="hidden h-10 min-w-[320px] items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 text-textMuted xl:flex">
          <Search size={16} />
          <input className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-textMuted" placeholder="Search users, IPs, incidents..." />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-4">
        
        {/* Simulate Attack Button */}
        <button 
          onClick={() => simulator.toggle()}
          aria-label={simulationActive ? 'Cyber Attack in progress' : 'Simulate Cyber Attack'}
          className={`flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 rounded-md font-semibold text-[10px] md:text-sm transition-all min-h-[42px] shadow-[0_0_15px_rgba(255,77,77,0.18)] hover:shadow-[0_0_25px_rgba(255,77,77,0.35)] ${
            simulationActive ? 'bg-danger text-white animate-pulse border border-danger/50' : 'bg-danger/20 hover:bg-red-600 text-white border border-danger/50'
          }`}
        >
          <ShieldAlert size={16} className="md:w-[18px] md:h-[18px]" aria-hidden="true" />
          <span className="hidden sm:inline">{simulationActive ? 'Stop Simulation' : 'Simulate Cyber Attack'}</span>
          <span className="sm:hidden">{simulationActive ? 'Running...' : 'Simulate'}</span>
        </button>

        {/* Demo Script Button */}
        <div className="flex items-center gap-2 md:gap-3 border-l border-panel-border pl-3 md:pl-4 h-[42px]">
          <button 
            onClick={() => simulator.simulateAttackSequence()}
            aria-label="Run Demo Attack Sequence"
            className="flex min-h-[38px] items-center gap-2 rounded-md border border-accent/30 bg-accent/10 px-3 py-1.5 text-[10px] font-semibold text-accent transition-all hover:bg-accent/20 md:text-sm"
          >
            <span className="hidden sm:inline">Run Scripted Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 border-l border-panel-border pl-3 md:pl-4 h-[42px]">
          <NotificationDropdown />
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="relative focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-full p-1 ml-2 text-textMuted hover:text-white transition-colors" 
            aria-label="Settings"
          >
             <Settings size={18} className="md:w-5 md:h-5" />
          </button>

          <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 p-1">
             <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-500">
                <Cpu size={14} className="text-white md:w-4 md:h-4" aria-hidden="true" />
             </div>
             <div className="hidden lg:block text-left text-sm">
                <p className="font-medium text-white leading-tight mt-0.5">{currentUser?.name || 'Admin SOC'}</p>
                <p className="text-[10px] text-textMuted">{currentUser?.role || 'Tier 3 Analyst'}</p>
             </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-textMuted hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
          </div>
        </div>

      </div>
    </header>
    <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

const pageTitles = {
  '/': 'Security Operations Command',
  '/manual-review': 'Manual Review',
  '/blacklist': 'Blacklist',
  '/activity': 'Activity Explorer',
  '/alerts': 'Threat Alerts',
  '/incidents': 'Incidents',
  '/users': 'Users',
  '/single-user': 'Single User View',
  '/ip-addresses': 'IP Addresses',
  '/countries': 'Countries',
  '/networks': 'Networks',
  '/resources': 'Resources',
  '/field-history': 'Field History',
  '/rules': 'Rules',
  '/preset-rules': 'Preset Rules',
  '/api': 'SDKs & API',
  '/built-for': 'Built For',
  '/deployment': 'Deployment',
  '/settings': 'Settings',
  '/logbook': 'Logbook',
  '/risk': 'Users & Risk',
  '/scanner': 'URL Scanner',
  '/adaptive-auth': 'Adaptive Auth',
  '/behavior': 'Behavior Monitor',
  '/continuous-auth': 'Continuous Auth',
};

export default TopNav;
