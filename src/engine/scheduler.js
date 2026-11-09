/**
 * DATASTRAW DETERMINISTIC SCHEDULING ENGINE
 * 
 * Multi-Pass Constraint Satisfaction Pipeline:
 * - Prioritizes Mandatory (Hard) Constraints over Preferences
 * - Dedicated Handling for 80% Single-Resource vs Multi-Resource Brands
 * - Non-Silent Failure Guarantee: Unfulfillable demand produces explicit conflict records
 */

import { getDaysInMonthArray, evaluateOperatingRequirement, getPublicHolidayForDate } from '../services/calendarService.js';
import { evaluateRosterConstraints } from './constraintChecker.js';

/**
 * Generates a monthly roster for all employees across all brand-process constraints.
 * 
 * @param {object} params
 * @param {number} params.month - 0-indexed (10 = November)
 * @param {number} params.year - e.g. 2026
 * @param {Array} params.employees - 36 staff
 * @param {Array} params.pods - 4 pods
 * @param {Array} params.brands - 15 brands (12 single-resource, 3 multi-resource)
 * @param {Array} params.processes - 4 processes (CS, ACC, RET, NDR)
 * @param {Array} params.brandProcessRules - operating calendars & headcounts
 * @param {Array} params.assignments - employee-brand-process mappings
 * @param {Array} params.publicHolidays - gazetted holidays
 * @param {Array} params.leaves - approved employee leaves
 * @param {Array} params.compOffs - approved compensatory offs
 * @returns {object} - { roster, conflicts, validation, executionTimeMs }
 */
export function generateDeterministicRoster({
  month,
  year,
  employees,
  pods,
  brands,
  processes,
  brandProcessRules,
  assignments,
  publicHolidays = [],
  leaves = [],
  compOffs = []
}) {
  const startTime = performance.now();
  const dates = getDaysInMonthArray(month, year);
  const rosterId = `roster-${year}-${String(month + 1).padStart(2, '0')}`;

  // Initialize empty assignment matrix: [employeeId][dateStr]
  const matrix = {};
  employees.forEach((emp) => {
    matrix[emp.id] = {};
    dates.forEach((d) => {
      matrix[emp.id][d] = null;
    });
  });

  const explicitConflicts = [];

  // --------------------------------------------------------------------------
  // STEP 1: PRE-FILL IMMUTABLE NON-WORKING SLOTS (Hard Constraints)
  // --------------------------------------------------------------------------
  employees.forEach((emp) => {
    // 1A. Approved Planned Leaves (PL)
    const empLeaves = leaves.filter((l) => l.employee_id === emp.id && l.status === 'approved');
    empLeaves.forEach((leave) => {
      dates.forEach((dateStr) => {
        if (dateStr >= leave.start_date && dateStr <= leave.end_date) {
          matrix[emp.id][dateStr] = {
            shift_status: 'planned_leave',
            leave_id: leave.id,
            leave_type: leave.leave_type,
            notes: `Approved Leave: ${leave.reason}`,
            brand_id: null,
            process_id: null
          };
        }
      });
    });

    // 1B. Approved Compensatory Offs (CO)
    const empCompOffs = compOffs.filter((c) => c.employee_id === emp.id && c.status === 'approved');
    empCompOffs.forEach((comp) => {
      if (matrix[emp.id][comp.date] === null) {
        matrix[emp.id][comp.date] = {
          shift_status: 'comp_off',
          comp_off_id: comp.id,
          notes: `Compensatory Off: ${comp.earned_reason}`,
          brand_id: null,
          process_id: null
        };
      }
    });
  });

  // Track consecutive working days and shift counts per employee
  const consecutiveDays = {};
  const weeklyOffsCount = {};
  const employeeShiftCounts = {};

  employees.forEach((e) => {
    consecutiveDays[e.id] = 0;
    weeklyOffsCount[e.id] = 0;
    employeeShiftCounts[e.id] = 0;
  });

  const singleResourceBrands = brands.filter((b) => b.is_single_resource);
  const multiResourceBrands = brands.filter((b) => !b.is_single_resource);

  // --------------------------------------------------------------------------
  // SYNCHRONIZED DAY-BY-DAY SCHEDULING PIPELINE
  // --------------------------------------------------------------------------
  dates.forEach((dateStr) => {
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();

    // A. Pre-check: Anyone already on approved leave or comp-off resets consecutive days
    employees.forEach((emp) => {
      const slot = matrix[emp.id][dateStr];
      if (slot && (slot.shift_status === 'planned_leave' || slot.shift_status === 'comp_off')) {
        consecutiveDays[emp.id] = 0;
      }
    });

    // B. Fatigue Pre-Enforcement: Employees who have worked 6 consecutive days MUST take rest
    employees.forEach((emp) => {
      if (consecutiveDays[emp.id] >= 6 && matrix[emp.id][dateStr] === null) {
        matrix[emp.id][dateStr] = {
          shift_status: 'weekly_off',
          brand_id: null,
          process_id: null,
          notes: 'Mandatory Rest Day (Labor Law: Max 6 consecutive working days)'
        };
        weeklyOffsCount[emp.id]++;
        consecutiveDays[emp.id] = 0;
      }
    });

    // C. Step 2: Single-Resource Brands Scheduling
    singleResourceBrands.forEach((brand) => {
      const brandRules = brandProcessRules.filter((r) => r.brand_id === brand.id);
      const brandAssigns = assignments.filter((a) => a.brand_id === brand.id);
      const dedicatedStaff = employees.find((e) => brandAssigns.some((a) => a.employee_id === e.id));

      if (!dedicatedStaff) {
        explicitConflicts.push({
          id: `conf-no-staff-${brand.id}-${dateStr}`,
          roster_id: rosterId,
          date: dateStr,
          severity: 'critical',
          conflict_type: 'single_resource_blackout',
          brand_id: brand.id,
          brand_name: brand.name,
          process_id: null,
          message: `Single-Resource Blackout: Brand ${brand.name} has no designated employee assigned to its account.`,
          suggested_action: 'Allocate a qualified specialist in the Brand Allocations manager.'
        });
        return;
      }

      const operatingRules = brandRules.filter((rule) => {
        const req = evaluateOperatingRequirement(dateStr, rule, publicHolidays);
        return req.isOperating && req.requiredHeadcount > 0;
      });

      if (operatingRules.length === 0) return; // Brand does not operate today

      const primaryProcess = operatingRules[0].process_id;
      const processSummary = operatingRules.map((r) => r.process_id).join(', ');
      const currentSlot = matrix[dedicatedStaff.id][dateStr];

      // If dedicated specialist is on approved leave / comp-off
      if (currentSlot && (currentSlot.shift_status === 'planned_leave' || currentSlot.shift_status === 'comp_off')) {
        explicitConflicts.push({
          id: `conf-single-blackout-${brand.id}-${dateStr}`,
          roster_id: rosterId,
          date: dateStr,
          severity: 'critical',
          conflict_type: 'single_resource_blackout',
          brand_id: brand.id,
          brand_code: brand.code,
          brand_name: brand.name,
          process_id: primaryProcess,
          employee_id: dedicatedStaff.id,
          employee_name: dedicatedStaff.name,
          message: `Single-Resource Blackout: ${brand.name} operates on ${dateStr}, but dedicated specialist ${dedicatedStaff.name} is on ${currentSlot.shift_status.replace(/_/g, ' ')}.`,
          suggested_action: `Deploy a cross-trained backup from ${dedicatedStaff.pod_id} to maintain 100% SLA.`
        });
        return;
      }

      // Check if specialist should take weekly off today (preferred day or fatigue)
      const isPreferredOff = dedicatedStaff.weekly_off_preference === dayOfWeek;
      const mustTakeRest = consecutiveDays[dedicatedStaff.id] >= 6;

      if ((isPreferredOff || mustTakeRest) && (currentSlot === null || currentSlot.shift_status === 'weekly_off')) {
        // Find qualified pod backup who is available today
        // Prefer one whose preferred weekly off day is not today, or any available pod peer
        let podBackup = employees.find((cand) =>
          cand.pod_id === dedicatedStaff.pod_id &&
          cand.id !== dedicatedStaff.id &&
          cand.skills.includes(primaryProcess) &&
          matrix[cand.id][dateStr] === null &&
          consecutiveDays[cand.id] < 6 &&
          cand.weekly_off_preference !== dayOfWeek
        );

        if (!podBackup) {
          podBackup = employees.find((cand) =>
            cand.pod_id === dedicatedStaff.pod_id &&
            cand.id !== dedicatedStaff.id &&
            cand.skills.includes(primaryProcess) &&
            matrix[cand.id][dateStr] === null &&
            consecutiveDays[cand.id] < 6
          );
        }

        if (podBackup) {
          matrix[dedicatedStaff.id][dateStr] = {
            shift_status: 'weekly_off',
            brand_id: null,
            process_id: null,
            notes: `Designated Weekly Off (Preferred: ${dateObj.toLocaleDateString('en-US', { weekday: 'long' })})`
          };
          weeklyOffsCount[dedicatedStaff.id]++;
          consecutiveDays[dedicatedStaff.id] = 0;

          matrix[podBackup.id][dateStr] = {
            shift_status: 'working',
            brand_id: brand.id,
            brand_code: brand.code,
            brand_name: brand.name,
            process_id: primaryProcess,
            is_single_resource: true,
            is_backup_fill: true,
            notes: `Cross-trained backup covering for ${dedicatedStaff.name} (${processSummary})`
          };
          employeeShiftCounts[podBackup.id]++;
          consecutiveDays[podBackup.id]++;
          return;
        }
      }

      // If available and not at fatigue limit, assign dedicated specialist
      if (matrix[dedicatedStaff.id][dateStr] === null) {
        matrix[dedicatedStaff.id][dateStr] = {
          shift_status: 'working',
          brand_id: brand.id,
          brand_code: brand.code,
          brand_name: brand.name,
          process_id: primaryProcess,
          is_single_resource: true,
          is_backup_fill: false,
          notes: `Dedicated account coverage (${processSummary})`
        };
        employeeShiftCounts[dedicatedStaff.id]++;
        consecutiveDays[dedicatedStaff.id]++;
      }
    });

    // D. Step 3: Multi-Resource Brands Scheduling
    multiResourceBrands.forEach((brand) => {
      const brandRules = brandProcessRules.filter((r) => r.brand_id === brand.id);

      brandRules.forEach((rule) => {
        const req = evaluateOperatingRequirement(dateStr, rule, publicHolidays);
        if (!req.isOperating || req.requiredHeadcount <= 0) return;

        // Primary candidates assigned to this brand & process
        const brandAssigns = assignments.filter(
          (a) => a.brand_id === brand.id && a.process_id === rule.process_id
        );
        let candidates = employees.filter((emp) =>
          brandAssigns.some((a) => a.employee_id === emp.id) &&
          matrix[emp.id][dateStr] === null &&
          consecutiveDays[emp.id] < 6
        );

        // If primary candidates insufficient, check other brand assignees with this skill
        if (candidates.length < req.requiredHeadcount) {
          const crossSkillAssignees = employees.filter((emp) =>
            assignments.some((a) => a.brand_id === brand.id && a.employee_id === emp.id) &&
            emp.skills.includes(rule.process_id) &&
            matrix[emp.id][dateStr] === null &&
            consecutiveDays[emp.id] < 6 &&
            !candidates.some((c) => c.id === emp.id)
          );
          candidates = [...candidates, ...crossSkillAssignees];
        }

        // If still insufficient, draw from same pod members with the certified skill
        if (candidates.length < req.requiredHeadcount) {
          const podHelpers = employees.filter((emp) =>
            emp.pod_id === brand.pod_id &&
            emp.skills.includes(rule.process_id) &&
            matrix[emp.id][dateStr] === null &&
            consecutiveDays[emp.id] < 6 &&
            !candidates.some((c) => c.id === emp.id)
          );
          candidates = [...candidates, ...podHelpers];
        }

        // Prioritize candidates:
        // 1. Not preferring off today
        // 2. Lowest consecutive days worked
        // 3. Lowest monthly shift count
        candidates.sort((a, b) => {
          const aPrefOff = a.weekly_off_preference === dayOfWeek ? 1 : 0;
          const bPrefOff = b.weekly_off_preference === dayOfWeek ? 1 : 0;
          if (aPrefOff !== bPrefOff) return aPrefOff - bPrefOff;
          if (consecutiveDays[a.id] !== consecutiveDays[b.id]) return consecutiveDays[a.id] - consecutiveDays[b.id];
          return (employeeShiftCounts[a.id] || 0) - (employeeShiftCounts[b.id] || 0);
        });

        const slotsToFill = req.requiredHeadcount;
        let filledCount = 0;

        for (let i = 0; i < slotsToFill && i < candidates.length; i++) {
          const staff = candidates[i];
          const isPrimary = brandAssigns.some((a) => a.employee_id === staff.id);

          matrix[staff.id][dateStr] = {
            shift_status: 'working',
            brand_id: brand.id,
            brand_code: brand.code,
            brand_name: brand.name,
            process_id: rule.process_id,
            is_single_resource: false,
            is_backup_fill: !isPrimary,
            notes: isPrimary ? `Multi-resource coverage (${req.reason})` : `Cross-trained pod support (${rule.process_id})`
          };
          employeeShiftCounts[staff.id]++;
          consecutiveDays[staff.id]++;
          filledCount++;
        }

        if (filledCount < slotsToFill) {
          explicitConflicts.push({
            id: `conf-understaffed-${brand.id}-${rule.process_id}-${dateStr}`,
            roster_id: rosterId,
            date: dateStr,
            severity: 'critical',
            conflict_type: 'understaffed_coverage',
            brand_id: brand.id,
            brand_code: brand.code,
            brand_name: brand.name,
            process_id: rule.process_id,
            required: slotsToFill,
            actual: filledCount,
            message: `Coverage Deficit: Multi-resource brand ${brand.name} requires ${slotsToFill} staff for ${rule.process_id} on ${dateStr}, but only ${filledCount} available.`,
            suggested_action: 'Assign an additional team member or approve temporary cross-pod backup.'
          });
        }
      });
    });

    // E. Step 4: Standby Capacity & Weekly Off Allocation for Remaining Staff
    employees.forEach((emp) => {
      if (matrix[emp.id][dateStr] !== null) return; // Already assigned

      const isPreferredOffDay = emp.weekly_off_preference === dayOfWeek;
      const mustTakeRest = consecutiveDays[emp.id] >= 6;
      const shouldTakeWeeklyOff = mustTakeRest || (isPreferredOffDay && weeklyOffsCount[emp.id] < emp.weekly_offs_quota);

      if (shouldTakeWeeklyOff) {
        matrix[emp.id][dateStr] = {
          shift_status: 'weekly_off',
          brand_id: null,
          process_id: null,
          notes: isPreferredOffDay
            ? `Designated Weekly Off (Preferred: ${dateObj.toLocaleDateString('en-US', { weekday: 'long' })})`
            : 'Scheduled Rest Day (Fatigue Prevention)'
        };
        weeklyOffsCount[emp.id]++;
        consecutiveDays[emp.id] = 0;
      } else {
        // Floating / standby operations
        matrix[emp.id][dateStr] = {
          shift_status: 'working',
          brand_id: null,
          process_id: null,
          notes: 'Standby / Floating Pod Operations'
        };
        consecutiveDays[emp.id]++;
        employeeShiftCounts[emp.id]++;
      }
    });
  });

  // --------------------------------------------------------------------------
  // STEP 5: FINAL CONSTRAINT VALIDATION & DIAGNOSTICS AUDIT
  // --------------------------------------------------------------------------
  const generatedRoster = {
    id: rosterId,
    month,
    year,
    status: explicitConflicts.length > 0 ? 'draft' : 'validated',
    assignments: matrix,
    created_at: new Date().toISOString()
  };

  const validation = evaluateRosterConstraints(
    generatedRoster,
    employees,
    brands,
    brandProcessRules,
    publicHolidays,
    leaves,
    compOffs
  );

  // Merge any explicit scheduler conflicts with constraint checker findings
  const allConflicts = [...explicitConflicts, ...validation.hardViolations];
  // Deduplicate by unique date/brand/process
  const uniqueConflicts = [];
  const seenKeys = new Set();
  for (const c of allConflicts) {
    const key = `${c.date}_${c.brand_id || ''}_${c.process_id || ''}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueConflicts.push(c);
    }
  }

  generatedRoster.coverage_score = validation.coverageScore;
  generatedRoster.conflicts = uniqueConflicts;
  generatedRoster.softWarnings = validation.softWarnings;

  const executionTimeMs = Math.round(performance.now() - startTime);

  return {
    roster: generatedRoster,
    conflicts: uniqueConflicts,
    softWarnings: validation.softWarnings,
    validation,
    stats: {
      ...validation.stats,
      totalSlotsEvaluated: employees.length * dates.length,
      executionTimeMs
    }
  };
}
