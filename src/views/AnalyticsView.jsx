import React, { useMemo } from 'react';
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
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  FileJson, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Briefcase,
  PieChart as PieIcon
} from 'lucide-react';

const COLORS = ['#0284c7', '#334155', '#a855f7', '#14b8a6', '#f59e0b'];

export default function AnalyticsView() {
  const { currentRoster, employees, pods, brands, metrics, addToast } = useApp();

  // 1. Pod Shift Totals Data
  const podChartData = useMemo(() => {
    return pods.map((pod) => {
      const podStaff = employees.filter((e) => e.pod_id === pod.id);
      let totalWorking = 0;
      let totalOff = 0;

      podStaff.forEach((emp) => {
        if (currentRoster?.assignments?.[emp.id]) {
          Object.values(currentRoster.assignments[emp.id]).forEach((s) => {
            if (s?.shift_status === 'working') totalWorking++;
            if (s?.shift_status === 'weekly_off') totalOff++;
          });
        }
      });

      return {
        name: pod.name.split(' ')[1] || pod.name,
        Working: totalWorking,
        Offs: totalOff
      };
    });
  }, [pods, employees, currentRoster]);

  // 2. Shift Status Distribution Data
  const shiftDistributionData = useMemo(() => {
    let working = 0;
    let offs = 0;
    let leaves = 0;
    let comp = 0;
    let holidays = 0;

    employees.forEach((emp) => {
      if (currentRoster?.assignments?.[emp.id]) {
        Object.values(currentRoster.assignments[emp.id]).forEach((s) => {
          if (s?.shift_status === 'working') working++;
          else if (s?.shift_status === 'weekly_off') offs++;
          else if (s?.shift_status === 'planned_leave') leaves++;
          else if (s?.shift_status === 'comp_off') comp++;
          else if (s?.shift_status === 'public_holiday') holidays++;
        });
      }
    });

    return [
      { name: 'Working Shift', value: working },
      { name: 'Weekly Off', value: offs },
      { name: 'Planned Leave', value: leaves },
      { name: 'Comp-Off', value: comp },
      { name: 'Public Holiday', value: holidays }
    ];
  }, [employees, currentRoster]);

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
            <h2 className="text-lg font-bold text-white tracking-tight">Operational Intelligence & SLAs</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Analytics Dashboard
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational capacity distribution, pod utilization, and CSV/JSON export engine
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster (CSV)</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <FileJson className="w-4 h-4 text-sky-400" />
            <span>Backup State (JSON)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-mono">Overall SLA Compliance</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-2">
            {metrics.coverageSlaRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across 15 client brand calendars</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-mono">Single-Resource Vulnerability</div>
          <div className="text-2xl font-bold text-sky-400 font-mono mt-2">80%</div>
          <div className="text-[11px] text-slate-400 mt-1">12 of 15 brands rely on 1 specialist</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-mono">Total Staff Capacity</div>
          <div className="text-2xl font-bold text-white font-mono mt-2">{employees.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Distributed across 4 operational pods</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-925 border border-slate-800">
          <div className="text-xs text-slate-400 uppercase font-mono">Active Conflict Records</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-2">{metrics.activeConflictsCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Unresolved staffing gaps</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pod Shift Allocation Chart */}
        <div className="p-5 rounded-2xl bg-slate-925 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Operational Shifts by Pod (Working vs Offs)</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Capacity distribution across the 4 operational pods</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={podChartData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Working" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Offs" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shift Type Distribution Pie */}
        <div className="p-5 rounded-2xl bg-slate-925 border border-slate-800 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
            <span>Monthly Shift Allocation Breakdown</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">Ratio of working shifts, weekly offs, leaves, and holidays</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
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
    </div>
  );
}
