import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'kn', label: 'ಕನ್ನಡ', short: 'ಕನ್ನ' },
    { code: 'hi', label: 'हिन्दी', short: 'हिन्' }
  ];

  return (
    <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200 p-0.5 rounded-xl shadow-xs">
      <div className="pl-2 pr-1 text-slate-500">
        <Globe className="w-3.5 h-3.5" />
      </div>
      {languages.map((lang) => {
        const isActive = (i18n.resolvedLanguage || i18n.language || 'en').startsWith(lang.code);
        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={`civic-tap-target px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-150 ${
              isActive
                ? 'bg-civic-navy text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title={`Switch to ${lang.label}`}
          >
            {lang.short}
          </button>
        );
      })}
    </div>
  );
}
