import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import RosterCell from './RosterCell';
import { getPublicHolidayForDate } from '../../services/calendarService';
import { UserCheck, Users, Shield } from 'lucide-react';

export default function PodRosterGrid({ onCellClick }) {
  const { currentRoster, employees, pods, publicHolidays } = useApp();

  const [activePodId, setActivePodId] = useState('pod-alpha');

  const selectedPod = pods.find((p) => p.id === activePodId) || pods[0];
  const podMembers = employees.filter((e) => e.pod_id === activePodId);
  const currentLead = podMembers.find((e) => e.id === selectedPod?.lead_id);
  const specialists = podMembers.filter((e) => e.id !== selectedPod?.lead_id);

  // Sorted members with Lead guaranteed on top
  const sortedMembers = currentLead ? [currentLead, ...specialists] : podMembers;

  const dates = useMemo(() => {
    if (!currentRoster?.assignments) return [];
    const firstEmpId = employees[0]?.id;
    return Object.keys(currentRoster.assignments[firstEmpId] || {});
  }, [currentRoster, employees]);

  if (!currentRoster || dates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Pod Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-925 p-2 rounded-xl border border-slate-800">
        {pods.map((pod) => {
          const isActive = activePodId === pod.id;
          return (
            <button
              key={pod.id}
              onClick={() => setActivePodId(pod.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: pod.color }}
              />
              <span>{pod.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/20">
                Lead: {pod.lead_name?.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pod Grid */}
      <div className="bg-slate-925 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-30 bg-slate-925 shadow-md">
              <tr className="border-b border-slate-800">
                <th className="sticky left-0 z-40 bg-slate-925 py-2.5 px-4 min-w-[220px] max-w-[220px] text-slate-400 font-mono uppercase text-[10px] border-r border-slate-800">
                  Pod Specialist ({sortedMembers.length})
                </th>
                <th className="py-2.5 px-3 min-w-[100px] text-slate-400 font-mono uppercase text-[10px] text-center border-r border-slate-800 bg-slate-900/90">
                  Work / Off
                </th>
                {dates.map((dateStr) => {
                  const dateObj = new Date(dateStr + 'T00:00:00');
                  const isSunday = dateObj.getDay() === 0;
                  const holiday = getPublicHolidayForDate(dateStr, publicHolidays);

                  return (
                    <th
                      key={dateStr}
                      className={`py-2 px-1 min-w-[58px] text-center font-mono text-[10px] border-r border-slate-800/80 ${
                        isSunday
                          ? 'bg-rose-950/30 text-rose-300'
                          : holiday
                          ? 'bg-amber-950/30 text-amber-300'
                          : 'bg-slate-900/40 text-slate-300'
                      }`}
                    >
                      <div className="text-[9px] uppercase tracking-tighter opacity-80">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </div>
                      <div className="font-bold text-xs mt-0.5">{dateObj.getDate()}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {sortedMembers.map((emp) => {
                const isLead = emp.id === selectedPod?.lead_id;

                let workCount = 0;
                let offCount = 0;
                dates.forEach((d) => {
                  const s = currentRoster.assignments?.[emp.id]?.[d];
                  if (s?.shift_status === 'working') workCount++;
                  if (s?.shift_status === 'weekly_off' || s?.shift_status === 'public_holiday') offCount++;
                });

                return (
                  <tr
                    key={emp.id}
                    className={`transition-colors group ${
                      isLead ? 'bg-amber-950/15 hover:bg-amber-950/25' : 'hover:bg-slate-850/50'
                    }`}
                  >
                    <td
                      className={`sticky left-0 z-20 py-2 px-4 border-r border-slate-800 shadow-sm ${
                        isLead ? 'bg-slate-925 group-hover:bg-amber-950/20' : 'bg-slate-925 group-hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: emp.avatar_color || '#0284c7' }}
                        >
                          {emp.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-white group-hover:text-sky-400 transition-colors text-xs flex items-center gap-1.5 truncate">
                            <span className="truncate">{emp.name}</span>
                            {isLead && (
                              <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                LEAD
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {emp.role} • {emp.skills.join(',')}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-2 px-2 text-center border-r border-slate-800 bg-slate-900/40 font-mono text-[11px]">
                      <span className="text-emerald-400 font-bold">{workCount}w</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-300">{offCount}o</span>
                    </td>

                    {dates.map((dateStr) => {
                      const shift = currentRoster.assignments?.[emp.id]?.[dateStr];
                      const dateObj = new Date(dateStr + 'T00:00:00');
                      const isSunday = dateObj.getDay() === 0;
                      const holiday = getPublicHolidayForDate(dateStr, publicHolidays);

                      return (
                        <td key={dateStr} className="p-0">
                          <RosterCell
                            shift={shift}
                            dateStr={dateStr}
                            isSunday={isSunday}
                            isHoliday={!!holiday}
                            onClick={() => onCellClick?.(emp, dateStr, shift)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
