import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  Share2, 
  ArrowLeft,
  Users,
  Calendar,
  Layers,
  Cpu
} from 'lucide-react';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';
import MiniLeafletMap from '../components/common/MiniLeafletMap';

export default function ComplaintDetailPage() {
  const { trackingId } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadComplaint() {
      try {
        setLoading(true);
        const res = await axios.get(`/api/complaints/${trackingId}`);
        if (res.data?.success && res.data?.complaint) {
          setComplaint(res.data.complaint);
          setTimeline(res.data.timeline || []);
        } else {
          throw new Error('Complaint not found');
        }
      } catch (err) {
        console.error('Failed to load complaint details:', err);
        setError('Could not locate complaint record for ID ' + trackingId);
      } finally {
        setLoading(false);
      }
    }
    loadComplaint();
  }, [trackingId]);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-civic-navy border-t-transparent animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-slate-600">Retrieving Full Public Transparency Dossier...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="civic-card p-8 space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">{error || 'Complaint Not Found'}</h2>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-civic-navy hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-civic-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Map & Dashboard</span>
        </Link>

        <button
          onClick={copyUrl}
          className="civic-tap-target self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Link Copied!' : 'Share Audit Page'}</span>
        </button>
      </div>

      {/* Main Title Banner */}
      <div className="civic-card p-6 sm:p-8 space-y-4 border-t-4 border-t-civic-navy">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sm font-extrabold text-civic-navy bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                {complaint.trackingId}
              </span>
              <StatusBadge status={complaint.status} size="sm" />
              <SeverityBadge score={complaint.priorityScore} size="sm" />
              {complaint.reportCount > 1 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>{complaint.reportCount} Similar Reports Grouped</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-2">
              {complaint.summary}
            </h1>
            {complaint.summaryLocal && (
              <p className="text-xs sm:text-sm text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                ಕನ್ನಡ / हिन्दी: {complaint.summaryLocal}
              </p>
            )}
            <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{complaint.location?.address}</span>
            </p>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 shrink-0 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Priority Rating</p>
            <p className="text-3xl font-black text-civic-navy font-mono">{complaint.priorityScore?.toFixed(1)} <span className="text-sm font-normal text-slate-500">/ 10</span></p>
            <p className="text-[10px] text-slate-500 font-semibold">Deterministic Score</p>
          </div>
        </div>

        {/* Media Gallery / Before-After Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Citizen Evidence Media</p>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
              <img
                src={complaint.media?.[0]?.url || '/seed/pothole-1.svg'}
                alt={complaint.summary}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/seed/pothole-1.svg'; }}
              />
            </div>
          </div>

          {complaint.resolutionPhoto ? (
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Officer Resolution Photo</span>
              </p>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-emerald-50 border-2 border-emerald-500/50">
                <img
                  src={complaint.resolutionPhoto}
                  alt="Resolution proof"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-2 bg-slate-50/50">
              <Clock className="w-8 h-8 text-amber-500" />
              <p className="text-xs font-bold text-slate-700">Remediation in Progress</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                Verification photo will be published here as soon as {complaint.department?.code} field inspectors sign off.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Section: AI Triage & Deterministic Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Gemini 2.5 Flash Triage Analysis */}
        <div className="civic-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Cpu className="w-5 h-5 text-civic-navy" />
            <div>
              <h3 className="text-sm font-extrabold text-civic-navy uppercase tracking-wider">
                Gemini 2.5 Flash Triage Breakdown
              </h3>
              <p className="text-[11px] text-slate-500">Autonomous multimodal inspection & classification</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-600">Detected Category:</span>
              <span className="font-bold text-civic-navy uppercase tracking-wider">{complaint.issueType?.replace('_', ' ')}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-600">Visual Severity Rating:</span>
              <span className="font-bold font-mono text-slate-900">{complaint.aiAnalysis?.visualSeverity} / 5</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-600">Safety Risk Classification:</span>
              <span className={`font-bold uppercase ${
                complaint.aiAnalysis?.safetyRisk === 'high' ? 'text-red-600' : 'text-amber-600'
              }`}>{complaint.aiAnalysis?.safetyRisk}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-600">Model Confidence:</span>
              <span className="font-mono font-bold text-emerald-700">
                {Math.round((complaint.aiAnalysis?.confidence || 0.9) * 100)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-600">Detected Citizen Language:</span>
              <span className="font-bold text-slate-800 uppercase">
                {complaint.aiAnalysis?.languageDetected === 'kn' ? 'Kannada (ಕನ್ನಡ)' : complaint.aiAnalysis?.languageDetected === 'hi' ? 'Hindi (हिन्दी)' : 'English'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Deterministic Score Calculation Formula */}
        <div className="civic-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-civic-gold" />
            <div>
              <h3 className="text-sm font-extrabold text-civic-navy uppercase tracking-wider">
                Explainable Priority Formula
              </h3>
              <p className="text-[11px] text-slate-500">35% Visual + 25% Safety + 15% Location + 15% Dupes + 10% Age</p>
            </div>
          </div>

          <div className="space-y-2">
            {complaint.scoreBreakdown?.map((b, idx) => (
              <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800">{b.factor}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{b.reason}</p>
                </div>
                <span className="font-mono font-bold text-amber-800 shrink-0 ml-2">
                  +{b.points?.toFixed(1)} pts
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Accountable Routing & Legal Jurisdiction */}
      <div className="civic-card p-6 space-y-4 border-l-4 border-l-blue-600 bg-blue-50/20">
        <div className="flex items-center gap-2 border-b border-blue-200/60 pb-3">
          <Building2 className="w-5 h-5 text-blue-700" />
          <div>
            <h3 className="text-sm font-extrabold text-blue-900 uppercase tracking-wider">
              Assigned Authority & Statutory SLA
            </h3>
            <p className="text-xs text-blue-700">Jurisdiction legally matched under Karnataka Municipal & PWD rules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-blue-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Department</span>
            <p className="font-bold text-slate-900 text-sm">{complaint.department?.name}</p>
            <p className="text-slate-500">{complaint.department?.contactEmail}</p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-blue-200 space-y-1 sm:col-span-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Routing Justification</span>
            <p className="font-medium text-slate-800 leading-relaxed">{complaint.routingReason}</p>
          </div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700">Resolution SLA Due Date:</span>
          <span className="font-mono font-bold text-blue-900">
            {new Date(complaint.slaDueAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Verified GIS Incident Location (OpenStreetMap) */}
      <div className="civic-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <div>
              <h3 className="text-sm font-extrabold text-civic-navy uppercase tracking-wider">
                Verified GIS Incident Location
              </h3>
              <p className="text-xs text-slate-500">
                Geotagged coordinates: {complaint.location?.lat?.toFixed(5)}, {complaint.location?.lng?.toFixed(5)}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-civic-navy bg-slate-100 px-2.5 py-1 rounded-lg">
            OpenStreetMap
          </span>
        </div>

        <MiniLeafletMap
          lat={complaint.location?.lat}
          lng={complaint.location?.lng}
          address={complaint.location?.address}
          priorityScore={complaint.priorityScore}
          height="280px"
          zoom={16}
        />
      </div>

      {/* Complete Status Audit Timeline */}
      <div className="civic-card p-6 space-y-6">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-civic-navy flex items-center gap-2">
          <Clock className="w-4 h-4 text-civic-navy" />
          <span>Full Public Audit Trail ({timeline.length} Events Logged)</span>
        </h3>

        <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 pl-6">
          {timeline.map((event, idx) => (
            <div key={idx} className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full ring-4 bg-civic-navy ring-slate-100"></span>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={event.status} size="xs" />
                    <span className="text-xs font-bold text-slate-800">{event.byUser?.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1">{event.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
