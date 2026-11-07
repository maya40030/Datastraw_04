/**
 * DATASTRAW REAL-TIME IMPACT ANALYZER
 * Evaluates the delta impact of a proposed shift modification before committing.
 */

import { evaluateOperatingRequirement } from '../services/calendarService';

/**
 * Evaluates the operational impact of changing an employee's shift on a specific date.
 * 
 * @param {object} params
 * @param {string} params.employeeId
 * @param {string} params.dateStr
 * @param {object} params.proposedShift - { shift_status, brand_id, process_id }
 * @param {object} params.currentRoster
 * @param {Array} params.employees
 * @param {Array} params.brands
 * @param {Array} params.brandProcessRules
 * @param {Array} params.publicHolidays
 * @param {Array} params.leaves
 * @param {Array} params.compOffs
 * @returns {object} - { hasImpact: boolean, isCritical: boolean, impacts: Array<string>, newConflicts: Array<object> }
 */
export function analyzeShiftModificationImpact({
  employeeId,
  dateStr,
  proposedShift,
  currentRoster,
  employees,
  brands,
  brandProcessRules,
  publicHolidays,
  leaves = [],
  compOffs = []
}) {
  const impacts = [];
  const newConflicts = [];
  const currentShift = currentRoster?.assignments?.[employeeId]?.[dateStr];
  const targetEmployee = employees.find((e) => e.id === employeeId);

  // 1. Check if employee is on Approved Leave on this date
  const activeLeave = leaves.find(
    (l) => l.employee_id === employeeId && l.status === 'approved' && dateStr >= l.start_date && dateStr <= l.end_date
  );

  if (activeLeave && proposedShift.shift_status === 'working') {
    impacts.push(
      `CRITICAL HARD BREACH: ${targetEmployee?.name} is on approved ${activeLeave.leave_type.replace(/_/g, ' ')} (${activeLeave.reason}) on ${dateStr}. Forcing a working shift violates non-negotiable leave policy.`
    );
    newConflicts.push({
      severity: 'critical',
      type: 'LEAVE_BREACH',
      message: `Employee ${targetEmployee?.name} scheduled on approved leave date ${dateStr}.`
    });
  }

  // 2. Check if employee is on Compensatory Off on this date
  const activeComp = compOffs.find(
    (c) => c.employee_id === employeeId && c.status === 'approved' && c.date === dateStr
  );

  if (activeComp && proposedShift.shift_status === 'working') {
    impacts.push(
      `CRITICAL HARD BREACH: ${targetEmployee?.name} is on earned Compensatory Off (${activeComp.earned_reason}) on ${dateStr}.`
    );
  }

  // 3. Check if removing this employee from a brand creates a Coverage Gap or Blackout
  if (currentShift?.shift_status === 'working' && currentShift.brand_id) {
    const isRemovingFromBrand =
      proposedShift.shift_status !== 'working' || proposedShift.brand_id !== currentShift.brand_id;

    if (isRemovingFromBrand) {
      const brand = brands.find((b) => b.id === currentShift.brand_id);
      const rule = brandProcessRules.find(
        (r) => r.brand_id === currentShift.brand_id && r.process_id === currentShift.process_id
      );

      if (brand && rule) {
        const req = evaluateOperatingRequirement(dateStr, rule, publicHolidays);

        if (req.isOperating && req.requiredHeadcount > 0) {
          // Count other workers who will remain on this brand & process on this date
          const otherAssigned = employees.filter((emp) => {
            if (emp.id === employeeId) return false;
            const s = currentRoster.assignments?.[emp.id]?.[dateStr];
            return (
              s &&
              s.shift_status === 'working' &&
              s.brand_id === currentShift.brand_id &&
              s.process_id === currentShift.process_id
            );
          });

          if (brand.is_single_resource && otherAssigned.length === 0) {
            impacts.push(
              `CRITICAL BLACKOUT: ${brand.name} is a Single-Resource (1:1) brand. Removing ${targetEmployee?.name} leaves this brand with 0% coverage on ${dateStr} (SLA Breach).`
            );
            newConflicts.push({
              severity: 'critical',
              type: 'SINGLE_RESOURCE_BLACKOUT',
              brand_id: brand.id,
              brand_name: brand.name,
              message: `Single-Resource Blackout: ${brand.name} has 0% coverage for ${currentShift.process_id} on ${dateStr}.`
            });
          } else if (otherAssigned.length < req.requiredHeadcount) {
            impacts.push(
              `COVERAGE DEFICIT: Removing ${targetEmployee?.name} reduces ${brand.name} staffing to ${otherAssigned.length}/${req.requiredHeadcount} for ${currentShift.process_id}.`
            );
            newConflicts.push({
              severity: 'critical',
              type: 'UNDERSTAFFED_COVERAGE',
              brand_id: brand.id,
              brand_name: brand.name,
              message: `Understaffed coverage on ${brand.name} on ${dateStr}.`
            });
          }
        }
      }
    }
  }

  // 4. Check consecutive working days fatigue
  if (proposedShift.shift_status === 'working' && currentShift?.shift_status !== 'working') {
    // Check rolling window around dateStr
    const dates = Object.keys(currentRoster.assignments?.[employeeId] || {}).sort();
    const dateIdx = dates.indexOf(dateStr);

    let consecutive = 1;
    // Look backwards
    for (let i = dateIdx - 1; i >= 0; i--) {
      const s = currentRoster.assignments[employeeId][dates[i]];
      if (s?.shift_status === 'working') consecutive++;
      else break;
    }
    // Look forwards
    for (let i = dateIdx + 1; i < dates.length; i++) {
      const s = currentRoster.assignments[employeeId][dates[i]];
      if (s?.shift_status === 'working') consecutive++;
      else break;
    }

    if (consecutive > 6) {
      impacts.push(
        `BURNOUT WARNING: Scheduling ${targetEmployee?.name} on this date creates a streak of ${consecutive} consecutive working days without a weekly off.`
      );
    }
  }

  return {
    hasImpact: impacts.length > 0,
    isCritical: newConflicts.some((c) => c.severity === 'critical'),
    impacts,
    newConflicts
  };
}
