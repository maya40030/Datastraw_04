import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { dataService } from '../../services/dataService';
import { Calendar, Plus, Trash2, ShieldCheck, Info } from 'lucide-react';
import HolidayModal from './HolidayModal';

export default function PublicHolidaysTable() {
  const { publicHolidays, refreshData, addToast } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = async (holidayId, holidayName) => {
    try {
      dataService.state.publicHolidays = dataService.state.publicHolidays.filter((h) => h.id !== holidayId);
      dataService.persistState();
      await refreshData();
      addToast(`Removed holiday: ${holidayName}.`, 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to delete holiday', 'error');
    }
  };

  // Sort holidays chronologically
  const sortedHolidays = [...publicHolidays].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-925 border border-slate-800 p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-semibold text-white">Company Gazetted Public Holidays</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Brands operating on 'Daily (Holidays Off)' and 'Standard Business' pause operations on these dates. 
            365-day brands continue operating with mandatory shift coverage.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Holiday</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedHolidays.map((holiday) => {
          const dateObj = new Date(holiday.date + 'T00:00:00');
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return (
            <div
              key={holiday.id}
              className="bg-slate-925 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex flex-col items-center justify-center font-mono shrink-0">
                  <span className="text-[9px] uppercase font-semibold">{dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-sm font-bold leading-none">{dateObj.getDate()}</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{holiday.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {dayName} • {holiday.description}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(holiday.id, holiday.name)}
                className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="Delete Holiday"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <HolidayModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
