import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Filter, 
  MapPin, 
  Flame, 
  Radio, 
  Layers, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function FilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  onToggleNearMe,
  isNearMeActive,
  onToggleHeatmap,
  isHeatmapActive,
  departments = [],
  totalCount = 0
}) {
  const { t } = useTranslation();

  const issueTypes = [
    { value: 'all', label: 'All Issues' },
    { value: 'pothole', label: 'Pothole' },
    { value: 'water_leak', label: 'Water Leak' },
    { value: 'garbage', label: 'Garbage' },
    { value: 'streetlight', label: 'Streetlight' },
    { value: 'sewage', label: 'Sewage' },
    { value: 'pollution', label: 'Pollution' },
    { value: 'road_damage', label: 'Road Damage' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'received', label: 'Received' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const severities = [
    { value: 'all', label: 'All Severities' },
    { value: '5', label: 'Level 5 (Critical)' },
    { value: '4', label: 'Level 4 (High)' },
    { value: '3', label: 'Level 3 (Medium)' },
    { value: '2', label: 'Level 2' },
    { value: '1', label: 'Level 1 (Low)' }
  ];

  return (
    <div className="civic-card p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-civic-navy" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-civic-navy">
            {t('dashboard.filters')} ({totalCount})
          </span>
        </div>

        {/* Action Toggles: Near Me & Heatmap */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onToggleNearMe}
            className={`civic-tap-target px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
              isNearMeActive
                ? 'bg-civic-navy text-white border-civic-navy shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${isNearMeActive ? 'text-civic-gold' : 'text-slate-500'}`} />
            <span>{t('dashboard.near_me')}</span>
          </button>

          <button
            type="button"
            onClick={onToggleHeatmap}
            className={`civic-tap-target px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs ${
              isHeatmapActive
                ? 'bg-amber-500 text-civic-navy border-amber-600 shadow-md font-black'
                : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${isHeatmapActive ? 'text-red-700' : 'text-amber-500'}`} />
            <span>{t('dashboard.heatmap_toggle')}</span>
          </button>

          <button
            type="button"
            onClick={onResetFilters}
            className="civic-tap-target p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        
        {/* Issue Type */}
        <select
          value={filters.issueType}
          onChange={(e) => onFilterChange('issueType', e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-civic-navy shadow-xs"
        >
          {issueTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        {/* Severity */}
        <select
          value={filters.severity}
          onChange={(e) => onFilterChange('severity', e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-civic-navy shadow-xs"
        >
          {severities.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-civic-navy shadow-xs"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Department */}
        <select
          value={filters.department}
          onChange={(e) => onFilterChange('department', e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-civic-navy shadow-xs"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.code} value={d.code}>{d.code} ({d.name.split('(')[0].trim()})</option>
          ))}
        </select>

      </div>
    </div>
  );
}
