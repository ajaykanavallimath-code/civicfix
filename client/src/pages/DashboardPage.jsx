import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  MapPin, 
  Radio, 
  Flame, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Bell,
  ArrowRight
} from 'lucide-react';
import StatCardGrid from '../components/dashboard/StatCardGrid';
import FilterBar from '../components/dashboard/FilterBar';
import LiveGoogleMap from '../components/dashboard/LiveGoogleMap';
import ComplaintListTable from '../components/dashboard/ComplaintListTable';
import TrendCharts from '../components/dashboard/TrendCharts';
import OverdueEscalatedList from '../components/dashboard/OverdueEscalatedList';
import DepartmentLeaderboard from '../components/dashboard/DepartmentLeaderboard';
import { useSocket } from '../context/SocketContext';
import { useGeolocation } from '../hooks/useGeolocation';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { connected, latestEvent } = useSocket();
  const { coords: userCoords } = useGeolocation();

  // State
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 28,
    resolved: 7,
    inProgress: 17,
    received: 4,
    overdue: 5,
    avgResolutionHours: 17.6,
    onTimePercentage: 58
  });
  const [chartsData, setChartsData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [departments, setDepartments] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [liveToast, setLiveToast] = useState(null);

  // Active Metric Filter (from the 6 clickable stat cards)
  const [activeMetric, setActiveMetric] = useState(null);

  // Dropdown & Map Filters state
  const [filters, setFilters] = useState({
    issueType: 'all',
    severity: 'all',
    status: 'all',
    department: 'all'
  });
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [complaintsRes, statsRes, chartsRes, leaderboardRes, deptsRes] = await Promise.all([
        axios.get('/api/complaints?limit=100'),
        axios.get('/api/complaints/analytics/stats'),
        axios.get('/api/complaints/analytics/charts'),
        axios.get('/api/complaints/analytics/leaderboard'),
        axios.get('/api/departments')
      ]);

      if (complaintsRes.data?.complaints) {
        // Ensure sorted by newest first
        const sorted = [...complaintsRes.data.complaints].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setComplaints(sorted);
      }
      if (statsRes.data?.stats) setStats(statsRes.data.stats);
      if (chartsRes.data?.charts) setChartsData(chartsRes.data.charts);
      if (leaderboardRes.data?.leaderboard) setLeaderboard(leaderboardRes.data.leaderboard);
      if (deptsRes.data?.departments) setDepartments(deptsRes.data.departments);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Real-Time Socket.IO events (complaint:new, complaint:updated)
  useEffect(() => {
    if (!latestEvent) return;

    if (latestEvent.type === 'new' && latestEvent.complaint) {
      const newComp = latestEvent.complaint;
      
      // CRITICAL: New complaint prepended at TOP of list immediately
      setComplaints((prev) => [newComp, ...prev.filter(c => c._id !== newComp._id && c.trackingId !== newComp.trackingId)]);
      
      // Update KPI stats count dynamically
      setStats((prev) => ({
        ...prev,
        total: (prev.total || 0) + 1,
        received: (prev.received || 0) + 1
      }));

      // Flash live toast banner
      setLiveToast({
        title: 'New Complaint Live Triaged!',
        trackingId: newComp.trackingId,
        summary: newComp.summary,
        type: newComp.issueType
      });
      setTimeout(() => setLiveToast(null), 6000);
    }

    if (latestEvent.type === 'updated' && latestEvent.data) {
      const updated = latestEvent.data.complaint;
      if (updated) {
        setComplaints((prev) => prev.map(c => c._id === updated._id ? updated : c));
        // Refresh aggregated stats
        axios.get('/api/complaints/analytics/stats').then(res => {
          if (res.data?.stats) setStats(res.data.stats);
        });
      }
    }
  }, [latestEvent]);

  // Handle Filter Change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ issueType: 'all', severity: 'all', status: 'all', department: 'all' });
    setIsNearMeActive(false);
    setIsHeatmapActive(false);
    setActiveMetric(null);
  };

  // Filter complaints based on active metric card + dropdown filters + Near Me
  const filteredComplaints = useMemo(() => {
    const now = new Date();

    return complaints.filter((c) => {
      // 1. Metric Card Click Filter
      if (activeMetric) {
        if (activeMetric === 'resolved' && c.status !== 'resolved') {
          return false;
        }
        if (activeMetric === 'in_progress' && c.status !== 'in_progress' && c.status !== 'assigned') {
          return false;
        }
        if (activeMetric === 'avg_time' && c.status !== 'resolved') {
          return false;
        }
        if (activeMetric === 'on_time') {
          if (c.status !== 'resolved') return false;
          const resolvedDate = new Date(c.resolvedAt || c.updatedAt);
          const slaDate = new Date(c.slaDueAt);
          if (resolvedDate > slaDate) return false;
        }
        if (activeMetric === 'overdue') {
          const isOverdue = (c.status !== 'resolved' && c.status !== 'rejected') && (now > new Date(c.slaDueAt));
          if (!isOverdue && c.status !== 'escalated') return false;
        }
      }

      // 2. Dropdown Filters
      if (filters.issueType !== 'all' && c.issueType !== filters.issueType) return false;
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      if (filters.department !== 'all' && c.department?.code !== filters.department) return false;
      if (filters.severity !== 'all' && c.aiAnalysis?.visualSeverity !== Number(filters.severity)) return false;

      // 3. Near Me Filter: within ~10km of user coords
      if (isNearMeActive && userCoords?.lat && userCoords?.lng) {
        const dLat = Math.abs(c.location.lat - userCoords.lat);
        const dLng = Math.abs(c.location.lng - userCoords.lng);
        if (dLat > 0.09 || dLng > 0.09) return false;
      }

      return true;
    });
  }, [complaints, activeMetric, filters, isNearMeActive, userCoords]);

  // Extract overdue complaints for the escalation banner
  const overdueComplaints = useMemo(() => {
    const now = new Date();
    return complaints.filter(c => (c.status !== 'resolved' && c.status !== 'rejected') && (now > new Date(c.slaDueAt)));
  }, [complaints]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      
      {/* Live Toast Banner on new Socket.IO event */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B4D] dark:bg-slate-900 text-white p-4 rounded-2xl shadow-floating border-2 border-blue-500 max-w-sm animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-wider">{liveToast.title}</p>
              <p className="text-xs font-semibold line-clamp-1">{liveToast.summary}</p>
              <p className="text-[11px] font-mono text-slate-300">Tracking: {liveToast.trackingId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span>{connected ? t('dashboard.live_pulse') || 'LIVE DATA SYNC ENABLED' : 'RECONNECTING LIVE FEED...'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] dark:text-white tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1">{t('dashboard.subtitle')}</p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="civic-tap-target self-start md:self-auto px-4 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs flex items-center gap-2 transition-all active:scale-95"
          title="Refresh All Metrics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. Stat Cards Grid (Clickable for Interactive Filtering) */}
      <StatCardGrid 
        stats={stats} 
        activeMetric={activeMetric}
        onSelectMetric={(metricKey) => setActiveMetric(metricKey)}
      />

      {/* 2. Public Live Map & Multi-Filter Bar */}
      <div className="space-y-4">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onToggleNearMe={() => setIsNearMeActive(!isNearMeActive)}
          isNearMeActive={isNearMeActive}
          onToggleHeatmap={() => setIsHeatmapActive(!isHeatmapActive)}
          isHeatmapActive={isHeatmapActive}
          departments={departments}
          totalCount={filteredComplaints.length}
        />

        <LiveGoogleMap
          complaints={filteredComplaints}
          isHeatmapActive={isHeatmapActive}
          center={{ lat: 14.9695, lng: 75.3410 }}
          zoom={13}
        />
      </div>

      {/* 3. Live Grievances Feed (Sorted Newest First) */}
      <ComplaintListTable
        complaints={filteredComplaints}
        activeMetric={activeMetric}
        onClearMetric={() => setActiveMetric(null)}
        totalAvailable={complaints.length}
      />

      {/* 4. Overdue / Escalated Complaints Section (Past SLA) */}
      <OverdueEscalatedList overdueComplaints={overdueComplaints} />

      {/* 5. Analytics & Trends Recharts Visualizations */}
      <TrendCharts chartsData={chartsData} />

      {/* 6. Department Accountability Leaderboard */}
      <DepartmentLeaderboard leaderboard={leaderboard} />

    </div>
  );
}
