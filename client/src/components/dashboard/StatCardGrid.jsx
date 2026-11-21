import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  ShieldCheck,
  Check,
  Filter
} from 'lucide-react';

export default function StatCardGrid({ stats = {}, activeMetric = null, onSelectMetric = () => {} }) {
  const { t } = useTranslation();

  const cards = [
    {
      key: 'total',
      label: t('dashboard.total_reported') || 'Total Grievances',
      value: stats.total || 0,
      subtext: 'All logged records',
      icon: Building2,
      accentColor: 'border-l-blue-600',
      textColor: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-50/80 dark:bg-blue-950/50'
    },
    {
      key: 'resolved',
      label: t('dashboard.resolved') || 'Resolved Fixes',
      value: stats.resolved || 0,
      subtext: 'Verified remedied',
      icon: CheckCircle2,
      accentColor: 'border-l-emerald-600',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      activeBg: 'bg-emerald-50/80 dark:bg-emerald-950/50'
    },
    {
      key: 'in_progress',
      label: t('dashboard.in_progress') || 'In Progress',
      value: stats.inProgress || 0,
      subtext: 'Under remediation',
      icon: Wrench,
      accentColor: 'border-l-amber-500',
      textColor: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-50/80 dark:bg-amber-950/50'
    },
    {
      key: 'avg_time',
      label: t('dashboard.avg_time') || 'Avg Fix Time',
      value: `${stats.avgResolutionHours || '18'}h`,
      subtext: 'Intake to sign-off',
      icon: Clock,
      accentColor: 'border-l-cyan-600',
      textColor: 'text-cyan-600 dark:text-cyan-400',
      activeBg: 'bg-cyan-50/80 dark:bg-cyan-950/50'
    },
    {
      key: 'on_time',
      label: t('dashboard.sla_compliance') || 'On-Time SLA',
      value: `${stats.onTimePercentage || 92}%`,
      subtext: 'Within deadline',
      icon: ShieldCheck,
      accentColor: 'border-l-indigo-600',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      activeBg: 'bg-indigo-50/80 dark:bg-indigo-950/50'
    },
    {
      key: 'overdue',
      label: t('dashboard.overdue_count') || 'Overdue / Escalated',
      value: stats.overdue || 0,
      subtext: 'Past target SLA',
      icon: AlertTriangle,
      accentColor: 'border-l-red-600',
      textColor: 'text-red-600 dark:text-red-400',
      activeBg: 'bg-red-50/80 dark:bg-red-950/50'
    }
  ];

  const handleCardClick = (cardKey) => {
    if (activeMetric === cardKey) {
      // Toggle off / clear filter
      onSelectMetric(null);
    } else {
      onSelectMetric(cardKey);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          const isSelected = activeMetric === c.key;

          return (
            <button
              key={c.key}
              type="button"
              onClick={() => handleCardClick(c.key)}
              className={`civic-card p-4 space-y-1.5 border-l-4 ${c.accentColor} text-left transition-all duration-200 select-none relative group ${
                isSelected
                  ? `ring-2 ring-blue-600 dark:ring-blue-400 ${c.activeBg} border-blue-500 shadow-md scale-[1.02]`
                  : 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01]'
              }`}
              title={`Click to filter complaints by ${c.label}`}
            >
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider truncate">
                  {c.label}
                </span>
                <Icon className={`w-4 h-4 ${c.textColor} shrink-0`} />
              </div>

              <div className="flex items-baseline justify-between">
                <p className={`text-2xl font-black ${c.textColor}`}>
                  {c.value}
                </p>
                {isSelected && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600 text-white shadow-xs">
                    ACTIVE
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium truncate">
                  {c.subtext}
                </span>
                <span className="text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[9px]">
                  {isSelected ? 'Clear' : 'Filter'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
