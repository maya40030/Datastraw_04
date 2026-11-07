/**
 * DATASTRAW ROSTER ORCHESTRATION SERVICE
 * Connects the Deterministic Scheduler, Constraint Evaluator, and Persistence layer.
 */

import { generateDeterministicRoster } from '../engine/scheduler';
import { evaluateRosterConstraints } from '../engine/constraintChecker';
import { dataService } from './dataService';

class RosterService {
  /**
   * Generates or retrieves the roster for a selected month and year
   * @param {number} month - 0-indexed (e.g. 10 = Nov)
   * @param {number} year - e.g. 2026
   * @param {boolean} forceRegenerate - force re-run of scheduler
   */
  async getOrGenerateRoster(month, year, forceRegenerate = false) {
    const rosterId = `roster-${year}-${String(month + 1).padStart(2, '0')}`;

    if (!forceRegenerate) {
      const existing = await dataService.getRoster(rosterId);
      if (existing) {
        return existing;
      }
    }

    // Pull current system entities
    const [
      employees,
      pods,
      brands,
      processes,
      brandProcessRules,
      assignments,
      publicHolidays,
      leaves,
      compOffs
    ] = await Promise.all([
      dataService.getEmployees(),
      dataService.getPods(),
      dataService.getBrands(),
      dataService.getProcesses(),
      dataService.getBrandProcessRules(),
      dataService.getAssignments(),
      dataService.getPublicHolidays(),
      dataService.getLeaves(),
      dataService.getCompOffs()
    ]);

    const result = generateDeterministicRoster({
      month,
      year,
      employees,
      pods,
      brands,
      processes,
      brandProcessRules,
      assignments,
      publicHolidays,
      leaves,
      compOffs
    });

    // Save and cache in dataService
    await dataService.saveRoster(rosterId, result.roster);

    return result.roster;
  }

  /**
   * Re-evaluates constraints on an existing roster after manual edits
   */
  async revalidateRoster(roster) {
    const [
      employees,
      brands,
      brandProcessRules,
      publicHolidays,
      leaves,
      compOffs
    ] = await Promise.all([
      dataService.getEmployees(),
      dataService.getBrands(),
      dataService.getBrandProcessRules(),
      dataService.getPublicHolidays(),
      dataService.getLeaves(),
      dataService.getCompOffs()
    ]);

    const validation = evaluateRosterConstraints(
      roster,
      employees,
      brands,
      brandProcessRules,
      publicHolidays,
      leaves,
      compOffs
    );

    roster.coverage_score = validation.coverageScore;
    roster.conflicts = validation.hardViolations;
    roster.softWarnings = validation.softWarnings;
    roster.status = validation.hardViolations.length === 0 ? 'validated' : 'draft';

    await dataService.saveRoster(roster.id, roster);
    return { roster, validation };
  }

  /**
   * Locks and publishes the roster
   */
  async publishRoster(rosterId) {
    const roster = await dataService.getRoster(rosterId);
    if (!roster) throw new Error('Roster not found');

    roster.status = 'published';
    roster.published_at = new Date().toISOString();
    await dataService.saveRoster(rosterId, roster);
    return roster;
  }
}

export const rosterService = new RosterService();
