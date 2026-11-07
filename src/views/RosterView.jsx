import React from 'react';
import { useApp } from '../context/AppContext';
import CompanyRosterGrid from '../components/roster/CompanyRosterGrid';
import PodRosterGrid from '../components/roster/PodRosterGrid';
import BrandRosterGrid from '../components/roster/BrandRosterGrid';
import ProcessRosterGrid from '../components/roster/ProcessRosterGrid';
import EmployeeRosterGrid from '../components/roster/EmployeeRosterGrid';
import { 
  Layers, 
  Users, 
  Building, 
  Cpu, 
  UserCheck, 
  Search, 
  Filter, 
  RotateCw, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function RosterView({ onCellClick }) {
  const { 
    rosterViewMode, 
    setRosterViewMode, 
    selectedPodId, 
    setSelectedPodId, 
    searchQuery, 
    setSearchQuery,
    pods,
    currentRoster,
    conflicts,
    metrics,
    generateRoster,
    isGenerating,
    selectedMonth,
    selectedYear
  } = useApp();

  return (
    <div className="space-y-5">
      {/* View Switcher Header & Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Master Roster Operations Matrix</h2>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${
                conflicts.length > 0
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {metrics.rosterStatus} • {currentRoster?.coverage_score ?? 98.2}% SLA
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized scheduling matrix across company, operational pods, client brands, processes, and individual specialists
          </p>
        </div>

        {/* 5 Views Selector Buttons (Full Responsive) */}
        <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner self-start xl:self-auto">
          <button
            onClick={() => setRosterViewMode('company')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rosterViewMode === 'company'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Company-wide</span>
          </button>

          <button
            onClick={() => setRosterViewMode('pod')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rosterViewMode === 'pod'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pod-wise</span>
          </button>

          <button
            onClick={() => setRosterViewMode('brand')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rosterViewMode === 'brand'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Brand-wise</span>
          </button>

          <button
            onClick={() => setRosterViewMode('process')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rosterViewMode === 'process'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Process-wise</span>
          </button>

          <button
            onClick={() => setRosterViewMode('employee')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              rosterViewMode === 'employee'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Employee-wise</span>
          </button>
        </div>
      </div>

      {/* Filter and Quick Search Bar */}
      {rosterViewMode === 'company' && (
        <div className="bg-slate-925 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff in matrix..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Pod:</span>
              <select
                value={selectedPodId}
                onChange={(e) => setSelectedPodId(e.target.value)}
                className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Pods</option>
                {pods.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-sky-500/20 border border-sky-500/40" /> Working Shift
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-slate-850 border border-slate-700" /> Weekly Off
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-purple-950/60 border border-purple-500/40" /> Planned Leave
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-teal-950/60 border border-teal-500/40" /> Comp-Off
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-950/60 border border-amber-500/40" /> Public Holiday
            </span>
          </div>
        </div>
      )}

      {/* Render Selected Stakeholder Grid */}
      {rosterViewMode === 'company' && <CompanyRosterGrid onCellClick={onCellClick} />}
      {rosterViewMode === 'pod' && <PodRosterGrid onCellClick={onCellClick} />}
      {rosterViewMode === 'brand' && <BrandRosterGrid />}
      {rosterViewMode === 'process' && <ProcessRosterGrid />}
      {rosterViewMode === 'employee' && <EmployeeRosterGrid onCellClick={onCellClick} />}
    </div>
  );
}
