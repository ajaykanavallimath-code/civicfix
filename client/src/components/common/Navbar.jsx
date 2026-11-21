import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  UserCheck, 
  ChevronDown, 
  Settings, 
  Activity, 
  PlusCircle,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function Navbar({ onToggleMobileSidebar, onOpenSettings }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentUser, switchRole, DEMO_ROLES } = useAuth();
  const { connected } = useSocket();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Derive human-readable page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Civic Overview';
      case '/report':
        return 'Report Issue';
      case '/dashboard':
        return 'Public Grievances Dashboard';
      case '/track':
        return 'Track Complaint';
      case '/authority':
        return 'Authority Triage Portal';
      default:
        if (location.pathname.startsWith('/complaint/')) return 'Complaint Dossier';
        return 'CivicFix AI';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Mobile Sidebar Trigger + Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
              title="Open Navigation"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-[#172B4D] dark:text-white tracking-tight flex items-center gap-2">
                <span>{getPageTitle()}</span>
                {location.pathname === '/report' && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    AI Guided
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Transparent Infrastructure Triage & Grievance Redressal
              </p>
            </div>
          </div>

          {/* Right: Quick Report Action, Live Status, Role Switcher & Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Report Issue Button (if not on /report) */}
            {location.pathname !== '/report' && (
              <Link
                to="/report"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </Link>
            )}

            {/* Live Socket Status Pill */}
            <div 
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300"
              title={connected ? 'Connected to live grievance WebSocket' : 'Connecting to live updates...'}
            >
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="hidden md:inline">{connected ? 'LIVE FEED' : 'OFFLINE'}</span>
            </div>

            {/* Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="civic-tap-target flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                title="Switch Demo Role for Presentation"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline max-w-[130px] truncate">{currentUser.badge}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-floating border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Demo Persona Switcher</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Switch role to test citizen triage or authority queues:</p>
                  </div>
                  <div className="py-1">
                    {DEMO_ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          switchRole(role.id);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          currentUser.id === role.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{role.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{role.badge}</p>
                        </div>
                        {currentUser.id === role.id && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings Trigger Icon */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="Open Settings (Appearance & Language)"
              aria-label="Open Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
