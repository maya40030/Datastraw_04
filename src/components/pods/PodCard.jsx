import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { UserCheck, Users, Briefcase, Award, Shield, Check } from 'lucide-react';

export default function PodCard({ pod }) {
  const { employees, brands, processes, assignments, refreshData, addToast } = useApp();

  const [isChangingLead, setIsChangingLead] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(pod.lead_id);

  // Pod specific data
  const podMembers = employees.filter((e) => e.pod_id === pod.id);
  const currentLead = employees.find((e) => e.id === pod.lead_id);
  const podBrands = brands.filter((b) => b.pod_id === pod.id);

  // Skills counts
  const skillCounts = processes.map((proc) => {
    const count = podMembers.filter((m) => m.skills.includes(proc.id)).length;
    return { ...proc, count };
  });

  const handleSaveLead = async () => {
    try {
      // Update Pod Lead
      pod.lead_id = selectedLeadId;
      const newLead = employees.find((e) => e.id === selectedLeadId);
      if (newLead) {
        pod.lead_name = newLead.name;
        // Also update role of new lead to 'Pod Lead' if not already
        if (newLead.role !== 'Pod Lead') {
          await dataService.updateEmployee(newLead.id, { role: 'Pod Lead' });
        }
      }
      dataService.persistState();
      await refreshData();
      setIsChangingLead(false);
      addToast(`Updated Pod Lead for ${pod.name} to ${newLead?.name}.`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update pod lead', 'error');
    }
  };

  return (
    <div className="bg-slate-925 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700/80 transition-all">
      <div>
        {/* Pod Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: pod.color }}
            />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{pod.name}</h3>
              <p className="text-[11px] text-slate-400">{pod.description}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
            {podMembers.length} Staff
          </span>
        </div>

        {/* Lead Selector / Status */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              Pod Lead
            </span>
            {!isChangingLead ? (
              <button
                onClick={() => setIsChangingLead(true)}
                className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold"
              >
                Reassign
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSaveLead}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-0.5"
                >
                  <Check className="w-3 h-3" /> Save
                </button>
                <button
                  onClick={() => setIsChangingLead(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {!isChangingLead ? (
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style={{ backgroundColor: currentLead?.avatar_color || '#0284c7' }}
              >
                {currentLead?.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">{currentLead?.name || 'Unassigned'}</div>
                <div className="text-[10px] text-slate-400 font-mono">{currentLead?.email}</div>
              </div>
            </div>
          ) : (
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              {podMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Process Competency Distribution */}
        <div className="mt-4">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            Process Qualified Capacity
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {skillCounts.map((s) => (
              <div key={s.id} className="bg-slate-900 border border-slate-800/80 p-2 rounded-lg text-center">
                <div className="text-[10px] font-mono font-bold text-slate-300">{s.code}</div>
                <div className="text-xs font-bold text-sky-400 font-mono mt-0.5">{s.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pod Brands Matrix */}
        <div className="mt-4">
          <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            Client Accounts ({podBrands.length})
          </div>
          <div className="space-y-1.5">
            {podBrands.map((b) => {
              const brandAssigns = assignments.filter((a) => a.brand_id === b.id);
              const staff = employees.filter((e) => brandAssigns.some((a) => a.employee_id === e.id));
              return (
                <div
                  key={b.id}
                  className="bg-slate-900/50 border border-slate-800/60 p-2 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-300">{b.code}</span>
                    <span className="text-slate-200 truncate max-w-[130px] font-medium">{b.name}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      b.is_single_resource
                        ? 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {b.is_single_resource ? 'Single (1:1)' : `${staff.length} Staff`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pod Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Coverage Readiness:</span>
        <span className="text-emerald-400 font-semibold">Ready for Roster</span>
      </div>
    </div>
  );
}
