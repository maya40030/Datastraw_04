import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ConflictCard from '../components/conflicts/ConflictCard';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Filter, 
  RotateCw, 
  Sparkles, 
  Layers, 
  Briefcase,
  Users,
  ShieldCheck
} from 'lucide-react';

export default function ConflictCenterView() {
  const { 
    conflicts, 
    softWarnings, 
    brands, 
    pods, 
    employees, 
    metrics, 
    generateRoster, 
    isGenerating, 
    setActiveTab, 
    setSelectedBrandId,
    addToast 
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState('all'); // 'all', 'critical', 'warning'
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [search, setSearch] = useState('');
  const [dismissedIds, setDismissedIds] = useState(new Set());

  // Combine critical conflicts and soft warnings into unified triage stream
  const allIssues = useMemo(() => {
    const list = [
      ...conflicts.map((c) => ({ ...c, severity: 'critical' })),
      ...softWarnings.map((w) => ({ ...w, severity: 'warning' }))
    ];
    return list.filter((item) => !dismissedIds.has(item.id || item.message));
  }, [conflicts, softWarnings, dismissedIds]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return allIssues.filter((issue) => {
      const matchesSeverity = 
        severityFilter === 'all' || issue.severity === severityFilter;
      
      const matchesBrand = 
        selectedBrand === 'all' || 
        issue.brand_id === selectedBrand || 
        issue.brand_code === selectedBrand;

      const matchesSearch = 
        !search ||
        (issue.message && issue.message.toLowerCase().includes(search.toLowerCase())) ||
        (issue.brand_name && issue.brand_name.toLowerCase().includes(search.toLowerCase())) ||
        (issue.employee_name && issue.employee_name.toLowerCase().includes(search.toLowerCase()));

      return matchesSeverity && matchesBrand && matchesSearch;
    });
  }, [allIssues, severityFilter, selectedBrand, search]);

  const criticalCount = allIssues.filter((i) => i.severity === 'critical').length;
  const warningCount = allIssues.filter((i) => i.severity === 'warning').length;
  const blackoutCount = allIssues.filter(
    (i) => i.conflict_type === 'single_resource_blackout' || i.type === 'SINGLE_RESOURCE_BLACKOUT'
  ).length;

  const handleResolve = (conflict) => {
    setDismissedIds((prev) => new Set([...prev, conflict.id || conflict.message]));
    addToast('Marked issue as addressed by operations manager.', 'info');
  };

  const handleJumpToRoster = (conflict) => {
    if (conflict.brand_id) {
      setSelectedBrandId(conflict.brand_id);
    }
    setActiveTab('roster');
  };

  const handleOpenSimulator = () => {
    setActiveTab('simulator');
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Conflict & Coverage Triage Center</h2>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded-full border ${
                criticalCount > 0
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {criticalCount > 0 ? `${criticalCount} Active Gaps` : 'All Constraints Satisfied'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time validation against hard constraints, single-resource blackouts, approved leaves, and fair preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold border border-sky-500/30 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Backup Simulator</span>
          </button>
          <button
            onClick={() => generateRoster(true)}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Re-Audit Roster</span>
          </button>
        </div>
      </div>

      {/* KPI Triage Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Critical Hard Violations</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400 font-mono">{criticalCount}</span>
            <span className="text-xs text-slate-400">Fatal Coverage Gaps</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Mandatory client SLA or approved leave breaches
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Single-Resource Blackouts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">{blackoutCount}</span>
            <span className="text-xs text-slate-400">80% Single Accounts</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Zero coverage on 1:1 dedicated accounts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Soft Warnings</span>
            <Sparkles className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-400 font-mono">{warningCount}</span>
            <span className="text-xs text-slate-400">Preference Disparities</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Off-day preferences overridden by coverage demand
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider font-mono">Overall Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              {metrics.coverageSlaRate}%
            </span>
            <span className="text-xs text-slate-400">Target: 95%+</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Constraint satisfaction health index
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-925 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conflict diagnosis, employee, or brand..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Severities ({allIssues.length})</option>
            <option value="critical" className="bg-slate-900">Critical Gaps ({criticalCount})</option>
            <option value="warning" className="bg-slate-900">Soft Warnings ({warningCount})</option>
          </select>
        </div>

        {/* Brand Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400">Brand:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900">
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues Triage Stream */}
      <div className="space-y-3">
        {filteredIssues.map((issue, idx) => (
          <ConflictCard
            key={issue.id || idx}
            conflict={issue}
            onResolve={handleResolve}
            onJumpToRoster={handleJumpToRoster}
          />
        ))}

        {filteredIssues.length === 0 && (
          <div className="p-8 rounded-2xl bg-slate-925 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Zero Operational Conflicts in Filter View</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All client-specific operating calendars, minimum staffing requirements, approved leaves, and compensatory offs are 100% satisfied.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
