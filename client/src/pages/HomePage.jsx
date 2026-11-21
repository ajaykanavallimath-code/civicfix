import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PlusCircle, 
  MapPin, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Layers, 
  Building2,
  Users
} from 'lucide-react';
import axios from 'axios';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 28,
    resolved: 7,
    inProgress: 17,
    avgResolutionHours: 17.6,
    onTimePercentage: 58
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, complaintsRes] = await Promise.all([
          axios.get('/api/complaints/analytics/stats'),
          axios.get('/api/complaints?limit=4')
        ]);
        if (statsRes.data?.stats) setStats(statsRes.data.stats);
        if (complaintsRes.data?.complaints) setRecentComplaints(complaintsRes.data.complaints);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-civic-navy to-civic-navy-light text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5B301_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300 shadow-xs">
            <Sparkles className="w-4 h-4 text-civic-gold" />
            <span>IDEA//FORGE Track 1 (Civic Pulse) • Problem 2</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Transparent Civic Grievances. <br />
            <span className="text-civic-gold">AI-Triaged. Publicly Accountable.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-200 font-normal leading-relaxed">
            Report road damages, water leaks, garbage, or electrical hazards in 3 taps.
            Every severity rating, departmental routing decision, and SLA countdown is 100% visible and explainable to the public.
          </p>

          {/* Core Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/report"
              className="w-full sm:w-auto civic-tap-target px-8 py-4 rounded-2xl bg-civic-gold hover:bg-amber-400 text-civic-navy font-bold text-base shadow-elevated transition-transform duration-150 hover:scale-105 flex items-center justify-center gap-3"
            >
              <PlusCircle className="w-5 h-5 text-civic-navy" />
              <span>Report a Problem (3 Taps)</span>
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto civic-tap-target px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 transition-all flex items-center justify-center gap-3"
            >
              <MapPin className="w-5 h-5 text-amber-300" />
              <span>Explore Live Public Map</span>
            </Link>

            <button
              onClick={() => navigate('/report?demo=true')}
              className="w-full sm:w-auto civic-tap-target px-5 py-4 rounded-2xl bg-indigo-600/40 hover:bg-indigo-600/60 text-amber-200 border border-indigo-400/40 text-sm font-semibold transition-all flex items-center justify-center gap-2"
              title="Pre-fills a realistic high-severity complaint for instant testing"
            >
              <Zap className="w-4 h-4 text-civic-gold" />
              <span>1-Click Demo Mode</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total}</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">Logged in Savanur & Haveri</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{stats.resolved}</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">Verified Remedied</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-2xl sm:text-3xl font-extrabold text-civic-gold">{stats.avgResolutionHours}h</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">Avg. Fix Time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">{stats.onTimePercentage}%</p>
              <p className="text-xs text-slate-300 mt-1 font-medium">SLA Compliance Rate</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3 Pillars of CivicFix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-civic-navy">
            How CivicFix Guarantees Accountability
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Eliminating bureaucratic black boxes with deterministic scoring, AI triage, and live GIS tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="civic-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Zap className="w-6 h-6 text-civic-navy" />
            </div>
            <h3 className="text-lg font-bold text-civic-navy">1. Explainable Priority Score</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              No black-box decisions. The priority score (0-10) is a deterministic weighted sum of visual severity (35%), safety risk (25%), school/hospital proximity (15%), community duplicate reports (15%), and unresolved age (10%).
            </p>
            <div className="text-xs font-mono bg-slate-100 p-2.5 rounded-xl text-slate-700">
              Score = 3.5(Sev) + 2.5(Risk) + 1.5(School) + 1.2(Dupes) + 0.5(Age)
            </div>
          </div>

          <div className="civic-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-civic-navy" />
            </div>
            <h3 className="text-lg font-bold text-civic-navy">2. Automated Karnataka Routing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Instantly maps each complaint to its lawful jurisdiction: Town Municipal Council (TMC), PWD Haveri, KUWS&DB water board, HESCOM electrical lines, or KSPCB, with an explicit, visible reason and enforceable SLA hours.
            </p>
            <div className="text-xs bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-blue-800">
              "Water Leak → KUWS&amp;DB because urban distribution is under state water board; SLA: 48h"
            </div>
          </div>

          <div className="civic-card p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-800" />
            </div>
            <h3 className="text-lg font-bold text-civic-navy">3. Live GIS Public Audit Trail</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Every status change broadcasts instantly via WebSockets to the public live map. Citizens inspect before/after remediation photos, officer notes, and overdue countdowns in real time.
            </p>
            <div className="text-xs bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Full resolution photo verification required for closure</span>
            </div>
          </div>

        </div>
      </section>

      {/* Live Highlights / Recent Complaints */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-civic-navy">Recent Live Triage Feed</h2>
            <p className="text-slate-500 text-xs sm:text-sm">Triaged reports around Haveri & Savanur region</p>
          </div>
          <Link to="/dashboard" className="text-xs sm:text-sm font-semibold text-civic-navy hover:text-amber-600 flex items-center gap-1">
            <span>View All on Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentComplaints.map((item) => (
            <div 
              key={item.trackingId}
              onClick={() => navigate(`/complaint/${item.trackingId}`)}
              className="civic-card p-4 cursor-pointer hover:border-civic-navy/40 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img 
                    src={item.media?.[0]?.url || '/seed/pothole-1.svg'} 
                    alt={item.summary} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/seed/pothole-1.svg'; }}
                  />
                </div>
                
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[11px] font-bold text-slate-500">{item.trackingId}</span>
                  <StatusBadge status={item.status} size="xs" />
                </div>

                <h4 className="font-bold text-sm text-slate-800 line-clamp-2">{item.summary}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{item.location?.address}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <SeverityBadge score={item.priorityScore} size="xs" />
                <span className="font-semibold text-slate-600">{item.department?.code}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
