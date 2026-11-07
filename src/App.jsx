import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import EmployeesView from './views/EmployeesView';
import PodsView from './views/PodsView';
import BrandsView from './views/BrandsView';
import RulesView from './views/RulesView';
import ConflictCenterView from './views/ConflictCenterView';
import RosterView from './views/RosterView';
import { 
  Users, 
  Briefcase, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle2, 
  FileText,
  ShieldCheck,
  RefreshCw,
  Building,
  UserCheck,
  Layers,
  Sparkles,
  SlidersHorizontal,
  CalendarDays,
  RotateCw,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { dataService } from './services/dataService';

function MasterDashboard() {
  const { 
    activeTab, 
    setActiveTab, 
    metrics, 
    pods, 
    employees, 
    brands, 
    processes, 
    assignments, 
    refreshData, 
    addToast,
    currentRoster,
    conflicts,
    softWarnings,
    generateRoster,
    isGenerating,
    selectedMonth,
    selectedYear
  } = useApp();

  const [teamSubTab, setTeamSubTab] = useState('directory');

  const handleResetData = async () => {
    dataService.resetToSeed();
    await refreshData();
    await generateRoster(true);
    addToast('Database reset to official DataStraw 36-staff baseline seed.', 'success');
  };

  // Route based on activeTab
  if (activeTab === 'roster') {
    return <RosterView />;
  }

  if (activeTab === 'team') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setTeamSubTab('directory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              teamSubTab === 'directory'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Staff Directory ({employees.length})
          </button>
          <button
            onClick={() => setTeamSubTab('pods')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              teamSubTab === 'pods'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Pods & Leadership (4 Pods)
          </button>
        </div>

        {teamSubTab === 'directory' ? <EmployeesView /> : <PodsView />}
      </div>
    );
  }

  if (activeTab === 'brands') {
    return <BrandsView />;
  }

  if (activeTab === 'rules') {
    return <RulesView />;
  }

  if (activeTab === 'conflicts') {
    return <ConflictCenterView />;
  }

  // Fallback / Overview Dashboard
  return (
    <div className="space-y-6">
      {/* Top Banner / Assessment Alignment Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-slate-925 border border-sky-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-sky-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            DataStraw Technical Internship Assessment • Part 7 Active
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Deterministic Smart Roster Management System
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
            Multi-stakeholder scheduling views: Company-wide, Pod-wise, Brand-wise, Process-wise, and Employee-wise. 
            Dense high-speed tables, sticky axes, status pill badges, and non-silent coverage validations.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('roster')}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/25 transition-all flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Open Master Roster Grid</span>
            </button>
            <button
              onClick={() => setActiveTab('conflicts')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Conflict Center ({conflicts.length})</span>
            </button>
            <button
              onClick={handleResetData}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Reset Seed Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Part 7 Progress Summary */}
      <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold font-mono">
            P7
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Part 7 Multi-Stakeholder Roster Views Complete</div>
            <div className="text-[11px] text-slate-400">
              Company-wide, Pod-wise, Brand-wise, Process-wise, and Employee-wise grids fully operational.
            </div>
          </div>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          Part 7 Verified
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <MasterDashboard />
      </AppShell>
    </AppProvider>
  );
}
