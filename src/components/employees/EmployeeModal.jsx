import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, User, Mail, Shield, Award, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';

export default function EmployeeModal({ isOpen, onClose, employee = null }) {
  const { pods, processes, refreshData, addToast } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Operations Specialist',
    pod_id: 'pod-alpha',
    skills: ['CS'],
    weekly_off_preference: 0,
    weekly_offs_quota: 4,
    avatar_color: '#0284c7'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        role: employee.role || 'Operations Specialist',
        pod_id: employee.pod_id || 'pod-alpha',
        skills: employee.skills || ['CS'],
        weekly_off_preference: employee.weekly_off_preference ?? 0,
        weekly_offs_quota: employee.weekly_offs_quota ?? 4,
        avatar_color: employee.avatar_color || '#0284c7'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'Operations Specialist',
        pod_id: pods[0]?.id || 'pod-alpha',
        skills: ['CS'],
        weekly_off_preference: 0,
        weekly_offs_quota: 4,
        avatar_color: '#0284c7'
      });
    }
  }, [employee, pods, isOpen]);

  if (!isOpen) return null;

  const handleSkillToggle = (skillId) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skillId);
      const updated = exists ? prev.skills.filter((s) => s !== skillId) : [...prev.skills, skillId];
      // Ensure at least one skill remains
      return { ...prev, skills: updated.length > 0 ? updated : [skillId] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      addToast('Please enter employee name and work email.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (employee) {
        await dataService.updateEmployee(employee.id, formData);
        addToast(`Updated employee profile for ${formData.name}.`, 'success');
      } else {
        await dataService.addEmployee(formData);
        addToast(`Added ${formData.name} to operational roster.`, 'success');
      }
      await refreshData();
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Failed to save employee changes.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-925 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {employee ? 'Edit Employee Profile' : 'Add Operational Staff Member'}
              </h2>
              <p className="text-[11px] text-slate-400">Configure pod assignment, role, and process competencies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Maya Sharma"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. maya.sharma@datastraw.io"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Operational Pod</label>
              <select
                value={formData.pod_id}
                onChange={(e) => setFormData({ ...formData, pod_id: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                {pods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Role Classification</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                <option value="Operations Specialist">Operations Specialist</option>
                <option value="Senior Specialist">Senior Specialist</option>
                <option value="Pod Lead">Pod Lead</option>
              </select>
            </div>
          </div>

          {/* Qualified Processes (Skills) */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Certified Process Competencies</span>
              <span className="text-[10px] text-slate-400 font-normal">Click to toggle qualification</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {processes.map((proc) => {
                const isSelected = formData.skills.includes(proc.id);
                return (
                  <button
                    type="button"
                    key={proc.id}
                    onClick={() => handleSkillToggle(proc.id)}
                    className={`p-2 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500/40 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-[11px]">{proc.code}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{proc.name}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly Off Preference & Quota */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Weekly-Off Preference</label>
              <select
                value={formData.weekly_off_preference}
                onChange={(e) => setFormData({ ...formData, weekly_off_preference: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                {DAYS.map((day, idx) => (
                  <option key={idx} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Monthly Offs Quota</label>
              <input
                type="number"
                min="2"
                max="8"
                value={formData.weekly_offs_quota}
                onChange={(e) => setFormData({ ...formData, weekly_offs_quota: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : employee ? 'Save Changes' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
