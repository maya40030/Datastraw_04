import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getPublicHolidayForDate } from '../../services/calendarService';
import { User, Calendar, CheckCircle2, Award, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EmployeeRosterGrid({ onCellClick }) {
  const { currentRoster, employees, pods, brands, publicHolidays, selectedMonth, selectedYear } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'emp-01');

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId) || employees[0];
  const pod = pods.find((p) => p.id === selectedEmployee?.pod_id);

  const dates = useMemo(() => {
    if (!currentRoster?.assignments || !selectedEmployee) return [];
    return Object.keys(currentRoster.assignments[selectedEmployee.id] || {});
  }, [currentRoster, selectedEmployee]);

  // Employee shift metrics
  const stats = useMemo(() => {
    let working = 0;
    let offs = 0;
    let leaves = 0;
    let comp = 0;
    let holidays = 0;

    dates.forEach((d) => {
      const s = currentRoster?.assignments?.[selectedEmployee?.id]?.[d];
      if (s?.shift_status === 'working') working++;
      if (s?.shift_status === 'weekly_off') offs++;
      if (s?.shift_status === 'planned_leave') leaves++;
      if (s?.shift_status === 'comp_off') comp++;
      if (s?.shift_status === 'public_holiday') holidays++;
    });

    return { working, offs, leaves, comp, holidays };
  }, [dates, currentRoster, selectedEmployee]);

  if (!currentRoster || !selectedEmployee) return null;

  // Build calendar matrix (padded for day of week)
  const firstDateObj = new Date(selectedYear, selectedMonth, 1);
  const startDayOfWeek = firstDateObj.getDay(); // 0 = Sun

  return (
    <div className="space-y-5">
      {/* Employee Selector & Stats Bar */}
      <div className="bg-slate-925 border border-slate-800 p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Profile Card */}
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-lg shrink-0"
            style={{ backgroundColor: selectedEmployee.avatar_color || '#0284c7' }}
          >
            {selectedEmployee.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-bold text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">
              {pod?.name} • Preferred Off: {DAYS[selectedEmployee.weekly_off_preference ?? 0]} • Quota: {selectedEmployee.weekly_offs_quota} offs
            </div>
          </div>
        </div>

        {/* Stats Pill Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Working Days</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{stats.working}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Weekly Offs</div>
            <div className="text-base font-bold text-slate-200 font-mono mt-0.5">{stats.offs}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Leaves Taken</div>
            <div className="text-base font-bold text-purple-400 font-mono mt-0.5">{stats.leaves}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 px-3 py-2 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Comp-Offs</div>
            <div className="text-base font-bold text-teal-400 font-mono mt-0.5">{stats.comp}</div>
          </div>
        </div>
      </div>

      {/* Personal Monthly Calendar Grid */}
      <div className="bg-slate-925 border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center font-mono text-xs uppercase font-semibold text-slate-400">
          {DAYS.map((d, i) => (
            <div key={d} className={`py-1.5 ${i === 0 ? 'text-rose-400' : ''}`}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Tiles */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty padding slots before day 1 */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-24 rounded-xl bg-slate-950/20 border border-slate-900" />
          ))}

          {/* Actual Month Days */}
          {dates.map((dateStr) => {
            const dateObj = new Date(dateStr + 'T00:00:00');
            const dayNum = dateObj.getDate();
            const isSunday = dateObj.getDay() === 0;
            const holiday = getPublicHolidayForDate(dateStr, publicHolidays);
            const shift = currentRoster.assignments?.[selectedEmployee.id]?.[dateStr];

            const isWorking = shift?.shift_status === 'working';
            const isLeave = shift?.shift_status === 'planned_leave';
            const isComp = shift?.shift_status === 'comp_off';
            const isOff = shift?.shift_status === 'weekly_off' || shift?.shift_status === 'public_holiday';

            return (
              <div
                key={dateStr}
                onClick={() => onCellClick?.(selectedEmployee, dateStr, shift)}
                className={`h-24 rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer hover:border-sky-500/50 ${
                  isLeave
                    ? 'bg-purple-950/30 border-purple-500/30 text-purple-200'
                    : isComp
                    ? 'bg-teal-950/30 border-teal-500/30 text-teal-200'
                    : isOff
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                    : 'bg-slate-900/90 border-slate-800/90 text-white hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className={`text-xs font-bold ${isSunday ? 'text-rose-400' : 'text-slate-300'}`}>
                    {dayNum}
                  </span>
                  {holiday && (
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      PH
                    </span>
                  )}
                </div>

                {/* Shift Details Inside Calendar Box */}
                <div className="mt-1">
                  {isWorking && (
                    <div className="text-left">
                      <div className="font-bold text-[11px] text-sky-400 truncate font-mono">
                        {shift.brand_code || 'Standby'}
                      </div>
                      <div className="text-[10px] text-slate-300 truncate font-mono">
                        {shift.process_id || 'OPS'}
                      </div>
                    </div>
                  )}

                  {isOff && (
                    <div className="text-center font-mono text-xs font-semibold text-slate-400">
                      WEEKLY OFF
                    </div>
                  )}

                  {isLeave && (
                    <div className="text-left font-mono">
                      <div className="text-[10px] font-bold text-purple-300">PLANNED LEAVE</div>
                      <div className="text-[9px] text-purple-400/80 truncate">{shift.notes || 'Leave'}</div>
                    </div>
                  )}

                  {isComp && (
                    <div className="text-left font-mono">
                      <div className="text-[10px] font-bold text-teal-300">COMP-OFF</div>
                    </div>
                  )}
                </div>

                <div className="text-[8px] text-slate-500 font-mono text-right truncate">
                  {dateObj.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
