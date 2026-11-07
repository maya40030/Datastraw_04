/**
 * DATASTRAW EXPORT ENGINE
 * Generates and downloads standard CSV and JSON files for operational handover.
 */

/**
 * Exports current monthly roster matrix to CSV format
 * @param {object} roster 
 * @param {Array} employees 
 * @param {Array} pods 
 */
export function exportRosterToCSV(roster, employees, pods) {
  if (!roster?.assignments) {
    throw new Error('No roster data available to export.');
  }

  const firstEmpId = employees[0]?.id;
  const dates = Object.keys(roster.assignments[firstEmpId] || {}).sort();

  // CSV Header
  const headers = ['Employee ID', 'Employee Name', 'Role', 'Pod', ...dates, 'Total Working', 'Total Offs'];
  const rows = [headers.join(',')];

  // Employee rows
  employees.forEach((emp) => {
    const pod = pods.find((p) => p.id === emp.pod_id);
    let workingCount = 0;
    let offCount = 0;

    const row = [
      `"${emp.id}"`,
      `"${emp.name}"`,
      `"${emp.role}"`,
      `"${pod?.name || emp.pod_id}"`
    ];

    dates.forEach((dateStr) => {
      const shift = roster.assignments?.[emp.id]?.[dateStr];
      if (shift?.shift_status === 'working') {
        workingCount++;
        row.push(`"${shift.brand_code || 'WORK'}:${shift.process_id || 'OPS'}"`);
      } else if (shift?.shift_status === 'weekly_off') {
        offCount++;
        row.push('"OFF"');
      } else if (shift?.shift_status === 'planned_leave') {
        row.push('"LEAVE"');
      } else if (shift?.shift_status === 'comp_off') {
        row.push('"COMP"');
      } else if (shift?.shift_status === 'public_holiday') {
        row.push('"HOLIDAY"');
      } else {
        row.push('"-"');
      }
    });

    row.push(workingCount);
    row.push(offCount);
    rows.push(row.join(','));
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', `datastraw_roster_${roster.id}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}

/**
 * Exports full operational database to JSON
 * @param {object} state 
 */
export function exportStateToJSON(state) {
  const jsonContent = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonContent);
  downloadAnchor.setAttribute('download', `datastraw_operational_state_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
}
