import React from 'react';
import { AlertCircle, AlertTriangle, ShieldAlert, ArrowRight, X } from 'lucide-react';

export default function ImpactPreviewModal({ isOpen, onClose, onConfirm, impacts = [], isCritical = false }) {
  if (!isOpen || impacts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-925 border border-rose-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-500/30 bg-rose-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Shift Modification Impact Warning</h3>
              <p className="text-[11px] text-rose-300/80">Real-time constraint gatekeeper detected operational risk</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Impact List */}
        <div className="p-6 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            The proposed shift change violates one or more configured scheduling constraints:
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {impacts.map((impact, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900 border border-rose-500/20 text-xs text-slate-200 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{impact}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-200">System Policy:</span> If you proceed, the change will be saved, but the resulting gap will be logged as an explicit active conflict in the Conflict Center and client SLA will drop.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Cancel & Revert
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
          >
            <span>Confirm & Log Conflict</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
