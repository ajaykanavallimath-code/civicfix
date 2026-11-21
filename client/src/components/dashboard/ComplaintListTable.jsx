import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  MapPin, 
  Clock, 
  Building2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import StatusBadge from '../common/StatusBadge';

export default function ComplaintListTable({ 
  complaints = [], 
  activeMetric = null, 
  onClearMetric = () => {},
  totalAvailable = 0 
}) {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (id) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter by local search query
  const displayedComplaints = complaints.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.trackingId?.toLowerCase().includes(q) ||
      c.summary?.toLowerCase().includes(q) ||
      c.location?.address?.toLowerCase().includes(q) ||
      c.issueType?.toLowerCase().includes(q) ||
      c.department?.name?.toLowerCase().includes(q) ||
      c.department?.code?.toLowerCase().includes(q)
    );
  });

  const getMetricLabel = (key) => {
    switch (key) {
      case 'total': return 'All Grievances';
      case 'resolved': return 'Resolved Fixes';
      case 'in_progress': return 'In Progress Grievances';
      case 'avg_time': return 'Resolved Fixes with SLA Metrics';
      case 'on_time': return 'On-Time SLA Compliant Fixes';
      case 'overdue': return 'Overdue / Escalated Grievances';
      default: return null;
    }
  };

  return (
    <div className="civic-card p-5 space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-[#172B4D] dark:text-white">
              Live Grievances Feed
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              {displayedComplaints.length} of {totalAvailable}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ranked with newest submissions first. Live updates broadcast without page reload.
          </p>
        </div>

        {/* Quick Search in List */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feed by ID, street, or issue..."
            className="w-full sm:w-64 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
          />
        </div>
      </div>

      {/* Active Metric Filter Banner */}
      {activeMetric && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-medium">
            <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Active KPI Filter: <strong>{getMetricLabel(activeMetric)}</strong> ({displayedComplaints.length} grievances match)</span>
          </div>
          <button
            onClick={onClearMetric}
            className="flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200 underline"
          >
            <X className="w-3 h-3" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {displayedComplaints.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No complaints match the current filter selection
          </p>
          <p className="text-xs text-slate-500">
            Try resetting the KPI card filter or clearing your dropdown selection.
          </p>
          {activeMetric && (
            <button
              onClick={onClearMetric}
              className="mt-2 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Show All Grievances
            </button>
          )}
        </div>
      ) : (
        /* Complaints Feed List (Cards / Rows) */
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {displayedComplaints.map((c) => {
            const isVeryRecent = Date.now() - new Date(c.createdAt).getTime() < 15 * 60 * 1000;
            const timeAgo = getTimeAgo(c.createdAt);

            return (
              <div 
                key={c._id || c.trackingId} 
                className={`py-3.5 px-2 rounded-xl transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isVeryRecent ? 'bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40' : ''
                }`}
              >
                {/* Left Column: ID, Badges, Details */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Tracking ID with Copy */}
                    <button
                      onClick={() => copyToClipboard(c.trackingId)}
                      className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 group bg-blue-50 dark:bg-blue-900/40 px-2 py-0.5 rounded-md"
                      title="Click to copy tracking ID"
                    >
                      <span>{c.trackingId}</span>
                      {copiedId === c.trackingId ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>

                    {/* New Badge */}
                    {isVeryRecent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 animate-pulse">
                        <Sparkles className="w-3 h-3" />
                        <span>JUST REPORTED</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    <StatusBadge status={c.status} size="sm" />

                    {/* Severity Badge */}
                    <SeverityBadge score={c.priorityScore} size="xs" />

                    {/* Priority Score Pill */}
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      Score: <strong className="text-[#172B4D] dark:text-slate-200">{c.priorityScore ? c.priorityScore.toFixed(1) : '7.5'}/10</strong>
                    </span>

                    {/* Elapsed Time */}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{timeAgo}</span>
                    </span>
                  </div>

                  {/* Summary */}
                  <h3 className="font-bold text-xs sm:text-sm text-[#172B4D] dark:text-slate-100 line-clamp-1">
                    {c.summary || `${c.issueType} reported at ${c.location?.address}`}
                  </h3>

                  {/* Address and Department */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1 line-clamp-1 max-w-sm">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.location?.address || 'Savanur Town'}</span>
                    </span>

                    <span className="text-slate-300 dark:text-slate-700">•</span>

                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{c.department?.name || c.department?.code || 'Local Authority'}</span>
                    </span>
                  </div>
                </div>

                {/* Right Column: CTA Inspect Button */}
                <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                  <Link
                    to={`/complaint/${c.trackingId}`}
                    className="civic-tap-target px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-[#172B4D] dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs group"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Helper: Calculate relative time string
function getTimeAgo(dateString) {
  if (!dateString) return 'recently';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
