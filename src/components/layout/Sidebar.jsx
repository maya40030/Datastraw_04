import React from 'react';
import { useApp } from '../../context/AppContext';
import { NAV_ITEMS } from '../../constants/navigation';
import { 
  CalendarDays, 
  AlertTriangle, 
  Sparkles, 
  Briefcase, 
  Users, 
  SlidersHorizontal, 
  BarChart3, 
  FileText,
  ShieldCheck,
  Building2
} from 'lucide-react';

const ICON_MAP = {
  CalendarDays,
  AlertTriangle,
  Sparkles,
  Briefcase,
  Users,
  SlidersHorizontal,
  BarChart3,
  FileText
};

export default function Sidebar() {
  const { activeTab, setActiveTab, metrics } = useApp();

  return (
    <aside className="w-64 bg-slate-925 border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-brand-700 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white font-bold text-lg">
          D
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white">DATASTRAW</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20">
              Ops
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">Smart Roster Engine</p>
        </div>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
          Operations Hub
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] || CalendarDays;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-sky-600/15 text-sky-400 border border-sky-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                    isActive
                      ? 'bg-sky-400/20 text-sky-300'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {item.id === 'conflicts' && metrics.activeConflictsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold animate-pulse">
                  {metrics.activeConflictsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Operational Summary Pill */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 m-2 rounded-xl border">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-sky-400" /> Organization
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
            Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Staff</div>
            <div className="font-bold text-slate-100 font-mono mt-0.5">{metrics.totalEmployees}</div>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Brands</div>
            <div className="font-bold text-slate-100 font-mono mt-0.5">{metrics.totalBrands}</div>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between px-1">
          <span>Single-Resource:</span>
          <span className="font-mono text-sky-400 font-semibold">{metrics.singleResourceBrands} (80%)</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>DataStraw Core v1.0</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">P1 Active</span>
      </div>
    </aside>
  );
}
