import React, { useState } from 'react';
import { X, Calendar, User, Award, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';

export default function CompOffModal({ isOpen, onClose }) {
  const { employees, refreshData, addToast } = useApp();

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [date, setDate] = useState('2026-11-20');
  const [earnedReason, setEarnedReason] = useState('Worked mandatory 365-day shift on Public Holiday');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId || !date) {
      addToast('Please select employee and date.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await dataService.addCompOff({
        employee_id: employeeId,
        date,
        earned_reason: earnedReason.trim()
      });
      await refreshData();
      const emp = employees.find((e) => e.id === employeeId);
      addToast(`Recorded Compensatory Off (CO) for ${emp?.name}.`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Failed to record compensatory off', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-925 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Credit Compensatory Off (CO)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              required
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Comp-Off Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Earned Reason / Justification</label>
            <input
              type="text"
              value={earnedReason}
              onChange={(e) => setEarnedReason(e.target.value)}
              placeholder="e.g. Worked on Diwali festival to maintain 365-day SLA"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md"
            >
              {isSubmitting ? 'Recording...' : 'Grant Comp-Off'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
