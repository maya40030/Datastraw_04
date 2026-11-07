/**
 * DATASTRAW CALENDAR & DEMAND EVALUATION SERVICE
 * Pure computational engine for evaluating operating calendars,
 * public holidays, and daily operational staffing demand.
 */

/**
 * Checks if a given date string (YYYY-MM-DD) matches a public holiday
 * @param {string} dateStr 
 * @param {Array} publicHolidays 
 * @returns {object|null}
 */
export function getPublicHolidayForDate(dateStr, publicHolidays = []) {
  return publicHolidays.find((h) => h.date === dateStr) || null;
}

/**
 * Determines whether a brand-process must operate on a specific date,
 * and what minimum headcount is required.
 * 
 * Rules supported:
 * 1. '365_days': Operates all 365 days including Sundays and Public Holidays.
 * 2. 'daily_no_holidays': Operates Monday-Sunday, but paused on Public Holidays.
 * 3. 'standard_business': Operates Monday-Saturday; Sundays and Public Holidays OFF.
 * 4. 'weekdays_only': Operates Monday-Friday; Saturdays, Sundays, and Public Holidays OFF.
 * 
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {object} brandProcessRule - { operating_calendar, min_headcount, weekend_min_headcount }
 * @param {Array} publicHolidays - list of holiday objects
 * @returns {object} - { isOperating: boolean, requiredHeadcount: number, reason: string }
 */
export function evaluateOperatingRequirement(dateStr, brandProcessRule, publicHolidays = []) {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isWeekend = isSunday || isSaturday;
  const holiday = getPublicHolidayForDate(dateStr, publicHolidays);

  const calendarType = brandProcessRule?.operating_calendar || 'standard_business';
  const minHeadcount = brandProcessRule?.min_headcount ?? 1;
  const weekendMin = brandProcessRule?.weekend_min_headcount ?? minHeadcount;

  switch (calendarType) {
    case '365_days':
      return {
        isOperating: true,
        requiredHeadcount: isWeekend ? weekendMin : minHeadcount,
        reason: isSunday
          ? 'Mandatory 365-day operation (Sunday shift)'
          : holiday
          ? `Mandatory 365-day operation (${holiday.name})`
          : 'Standard operational day'
      };

    case 'daily_no_holidays':
      if (holiday) {
        return {
          isOperating: false,
          requiredHeadcount: 0,
          reason: `Public Holiday Off: ${holiday.name}`
        };
      }
      return {
        isOperating: true,
        requiredHeadcount: isWeekend ? weekendMin : minHeadcount,
        reason: isSunday ? 'Daily operation (Sunday coverage)' : 'Standard operational day'
      };

    case 'weekdays_only':
      if (isWeekend) {
        return {
          isOperating: false,
          requiredHeadcount: 0,
          reason: isSunday ? 'Sunday Off (Weekdays Only rule)' : 'Saturday Off (Weekdays Only rule)'
        };
      }
      if (holiday) {
        return {
          isOperating: false,
          requiredHeadcount: 0,
          reason: `Public Holiday Off: ${holiday.name}`
        };
      }
      return {
        isOperating: true,
        requiredHeadcount: minHeadcount,
        reason: 'Weekday business operational day'
      };

    case 'standard_business':
    default:
      if (isSunday) {
        return {
          isOperating: false,
          requiredHeadcount: 0,
          reason: 'Sunday Off (Standard Business rule)'
        };
      }
      if (holiday) {
        return {
          isOperating: false,
          requiredHeadcount: 0,
          reason: `Public Holiday Off: ${holiday.name}`
        };
      }
      return {
        isOperating: true,
        requiredHeadcount: isSaturday ? weekendMin : minHeadcount,
        reason: isSaturday ? 'Saturday operational schedule' : 'Standard business operational day'
      };
  }
}

/**
 * Generates an array of all date strings in a given month (YYYY-MM-DD)
 * @param {number} month - 0-indexed (0 = Jan, 10 = Nov)
 * @param {number} year 
 * @returns {Array<string>}
 */
export function getDaysInMonthArray(month, year) {
  const daysCount = new Date(year, month + 1, 0).getDate();
  const dates = [];
  for (let day = 1; day <= daysCount; day++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dates.push(dStr);
  }
  return dates;
}

/**
 * Generates the full Demand Matrix for a specific month across all brands & processes
 * @param {number} month - 0-indexed
 * @param {number} year 
 * @param {Array} brands 
 * @param {Array} brandProcessRules 
 * @param {Array} publicHolidays 
 * @returns {object} - Map of `dateStr` -> Array of required slot objects
 */
export function generateMonthlyDemandMatrix(month, year, brands, brandProcessRules, publicHolidays) {
  const dates = getDaysInMonthArray(month, year);
  const matrix = {};

  dates.forEach((dateStr) => {
    matrix[dateStr] = [];

    brandProcessRules.forEach((rule) => {
      const brand = brands.find((b) => b.id === rule.brand_id);
      if (!brand) return;

      const requirement = evaluateOperatingRequirement(dateStr, rule, publicHolidays);

      if (requirement.isOperating && requirement.requiredHeadcount > 0) {
        for (let slotIndex = 1; slotIndex <= requirement.requiredHeadcount; slotIndex++) {
          matrix[dateStr].push({
            brand_id: rule.brand_id,
            brand_code: brand.code,
            brand_name: brand.name,
            is_single_resource: brand.is_single_resource,
            process_id: rule.process_id,
            slot_number: slotIndex,
            total_required: requirement.requiredHeadcount,
            calendar_type: rule.operating_calendar,
            reason: requirement.reason
          });
        }
      }
    });
  });

  return matrix;
}
