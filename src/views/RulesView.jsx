import React, { useState } from 'react';
import OperatingCalendarConfig from '../components/rules/OperatingCalendarConfig';
import PublicHolidaysTable from '../components/rules/PublicHolidaysTable';
import LeaveManager from '../components/leaves/LeaveManager';
import { SlidersHorizontal, Calendar, Award, UserCheck, ShieldCheck } from 'lucide-react';

export default function RulesView() {
  const [activeSubTab, setActiveSubTab] = useState('calendars'); // 'calendars' | 'holidays' | 'leaves'

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Operating Rules, Calendars & Availability</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Constraint Architecture
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure client brand-process operating schedules, holiday pauses, approved leaves, and compensatory offs
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('calendars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'calendars'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Brand Calendars</span>
          </button>
          <button
            onClick={() => setActiveSubTab('holidays')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'holidays'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Public Holidays</span>
          </button>
          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeSubTab === 'leaves'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Leaves & Comp-Offs</span>
          </button>
        </div>
      </div>

      {/* Render Sub Tab */}
      {activeSubTab === 'calendars' && <OperatingCalendarConfig />}
      {activeSubTab === 'holidays' && <PublicHolidaysTable />}
      {activeSubTab === 'leaves' && <LeaveManager />}
    </div>
  );
}
