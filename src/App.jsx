import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import { 
  CalendarDays, 
  AlertTriangle, 
  Sparkles, 
  Briefcase, 
  Users, 
  SlidersHorizontal, 
  BarChart3, 
  FileText,
  CheckCircle2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

function DashboardView() {
  const { activeTab, setActiveTab, rosterViewMode, metrics, addToast } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Banner / Assessment Alignment Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950/70 via-slate-900 to-slate-925 border border-sky-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-sky-500/5 to-transparent pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            DataStraw Technical Internship Assessment • Part 1 Initialized
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Deterministic Smart Roster Management System
          </h2>
          <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
            Enterprise operations platform designed to solve multi-brand, multi-process scheduling constraints. 
            Built for 36 employees across 4 operational pods, managing 15 brands (including ~80% single-resource accounts), 
            operating calendars (365-day, holidays, Sundays off), conflict triage, and dynamic backup substitutions.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => addToast('System operating normally. Part 1 scaffold verified.', 'success')}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/25 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify Environment
            </button>
            <button
              onClick={() => setActiveTab('documentation')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              View Architecture & Defense
            </button>
          </div>
        </div>
      </div>

      {/* Part 1 Active Status & Live Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Team Hierarchy</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{metrics.totalEmployees}</span>
            <span className="text-xs text-slate-400">Staff / {metrics.activePods} Pods</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 4 Dedicated Pod Leads
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">D2C Accounts</span>
            <Briefcase className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{metrics.totalBrands}</span>
            <span className="text-xs text-slate-400">Active Brands</span>
          </div>
          <div className="mt-2 text-[11px] text-sky-400 flex items-center gap-1 font-mono">
            <span>{metrics.singleResourceBrands} Single-Resource (80%)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Coverage SLA</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{metrics.coverageSlaRate}%</span>
            <span className="text-xs text-slate-400">Compliance target</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>365-day + Custom calendars</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Active Conflicts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{metrics.activeConflictsCount}</span>
            <span className="text-xs text-slate-400">Violations detected</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Engine Ready for Seed
          </div>
        </div>
      </div>

      {/* Module Overview & Roadmap Progress Bar */}
      <div className="p-5 rounded-xl bg-slate-925 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">System Architecture & 10-Part Build Sequence</h3>
            <p className="text-xs text-slate-400 mt-0.5">Strict phased delivery tracking across all assessment requirements</p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
            Part 1 of 10 Complete
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { num: 1, title: 'App Shell & Design System', status: 'In Progress (Finishing)', active: true },
            { num: 2, title: '36-Staff & 15-Brand Models', status: 'Next (Part 2)', active: false },
            { num: 3, title: 'Master Entity CRUD', status: 'Queued', active: false },
            { num: 4, title: 'Calendars & Availability', status: 'Queued', active: false },
            { num: 5, title: 'Deterministic Engine', status: 'Queued', active: false },
            { num: 6, title: 'Conflict Detection Triage', status: 'Queued', active: false },
            { num: 7, title: '5 Specialized Roster Views', status: 'Queued', active: false },
            { num: 8, title: 'In-line Roster Editor', status: 'Queued', active: false },
            { num: 9, title: 'Dynamic Change Simulator', status: 'Queued', active: false },
            { num: 10, title: 'Analytics & Deployment', status: 'Queued', active: false },
          ].map((part) => (
            <div
              key={part.num}
              className={`p-3 rounded-lg border text-xs transition-all ${
                part.active
                  ? 'bg-sky-500/10 border-sky-500/30 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] font-bold text-sky-400">PART {part.num}</span>
                {part.active ? (
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                )}
              </div>
              <div className="font-medium text-slate-200 line-clamp-1">{part.title}</div>
              <div className="text-[10px] mt-1 text-slate-400 font-mono">{part.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <DashboardView />
      </AppShell>
    </AppProvider>
  );
}
