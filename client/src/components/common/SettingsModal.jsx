import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, 
  Sun, 
  Moon, 
  Monitor, 
  Globe, 
  UserCheck, 
  ShieldCheck, 
  Palette,
  Check
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { currentUser, switchRole, DEMO_ROLES } = useAuth();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentLanguage = i18n.language || 'en';

  const languages = [
    { code: 'en', label: 'English', sub: 'Default' },
    { code: 'kn', label: 'ಕನ್ನಡ', sub: 'Kannada' },
    { code: 'hi', label: 'हिन्दी', sub: 'Hindi' }
  ];

  const appearanceOptions = [
    { id: 'light', label: 'Light', icon: Sun, desc: 'Clean white civic interface' },
    { id: 'dark', label: 'Dark', icon: Moon, desc: 'High contrast dark mode' },
    { id: 'system', label: 'System', icon: Monitor, desc: 'Follows your OS preference' }
  ];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-floating border border-slate-200 dark:border-slate-800 overflow-hidden text-[#172B4D] dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-[#F5F8FC] dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs font-bold">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                Profile & Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage appearance, language, and civic demo identity
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Appearance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Appearance & Theme
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {appearanceOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTheme(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/30 ring-2 ring-blue-600/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Language */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Application Language
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {languages.map((lng) => {
                const isSelected = currentLanguage.startsWith(lng.code);
                return (
                  <button
                    key={lng.code}
                    type="button"
                    onClick={() => handleLanguageChange(lng.code)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/30 ring-2 ring-blue-600/30 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-black font-sans text-slate-700 dark:text-slate-200">
                        {lng.label}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {lng.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Active Persona / Role Demo Switcher */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Demo User Identity & Role
              </label>
            </div>

            <div className="p-3 rounded-2xl bg-[#F5F8FC] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentUser.email} • <span className="font-semibold text-blue-600 dark:text-blue-400">{currentUser.badge}</span>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => switchRole(role.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    currentUser.id === role.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-xs font-semibold truncate">{role.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{role.badge}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F5F8FC] dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
