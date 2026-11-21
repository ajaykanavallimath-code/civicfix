import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export default function SeverityBadge({ score, level, size = 'sm', showIcon = true }) {
  const { t } = useTranslation();

  let severity = 'low';
  let numScore = typeof score === 'number' ? score : null;

  if (level) {
    severity = level.toLowerCase();
  } else if (numScore !== null) {
    if (numScore >= 8.5) severity = 'critical';
    else if (numScore >= 7.0) severity = 'high';
    else if (numScore >= 4.5) severity = 'medium';
    else severity = 'low';
  }

  const configs = {
    low: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: t('common.severity_low')
    },
    medium: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      icon: AlertCircle,
      label: t('common.severity_medium')
    },
    high: {
      bg: 'bg-orange-50 text-orange-800 border-orange-300',
      dot: 'bg-orange-500',
      icon: AlertTriangle,
      label: t('common.severity_high')
    },
    critical: {
      bg: 'bg-red-50 text-red-800 border-red-300',
      dot: 'bg-red-500 animate-pulse',
      icon: Flame,
      label: t('common.severity_critical')
    }
  };

  const current = configs[severity] || configs.medium;
  const Icon = current.icon;

  const sizeClasses = size === 'lg' 
    ? 'text-sm px-3 py-1 font-bold'
    : size === 'xs'
    ? 'text-[11px] px-1.5 py-0.5 font-medium'
    : 'text-xs px-2.5 py-0.5 font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${current.dot}`}></span>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{current.label}</span>
      {numScore !== null && <span className="opacity-75 font-mono">({numScore.toFixed(1)})</span>}
    </span>
  );
}
