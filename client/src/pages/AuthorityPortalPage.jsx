import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  ShieldCheck, 
  UserCheck, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  ExternalLink,
  Camera,
  Upload,
  Send,
  Sparkles,
  Users,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import SeverityBadge from '../components/common/SeverityBadge';
import StatusBadge from '../components/common/StatusBadge';
import MiniLeafletMap from '../components/common/MiniLeafletMap';

export default function AuthorityPortalPage() {
  const { t } = useTranslation();
  const { currentUser, switchRole, DEMO_ROLES } = useAuth();
  const { connected } = useSocket();

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Status Update Modal State
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('in_progress');
  const [officerNote, setOfficerNote] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Load complaints
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const [compRes, deptRes] = await Promise.all([
        axios.get('/api/complaints?limit=100'),
        axios.get('/api/departments')
      ]);
      if (compRes.data?.complaints) setComplaints(compRes.data.complaints);
      if (deptRes.data?.departments) setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error('Failed to load authority queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // Set default department filter when user switches role
  useEffect(() => {
    if (currentUser.dept) {
      setSelectedDeptFilter(currentUser.dept);
    } else {
      setSelectedDeptFilter('ALL');
    }
  }, [currentUser]);

  // Filtered queue sorted by priority score (descending)
  const queue = useMemo(() => {
    return complaints
      .filter((c) => {
        if (selectedDeptFilter !== 'ALL' && c.department?.code !== selectedDeptFilter) return false;
        if (selectedStatusFilter !== 'ALL' && c.status !== selectedStatusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return c.trackingId.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
  }, [complaints, selectedDeptFilter, selectedStatusFilter, searchQuery]);

  const openInspector = (complaint) => {
    setActiveComplaint(complaint);
    setNewStatus(complaint.status === 'received' ? 'assigned' : complaint.status === 'assigned' ? 'in_progress' : 'resolved');
    setOfficerNote('');
    setResolutionPhoto(complaint.resolutionPhoto || (
      complaint.issueType === 'pothole' ? '/seed/resolved-pothole.svg'
      : complaint.issueType === 'water_leak' ? '/seed/resolved-water.svg'
      : '/seed/resolved-garbage.svg'
    ));
    setUpdateSuccess(false);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!activeComplaint) return;

    setUpdating(true);
    try {
      const payload = {
        status: newStatus,
        note: officerNote.trim() || `Status updated to ${newStatus} by ${currentUser.name} (${currentUser.badge})`,
        officerName: currentUser.name,
        officerRole: currentUser.role,
        department: currentUser.dept || activeComplaint.department?.code,
        resolutionPhoto: newStatus === 'resolved' ? resolutionPhoto : null
      };

      const res = await axios.patch(`/api/complaints/${activeComplaint._id}/status`, payload);
      if (res.data?.success) {
        setUpdateSuccess(true);
        // Update local queue list
        setComplaints((prev) => prev.map(c => c._id === activeComplaint._id ? res.data.complaint : c));
        setActiveComplaint(res.data.complaint);
        setTimeout(() => {
          setActiveComplaint(null);
          setUpdateSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating status: ' + (err.response?.data?.error || err.message));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
      
      {/* Header & Role Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-civic-navy text-white p-6 rounded-3xl shadow-elevated">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-civic-gold" />
            <span>Karnataka Municipal Governance Authority Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Priority-Ranked Triage Queue
          </h1>
          <p className="text-xs text-slate-300">
            Complaints strictly ordered by algorithmic urgency score & SLA countdown
          </p>
        </div>

        {/* Current Officer Identity Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Signed in as:</p>
              <p className="text-sm font-extrabold text-white">{currentUser.name}</p>
              <p className="text-xs text-amber-300 font-semibold">{currentUser.badge}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <div className="pt-1">
            <select
              value={currentUser.id}
              onChange={(e) => switchRole(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold border border-slate-700 focus:outline-none"
            >
              {DEMO_ROLES.map((r) => (
                <option key={r.id} value={r.id}>Switch: {r.badge} ({r.name})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="civic-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Department Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedDeptFilter('ALL')}
              className={`civic-tap-target px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDeptFilter === 'ALL'
                  ? 'bg-civic-navy text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Departments
            </button>
            {departments.map((d) => (
              <button
                key={d.code}
                onClick={() => setSelectedDeptFilter(d.code)}
                className={`civic-tap-target px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedDeptFilter === d.code
                    ? 'bg-civic-navy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {d.code}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white shadow-xs focus:ring-2 focus:ring-civic-navy"
            >
              <option value="ALL">All Statuses</option>
              <option value="received">Received</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

        </div>
      </div>

      {/* Queue List Table */}
      <div className="civic-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-extrabold uppercase tracking-wider text-civic-navy">
            Active Priority Queue ({queue.length} Grievances)
          </p>
          <span className="text-[11px] font-bold text-slate-400">Sorted by Priority Score</span>
        </div>

        <div className="divide-y divide-slate-100">
          {queue.map((c) => {
            const isOverdue = (c.status !== 'resolved' && c.status !== 'rejected') && (new Date() > new Date(c.slaDueAt));

            return (
              <div
                key={c.trackingId}
                className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  {/* Photo thumbnail */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    <img
                      src={c.media?.[0]?.url || '/seed/pothole-1.svg'}
                      alt={c.summary}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/seed/pothole-1.svg'; }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-civic-navy bg-slate-100 px-2 py-0.5 rounded">
                        {c.trackingId}
                      </span>
                      <StatusBadge status={c.status} size="xs" />
                      <SeverityBadge score={c.priorityScore} size="xs" />
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-300 animate-pulse">
                          OVERDUE SLA
                        </span>
                      )}
                      {c.reportCount > 1 && (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          {c.reportCount} reports
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">{c.summary}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.location?.address}</span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="font-bold text-civic-navy">{c.department?.name || c.department?.code}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-500">Due: {new Date(c.slaDueAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Inspect & Update Action */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => openInspector(c)}
                    className="civic-tap-target px-4 py-2.5 rounded-xl bg-civic-navy hover:bg-civic-navy-light text-white text-xs font-bold shadow-xs transition-transform active:scale-95"
                  >
                    Inspect & Update
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complaint Detail & Status Update Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-elevated border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-extrabold text-civic-navy bg-slate-100 px-3 py-1 rounded-lg">
                  {activeComplaint.trackingId}
                </span>
                <StatusBadge status={activeComplaint.status} size="sm" />
              </div>
              <button
                onClick={() => setActiveComplaint(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {updateSuccess ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Status Broadcast Successfully!</h3>
                <p className="text-xs text-slate-600">
                  Live Public Dashboard and tracking timelines have updated instantly via WebSockets.
                </p>
              </div>
            ) : (
              <form onSubmit={handleStatusSubmit} className="space-y-6">
                
                {/* Details Summary */}
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-slate-900">{activeComplaint.summary}</h3>
                  <p className="text-xs text-slate-500">{activeComplaint.location?.address}</p>
                  
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Priority Rating</span>
                      <p className="font-bold text-civic-navy text-sm">{activeComplaint.priorityScore} / 10</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Target SLA Due</span>
                      <p className="font-mono font-bold text-slate-800 text-xs">{new Date(activeComplaint.slaDueAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* OpenStreetMap Location Inspection */}
                  <div className="pt-2">
                    <MiniLeafletMap
                      lat={activeComplaint.location?.lat}
                      lng={activeComplaint.location?.lng}
                      address={activeComplaint.location?.address}
                      priorityScore={activeComplaint.priorityScore}
                      height="170px"
                      zoom={15}
                    />
                  </div>
                </div>

                {/* Status Update Controls */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Transition Status To:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['assigned', 'in_progress', 'resolved'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewStatus(s)}
                          className={`civic-tap-target py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                            newStatus === s
                              ? 'bg-civic-navy text-white border-civic-navy shadow-md'
                              : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                          }`}
                        >
                          {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Photo if status is resolved */}
                  {newStatus === 'resolved' && (
                    <div className="space-y-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-300">
                      <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-emerald-700" />
                        <span>Resolution Photo Evidence (Required for Closure)</span>
                      </label>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { img: '/seed/resolved-pothole.svg', label: 'Road Repaired' },
                          { img: '/seed/resolved-water.svg', label: 'Pipe Replaced' },
                          { img: '/seed/resolved-garbage.svg', label: 'Waste Cleared' }
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => setResolutionPhoto(item.img)}
                            className={`p-1.5 rounded-xl border-2 cursor-pointer transition-all ${
                              resolutionPhoto === item.img ? 'border-emerald-600 bg-white shadow-md' : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <img src={item.img} alt={item.label} className="aspect-video w-full object-cover rounded-lg" />
                            <p className="text-[10px] font-bold text-center mt-1 text-slate-700">{item.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remediation Note */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Official Remediation Note:</label>
                    <textarea
                      rows={3}
                      value={officerNote}
                      onChange={(e) => setOfficerNote(e.target.value)}
                      placeholder="e.g. Field team dispatched; bitumen patched and roller compacted..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-civic-navy outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex-1 civic-tap-target py-3.5 rounded-xl bg-civic-navy hover:bg-civic-navy-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>{updating ? 'Broadcasting...' : 'Broadcast Status Change'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveComplaint(null)}
                    className="px-4 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
