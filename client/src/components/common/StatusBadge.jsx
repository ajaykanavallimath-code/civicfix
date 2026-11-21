import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, UserCheck, Wrench, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm', showIcon = true }) {
  const { t } = useTranslation();

  const configs = {
    received: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: Clock,
      label: t('common.status_received')
    },
    assigned: {
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: UserCheck,
      label: t('common.status_assigned')
    },
    in_progress: {
      bg: 'bg-amber-50 text-amber-900 border-amber-300',
      icon: Wrench,
      label: t('common.status_in_progress')
    },
    resolved: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      icon: CheckCircle2,
      label: t('common.status_resolved')
    },
    rejected: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: XCircle,
      label: 'Rejected'
    }
  };

  const current = configs[status] || configs.received;
  const Icon = current.icon;

  const sizeClasses = size === 'lg' 
    ? 'text-sm px-3 py-1 font-bold'
    : size === 'xs'
    ? 'text-[11px] px-1.5 py-0.5 font-medium'
    : 'text-xs px-2.5 py-0.5 font-semibold';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${current.bg} ${sizeClasses}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{current.label}</span>
    </span>
  );
}
