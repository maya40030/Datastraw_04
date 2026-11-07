import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { Sliders, Save, CheckCircle2, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';

export default function OperatingCalendarConfig() {
  const { brands, processes, brandProcessRules, refreshData, addToast } = useApp();

  const [selectedBrandFilter, setSelectedBrandFilter] = useState('all');
  const [selectedProcessFilter, setSelectedProcessFilter] = useState('all');
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filteredRules = brandProcessRules.filter((rule) => {
    const matchesBrand = selectedBrandFilter === 'all' || rule.brand_id === selectedBrandFilter;
    const matchesProcess = selectedProcessFilter === 'all' || rule.process_id === selectedProcessFilter;
    return matchesBrand && matchesProcess;
  });

  const startEdit = (rule) => {
    setEditingRuleId(rule.id);
    setEditForm({
      operating_calendar: rule.operating_calendar,
      min_headcount: rule.min_headcount,
      weekend_min_headcount: rule.weekend_min_headcount ?? rule.min_headcount
    });
  };

  const handleSave = async (ruleId) => {
    try {
      await dataService.updateBrandProcessRule(ruleId, editForm);
      await refreshData();
      setEditingRuleId(null);
      addToast('Brand-process operating schedule updated.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to update operating rule', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-925 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Filter Brand:</span>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
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

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Filter Process:</span>
            <select
              value={selectedProcessFilter}
              onChange={(e) => setSelectedProcessFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Processes</option>
              {processes.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing <span className="text-white font-bold">{filteredRules.length}</span> Operating Calendars
        </span>
      </div>

      {/* Rules Master Table */}
      <div className="bg-slate-925 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Brand Account</th>
                <th className="py-3 px-4">Process</th>
                <th className="py-3 px-4">Operating Calendar Model</th>
                <th className="py-3 px-4">Weekday Min Staff</th>
                <th className="py-3 px-4">Weekend Min Staff</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredRules.map((rule) => {
                const brand = brands.find((b) => b.id === rule.brand_id);
                const proc = processes.find((p) => p.id === rule.process_id);
                const isEditing = editingRuleId === rule.id;

                return (
                  <tr key={rule.id} className="hover:bg-slate-850/60 transition-colors">
                    {/* Brand */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-400 text-[11px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                          {brand?.code || rule.brand_id}
                        </span>
                        <div>
                          <div className="font-semibold text-white">{brand?.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {brand?.is_single_resource ? 'Single-Resource (80%)' : 'Multi-Resource (20%)'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Process */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">
                        {proc?.name || rule.process_id} ({rule.process_id})
                      </span>
                    </td>

                    {/* Operating Calendar Model */}
                    <td className="py-3 px-4">
                      {!isEditing ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium ${
                            rule.operating_calendar === '365_days'
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                              : rule.operating_calendar === 'daily_no_holidays'
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : rule.operating_calendar === 'weekdays_only'
                              ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                              : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {rule.operating_calendar === '365_days' && '365-Day Operations'}
                          {rule.operating_calendar === 'daily_no_holidays' && 'Daily (Holidays Off)'}
                          {rule.operating_calendar === 'standard_business' && 'Standard Business (Sun Off)'}
                          {rule.operating_calendar === 'weekdays_only' && 'Weekdays Only (Mon-Fri)'}
                        </span>
                      ) : (
                        <select
                          value={editForm.operating_calendar}
                          onChange={(e) => setEditForm({ ...editForm, operating_calendar: e.target.value })}
                          className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                        >
                          <option value="365_days">365-Day Operations (All Days Inc. Sun & Holidays)</option>
                          <option value="daily_no_holidays">Daily Operations (Public Holidays Off)</option>
                          <option value="standard_business">Standard Business (Mon-Sat, Sun & Holidays Off)</option>
                          <option value="weekdays_only">Weekdays Only (Mon-Fri, Weekends & Holidays Off)</option>
                        </select>
                      )}
                    </td>

                    {/* Min Headcount */}
                    <td className="py-3 px-4 font-mono">
                      {!isEditing ? (
                        <span className="font-bold text-slate-200">{rule.min_headcount} staff / day</span>
                      ) : (
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={editForm.min_headcount}
                          onChange={(e) => setEditForm({ ...editForm, min_headcount: Number(e.target.value) })}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500 text-center"
                        />
                      )}
                    </td>

                    {/* Weekend Min Headcount */}
                    <td className="py-3 px-4 font-mono">
                      {!isEditing ? (
                        <span className="font-bold text-slate-300">
                          {rule.weekend_min_headcount ?? rule.min_headcount} staff
                        </span>
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="5"
                          value={editForm.weekend_min_headcount}
                          onChange={(e) => setEditForm({ ...editForm, weekend_min_headcount: Number(e.target.value) })}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-sky-500 text-center"
                        />
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {!isEditing ? (
                        <button
                          onClick={() => startEdit(rule)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                        >
                          Configure
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSave(rule.id)}
                            className="px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-all shadow-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingRuleId(null)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
