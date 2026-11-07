import React from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  ShieldAlert, 
  Calendar, 
  User, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function ConflictCard({ conflict, onResolve, onJumpToRoster }) {
  const isCritical = conflict.severity === 'critical';

  const getConflictIcon = () => {
    if (conflict.conflict_type === 'single_resource_blackout' || conflict.type === 'SINGLE_RESOURCE_BLACKOUT') {
      return <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />;
    }
    if (isCritical) {
      return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
    }
    return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
  };

  const getBadgeStyle = () => {
    if (isCritical) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
    return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  };

  const formattedDate = conflict.date
    ? new Date(conflict.date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
        year: 'numeric'
      })
    : null;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isCritical
          ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
          : 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/50'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{getConflictIcon()}</div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${getBadgeStyle()}`}>
                {conflict.severity || 'Critical'}
              </span>
              <span className="text-xs font-semibold text-white">
                {(conflict.conflict_type || conflict.type || 'Operational Conflict').replace(/_/g, ' ')}
              </span>
              {formattedDate && (
                <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {formattedDate}
                </span>
              )}
            </div>

            <p className="mt-2 text-xs text-slate-200 leading-relaxed font-sans">
              {conflict.message}
            </p>

            {/* Affected Stakeholders Meta */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
              {conflict.brand_name && (
                <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <Briefcase className="w-3 h-3 text-sky-400" />
                  {conflict.brand_name} {conflict.brand_code ? `(${conflict.brand_code})` : ''}
                </span>
              )}
              {conflict.process_id && (
                <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <span className="text-sky-400 font-bold">{conflict.process_id}</span>
                </span>
              )}
              {conflict.employee_name && (
                <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  <User className="w-3 h-3 text-emerald-400" />
                  {conflict.employee_name}
                </span>
              )}
              {conflict.required !== undefined && conflict.actual !== undefined && (
                <span className="text-rose-300 font-bold">
                  Deficit: {conflict.actual}/{conflict.required} Staff
                </span>
              )}
            </div>

            {/* Actionable Suggested Remediation */}
            {conflict.suggested_action && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-300">
                  <span className="font-semibold text-sky-300 font-mono">Recommended Fix: </span>
                  {conflict.suggested_action}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-auto">
          {onJumpToRoster && (
            <button
              onClick={() => onJumpToRoster(conflict)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>Inspect in Roster</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
          {onResolve && (
            <button
              onClick={() => onResolve(conflict)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Handled</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
