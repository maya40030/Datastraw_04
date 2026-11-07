import React from 'react';
import { useApp } from '../../context/AppContext';
import { MONTHS, YEARS } from '../../constants/navigation';
import { 
  Calendar, 
  RotateCw, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Building, 
  Users, 
  Cpu, 
  UserCheck
} from 'lucide-react';

export default function Header() {
  const { 
    activeTab, 
    rosterViewMode, 
    setRosterViewMode, 
    selectedMonth, 
    setSelectedMonth, 
    selectedYear, 
    setSelectedYear,
    metrics,
    generateRoster,
    isGenerating
  } = useApp();

  const handleGenerateClick = () => {
    generateRoster(true);
  };

  const getStatusBadge = () => {
    switch (metrics.rosterStatus) {
      case 'Published':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Published
          </span>
        );
      case 'Validated':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <CheckCircle className="w-3.5 h-3.5" /> Validated
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> Draft Working State
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-slate-925/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left: View Title & Sub-tabs */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight capitalize flex items-center gap-2">
            {activeTab === 'roster' && 'Master Roster Management'}
            {activeTab === 'conflicts' && 'Conflict & Coverage Triage Center'}
            {activeTab === 'simulator' && 'Dynamic Change & Backup Simulator'}
            {activeTab === 'brands' && 'Client Brands & Operational Processes'}
            {activeTab === 'team' && 'Operational Pods & Staff Directory'}
            {activeTab === 'rules' && 'Operating Calendars & Availability Rules'}
            {activeTab === 'analytics' && 'Operational Intelligence & SLAs'}
            {activeTab === 'documentation' && 'Assessment Defense & Architecture'}
          </h1>
        </div>

        {/* 5 Specialized Roster Views Selector (Active on 'roster' tab) */}
        {activeTab === 'roster' && (
          <div className="hidden lg:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 shadow-inner">
            <button
              onClick={() => setRosterViewMode('company')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                rosterViewMode === 'company'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Company-wide
            </button>
            <button
              onClick={() => setRosterViewMode('pod')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                rosterViewMode === 'pod'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Pod-wise
            </button>
            <button
              onClick={() => setRosterViewMode('brand')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                rosterViewMode === 'brand'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" /> Brand-wise
            </button>
            <button
              onClick={() => setRosterViewMode('process')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                rosterViewMode === 'process'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Process-wise
            </button>
            <button
              onClick={() => setRosterViewMode('employee')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                rosterViewMode === 'employee'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Employee-wise
            </button>
          </div>
        )}
      </div>

      {/* Right: Planning Period, Status & Operational Triggers */}
      <div className="flex items-center gap-3">
        {/* Month & Year Selectors */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
          <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-1"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value} className="bg-slate-900 text-slate-100">
                {m.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            {YEARS.map((y) => (
              <option key={y} value={y} className="bg-slate-900 text-slate-100">
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Status Pill */}
        {getStatusBadge()}

        {/* Generate Action Button */}
        <button
          onClick={handleGenerateClick}
          disabled={isGenerating}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all active:scale-95"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Generate Roster'}</span>
        </button>
      </div>
    </header>
  );
}
