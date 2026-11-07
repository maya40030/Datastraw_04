import React, { useState } from 'react';
import { X, Calendar, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';

export default function HolidayModal({ isOpen, onClose }) {
  const { refreshData, addToast } = useApp();

  const [date, setDate] = useState('2026-11-26');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('Gazetted Company Holiday');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !name.trim()) {
      addToast('Please enter holiday date and name.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const newHoliday = {
        id: `ph-${Date.now()}`,
        date,
        name: name.trim(),
        description: description.trim()
      };
      dataService.state.publicHolidays.push(newHoliday);
      dataService.persistState();
      await refreshData();
      addToast(`Added public holiday: ${name}.`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Failed to add public holiday', 'error');
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
            <h3 className="text-sm font-semibold text-white">Add Public Holiday</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Holiday Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Holiday Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Diwali Festival"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description / Category</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. National Gazetted Holiday"
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
              {isSubmitting ? 'Adding...' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
