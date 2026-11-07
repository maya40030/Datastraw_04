import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertTriangle, User, Briefcase, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';

export default function BrandAssignmentModal({ isOpen, onClose, brand }) {
  const { employees, processes, assignments, brandProcessRules, refreshData, addToast } = useApp();

  const [selectedProcessId, setSelectedProcessId] = useState('CS');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !brand) return null;

  // Active assignments for this brand
  const currentAssignments = assignments.filter((a) => a.brand_id === brand.id);
  const distinctEmployees = Array.from(new Set(currentAssignments.map((a) => a.employee_id)));

  // Filter candidates for selected process: must have the skill
  const eligibleCandidates = employees.filter((emp) => {
    const hasSkill = emp.skills.includes(selectedProcessId);
    const alreadyAssignedToThisProcess = currentAssignments.some(
      (a) => a.employee_id === emp.id && a.process_id === selectedProcessId
    );
    return hasSkill && !alreadyAssignedToThisProcess;
  });

  const handleAddAssignment = async () => {
    if (!selectedEmployeeId) {
      addToast('Please select a qualified employee to assign.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await dataService.addAssignment({
        employee_id: selectedEmployeeId,
        brand_id: brand.id,
        process_id: selectedProcessId,
        is_primary: true
      });

      // Recalculate if brand is single resource or multi resource
      const updatedAssigns = [...currentAssignments, { employee_id: selectedEmployeeId }];
      const uniqueCount = new Set(updatedAssigns.map((a) => a.employee_id)).size;
      const isSingle = uniqueCount === 1;

      await dataService.updateBrand(brand.id, { is_single_resource: isSingle });

      await refreshData();
      setSelectedEmployeeId('');
      addToast(`Added employee assignment for ${brand.name}.`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to add assignment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    try {
      setIsSubmitting(true);
      await dataService.removeAssignment(assignmentId);

      // Recalculate single resource status
      const remainingAssigns = currentAssignments.filter((a) => a.id !== assignmentId);
      const uniqueCount = new Set(remainingAssigns.map((a) => a.employee_id)).size;
      const isSingle = uniqueCount === 1;

      await dataService.updateBrand(brand.id, { is_single_resource: isSingle });

      await refreshData();
      addToast(`Assignment removed from ${brand.name}.`, 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to remove assignment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-925 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-mono font-bold text-xs">
              {brand.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white">{brand.name}</h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    distinctEmployees.length <= 1
                      ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  }`}
                >
                  {distinctEmployees.length <= 1 ? 'Single-Resource (1:1)' : `Multi-Resource (${distinctEmployees.length} Staff)`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Configure staffing assignments and process responsibilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Active Assignments Table */}
          <div>
            <h3 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400 mb-2.5">
              Active Process Staffing Allocations
            </h3>

            {currentAssignments.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>No staff members are currently allocated to this brand. Roster generation will flag critical coverage gap!</span>
              </div>
            ) : (
              <div className="space-y-2">
                {currentAssignments.map((assign) => {
                  const emp = employees.find((e) => e.id === assign.employee_id);
                  const proc = processes.find((p) => p.id === assign.process_id);
                  return (
                    <div
                      key={assign.id}
                      className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
                          style={{ backgroundColor: emp?.avatar_color || '#0284c7' }}
                        >
                          {emp?.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2">
                            <span>{emp?.name || 'Unknown Staff'}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({emp?.role})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Assigned Process: <span className="text-sky-400 font-bold">{proc?.name || assign.process_id}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRemoveAssignment(assign.id)}
                          disabled={isSubmitting}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remove Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Assignment Section */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              Allocate Qualified Staff Member
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Select Process</label>
                <select
                  value={selectedProcessId}
                  onChange={(e) => {
                    setSelectedProcessId(e.target.value);
                    setSelectedEmployeeId('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  {processes.map((proc) => (
                    <option key={proc.id} value={proc.id}>
                      {proc.code} - {proc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Qualified Candidates ({eligibleCandidates.length})
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="">-- Choose Staff Member --</option>
                  {eligibleCandidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role} • {c.pod_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAddAssignment}
              disabled={isSubmitting || !selectedEmployeeId}
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff to {selectedProcessId} Allocation</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            Total Distinct Staff: <span className="text-white font-bold">{distinctEmployees.length}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
