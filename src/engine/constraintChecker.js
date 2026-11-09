/**
 * DATASTRAW CONSTRAINT EVALUATOR & INTEGRITY AUDITOR
 * Evaluates any roster state against Hard Constraints and Soft Preferences.
 */

import { evaluateOperatingRequirement } from '../services/calendarService.js';

/**
 * Validates a monthly roster against all mandatory and preference rules.
 * 
 * @param {object} roster - { id, month, year, assignments: { [empId]: { [dateStr]: slotObj } } }
 * @param {Array} employees 
 * @param {Array} brands 
 * @param {Array} brandProcessRules 
 * @param {Array} publicHolidays 
 * @param {Array} leaves 
 * @param {Array} compOffs 
 * @returns {object} - { isValid, hardViolations, softWarnings, coverageScore, stats }
 */
export function evaluateRosterConstraints(
  roster,
  employees,
  brands,
  brandProcessRules,
  publicHolidays,
  leaves = [],
  compOffs = []
) {
  const hardViolations = [];
  const softWarnings = [];
  const dates = Object.keys(roster?.assignments?.[employees[0]?.id] || {});

  if (!dates.length) {
    return {
      isValid: false,
      hardViolations: [{ type: 'EMPTY_ROSTER', message: 'Roster has no assignment slots.' }],
      softWarnings: [],
      coverageScore: 0,
      stats: { totalDemandedSlots: 0, fulfilledSlots: 0 }
    };
  }

  // -------------------------------------------------------------
  // 1. HARD CONSTRAINT: Zero Scheduling on Approved Leaves
  // -------------------------------------------------------------
  for (const emp of employees) {
    const empLeaves = leaves.filter((l) => l.employee_id === emp.id && l.status === 'approved');

    for (const leave of empLeaves) {
      for (const dateStr of dates) {
        if (dateStr >= leave.start_date && dateStr <= leave.end_date) {
          const shift = roster.assignments?.[emp.id]?.[dateStr];
          if (shift && shift.shift_status === 'working') {
            hardViolations.push({
              type: 'LEAVE_BREACH',
              severity: 'critical',
              employee_id: emp.id,
              employee_name: emp.name,
              date: dateStr,
              message: `Hard Constraint Violation: ${emp.name} is scheduled to work on ${dateStr} during approved ${leave.leave_type.replace(/_/g, ' ')} (${leave.reason}).`
            });
          }
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 2. HARD CONSTRAINT: Zero Scheduling on Compensatory Offs
  // -------------------------------------------------------------
  for (const emp of employees) {
    const empCompOffs = compOffs.filter((c) => c.employee_id === emp.id && c.status === 'approved');

    for (const comp of empCompOffs) {
      const shift = roster.assignments?.[emp.id]?.[comp.date];
      if (shift && shift.shift_status === 'working') {
        hardViolations.push({
          type: 'COMP_OFF_BREACH',
          severity: 'critical',
          employee_id: emp.id,
          employee_name: emp.name,
          date: comp.date,
          message: `Hard Constraint Violation: ${emp.name} is scheduled to work on credited Compensatory Off date (${comp.date}).`
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 3. HARD CONSTRAINT: No Overlapping / Conflicting Assignments
  // Each employee can only have ONE working assignment per date
  // -------------------------------------------------------------
  // In our data model, each employee slot has 1 assignment object.
  // We ensure no employee is double-booked across brands.

  // -------------------------------------------------------------
  // 4. HARD CONSTRAINT & COVERAGE: Operational Coverage & Minimum Headcount
  // -------------------------------------------------------------
  let totalDemandedSlots = 0;
  let fulfilledSlots = 0;

  for (const dateStr of dates) {
    for (const rule of brandProcessRules) {
      const brand = brands.find((b) => b.id === rule.brand_id);
      if (!brand) continue;

      const requirement = evaluateOperatingRequirement(dateStr, rule, publicHolidays);

      if (requirement.isOperating && requirement.requiredHeadcount > 0) {
        totalDemandedSlots += requirement.requiredHeadcount;

        // Count how many staff members are scheduled to work on this brand & process on this date
        const assignedWorkers = employees.filter((emp) => {
          const shift = roster.assignments?.[emp.id]?.[dateStr];
          if (!shift || shift.shift_status !== 'working' || shift.brand_id !== rule.brand_id) {
            return false;
          }
          // For single-resource brands, the dedicated specialist (or deployed backup) covers all brand processes
          if (brand.is_single_resource) {
            return true;
          }
          return shift.process_id === rule.process_id;
        });

        fulfilledSlots += Math.min(assignedWorkers.length, requirement.requiredHeadcount);

        if (assignedWorkers.length < requirement.requiredHeadcount) {
          const isBlackout = brand.is_single_resource && assignedWorkers.length === 0;

          hardViolations.push({
            type: isBlackout ? 'SINGLE_RESOURCE_BLACKOUT' : 'UNDERSTAFFED_COVERAGE',
            severity: 'critical',
            brand_id: brand.id,
            brand_code: brand.code,
            brand_name: brand.name,
            process_id: rule.process_id,
            date: dateStr,
            required: requirement.requiredHeadcount,
            actual: assignedWorkers.length,
            message: isBlackout
              ? `Critical Blackout: Single-resource brand ${brand.name} has 0% coverage for ${rule.process_id} on ${dateStr} (Required: ${requirement.requiredHeadcount}, Assigned: 0).`
              : `Coverage Deficit: ${brand.name} required ${requirement.requiredHeadcount} staff for ${rule.process_id} on ${dateStr}, but only ${assignedWorkers.length} assigned.`
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 5. HARD CONSTRAINT: Maximum Consecutive Working Days (Max 6)
  // -------------------------------------------------------------
  for (const emp of employees) {
    let consecutiveDays = 0;

    for (const dateStr of dates) {
      const shift = roster.assignments?.[emp.id]?.[dateStr];
      if (shift && shift.shift_status === 'working') {
        consecutiveDays++;
        if (consecutiveDays > 6) {
          hardViolations.push({
            type: 'FATIGUE_LIMIT_BREACH',
            severity: 'critical',
            employee_id: emp.id,
            employee_name: emp.name,
            date: dateStr,
            message: `Labor Law & Burnout Violation: ${emp.name} is scheduled to work ${consecutiveDays} consecutive days ending on ${dateStr} without a weekly off.`
          });
        }
      } else {
        consecutiveDays = 0;
      }
    }
  }

  // -------------------------------------------------------------
  // 6. SOFT CONSTRAINT: Weekly Off Day Preferences & Fairness
  // -------------------------------------------------------------
  for (const emp of employees) {
    let totalWeeklyOffs = 0;

    for (const dateStr of dates) {
      const shift = roster.assignments?.[emp.id]?.[dateStr];
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = dateObj.getDay();

      if (shift && (shift.shift_status === 'weekly_off' || shift.shift_status === 'public_holiday')) {
        totalWeeklyOffs++;
      }

      // Check if employee wanted this day off but had to work
      if (emp.weekly_off_preference === dayOfWeek && shift && shift.shift_status === 'working') {
        softWarnings.push({
          type: 'PREFERENCE_DISPARITY',
          severity: 'warning',
          employee_id: emp.id,
          employee_name: emp.name,
          date: dateStr,
          message: `${emp.name} prefers weekly off on ${dateObj.toLocaleDateString('en-US', { weekday: 'long' })}, but was scheduled to work due to mandatory operational demand.`
        });
      }
    }

    if (totalWeeklyOffs < emp.weekly_offs_quota) {
      softWarnings.push({
        type: 'WEEKLY_OFF_QUOTA_UNMET',
        severity: 'warning',
        employee_id: emp.id,
        employee_name: emp.name,
        message: `${emp.name} received ${totalWeeklyOffs} weekly offs this month (target quota was ${emp.weekly_offs_quota}).`
      });
    }
  }

  const coverageScore = totalDemandedSlots > 0 ? (fulfilledSlots / totalDemandedSlots) * 100 : 100;

  return {
    isValid: hardViolations.length === 0,
    hardViolations,
    softWarnings,
    coverageScore: Math.round(coverageScore * 10) / 10,
    stats: {
      totalDemandedSlots,
      fulfilledSlots,
      hardViolationsCount: hardViolations.length,
      softWarningsCount: softWarnings.length
    }
  };
}
