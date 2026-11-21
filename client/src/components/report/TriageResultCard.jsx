import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  Building2, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Layers,
  MapPin,
  ExternalLink
} from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';

export default function TriageResultCard({ complaint, onReportAnother }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyTrackingId = () => {
    navigator.clipboard.writeText(complaint.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="civic-card p-6 sm:p-8 space-y-6 max-w-2xl mx-auto border-2 border-emerald-500/40 shadow-elevated animate-in zoom-in-95 duration-200">
      
      {/* Success Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-soft">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-civic-navy">{t('report.triage_success')}</h2>
        <p className="text-xs text-slate-500">Your grievance has been logged, triaged, and routed under public oversight.</p>
      </div>

      {/* Tracking ID Pill */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div>
          <p className="text-[11px] font-bold text-amber-300 uppercase tracking-widest">{t('report.tracking_id')}</p>
          <p className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white mt-0.5">{complaint.trackingId}</p>
        </div>
        <button
          type="button"
          onClick={copyTrackingId}
          className="civic-tap-target px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 flex items-center gap-2 border border-white/10 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-civic-gold" />}
          <span>{copied ? t('report.copied') : t('report.copy_id')}</span>
        </button>
      </div>

      {/* Media & Summary Spotlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        {complaint.media?.[0]?.url && (
          <div className="aspect-video sm:aspect-square w-full rounded-xl overflow-hidden bg-slate-200 border border-slate-300">
            <img 
              src={complaint.media[0].url} 
              alt={complaint.summary} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/seed/pothole-1.svg'; }}
            />
          </div>
        )}
        <div className={`space-y-2 ${complaint.media?.[0]?.url ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-civic-navy text-white uppercase tracking-wider">
              {complaint.issueType?.replace('_', ' ')}
            </span>
            <SeverityBadge score={complaint.priorityScore} />
          </div>
          <h3 className="font-bold text-base text-slate-900 leading-snug">{complaint.summary}</h3>
          {complaint.summaryLocal && (
            <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 font-sans italic">
              ಕನ್ನಡ / हिन्दी: {complaint.summaryLocal}
            </p>
          )}
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{complaint.location?.address}</span>
          </p>
        </div>
      </div>

      {/* Explainable Deterministic Priority Score Breakdown */}
      <div className="space-y-3 bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-civic-navy" />
            <span className="text-xs font-extrabold text-civic-navy uppercase tracking-wider">
              {t('triage.priority_score')}
            </span>
          </div>
          <span className="text-lg font-black text-civic-navy bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-xs">
            {complaint.priorityScore?.toFixed(1)} / 10.0
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Determined algorithmically through transparent weighting, not an unexplainable black box:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {complaint.scoreBreakdown?.map((b, idx) => (
            <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>{b.factor}</span>
                <span className="font-mono text-amber-700">+{b.points?.toFixed(1)} pts</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{b.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transparent Routing & SLA Justification */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">{t('triage.assigned_dept')}</span>
          </div>
          <span className="text-xs font-bold text-blue-900 bg-blue-100 px-3 py-1 rounded-full border border-blue-300">
            {complaint.department?.name || complaint.department?.code}
          </span>
        </div>

        <div className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-blue-100">
          <span className="font-bold text-slate-800">Routing Justification: </span>
          {complaint.routingReason}
        </div>

        <div className="flex items-center justify-between text-xs text-blue-900 font-semibold pt-1">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Resolution SLA Target:</span>
          </span>
          <span className="font-mono font-bold">
            {complaint.slaDueAt ? new Date(complaint.slaDueAt).toLocaleString() : 'Within 48 hours'}
          </span>
        </div>
      </div>

      {/* Human Review Disclaimer if confidence is low */}
      {complaint.needsHumanReview && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{t('triage.human_review_notice')}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          to={`/complaint/${complaint.trackingId}`}
          className="flex-1 civic-tap-target py-3.5 rounded-xl bg-civic-navy hover:bg-civic-navy-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <span>{t('report.view_timeline')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/dashboard"
          className="flex-1 civic-tap-target py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-300 transition-colors"
        >
          <span>View on Public Map</span>
          <ExternalLink className="w-4 h-4" />
        </Link>

        <button
          type="button"
          onClick={onReportAnother}
          className="civic-tap-target py-3.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors"
        >
          {t('report.report_another')}
        </button>
      </div>

    </div>
  );
}
