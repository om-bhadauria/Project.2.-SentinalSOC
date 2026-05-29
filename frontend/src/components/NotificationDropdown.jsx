import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { Bell, Check, Trash2, ShieldAlert, Shield } from 'lucide-react';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const notifications = useStore(state => state.notifications);
  const markNotificationRead = useStore(state => state.markNotificationRead);
  const clearNotifications = useStore(state => state.clearNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-full p-1" 
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell size={18} className="text-textMuted hover:text-white cursor-pointer transition-colors md:w-5 md:h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute 0 -right-0 flex h-2.5 w-2.5 md:h-3 md:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3 bg-accent border-2 border-darkBg text-[8px] flex items-center justify-center font-bold text-darkBg">
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0a0f18] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-in origin-top-right">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
            <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
              <Bell size={14} className="text-accent" />
              Notifications
            </h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearNotifications}
                className="text-[10px] text-textMuted hover:text-danger flex items-center gap-1 transition-colors uppercase font-semibold"
                aria-label="Clear all notifications"
              >
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-textMuted flex flex-col items-center gap-2">
                <Shield size={24} className="opacity-50" />
                <p className="text-xs">No pending notifications</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className={`p-3 border-b border-white/5 flex gap-3 group transition-colors hover:bg-white/5 ${!notif.read ? 'bg-accent/5' : ''}`}
                  >
                    <div className="mt-0.5">
                      <ShieldAlert size={16} className={`
                        ${notif.type === 'critical' ? 'text-danger' : 
                          notif.type === 'high' ? 'text-warning' : 'text-accent'}
                      `} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${!notif.read ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[9px] text-textMuted mt-1 uppercase tracking-wider font-mono">
                         {new Date(notif.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notif.read && (
                      <button 
                         onClick={() => markNotificationRead(notif.id)}
                         className="opacity-0 group-hover:opacity-100 transition-opacity text-accent p-1 hover:bg-accent/20 rounded"
                         title="Mark as read"
                      >
                         <Check size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
