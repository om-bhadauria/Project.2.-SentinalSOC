import React from 'react';
import useStore from '../store/useStore';
import { Settings, Moon, Sun, Bell, Sliders, X } from 'lucide-react';

const SettingsPanel = ({ isOpen, onClose }) => {
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Slide-out panel */}
      <div 
        className="fixed top-0 right-0 h-full w-[350px] bg-darkBg border-l border-white/10 shadow-2xl z-50 animate-slide-in p-6 flex flex-col overflow-y-auto"
        role="dialog"
        aria-label="Dashboard Settings"
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Settings size={22} className="text-accent" />
            Preferences
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-textMuted hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label="Close Settings"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8 flex-1">
          {/* Theme Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Moon size={16} /> Theme
            </h3>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <span className="text-sm text-white">Dark Mode</span>
              <button 
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${settings.darkMode ? 'bg-accent' : 'bg-gray-600'}`}
                role="switch"
                aria-checked={settings.darkMode}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bell size={16} /> Notifications
            </h3>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div>
                 <span className="text-sm text-white block">System Alerts</span>
                 <span className="text-[10px] text-textMuted">Receive unread badges</span>
              </div>
              <button 
                onClick={() => updateSettings({ enableNotifications: !settings.enableNotifications })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${settings.enableNotifications ? 'bg-accent' : 'bg-gray-600'}`}
                role="switch"
                aria-checked={settings.enableNotifications}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          {/* Filter Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders size={16} /> Alert Visibilty
            </h3>
            <div className="space-y-2">
              {['critical', 'high', 'medium', 'low'].map(level => (
                 <label key={level} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                    <span className="text-sm text-white capitalize">{level} Alerts</span>
                    <input 
                      type="checkbox" 
                      checked={settings.severityFilters[level]} 
                      onChange={() => updateSettings({ 
                         severityFilters: { 
                             ...settings.severityFilters, 
                             [level]: !settings.severityFilters[level] 
                         } 
                      })}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-accent focus:ring-accent focus:ring-2"
                    />
                 </label>
              ))}
            </div>
            <p className="text-[10px] text-textMuted mt-2 px-1">Note: Hiding alerts prevents them from showing in the Live Alerts Panel, but they still exist in the SOC context.</p>
          </section>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
