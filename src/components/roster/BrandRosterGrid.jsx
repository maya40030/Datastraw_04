import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { evaluateOperatingRequirement, getPublicHolidayForDate } from '../../services/calendarService';
import { Briefcase, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function BrandRosterGrid() {
  const { currentRoster, brands, brandProcessRules, employees, publicHolidays } = useApp();

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
              <th className="sticky left-0 z-40 bg-slate-925 py-2.5 px-4 min-w-[220px] max-w-[220px] text-slate-400 font-mono uppercase text-[10px] border-r border-slate-800">
                Client Brand Account (15)
              </th>
              <th className="py-2.5 px-3 min-w-[90px] text-slate-400 font-mono uppercase text-[10px] text-center border-r border-slate-800 bg-slate-900/90">
                Model
              </th>
              {dates.map((dateStr) => {
                const dateObj = new Date(dateStr + 'T00:00:00');
                const isSunday = dateObj.getDay() === 0;
                const holiday = getPublicHolidayForDate(dateStr, publicHolidays);

                return (
                  <th
                    key={dateStr}
                    className={`py-2 px-1 min-w-[62px] text-center font-mono text-[10px] border-r border-slate-800/80 ${
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
            {brands.map((brand) => {
              const brandRules = brandProcessRules.filter((r) => r.brand_id === brand.id);

              return (
                <tr key={brand.id} className="hover:bg-slate-850/50 transition-colors group">
                  {/* Brand Profile Column */}
                  <td className="sticky left-0 z-20 bg-slate-925 group-hover:bg-slate-850 py-2.5 px-4 border-r border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white shrink-0"
                        style={{ backgroundColor: brand.color || '#0284c7' }}
                      >
                        {brand.code}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-white group-hover:text-sky-400 transition-colors text-xs truncate">
                          {brand.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {brandRules.map((r) => r.process_id).join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Single vs Multi Badge */}
                  <td className="py-2 px-2 text-center border-r border-slate-800 bg-slate-900/40 font-mono text-[10px]">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded font-semibold ${
                        brand.is_single_resource
                          ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold'
                      }`}
                    >
                      {brand.is_single_resource ? 'Single (1:1)' : 'Multi'}
                    </span>
                  </td>

                  {/* Daily Coverage Status Cells */}
                  {dates.map((dateStr) => {
                    // Check if brand processes operate on this date
                    let totalRequired = 0;
                    const requiredProcesses = [];

                    brandRules.forEach((rule) => {
                      const req = evaluateOperatingRequirement(dateStr, rule, publicHolidays);
                      if (req.isOperating && req.requiredHeadcount > 0) {
                        totalRequired += req.requiredHeadcount;
                        requiredProcesses.push({
                          process_id: rule.process_id,
                          required: req.requiredHeadcount
                        });
                      }
                    });

                    if (totalRequired === 0) {
                      // Brand is closed on this day (e.g. Sunday or Holiday off per operating calendar)
                      return (
                        <td
                          key={dateStr}
                          className="h-10 min-w-[62px] border-b border-r border-slate-800/80 p-1 text-center bg-slate-950/40"
                          title="Brand Closed per Operating Calendar"
                        >
                          <span className="text-[9px] font-mono text-slate-600">Closed</span>
                        </td>
                      );
                    }

                    // Count how many staff are working for this brand on this date
                    const assignedStaff = employees.filter((emp) => {
                      const shift = currentRoster.assignments?.[emp.id]?.[dateStr];
                      return shift && shift.shift_status === 'working' && shift.brand_id === brand.id;
                    });

                    const isCovered = assignedStaff.length >= totalRequired;
                    const isBlackout = brand.is_single_resource && assignedStaff.length === 0;

                    return (
                      <td
                        key={dateStr}
                        className={`h-10 min-w-[62px] border-b border-r border-slate-800/80 p-1 text-center transition-colors ${
                          !isCovered
                            ? 'bg-rose-950/20'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        {isCovered ? (
                          <div
                            title={`Coverage Met: ${assignedStaff.length}/${totalRequired} Staff Active (${assignedStaff.map((s) => s.name).join(', ')})`}
                            className="w-full h-8 px-1 py-0.5 rounded flex flex-col justify-center items-center bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
                          >
                            <span className="text-[9px] font-mono font-bold leading-none">
                              {assignedStaff.length}/{totalRequired}
                            </span>
                            <span className="text-[8px] font-mono text-emerald-400/80 mt-0.5">
                              MET
                            </span>
                          </div>
                        ) : (
                          <div
                            title={`Critical Deficit: ${assignedStaff.length}/${totalRequired} Required Staff`}
                            className="w-full h-8 px-1 py-0.5 rounded flex flex-col justify-center items-center bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse"
                          >
                            <span className="text-[9px] font-mono font-bold leading-none">
                              {assignedStaff.length}/{totalRequired}
                            </span>
                            <span className="text-[8px] font-mono font-bold text-rose-400 mt-0.5">
                              {isBlackout ? 'BLACKOUT' : 'GAP'}
                            </span>
                          </div>
                        )}
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
