import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Briefcase, Award, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { analyzeShiftModificationImpact } from '../../engine/impactAnalyzer';
import { rosterService } from '../../services/rosterService';
import ImpactPreviewModal from './ImpactPreviewModal';

export default function RosterCellEditorModal({ isOpen, onClose, cellData }) {
  const { 
    currentRoster, 
    setCurrentRoster, 
    employees, 
    brands, 
    processes, 
    brandProcessRules, 
    assignments, 
    publicHolidays, 
    leaves, 
    compOffs,
    setConflicts,
    setMetrics,
    addToast 
  } = useApp();

  const [shiftStatus, setShiftStatus] = useState('working');
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedProcessId, setSelectedProcessId] = useState('CS');
  const [notes, setNotes] = useState('');

  // Impact Preview State
  const [impactModalOpen, setImpactModalOpen] = useState(false);
  const [detectedImpacts, setDetectedImpacts] = useState([]);
  const [isCriticalImpact, setIsCriticalImpact] = useState(false);

  useEffect(() => {
    if (cellData?.shift) {
      setShiftStatus(cellData.shift.shift_status || 'working');
      setSelectedBrandId(cellData.shift.brand_id || '');
      setSelectedProcessId(cellData.shift.process_id || 'CS');
      setNotes(cellData.shift.notes || '');
    } else {
      setShiftStatus('working');
      setSelectedBrandId('');
      setSelectedProcessId('CS');
      setNotes('');
    }
  }, [cellData, isOpen]);

  if (!isOpen || !cellData) return null;

  const { employee, dateStr, shift } = cellData;

  const dateFormatted = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Allowed brands for this employee
  const empAssignments = assignments.filter((a) => a.employee_id === employee.id);
  const assignedBrands = brands.filter((b) => empAssignments.some((a) => a.brand_id === b.id));
  const availableBrands = assignedBrands.length > 0 ? assignedBrands : brands;

  const handleApplyClick = (e) => {
    e.preventDefault();

    const selectedBrand = brands.find((b) => b.id === selectedBrandId);

    const proposedShift = {
      shift_status: shiftStatus,
      brand_id: shiftStatus === 'working' ? selectedBrandId || null : null,
      brand_code: shiftStatus === 'working' ? selectedBrand?.code || null : null,
      brand_name: shiftStatus === 'working' ? selectedBrand?.name || null : null,
      process_id: shiftStatus === 'working' ? selectedProcessId || null : null,
      is_single_resource: selectedBrand?.is_single_resource ?? false,
      notes: notes || `Manual shift override on ${dateStr}`
    };

    // Analyze impact
    const analysis = analyzeShiftModificationImpact({
      employeeId: employee.id,
      dateStr,
      proposedShift,
      currentRoster,
      employees,
      brands,
      brandProcessRules,
      publicHolidays,
      leaves,
      compOffs
    });

    if (analysis.hasImpact) {
      setDetectedImpacts(analysis.impacts);
      setIsCriticalImpact(analysis.isCritical);
      setImpactModalOpen(true);
    } else {
      commitShiftChange(proposedShift);
    }
  };

  const commitShiftChange = async (proposedShift = null) => {
    const finalShift = proposedShift || {
      shift_status: shiftStatus,
      brand_id: shiftStatus === 'working' ? selectedBrandId || null : null,
      brand_code: shiftStatus === 'working' ? brands.find((b) => b.id === selectedBrandId)?.code || null : null,
      process_id: shiftStatus === 'working' ? selectedProcessId || null : null,
      notes: notes || 'Manual adjustment'
    };

    try {
      // Apply change to active roster state
      const updatedAssignments = {
        ...currentRoster.assignments,
        [employee.id]: {
          ...currentRoster.assignments[employee.id],
          [dateStr]: finalShift
        }
      };

      const updatedRoster = {
        ...currentRoster,
        assignments: updatedAssignments
      };

      // Revalidate through Roster Service
      const { roster, validation } = await rosterService.revalidateRoster(updatedRoster);

      setCurrentRoster(roster);
      setConflicts(validation.hardViolations);
      setMetrics((prev) => ({
        ...prev,
        coverageSlaRate: validation.coverageScore,
        activeConflictsCount: validation.hardViolations.length,
        rosterStatus: validation.hardViolations.length === 0 ? 'Validated' : 'Draft'
      }));

      addToast(`Shift updated for ${employee.name} on ${dateStr}.`, 'success');
      setImpactModalOpen(false);
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Failed to apply shift override', 'error');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-925 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                style={{ backgroundColor: employee.avatar_color || '#0284c7' }}
              >
                {employee.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{employee.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">{dateFormatted}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleApplyClick} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Shift Classification</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'working', label: 'Working Shift', color: 'border-sky-500 text-sky-400' },
                  { id: 'weekly_off', label: 'Weekly Off', color: 'border-slate-500 text-slate-300' },
                  { id: 'planned_leave', label: 'Planned Leave (PL)', color: 'border-purple-500 text-purple-300' },
                  { id: 'comp_off', label: 'Compensatory Off (CO)', color: 'border-teal-500 text-teal-300' },
                ].map((st) => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => setShiftStatus(st.id)}
                    className={`py-2 px-3 rounded-lg border text-left text-xs font-medium transition-all ${
                      shiftStatus === st.id
                        ? `bg-slate-900 border-sky-500 font-bold ${st.color}`
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {shiftStatus === 'working' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Client Brand</label>
                  <select
                    value={selectedBrandId}
                    onChange={(e) => setSelectedBrandId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                    required
                  >
                    <option value="">-- Select Client Brand --</option>
                    {availableBrands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code}) {b.is_single_resource ? '• 1:1 Dedicated' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Process Assignment</label>
                  <select
                    value={selectedProcessId}
                    onChange={(e) => setSelectedProcessId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {processes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Adjustment Reason / Notes</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Swapped with peer / emergency duty"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Actions */}
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
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20"
              >
                Validate & Apply
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Impact Warning Modal */}
      <ImpactPreviewModal
        isOpen={impactModalOpen}
        onClose={() => setImpactModalOpen(false)}
        onConfirm={() => commitShiftChange()}
        impacts={detectedImpacts}
        isCritical={isCriticalImpact}
      />
    </>
  );
}
