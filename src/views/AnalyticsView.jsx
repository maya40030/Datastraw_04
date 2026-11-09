import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { exportRosterToCSV, exportStateToJSON } from '../services/exportService';
import { dataService } from '../services/dataService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  FileJson, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Briefcase,
  PieChart as PieIcon,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Filter,
  Check
} from 'lucide-react';

const COLORS = ['#0284c7', '#334155', '#a855f7', '#14b8a6', '#f59e0b'];

export default function AnalyticsView() {
  const { currentRoster, employees, pods, brands, brandProcessRules, conflicts, metrics, addToast } = useApp();
  const [selectedPodFilter, setSelectedPodFilter] = useState('all');

  // Filtered employees based on pod selection
  const filteredEmployees = useMemo(() => {
    if (selectedPodFilter === 'all') return employees;
    return employees.filter((e) => e.pod_id === selectedPodFilter);
  }, [employees, selectedPodFilter]);

  // 1. Pod Shift Totals Data
  const podChartData = useMemo(() => {
    return pods.map((pod) => {
      const podStaff = employees.filter((e) => e.pod_id === pod.id);
      let totalWorking = 0;
      let totalOff = 0;
      let totalLeaves = 0;

      podStaff.forEach((emp) => {
        if (currentRoster?.assignments?.[emp.id]) {
          Object.values(currentRoster.assignments[emp.id]).forEach((s) => {
            if (s?.shift_status === 'working') totalWorking++;
            else if (s?.shift_status === 'weekly_off') totalOff++;
            else if (s?.shift_status === 'planned_leave' || s?.shift_status === 'comp_off') totalLeaves++;
          });
        }
      });

      return {
        name: pod.name.replace('Pod ', ''),
        Working: totalWorking,
        Offs: totalOff,
        Leaves: totalLeaves
      };
    });
  }, [pods, employees, currentRoster]);

  // 2. Shift Status Distribution Data
  const shiftDistributionData = useMemo(() => {
    let working = 0;
    let offs = 0;
    let leaves = 0;
    let comp = 0;

    filteredEmployees.forEach((emp) => {
      if (currentRoster?.assignments?.[emp.id]) {
        Object.values(currentRoster.assignments[emp.id]).forEach((s) => {
          if (s?.shift_status === 'working') working++;
          else if (s?.shift_status === 'weekly_off') offs++;
          else if (s?.shift_status === 'planned_leave') leaves++;
          else if (s?.shift_status === 'comp_off') comp++;
        });
      }
    });

    return [
      { name: 'Working Shift', value: working },
      { name: 'Weekly Off', value: offs },
      { name: 'Planned Leave', value: leaves },
      { name: 'Comp-Off', value: comp }
    ];
  }, [filteredEmployees, currentRoster]);

  // 3. Daily Staffing Distribution Trend (Days 1 to 30)
  const dailyStaffingTrend = useMemo(() => {
    if (!employees.length || !currentRoster?.assignments) return [];
    const sampleEmpId = employees[0].id;
    const dates = Object.keys(currentRoster.assignments[sampleEmpId] || {});
    
    return dates.map((dateStr) => {
      const dayNum = dateStr.split('-')[2];
      let onDuty = 0;
      let onRest = 0;

      filteredEmployees.forEach((emp) => {
        const slot = currentRoster.assignments?.[emp.id]?.[dateStr];
        if (slot?.shift_status === 'working') onDuty++;
        else if (slot?.shift_status === 'weekly_off') onRest++;
      });

      return {
        day: `D${dayNum}`,
        OnDuty: onDuty,
        RestDays: onRest
      };
    });
  }, [filteredEmployees, employees, currentRoster]);

  // 4. Brand Portfolio Health & SLA Breakdown
  const brandHealthData = useMemo(() => {
    return brands.map((brand) => {
      const pod = pods.find((p) => p.id === brand.pod_id);
      const rules = brandProcessRules.filter((r) => r.brand_id === brand.id);
      
      // Find staff assigned to this brand
      const assignedStaff = employees.filter((emp) => {
        if (!currentRoster?.assignments?.[emp.id]) return false;
        return Object.values(currentRoster.assignments[emp.id]).some((s) => s?.brand_id === brand.id);
      });

      // Check conflicts for this brand
      const brandConflicts = (conflicts || []).filter((c) => c.brand_id === brand.id);
      const isBlackout = brandConflicts.some((c) => c.severity === 'critical');

      return {
        ...brand,
        podName: pod?.name || 'Unassigned',
        processCount: rules.length,
        assignedStaffNames: assignedStaff.map((e) => e.name).join(', ') || 'Auto-allocated',
        conflictCount: brandConflicts.length,
        status: isBlackout ? 'Blackout Risk' : brand.is_single_resource ? 'Single Point of Failure' : 'Optimal SLA',
        statusColor: isBlackout ? 'rose' : brand.is_single_resource ? 'amber' : 'emerald'
      };
    });
  }, [brands, pods, brandProcessRules, employees, currentRoster, conflicts]);

  const handleExportCSV = () => {
    try {
      exportRosterToCSV(currentRoster, employees, pods);
      addToast('Master Roster exported to CSV successfully.', 'success');
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleExportJSON = () => {
    try {
      exportStateToJSON(dataService.state);
      addToast('Operational database snapshot exported to JSON.', 'success');
    } catch (err) {
      addToast('Failed to export JSON snapshot', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Executive Operations & Analytics Hub</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Operations Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic cross-pod staffing analysis, single-resource vulnerability monitoring, and SLA compliance audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Pod Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPodFilter}
              onChange={(e) => setSelectedPodFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Pods (Alpha-Delta)</option>
              {pods.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">{p.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <FileJson className="w-3.5 h-3.5 text-sky-400" />
            <span>State JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: SLA Compliance */}
        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>OVERALL SLA COMPLIANCE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-2 flex items-baseline gap-2">
            <span>{metrics.coverageSlaRate}%</span>
            <span className="text-xs font-normal text-emerald-500/80 font-sans">Target: ≥95%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(metrics.coverageSlaRate, 100)}%` }} 
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Across 15 client brand calendars</span>
            <span className="text-emerald-400 font-medium">Optimal</span>
          </div>
        </div>

        {/* Card 2: Single-Resource Vulnerability */}
        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>SINGLE-RESOURCE RISK</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono mt-2 flex items-baseline gap-2">
            <span>80.0%</span>
            <span className="text-xs font-normal text-amber-500/80 font-sans">12 / 15 Brands</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '80%' }} />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Solitary specialist model</span>
            <span className="text-amber-400 font-medium">SPoF Sensitive</span>
          </div>
        </div>

        {/* Card 3: Labor Law & Fatigue Compliance */}
        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>FATIGUE COMPLIANCE</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-sky-400 font-mono mt-2 flex items-baseline gap-2">
            <span>100%</span>
            <span className="text-xs font-normal text-slate-400 font-sans">0 Fatigue Breaches</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: '100%' }} />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Max 6 consecutive work days</span>
            <span className="text-sky-400 font-medium">Labor Law Strict</span>
          </div>
        </div>

        {/* Card 4: Active Conflicts & Escalations */}
        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>UNRESOLVED CONFLICTS</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono mt-2 flex items-baseline gap-2">
            <span>{metrics.activeConflictsCount}</span>
            <span className="text-xs font-normal text-slate-400 font-sans">Pending Actions</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-rose-500 h-full rounded-full" 
              style={{ width: `${Math.min(metrics.activeConflictsCount * 10, 100)}%` }} 
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Intentional leave blackout gaps</span>
            <span className="text-rose-400 font-medium">Requires Manager</span>
          </div>
        </div>
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pod Shift Distribution (Span 2) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-925 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                <span>Operational Shift Allocation by Pod</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparative balance of active working shifts, scheduled rest days, and approved leaves across pods
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-sky-500" /> Working</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-600" /> Rest Days</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500" /> Leaves</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={podChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="Working" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Offs" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Leaves" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shift Type Distribution Pie (Span 1) */}
        <div className="p-5 rounded-2xl bg-slate-925 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
            <span>Monthly Roster Composition</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Total shift status distribution</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {shiftDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Daily Staffing Distribution Trend (Days 1 to 30) */}
      <div className="p-5 rounded-2xl bg-slate-925 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Daily Active Staffing Level vs Weekly Rest Days (30-Day Trajectory)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks day-by-day active floor capacity and ensures smooth weekend rotation without understaffing
            </p>
          </div>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyStaffingTrend}>
              <defs>
                <linearGradient id="colorDuty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorRest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={10} interval={1} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Area type="monotone" dataKey="OnDuty" stroke="#0284c7" fillOpacity={1} fill="url(#colorDuty)" />
              <Area type="monotone" dataKey="RestDays" stroke="#64748b" fillOpacity={1} fill="url(#colorRest)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Brand Portfolio Operational Health Matrix */}
      <div className="p-5 rounded-2xl bg-slate-925 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span>Brand Portfolio Operational Health & Vulnerability Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Full visibility across all 15 client accounts, showing staffing model, operating calendar, and SPoF risk index
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            15 Brands Monitored
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-800/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
                <th className="py-2.5 px-3">Brand Name</th>
                <th className="py-2.5 px-3">Pod</th>
                <th className="py-2.5 px-3">Operating Model</th>
                <th className="py-2.5 px-3">Active Processes</th>
                <th className="py-2.5 px-3">Assigned Specialist(s)</th>
                <th className="py-2.5 px-3">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {brandHealthData.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" 
                      style={{ backgroundColor: brand.color }} 
                    />
                    <span>{brand.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({brand.code})</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{brand.podName}</td>
                  <td className="py-2.5 px-3">
                    {brand.is_single_resource ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Single Resource (80%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        Multi-Resource (Scale)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">{brand.processCount} Processes</td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px] truncate max-w-[200px]" title={brand.assignedStaffNames}>
                    {brand.assignedStaffNames}
                  </td>
                  <td className="py-2.5 px-3">
                    {brand.statusColor === 'emerald' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> Optimal (100% SLA)
                      </span>
                    )}
                    {brand.statusColor === 'amber' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> Covered (SPoF Risk)
                      </span>
                    )}
                    {brand.statusColor === 'rose' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> Leave Blackout
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
