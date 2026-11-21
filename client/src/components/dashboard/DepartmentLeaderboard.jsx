import React from 'react';
import { useTranslation } from 'react-i18next';
import { Award, CheckCircle2, Clock, AlertTriangle, Building2, User } from 'lucide-react';

export default function DepartmentLeaderboard({ leaderboard = [] }) {
  const { t } = useTranslation();

  return (
    <div className="civic-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-civic-gold fill-civic-gold" />
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-civic-navy">
              {t('dashboard.leaderboard_title')}
            </h3>
            <p className="text-xs text-slate-500">Public accountability scorecard across Haveri district urban bodies</p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Ranked by % Resolved
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Rank & Authority</th>
              <th className="py-2.5 px-3">Nodal Officer</th>
              <th className="py-2.5 px-3 text-center">Workload</th>
              <th className="py-2.5 px-3 text-center">Avg Fix Time</th>
              <th className="py-2.5 px-3 text-center">Overdue</th>
              <th className="py-2.5 px-3 text-center">On-Time SLA</th>
              <th className="py-2.5 px-3 text-right">Fix Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {leaderboard.map((dept, index) => {
              const rankColor = index === 0 ? 'bg-amber-100 text-amber-900 border-amber-300'
                : index === 1 ? 'bg-slate-200 text-slate-800'
                : index === 2 ? 'bg-orange-100 text-orange-900'
                : 'bg-slate-100 text-slate-600';

              return (
                <tr key={dept.code} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Rank & Dept */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${rankColor}`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-900">{dept.name}</p>
                        {dept.nameLocal && (
                          <p className="text-[11px] text-slate-500 font-sans">{dept.nameLocal}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Officer */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[150px]">{dept.officer}</span>
                    </div>
                  </td>

                  {/* Workload */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-slate-800">{dept.resolved}</span>
                    <span className="text-slate-400 text-[11px]"> / {dept.total}</span>
                  </td>

                  {/* Avg Fix Time vs SLA */}
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-bold text-slate-800">{dept.avgHours}h</span>
                      <span className="text-slate-400 text-[10px]">({dept.slaHours}h SLA)</span>
                    </div>
                  </td>

                  {/* Overdue */}
                  <td className="py-3 px-3 text-center">
                    {dept.overdue > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-300">
                        {dept.overdue}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>0</span>
                      </span>
                    )}
                  </td>

                  {/* On-Time SLA Compliance */}
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                      dept.onTimeRate >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      dept.onTimeRate >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {dept.onTimeRate ?? 0}%
                    </span>
                  </td>

                  {/* Resolution Rate Progress */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${dept.resolutionRate}%` }}
                        ></div>
                      </div>
                      <span className="font-extrabold text-sm text-slate-900 w-10 text-right">
                        {dept.resolutionRate}%
                      </span>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
