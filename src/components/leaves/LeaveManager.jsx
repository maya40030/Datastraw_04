import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { Calendar, Plus, Trash2, Award, CheckCircle2, User, Clock } from 'lucide-react';
import LeaveRequestModal from './LeaveRequestModal';
import CompOffModal from './CompOffModal';

export default function LeaveManager() {
  const { employees, leaves, compOffs, refreshData, addToast } = useApp();

  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [compModalOpen, setCompModalOpen] = useState(false);
  const [selectedEmpFilter, setSelectedEmpFilter] = useState('all');

  const filteredLeaves = leaves.filter((l) =>
    selectedEmpFilter === 'all' ? true : l.employee_id === selectedEmpFilter
  );

  const filteredCompOffs = compOffs.filter((c) =>
    selectedEmpFilter === 'all' ? true : c.employee_id === selectedEmpFilter
  );

  const handleDeleteLeave = async (leaveId) => {
    try {
      await dataService.removeLeave(leaveId);
      await refreshData();
      addToast('Leave request removed from roster constraints.', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete leave', 'error');
    }
  };

  const handleDeleteCompOff = async (compOffId) => {
    try {
      dataService.state.compOffs = dataService.state.compOffs.filter((c) => c.id !== compOffId);
      dataService.persistState();
      await refreshData();
      addToast('Comp-off record deleted.', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete comp-off', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-925 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400">Filter Employee:</span>
          <select
            value={selectedEmpFilter}
            onChange={(e) => setSelectedEmpFilter(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id} className="bg-slate-900">
                {e.name} ({e.pod_id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLeaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Leave (PL)</span>
          </button>
          <button
            onClick={() => setCompModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Credit Comp-Off (CO)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planned Leaves List */}
        <div className="bg-slate-925 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold text-white">Approved Leaves ({filteredLeaves.length})</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Mandatory Hard Constraint</span>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredLeaves.map((leave) => {
              const emp = employees.find((e) => e.id === leave.employee_id);
              return (
                <div
                  key={leave.id}
                  className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: emp?.avatar_color || '#0284c7' }}
                    >
                      {emp?.name[0] || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{emp?.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-mono">
                          {leave.leave_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {leave.start_date} to {leave.end_date} • {leave.reason}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLeave(leave.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Remove Leave"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {filteredLeaves.length === 0 && (
              <div className="text-xs text-slate-500 italic p-4 text-center">
                No approved leaves recorded for this filter.
              </div>
            )}
          </div>
        </div>

        {/* Compensatory Offs (CO) List */}
        <div className="bg-slate-925 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Compensatory Offs Ledger ({filteredCompOffs.length})</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Earned Credit</span>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredCompOffs.map((comp) => {
              const emp = employees.find((e) => e.id === comp.employee_id);
              return (
                <div
                  key={comp.id}
                  className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: emp?.avatar_color || '#10b981' }}
                    >
                      {emp?.name[0] || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span>{emp?.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                          Comp-Off Credit
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Scheduled Off: {comp.date} • {comp.earned_reason}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCompOff(comp.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Remove Comp Off"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            {filteredCompOffs.length === 0 && (
              <div className="text-xs text-slate-500 italic p-4 text-center">
                No compensatory off records found.
              </div>
            )}
          </div>
        </div>
      </div>

      <LeaveRequestModal isOpen={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} />
      <CompOffModal isOpen={compModalOpen} onClose={() => setCompModalOpen(false)} />
    </div>
  );
}
