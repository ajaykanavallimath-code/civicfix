import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  PlusCircle, 
  LayoutDashboard, 
  Search, 
  ShieldAlert, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Activity, 
  UserCheck 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse, 
  onOpenSettings 
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { connected } = useSocket();

  const navItems = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/report', label: t('nav.report'), icon: PlusCircle, isAction: true },
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/track', label: t('nav.track') || 'Track Complaint', icon: Search },
    { to: '/authority', label: t('nav.authority'), icon: ShieldAlert }
  ];

  const handleNavClick = () => {
    // Close mobile drawer on navigation
    if (isOpen && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-lg lg:shadow-none ${
          /* Mobile slide-in */
          isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${
          /* Desktop collapsed or expanded */
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <NavLink 
            to="/" 
            onClick={handleNavClick}
            className="flex items-center gap-3 overflow-hidden group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
              CF
            </div>
            {(!isCollapsed || isOpen) && (
              <div className="min-w-0 transition-opacity">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-[#172B4D] dark:text-white">
                    Civic<span className="text-blue-600 dark:text-blue-400">Fix</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Karnataka Pilot
                </p>
              </div>
            )}
          </NavLink>

          {/* Close button for Mobile / Collapse button for Desktop */}
          <div className="flex items-center">
            {/* Mobile close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            if (item.isAction) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-md'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } ${isCollapsed && !isOpen ? 'justify-center px-0' : ''}`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4 shrink-0 text-white" />
                  {(!isCollapsed || isOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isCollapsed && !isOpen ? 'justify-center px-0' : ''}`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                {(!isCollapsed || isOpen) && (
                  <span className="truncate">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Live Network Pulse Indicator */}
        {(!isCollapsed || isOpen) && (
          <div className="px-4 py-2 mx-3 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {connected ? 'Real-Time Sync' : 'Offline'}
              </span>
            </div>
            <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {/* Bottom Section: User Profile & Settings */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* User Profile Summary */}
          {(!isCollapsed || isOpen) ? (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#172B4D] dark:text-white truncate">
                    {currentUser?.name || 'Citizen'}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser?.badge || 'Public User'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-1" title={currentUser?.name}>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Settings Trigger Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              isCollapsed && !isOpen ? 'justify-center px-0' : ''
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            {(!isCollapsed || isOpen) && <span>Profile & Settings</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
