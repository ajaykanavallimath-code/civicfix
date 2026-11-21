import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';

export default function TrackPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sample quick tracking IDs for judges / presenters
  const sampleIds = [
    { id: 'CF-2026-000101', label: 'CF-000101 (In Progress - Water)' },
    { id: 'CF-2026-000102', label: 'CF-000102 (Overdue - PWD)' },
    { id: 'CF-2026-000103', label: 'CF-000103 (Resolved - TMC)' },
    { id: 'CF-2026-000106', label: 'CF-000106 (Resolved - PWD)' }
  ];

  const searchComplaint = async (targetId) => {
    const id = (targetId || trackingId).trim();
    if (!id) return;

    setLoading(true);
    setErrorMessage(null);
    setComplaint(null);
    setTimeline([]);

    try {
      const res = await axios.get(`/api/complaints/${id}`);
      if (res.data?.success && res.data?.complaint) {
        setComplaint(res.data.complaint);
        setTimeline(res.data.timeline || []);
      } else {
        throw new Error('Complaint not found');
      }
    } catch (err) {
      console.warn('Track search error:', err);
      setErrorMessage(`No record found for tracking ID "${id}". Please verify code.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('id')) {
      searchComplaint(searchParams.get('id'));
    }
  }, [searchParams]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    searchComplaint();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-16">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-civic-navy">{t('nav.track')}</h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          Enter your unique tracking ID to inspect real-time progress, officer remediation notes, and before/after verification photos.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="civic-card p-4 sm:p-6 space-y-3">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
              placeholder="e.g. CF-2026-000101"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-civic-navy bg-white shadow-xs font-bold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="civic-tap-target px-6 py-3 rounded-xl bg-civic-navy hover:bg-civic-navy-light text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2"
          >
            <span>{loading ? 'Searching...' : 'Search'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Sample IDs */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-slate-500">Demo Codes:</span>
          {sampleIds.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTrackingId(item.id);
                searchComplaint(item.id);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 transition-colors border border-slate-200"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Complaint Search Results & Timeline */}
      {complaint && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Card */}
          <div className="civic-card p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-extrabold text-civic-navy bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {complaint.trackingId}
                  </span>
                  <StatusBadge status={complaint.status} size="sm" />
                  <SeverityBadge score={complaint.priorityScore} size="sm" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{complaint.summary}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{complaint.location?.address}</span>
                </p>
              </div>

              <Link
                to={`/complaint/${complaint.trackingId}`}
                className="civic-tap-target shrink-0 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <span>Full Transparency Dossier</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Before / After Photo Comparison if Resolved */}
            {complaint.resolutionPhoto && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Before & After Remediation Verification</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Before (Citizen Evidence)</p>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={complaint.media?.[0]?.url || '/seed/pothole-1.svg'}
                        alt="Before remediation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">After (Officer Fixed Verification)</p>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-emerald-50 border-2 border-emerald-500/40">
                      <img
                        src={complaint.resolutionPhoto}
                        alt="After remediation"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Department & SLA Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Accountable Department</span>
                <p className="font-bold text-civic-navy">{complaint.department?.name || complaint.department?.code}</p>
                <p className="text-slate-500">{complaint.department?.contactEmail}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Statutory SLA Target</span>
                <p className="font-mono font-bold text-slate-800">
                  {new Date(complaint.slaDueAt).toLocaleString()}
                </p>
                <p className="text-slate-500">
                  {complaint.status === 'resolved' 
                    ? 'Resolved on-time within jurisdiction target' 
                    : new Date() > new Date(complaint.slaDueAt) 
                    ? 'EXCEEDED SLA - Escalated to Deputy Commissioner' 
                    : 'Remediation currently in schedule'}
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Step Timeline */}
          <div className="civic-card p-6 space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-civic-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-civic-navy" />
              <span>Public Audit Timeline (Received → Assigned → In Progress → Resolved)</span>
            </h3>

            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-6">
              {timeline.map((event, idx) => {
                const isResolved = event.status === 'resolved';
                const isProgress = event.status === 'in_progress';
                const isAssigned = event.status === 'assigned';

                const dotColor = isResolved ? 'bg-emerald-500 ring-emerald-100'
                  : isProgress ? 'bg-amber-500 ring-amber-100'
                  : isAssigned ? 'bg-purple-500 ring-purple-100'
                  : 'bg-blue-500 ring-blue-100';

                return (
                  <div key={idx} className="relative group">
                    {/* Pulsing Step Node */}
                    <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full ring-4 ${dotColor}`}></span>
                    
                    <div className="space-y-1 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={event.status} size="xs" />
                          <span className="text-xs font-bold text-slate-800">
                            {event.byUser?.name || 'Civic Authority'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({event.byUser?.role || 'system'})
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1">
                        {event.note}
                      </p>

                      {event.photo && (
                        <div className="mt-2 max-w-xs rounded-xl overflow-hidden border border-slate-300">
                          <img src={event.photo} alt="Timeline attachment" className="w-full h-auto object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
