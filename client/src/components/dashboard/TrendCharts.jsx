import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { PieChart as PieIcon, TrendingUp, BarChart3 } from 'lucide-react';

const COLORS = ['#0B1F3A', '#F5B301', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#64748B'];

export default function TrendCharts({ chartsData }) {
  const byType = chartsData?.byType || [
    { name: 'pothole', value: 8 },
    { name: 'water_leak', value: 6 },
    { name: 'garbage', value: 5 },
    { name: 'streetlight', value: 4 },
    { name: 'sewage', value: 3 },
    { name: 'pollution', value: 2 }
  ];

  const byDepartment = chartsData?.byDepartment || [
    { code: 'PWD', count: 9 },
    { code: 'TMC', count: 8 },
    { code: 'KUWSDB', count: 6 },
    { code: 'HESCOM', count: 4 },
    { code: 'KSPCB', count: 2 }
  ];

  const trend = chartsData?.trend || [
    { date: 'Nov 14', reports: 3, resolved: 2 },
    { date: 'Nov 15', reports: 5, resolved: 3 },
    { date: 'Nov 16', reports: 4, resolved: 4 },
    { date: 'Nov 17', reports: 6, resolved: 5 },
    { date: 'Nov 18', reports: 8, resolved: 6 },
    { date: 'Nov 19', reports: 7, resolved: 6 },
    { date: 'Nov 20', reports: 9, resolved: 7 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Grievances by Issue Type (Donut) */}
      <div className="civic-card p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <PieIcon className="w-4 h-4 text-civic-navy" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-civic-navy">
            Grievances by Category
          </h3>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byType}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
              >
                {byType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val, name) => [val, String(name).replace('_', ' ')]}
                contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] text-slate-600 justify-center">
          {byType.slice(0, 5).map((t, idx) => (
            <span key={idx} className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
              <span>{t.name?.replace('_', ' ')} ({t.value})</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. Complaints Volume by Department (Bar) */}
      <div className="civic-card p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <BarChart3 className="w-4 h-4 text-civic-navy" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-civic-navy">
            Workload by Department
          </h3>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDepartment} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="code" tick={{ fontSize: 11, fontWeight: 600, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip 
                formatter={(val) => [`${val} grievances`, 'Assigned Count']}
                contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" fill="#0B1F3A" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-500 text-center font-medium">
          TMC • PWD • KUWS&DB • HESCOM • KSPCB
        </p>
      </div>

      {/* 3. 7-Day Inflow vs Resolution Trend (Area) */}
      <div className="civic-card p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-civic-navy">
            Intake vs. Resolution Velocity
          </h3>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#0B1F3A" stop-opacity={0.3}/>
                  <stop offset="95%" stop-color="#0B1F3A" stop-opacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stop-color="#10B981" stop-opacity={0.4}/>
                  <stop offset="95%" stop-color="#10B981" stop-opacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
              <Area type="monotone" dataKey="reports" stroke="#0B1F3A" fillOpacity={1} fill="url(#colorReports)" name="Reported" />
              <Area type="monotone" dataKey="resolved" stroke="#10B981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold">
          <span className="flex items-center gap-1 text-slate-800"><span className="w-2.5 h-1 bg-civic-navy rounded-sm"></span> New Logged</span>
          <span className="flex items-center gap-1 text-emerald-700"><span className="w-2.5 h-1 bg-emerald-500 rounded-sm"></span> Fixed & Closed</span>
        </div>
      </div>

    </div>
  );
}
