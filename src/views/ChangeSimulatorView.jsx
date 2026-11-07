import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { recommendBackupEmployees } from '../engine/backupRecommender';
import { evaluateOperatingRequirement } from '../services/calendarService';
import { rosterService } from '../services/rosterService';
import { 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  Briefcase, 
  Calendar, 
  ArrowRight, 
  RotateCw,
  Award,
  Zap,
  Info
} from 'lucide-react';

export default function ChangeSimulatorView() {
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

  const [selectedEmpId, setSelectedEmpId] = useState(employees[1]?.id || 'emp-02'); // Defaults to Kabir Mehta (Single-resource dedicated)
  const [absenceDate, setAbsenceDate] = useState('2026-11-04');
  const [absenceReason, setAbsenceReason] = useState('Sudden Medical Emergency');
  const [simulationResult, setSimulationResult] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  const targetEmp = employees.find((e) => e.id === selectedEmpId);

  const handleSimulate = () => {
    if (!currentRoster || !targetEmp) return;

    // Check what the employee is scheduled for on that date
    const shift = currentRoster.assignments?.[targetEmp.id]?.[absenceDate];

    if (!shift || shift.shift_status !== 'working' || !shift.brand_id) {
      setSimulationResult({
        hasImpact: false,
        isSingleResource: false,
        message: `${targetEmp.name} is not scheduled for client brand operations on ${absenceDate} (Current Status: ${shift?.shift_status || 'Off'}). No operational gap created.`,
        recommendations: []
      });
      return;
    }

    const brand = brands.find((b) => b.id === shift.brand_id);
    const rule = brandProcessRules.find(
      (r) => r.brand_id === shift.brand_id && r.process_id === shift.process_id
    );

    // Assess Brand Type (Single-Resource vs Multi-Resource)
    const isSingleResource = brand?.is_single_resource ?? false;

    // Check if remaining staff on this brand can absorb the absence
    const remainingStaff = employees.filter((emp) => {
      if (emp.id === targetEmp.id) return false;
      const s = currentRoster.assignments?.[emp.id]?.[absenceDate];
      return s && s.shift_status === 'working' && s.brand_id === shift.brand_id && s.process_id === shift.process_id;
    });

    const req = evaluateOperatingRequirement(absenceDate, rule, publicHolidays);
    const canRemainingAbsorb = !isSingleResource && remainingStaff.length >= req.requiredHeadcount;

    let recommendations = [];
    if (!canRemainingAbsorb) {
      recommendations = recommendBackupEmployees({
        dateStr: absenceDate,
        brandId: shift.brand_id,
        processId: shift.process_id,
        absenteeEmployeeId: targetEmp.id,
        currentRoster,
        employees,
        brands,
        leaves,
        compOffs
      });
    }

    setSimulationResult({
      hasImpact: true,
      isSingleResource,
      canRemainingAbsorb,
      brand,
      process_id: shift.process_id,
      requiredHeadcount: req.requiredHeadcount,
      remainingCount: remainingStaff.length,
      recommendations: recommendations.slice(0, 3), // Top 3 ranked recommendations
      shift
    });
  };

  const handleApplySubstitution = async (candidate) => {
    if (!simulationResult || !candidate) return;

    try {
      setIsApplying(true);

      const brand = simulationResult.brand;
      const processId = simulationResult.process_id;

      // 1. Mark Absentee employee as Emergency Leave
      const updatedAssignments = {
        ...currentRoster.assignments,
        [targetEmp.id]: {
          ...currentRoster.assignments[targetEmp.id],
          [absenceDate]: {
            shift_status: 'planned_leave',
            notes: `Emergency Leave: ${absenceReason}`,
            brand_id: null,
            process_id: null
          }
        },
        // 2. Assign Backup Employee to this Brand & Process
        [candidate.employee_id]: {
          ...currentRoster.assignments[candidate.employee_id],
          [absenceDate]: {
            shift_status: 'working',
            brand_id: brand.id,
            brand_code: brand.code,
            brand_name: brand.name,
            process_id: processId,
            is_backup_fill: true,
            original_employee_id: targetEmp.id,
            notes: `Backup substitution for ${targetEmp.name} (${absenceReason})`
          }
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

      addToast(
        `Successfully substituted ${candidate.name} into ${brand.name} ${processId}. Gap resolved!`,
        'success'
      );

      // Refresh simulation result to show resolution
      setSimulationResult({
        ...simulationResult,
        resolved: true,
        substitutedStaff: candidate.name
      });
    } catch (err) {
      console.error(err);
      addToast('Failed to apply backup substitution', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Dynamic Change Management & Backup Finder</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Assessment Section 3.F
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulate sudden employee absence, evaluate single vs multi-resource coverage impact, and deploy scored backup candidates
          </p>
        </div>
      </div>

      {/* Simulation Controls Card */}
      <div className="p-6 rounded-2xl bg-slate-925 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-sky-400" />
          <span>Simulate Emergency Absence / Unscheduled Change</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Employee</label>
            <select
              value={selectedEmpId}
              onChange={(e) => {
                setSelectedEmpId(e.target.value);
                setSimulationResult(null);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.role} • {e.pod_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Date of Absence</label>
            <input
              type="date"
              value={absenceDate}
              onChange={(e) => {
                setAbsenceDate(e.target.value);
                setSimulationResult(null);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Absence Reason</label>
            <input
              type="text"
              value={absenceReason}
              onChange={(e) => setAbsenceReason(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <button
          onClick={handleSimulate}
          className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulate Impact & Find Backup Staff</span>
        </button>
      </div>

      {/* Simulation Results Output */}
      {simulationResult && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {simulationResult.resolved ? (
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Coverage Gap Resolved!</span>
              </div>
              <p className="mt-1 text-xs text-emerald-200/90 leading-relaxed">
                {simulationResult.substitutedStaff} has been allocated to replace {targetEmp.name} on {simulationResult.brand?.name} ({simulationResult.process_id}). The roster was re-audited and 100% operational coverage was restored.
              </p>
            </div>
          ) : !simulationResult.hasImpact ? (
            <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 text-slate-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              <span>{simulationResult.message}</span>
            </div>
          ) : simulationResult.canRemainingAbsorb ? (
            /* Multi-Resource Evaluation: Remaining staff can absorb */
            <div className="p-5 rounded-2xl bg-slate-925 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Multi-Resource Brand Redundancy Preserved</span>
              </div>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Brand <span className="font-bold text-white">{simulationResult.brand.name}</span> is a multi-resource account.
                Although {targetEmp.name} is absent, the remaining {simulationResult.remainingCount} assigned employee(s) are sufficient to maintain the required minimum headcount of {simulationResult.requiredHeadcount} on {simulationResult.process_id}.
              </p>
              <div className="mt-3 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/20">
                SLA Status: 100% Maintained without requiring external backup substitution.
              </div>
            </div>
          ) : (
            /* Single-Resource Blackout or Multi-Resource Deficit */
            <div className="p-5 rounded-2xl bg-slate-925 border border-rose-500/30 space-y-4">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>
                  {simulationResult.isSingleResource
                    ? 'Critical Single-Resource Blackout Detected'
                    : 'Coverage Deficit Detected'}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {simulationResult.isSingleResource ? (
                  <>
                    <span className="font-bold text-white">{simulationResult.brand.name}</span> is managed by a single dedicated employee ({targetEmp.name}). With this absence on {absenceDate}, the account has <span className="font-bold text-rose-400">0% operational coverage</span>.
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">{simulationResult.brand.name}</span> required {simulationResult.requiredHeadcount} staff for {simulationResult.process_id}, but only {simulationResult.remainingCount} staff remain available.
                  </>
                )}
              </p>

              {/* Scored Backup Recommendations */}
              <div>
                <h4 className="text-xs font-mono uppercase font-bold text-sky-400 tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Intelligent Backup Recommendations (Ranked by Pod & Skill Affinity)
                </h4>

                <div className="space-y-2.5">
                  {simulationResult.recommendations.map((cand, rank) => (
                    <div
                      key={cand.employee_id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 font-bold text-xs flex items-center justify-center font-mono shrink-0">
                          #{rank + 1}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-2">
                            <span>{cand.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
                              {cand.match_score}% Match
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {cand.role} • {cand.pod_id} • Status: {cand.current_shift_status}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex flex-wrap gap-1">
                            {cand.reasons.map((r, i) => (
                              <span key={i} className="text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded">
                                • {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplySubstitution(cand)}
                        disabled={isApplying}
                        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isApplying ? 'Applying...' : 'Deploy as Substitute'}</span>
                      </button>
                    </div>
                  ))}

                  {simulationResult.recommendations.length === 0 && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                      No certified backup employees with active availability found. Consider cross-pod emergency reallocation.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
