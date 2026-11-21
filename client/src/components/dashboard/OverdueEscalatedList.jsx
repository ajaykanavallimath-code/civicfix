import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Clock, ArrowRight, ShieldAlert, Mail } from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';

export default function OverdueEscalatedList({ overdueComplaints = [] }) {
  const { t } = useTranslation();

  if (overdueComplaints.length === 0) {
    return (
      <div className="civic-card p-6 text-center space-y-2 border-l-4 border-l-emerald-500">
        <p className="text-sm font-bold text-emerald-800">No Overdue Grievances Currently!</p>
        <p className="text-xs text-slate-500">All local departments in Haveri and Savanur are operating within SLA deadlines.</p>
      </div>
    );
  }

  return (
    <div className="civic-card p-5 space-y-4 border-l-4 border-l-red-500 bg-red-50/20">
      <div className="flex items-center justify-between border-b border-red-200/60 pb-3">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-red-900">
              {t('dashboard.overdue_title')} ({overdueComplaints.length})
            </h3>
            <p className="text-xs text-red-700">Grievances that exceeded target resolution SLA threshold</p>
          </div>
        </div>
        <span className="text-[11px] font-bold uppercase bg-red-600 text-white px-2.5 py-1 rounded-full shadow-xs">
          Executive Escalation
        </span>
      </div>

      <div className="divide-y divide-red-200/50">
        {overdueComplaints.map((c) => {
          const overdueMs = Date.now() - new Date(c.slaDueAt).getTime();
          const overdueHours = Math.round(overdueMs / (1000 * 3600));

          return (
            <div key={c.trackingId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-700">{c.trackingId}</span>
                  <SeverityBadge score={c.priorityScore} size="xs" />
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800 border border-red-300">
                    Overdue by {overdueHours}h
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">{c.summary}</h4>
                <p className="text-xs text-slate-500">{c.location?.address}</p>
                <p className="text-[11px] text-slate-600 flex items-center gap-1">
                  <span>Assigned: </span>
                  <span className="font-bold text-civic-navy">{c.department?.name || c.department?.code}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500">{c.department?.contactEmail}</span>
                </p>
              </div>

              <Link
                to={`/complaint/${c.trackingId}`}
                className="civic-tap-target shrink-0 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Inspect Escalation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
