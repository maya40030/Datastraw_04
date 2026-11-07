import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getPublicHolidayForDate } from '../../services/calendarService';
import { Cpu, Layers } from 'lucide-react';

export default function ProcessRosterGrid() {
  const { currentRoster, processes, employees, publicHolidays } = useApp();

  const dates = useMemo(() => {
    if (!currentRoster?.assignments) return [];
    const firstEmpId = employees[0]?.id;
    return Object.keys(currentRoster.assignments[firstEmpId] || {});
  }, [currentRoster, employees]);

  if (!currentRoster || dates.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-925 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      <div className="overflow-x-auto max-h-[75vh]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-30 bg-slate-925 shadow-md">
            <tr className="border-b border-slate-800">
              <th className="sticky left-0 z-40 bg-slate-925 py-2.5 px-4 min-w-[240px] max-w-[240px] text-slate-400 font-mono uppercase text-[10px] border-r border-slate-800">
                Operational Process
              </th>
              <th className="py-2.5 px-3 min-w-[90px] text-slate-400 font-mono uppercase text-[10px] text-center border-r border-slate-800 bg-slate-900/90">
                Qualified
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
            {processes.map((proc) => {
              const qualifiedCount = employees.filter((e) => e.skills.includes(proc.id)).length;

              return (
                <tr key={proc.id} className="hover:bg-slate-850/50 transition-colors group">
                  <td className="sticky left-0 z-20 bg-slate-925 group-hover:bg-slate-850 py-3 px-4 border-r border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs text-white"
                        style={{ backgroundColor: proc.color || '#0284c7' }}
                      >
                        {proc.code}
                      </div>
                      <div>
                        <div className="font-semibold text-white group-hover:text-sky-400 transition-colors text-xs">
                          {proc.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {proc.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-2 px-2 text-center border-r border-slate-800 bg-slate-900/40 font-mono text-xs font-bold text-sky-400">
                    {qualifiedCount} staff
                  </td>

                  {dates.map((dateStr) => {
                    const workingStaff = employees.filter((emp) => {
                      const shift = currentRoster.assignments?.[emp.id]?.[dateStr];
                      return shift && shift.shift_status === 'working' && shift.process_id === proc.id;
                    });

                    return (
                      <td
                        key={dateStr}
                        className="h-10 min-w-[58px] border-b border-r border-slate-800/80 p-1 text-center"
                      >
                        <div
                          title={`${proc.name} on ${dateStr}: ${workingStaff.length} active staff (${workingStaff.map((s) => s.name).join(', ')})`}
                          className={`w-full h-8 rounded flex flex-col justify-center items-center font-mono ${
                            workingStaff.length > 0
                              ? 'bg-sky-500/10 border border-sky-500/30 text-sky-300'
                              : 'bg-slate-950/40 text-slate-600'
                          }`}
                        >
                          <span className="text-[10px] font-bold leading-none">{workingStaff.length}</span>
                          <span className="text-[8px] opacity-70 leading-none mt-0.5">STAFF</span>
                        </div>
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
  );
}
