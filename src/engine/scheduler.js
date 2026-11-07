/**
 * DATASTRAW DETERMINISTIC SCHEDULING ENGINE
 * 
 * Multi-Pass Constraint Satisfaction Pipeline:
 * - Prioritizes Mandatory (Hard) Constraints over Preferences
 * - Dedicated Handling for 80% Single-Resource vs Multi-Resource Brands
 * - Non-Silent Failure Guarantee: Unfulfillable demand produces explicit conflict records
 */

import { getDaysInMonthArray, evaluateOperatingRequirement, getPublicHolidayForDate } from '../services/calendarService';
import { evaluateRosterConstraints } from './constraintChecker';

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

  // Track operational shifts assigned per employee to balance workload
  const employeeShiftCounts = {};
  employees.forEach((e) => {
    employeeShiftCounts[e.id] = 0;
  });

  // --------------------------------------------------------------------------
  // STEP 2: SINGLE-RESOURCE BRANDS MANDATORY SCHEDULING (80% OF BRANDS)
  // --------------------------------------------------------------------------
  // For single-resource brands, there is exactly 1 dedicated employee.
  // Their coverage requirement must be scheduled first as a non-negotiable hard constraint.
  const singleResourceBrands = brands.filter((b) => b.is_single_resource);

  dates.forEach((dateStr) => {
    singleResourceBrands.forEach((brand) => {
      const brandRules = brandProcessRules.filter((r) => r.brand_id === brand.id);
      const brandAssigns = assignments.filter((a) => a.brand_id === brand.id);
      const dedicatedStaff = employees.find((e) => brandAssigns.some((a) => a.employee_id === e.id));

      if (!dedicatedStaff) {
        // Operational gap: Single resource brand has no assigned specialist!
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

      // Check each process required for this single-resource brand on this date
      brandRules.forEach((rule) => {
        const req = evaluateOperatingRequirement(dateStr, rule, publicHolidays);

        if (req.isOperating && req.requiredHeadcount > 0) {
          const currentSlot = matrix[dedicatedStaff.id][dateStr];

          if (currentSlot !== null) {
            // Specialist is already blocked (on planned leave, comp-off, or assigned)
            explicitConflicts.push({
              id: `conf-single-blackout-${brand.id}-${rule.process_id}-${dateStr}`,
              roster_id: rosterId,
              date: dateStr,
              severity: 'critical',
              conflict_type: 'single_resource_blackout',
              brand_id: brand.id,
              brand_code: brand.code,
              brand_name: brand.name,
              process_id: rule.process_id,
              employee_id: dedicatedStaff.id,
              employee_name: dedicatedStaff.name,
              message: `Single-Resource Blackout: ${brand.name} requires ${rule.process_id} coverage on ${dateStr}, but dedicated specialist ${dedicatedStaff.name} is on ${currentSlot.shift_status.replace(/_/g, ' ')}.`,
              suggested_action: `Deploy a cross-trained backup from ${dedicatedStaff.pod_id} to maintain 100% SLA.`
            });
          } else {
            // Assign primary single-resource shift
            matrix[dedicatedStaff.id][dateStr] = {
              shift_status: 'working',
              brand_id: brand.id,
              brand_code: brand.code,
              brand_name: brand.name,
              process_id: rule.process_id,
              is_single_resource: true,
              is_backup_fill: false,
              notes: `Dedicated account coverage (${req.reason})`
            };
            employeeShiftCounts[dedicatedStaff.id]++;
          }
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // STEP 3: MULTI-RESOURCE BRANDS SCHEDULING & CAPACITY OPTIMIZATION (20%)
  // --------------------------------------------------------------------------
  // For multi-resource brands, multiple staff are available.
  // We allocate eligible certified staff while balancing shifts and respecting leaves.
  const multiResourceBrands = brands.filter((b) => !b.is_single_resource);

  dates.forEach((dateStr) => {
    multiResourceBrands.forEach((brand) => {
      const brandRules = brandProcessRules.filter((r) => r.brand_id === brand.id);

      brandRules.forEach((rule) => {
        const req = evaluateOperatingRequirement(dateStr, rule, publicHolidays);

        if (req.isOperating && req.requiredHeadcount > 0) {
          // Find candidates assigned to this brand who are qualified for this process
          const brandAssigns = assignments.filter(
            (a) => a.brand_id === brand.id && a.process_id === rule.process_id
          );
          const candidateStaff = employees.filter((emp) =>
            brandAssigns.some((a) => a.employee_id === emp.id)
          );

          // Filter candidates who are NOT blocked on this date
          const availableCandidates = candidateStaff.filter(
            (emp) => matrix[emp.id][dateStr] === null
          );

          // Sort candidates:
          // 1. Not preferring off on this day of week
          // 2. Lowest total shifts worked so far (uniform shift parity)
          const dateObj = new Date(dateStr + 'T00:00:00');
          const dayOfWeek = dateObj.getDay();

          availableCandidates.sort((a, b) => {
            const aPrefersOff = a.weekly_off_preference === dayOfWeek ? 1 : 0;
            const bPrefersOff = b.weekly_off_preference === dayOfWeek ? 1 : 0;
            if (aPrefersOff !== bPrefersOff) return aPrefersOff - bPrefersOff;
            return (employeeShiftCounts[a.id] || 0) - (employeeShiftCounts[b.id] || 0);
          });

          const slotsToFill = req.requiredHeadcount;
          let filledCount = 0;

          for (let i = 0; i < slotsToFill && i < availableCandidates.length; i++) {
            const selectedStaff = availableCandidates[i];
            matrix[selectedStaff.id][dateStr] = {
              shift_status: 'working',
              brand_id: brand.id,
              brand_code: brand.code,
              brand_name: brand.name,
              process_id: rule.process_id,
              is_single_resource: false,
              is_backup_fill: false,
              notes: `Multi-resource coverage (${req.reason})`
            };
            employeeShiftCounts[selectedStaff.id]++;
            filledCount++;
          }

          // If available candidates < required headcount, log explicit understaffing conflict
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
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // STEP 4: WEEKLY OFF ALLOCATION & PREFERENCE SATISFACTION
  // --------------------------------------------------------------------------
  // For any remaining unassigned slots:
  // - Respect employee's preferred weekly off day
  // - Ensure minimum 1 weekly off every 7 days (burnout prevention)
  // - Honor employee's monthly weekly off quota (e.g. 4 offs/month)
  employees.forEach((emp) => {
    let consecutiveWorkDays = 0;
    let weeklyOffsCount = 0;

    dates.forEach((dateStr) => {
      const currentSlot = matrix[emp.id][dateStr];
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();

      if (currentSlot && currentSlot.shift_status === 'working') {
        consecutiveWorkDays++;
        return;
      }

      if (currentSlot && (currentSlot.shift_status === 'planned_leave' || currentSlot.shift_status === 'comp_off')) {
        consecutiveWorkDays = 0;
        return;
      }

      // Slot is currently unassigned (null)
      const holiday = getPublicHolidayForDate(dateStr, publicHolidays);
      const isPreferredOffDay = emp.weekly_off_preference === dayOfWeek;
      const mustTakeOff = consecutiveWorkDays >= 6 || isPreferredOffDay || weeklyOffsCount < emp.weekly_offs_quota;

      if (mustTakeOff) {
        matrix[emp.id][dateStr] = {
          shift_status: 'weekly_off',
          brand_id: null,
          process_id: null,
          notes: isPreferredOffDay
            ? `Designated Weekly Off (Preferred: ${dateObj.toLocaleDateString('en-US', { weekday: 'long' })})`
            : 'Scheduled Weekly Off'
        };
        weeklyOffsCount++;
        consecutiveWorkDays = 0;
      } else {
        // Available for floating / cross-brand standby or secondary tasks
        matrix[emp.id][dateStr] = {
          shift_status: 'working',
          brand_id: null,
          process_id: null,
          notes: 'Standby / Floating Pod Operations'
        };
        consecutiveWorkDays++;
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
  // Deduplicate by unique message/date/brand
  const uniqueConflicts = [];
  const seenKeys = new Set();
  for (const c of allConflicts) {
    const key = `${c.date}_${c.brand_id || ''}_${c.employee_id || ''}_${c.conflict_type || c.type}`;
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
