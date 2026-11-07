import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import RosterCell from './RosterCell';
import { getPublicHolidayForDate } from '../../services/calendarService';
import { Users, UserCheck } from 'lucide-react';

export default function CompanyRosterGrid({ onCellClick }) {
  const { currentRoster, employees, pods, publicHolidays, selectedPodId, searchQuery } = useApp();

  const dates = useMemo(() => {
    if (!currentRoster?.assignments) return [];
    const firstEmpId = employees[0]?.id;
    return Object.keys(currentRoster.assignments[firstEmpId] || {});
  }, [currentRoster, employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesPod = selectedPodId === 'all' || emp.pod_id === selectedPodId;
      const matchesSearch =
        !searchQuery ||
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPod && matchesSearch;
    });
  }, [employees, selectedPodId, searchQuery]);

  // Calculate daily working counts
  const dailyWorkingTotals = useMemo(() => {
    const totals = {};
    dates.forEach((dateStr) => {
      let count = 0;
      employees.forEach((emp) => {
        const shift = currentRoster?.assignments?.[emp.id]?.[dateStr];
        if (shift && shift.shift_status === 'working') {
          count++;
        }
      });
      totals[dateStr] = count;
    });
    return totals;
  }, [dates, employees, currentRoster]);

  if (!currentRoster || dates.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-925 rounded-2xl border border-slate-800 text-slate-400 text-xs">
        No active roster data. Click "Generate Roster" to compute monthly schedules.
      </div>
    );
  }

  return (
    <div className="bg-slate-925 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Scrollable Matrix Container */}
      <div className="overflow-x-auto max-h-[75vh]">
        <table className="w-full text-left text-xs border-collapse">
          {/* Header Row: Dates */}
          <thead className="sticky top-0 z-30 bg-slate-925 shadow-md">
            <tr className="border-b border-slate-800">
              {/* Frozen Employee Column */}
              <th className="sticky left-0 z-40 bg-slate-925 py-2.5 px-4 min-w-[220px] max-w-[220px] text-slate-400 font-mono uppercase text-[10px] border-r border-slate-800">
                Staff Member ({filteredEmployees.length})
              </th>

              {/* Monthly Stats Column */}
              <th className="py-2.5 px-3 min-w-[110px] text-slate-400 font-mono uppercase text-[10px] text-center border-r border-slate-800 bg-slate-900/90">
                Work / Off
              </th>

              {/* 30/31 Days Columns */}
              {dates.map((dateStr) => {
                const dateObj = new Date(dateStr + 'T00:00:00');
                const isSunday = dateObj.getDay() === 0;
                const isSaturday = dateObj.getDay() === 6;
                const holiday = getPublicHolidayForDate(dateStr, publicHolidays);

                return (
                  <th
                    key={dateStr}
                    className={`py-2 px-1 min-w-[58px] text-center font-mono text-[10px] border-r border-slate-800/80 transition-colors ${
                      isSunday
                        ? 'bg-rose-950/30 text-rose-300'
                        : holiday
                        ? 'bg-amber-950/30 text-amber-300'
                        : isSaturday
                        ? 'bg-slate-900/60 text-slate-300'
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

          {/* Body Rows: Employee Shifts */}
          <tbody className="divide-y divide-slate-800/60">
            {filteredEmployees.map((emp) => {
              const pod = pods.find((p) => p.id === emp.pod_id);
              const isLead = pod?.lead_id === emp.id;

              // Calculate monthly stats for this employee
              let workCount = 0;
              let offCount = 0;
              let leaveCount = 0;

              dates.forEach((d) => {
                const s = currentRoster.assignments?.[emp.id]?.[d];
                if (s?.shift_status === 'working') workCount++;
                if (s?.shift_status === 'weekly_off' || s?.shift_status === 'public_holiday') offCount++;
                if (s?.shift_status === 'planned_leave' || s?.shift_status === 'comp_off') leaveCount++;
              });

              return (
                <tr key={emp.id} className="hover:bg-slate-850/50 transition-colors group">
                  {/* Frozen Employee Name Column */}
                  <td className="sticky left-0 z-20 bg-slate-925 group-hover:bg-slate-850 py-2 px-4 border-r border-slate-800 shadow-sm">
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
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              LEAD
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {pod?.name.split(' ')[1] || pod?.name} • {emp.skills.join(',')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Monthly Totals Badge */}
                  <td className="py-2 px-2 text-center border-r border-slate-800 bg-slate-900/40 font-mono text-[11px]">
                    <span className="text-emerald-400 font-bold">{workCount}w</span>
                    <span className="text-slate-500 mx-1">/</span>
                    <span className="text-slate-300">{offCount}o</span>
                    {leaveCount > 0 && (
                      <span className="text-purple-400 ml-1 font-bold">({leaveCount}L)</span>
                    )}
                  </td>

                  {/* 30/31 Day Shift Cells */}
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

          {/* Bottom Summary Row: Total Active Staff */}
          <tfoot className="sticky bottom-0 z-30 bg-slate-900 border-t-2 border-slate-800 font-mono text-[10px]">
            <tr>
              <td className="sticky left-0 z-40 bg-slate-900 py-2.5 px-4 font-bold text-slate-300 border-r border-slate-800">
                DAILY ACTIVE STAFF (Total)
              </td>
              <td className="py-2.5 px-2 text-center font-bold text-sky-400 border-r border-slate-800">
                {Object.values(dailyWorkingTotals).reduce((a, b) => a + b, 0)} shifts
              </td>
              {dates.map((dateStr) => {
                const total = dailyWorkingTotals[dateStr] || 0;
                return (
                  <td
                    key={dateStr}
                    className="py-2 px-1 text-center font-bold text-slate-200 border-r border-slate-800/80"
                  >
                    {total}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
