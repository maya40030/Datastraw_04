import React from 'react';

/**
 * Standard Roster Cell Component
 * Renders shift status badge, brand/process labels, and conflict indicators.
 */
export default function RosterCell({ shift, dateStr, isToday, isSunday, isHoliday, onClick }) {
  if (!shift) {
    return (
      <div 
        onClick={onClick}
        className="h-10 border-b border-r border-slate-800/80 flex items-center justify-center p-1 text-slate-600 hover:bg-slate-800/40 cursor-pointer"
      >
        <span className="text-[10px] font-mono">-</span>
      </div>
    );
  }

  const { shift_status, brand_code, process_id, notes, is_single_resource } = shift;

  const getBadge = () => {
    switch (shift_status) {
      case 'working':
        return (
          <div
            title={`${notes || 'Working Shift'} ${brand_code ? `(${brand_code} • ${process_id})` : ''}`}
            className={`w-full h-8 px-1 py-0.5 rounded flex flex-col justify-center items-center text-center transition-all ${
              is_single_resource
                ? 'bg-sky-500/15 border border-sky-500/30 text-sky-200 hover:bg-sky-500/25'
                : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/25'
            }`}
          >
            <span className="text-[9px] font-bold font-mono tracking-tight leading-none truncate max-w-full">
              {brand_code || 'OPS'}
            </span>
            <span className="text-[8px] font-mono text-slate-300 leading-none mt-0.5">
              {process_id || 'Shift'}
            </span>
          </div>
        );

      case 'weekly_off':
        return (
          <div
            title={notes || 'Scheduled Weekly Off'}
            className="w-full h-8 px-1 rounded flex items-center justify-center bg-slate-850/90 border border-slate-800 text-slate-400 hover:bg-slate-800 transition-all"
          >
            <span className="text-[9px] font-mono font-semibold">OFF</span>
          </div>
        );

      case 'planned_leave':
        return (
          <div
            title={notes || 'Approved Planned Leave'}
            className="w-full h-8 px-1 rounded flex items-center justify-center bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:bg-purple-900/60 transition-all"
          >
            <span className="text-[9px] font-mono font-bold tracking-tight">LEAVE</span>
          </div>
        );

      case 'comp_off':
        return (
          <div
            title={notes || 'Compensatory Off Credit'}
            className="w-full h-8 px-1 rounded flex items-center justify-center bg-teal-950/60 border border-teal-500/30 text-teal-300 hover:bg-teal-900/60 transition-all"
          >
            <span className="text-[9px] font-mono font-bold tracking-tight">COMP</span>
          </div>
        );

      case 'public_holiday':
        return (
          <div
            title={notes || 'Company Public Holiday'}
            className="w-full h-8 px-1 rounded flex items-center justify-center bg-amber-950/60 border border-amber-500/30 text-amber-300 hover:bg-amber-900/60 transition-all"
          >
            <span className="text-[9px] font-mono font-bold tracking-tight">HOLIDAY</span>
          </div>
        );

      default:
        return (
          <div className="w-full h-8 px-1 rounded flex items-center justify-center bg-slate-900 text-slate-500 text-[10px]">
            {shift_status}
          </div>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`h-10 min-w-[58px] border-b border-r border-slate-800/80 p-1 flex items-center justify-center cursor-pointer transition-colors ${
        isSunday ? 'bg-slate-950/40' : isHoliday ? 'bg-amber-950/10' : ''
      }`}
    >
      {getBadge()}
    </div>
  );
}
