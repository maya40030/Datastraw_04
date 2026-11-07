/**
 * DATASTRAW INTELLIGENT BACKUP RECOMMENDER ENGINE
 * 
 * Multi-criteria ranking engine for identifying the optimal backup replacement
 * when an employee takes sudden leave or when a coverage gap occurs.
 */

/**
 * Finds and ranks eligible backup candidates for an unavailable shift.
 * 
 * Criteria & Scoring:
 * 1. Process Skill Match: Candidate MUST have the process skill (hard requirement, 40 pts).
 * 2. Pod Proximity: Candidate in same pod as brand or absentee employee (+30 pts).
 * 3. Schedule Availability on Date:
 *    - Standby / Floating working shift on date (+20 pts).
 *    - Weekly off on date (+10 pts).
 *    - Ineligible if on approved leave, comp-off, or already committed to client brand (0 pts).
 * 4. Workload Equity: Fewer shifts worked in current month (+10 pts max).
 * 
 * @param {object} params
 * @param {string} params.dateStr - 'YYYY-MM-DD'
 * @param {string} params.brandId - brand needing coverage
 * @param {string} params.processId - process needing coverage ('CS', 'ACC', etc.)
 * @param {string} params.absenteeEmployeeId - employee who is unavailable
 * @param {object} params.currentRoster
 * @param {Array} params.employees - 36 staff
 * @param {Array} params.brands
 * @param {Array} params.leaves
 * @param {Array} params.compOffs
 * @returns {Array<object>} - Ranked candidate list with scores and justifications
 */
export function recommendBackupEmployees({
  dateStr,
  brandId,
  processId,
  absenteeEmployeeId,
  currentRoster,
  employees,
  brands,
  leaves = [],
  compOffs = []
}) {
  const targetBrand = brands.find((b) => b.id === brandId);
  const absentee = employees.find((e) => e.id === absenteeEmployeeId);

  const candidates = [];

  for (const emp of employees) {
    // Cannot substitute with the absentee employee themselves
    if (emp.id === absenteeEmployeeId) continue;

    // 1. Hard Qualification Filter: Must have certified process skill
    if (!emp.skills.includes(processId)) continue;

    // 2. Hard Availability Filter: Cannot be on approved leave or comp-off
    const isOnLeave = leaves.some(
      (l) => l.employee_id === emp.id && l.status === 'approved' && dateStr >= l.start_date && dateStr <= l.end_date
    );
    if (isOnLeave) continue;

    const isOnCompOff = compOffs.some(
      (c) => c.employee_id === emp.id && c.status === 'approved' && c.date === dateStr
    );
    if (isOnCompOff) continue;

    // Current shift on date
    const shift = currentRoster?.assignments?.[emp.id]?.[dateStr];

    // Cannot substitute if already assigned to another active client brand
    if (shift && shift.shift_status === 'working' && shift.brand_id && shift.brand_id !== brandId) {
      continue;
    }

    let score = 40; // Base points for process skill match
    const reasons = [`Certified in ${processId}`];

    // 3. Pod Proximity Evaluation
    const isSamePodAsBrand = targetBrand && emp.pod_id === targetBrand.pod_id;
    const isSamePodAsAbsentee = absentee && emp.pod_id === absentee.pod_id;

    if (isSamePodAsBrand || isSamePodAsAbsentee) {
      score += 30;
      reasons.push(`Same Pod Affinity (${emp.pod_id})`);
    } else {
      reasons.push('Cross-Pod Deployment');
    }

    // 4. Current Availability Status on Date
    if (shift && shift.shift_status === 'working' && !shift.brand_id) {
      score += 20;
      reasons.push('Currently on Unallocated / Standby shift');
    } else if (shift && shift.shift_status === 'weekly_off') {
      score += 10;
      reasons.push('On Scheduled Weekly Off (Eligible for Comp-Off trade)');
    }

    // 5. Shift Balance Fairness
    let totalShifts = 0;
    if (currentRoster?.assignments?.[emp.id]) {
      Object.values(currentRoster.assignments[emp.id]).forEach((s) => {
        if (s?.shift_status === 'working') totalShifts++;
      });
    }

    if (totalShifts < 20) {
      score += 10;
      reasons.push('Workload capacity available');
    }

    candidates.push({
      employee_id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      pod_id: emp.pod_id,
      avatar_color: emp.avatar_color,
      current_shift_status: shift?.shift_status || 'unassigned',
      match_score: Math.min(score, 100),
      reasons
    });
  }

  // Sort descending by match score
  candidates.sort((a, b) => b.match_score - a.match_score);

  return candidates;
}
