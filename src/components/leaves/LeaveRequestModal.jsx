import React, { useState } from 'react';
import { X, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';

export default function LeaveRequestModal({ isOpen, onClose }) {
  const { employees, refreshData, addToast } = useApp();

  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-11-12');
  const [endDate, setEndDate] = useState('2026-11-13');
  const [leaveType, setLeaveType] = useState('planned_leave');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId || !startDate || !endDate) {
      addToast('Please complete all leave fields.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await dataService.addLeave({
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        leave_type: leaveType,
        status: 'approved',
        reason: reason.trim() || 'Approved operations leave'
      });
      await refreshData();
      const emp = employees.find((e) => e.id === employeeId);
      addToast(`Recorded approved leave for ${emp?.name}.`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Failed to record leave', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-925 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Record Approved Employee Leave</h3>
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
                  {e.name} ({e.role} • {e.pod_id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Leave Classification</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="planned_leave">Planned Annual Leave (PL)</option>
              <option value="sick_leave">Sick / Medical Leave (SL)</option>
              <option value="emergency">Emergency / Compassionate Leave</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Reason / Notes</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Pre-booked family vacation"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
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
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md"
            >
              {isSubmitting ? 'Saving...' : 'Approve & Record Leave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
