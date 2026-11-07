import React, { useState } from 'react';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  Code, 
  Cpu, 
  ShieldAlert, 
  Users, 
  Building, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const QUESTIONS = [
  {
    num: 1,
    title: 'How did you model employees, brands, processes, pods, and their relationships?',
    answer: `We modeled the domain using a normalized relational architecture (PostgreSQL schema in supabase/schema.sql) that cleanly decouples organizational hierarchy from operational scheduling rules:

• Pods & Pod Leads: 4 Operational Pods (Alpha, Beta, Gamma, Delta), each with a dedicated Pod Lead (emp-01, emp-10, emp-19, emp-28). Pod Leads oversee their pod specialists and serve as senior escalation points.
• Employees: 36 realistic employee profiles (emp-01 to emp-36) with attributes for pod membership, role ('Pod Lead', 'Senior Specialist', 'Operations Specialist'), certified process skills (array of 'CS', 'ACC', 'RET', 'NDR'), preferred weekly-off day, and monthly off quota.
• Client Brands: 15 D2C brands divided strictly according to the assessment's specifications: 12 single-resource accounts (~80%) and 3 multi-resource accounts (~20%).
• Operating Rules (Brand × Process Level): Operating calendars are NOT bound to employees; they are configured per Brand-Process pair. This allows Brand 1 Customer Support to operate 365 days while its NDR process operates on a standard business schedule (Sundays & Public Holidays off).
• Employee Assignments: A junction table maps qualified specialists to brand-process pairs, distinguishing primary assignments from floating pod backup capacity.`
  },
  {
    num: 2,
    title: 'How does your system generate a roster and determine whether it satisfies the required constraints?',
    answer: `The system uses a multi-pass deterministic constraint-satisfaction engine (src/engine/scheduler.js and constraintChecker.js). It strictly enforces a priority hierarchy between Mandatory (Hard) Constraints and Preferences (Soft Constraints):

1. Pass 1 (Immutable Non-Working Slots): Pre-fills approved planned leaves (PL) and earned compensatory offs (CO). No employee on approved leave can ever be scheduled.
2. Pass 2 (Demand Matrix Generation): Evaluates each day's operating calendar per brand-process, calculating required headcount (e.g. 365-day Sunday shifts vs holiday pauses).
3. Pass 3 (Single-Resource Brand Assignment): Dedicates primary specialists to the 12 single-resource accounts as non-negotiable priority slots.
4. Pass 4 (Multi-Resource Optimization): Balances shifts across shared agents using round-robin equity and workload balancing.
5. Pass 5 (Preference & Fairness Optimization): Allocates weekly offs adhering to rolling 6-day fatigue limits, preferred days off, and monthly off quotas.
6. Non-Silent Failure Guarantee: If any mandatory slot cannot be satisfied, the engine generates an explicit Conflict Record with full diagnostic context rather than producing an invalid roster.`
  },
  {
    num: 3,
    title: 'How did you handle the difference between single-resource brands and brands with multiple employees?',
    answer: `Single-resource and multi-resource brands represent fundamentally different operational risk profiles:

• Single-Resource Brands (12 accounts, 80%): Exactly 1 dedicated specialist manages all brand processes. The scheduling engine recognizes that any weekly off or planned leave taken by this specialist creates a critical coverage gap. The system prioritizes their schedule and, when an absence occurs, immediately flags a 'Single-Resource Blackout' and triggers the intelligent backup recommender to suggest same-pod qualified substitutes.
• Multi-Resource Brands (3 accounts, 20%): Multiple employees are assigned with either specialized or overlapping processes. When one specialist takes leave, the engine evaluates whether the remaining assigned staff can absorb the coverage demand to meet the minimum headcount without requiring external backup.`
  },
  {
    num: 4,
    title: 'What happens when an employee manages all processes for a brand but is unavailable on a required working day?',
    answer: `When a dedicated single-resource specialist becomes unavailable (demonstrated in Part 9 via the Change Simulator and during Part 5 with Kabir Mehta on GlowAura Skincare):

1. Non-Silent Detection: The system flags a 'Single-Resource Blackout' conflict, alerting the operations manager that the brand has 0% operational coverage on that date.
2. Multi-Criteria Backup Recommendation (src/engine/backupRecommender.js): The engine searches the entire 36-employee pool and ranks replacement candidates based on:
   - Certified process skill match (mandatory hard filter).
   - Same-pod affinity (+30 pts) to preserve pod leadership oversight.
   - Schedule availability on that date (standby/floating status or weekly-off trade).
   - Workload equity to balance monthly hours.
3. One-Click Substitution: The operations manager can review the ranked recommendations and click 'Deploy as Substitute', reallocating the backup, restoring coverage, and re-auditing the roster in $< 15ms.`
  },
  {
    num: 5,
    title: 'How does your system handle conflicting requirements or insufficient staffing?',
    answer: `The system handles conflicts through an explicit, non-silent triage pipeline:

1. Hard Priority over Soft Preferences: A required client operating day ALWAYS overrides an employee's preferred weekly-off day. The engine schedules the mandatory coverage and generates a soft 'Preference Disparity' warning rather than dropping coverage.
2. Unfulfillable Hard Constraints: If demand exceeds qualified available staff (e.g. all certified agents are on approved leave), the engine refuses to corrupt the data. It marks the shift unfilled and logs a Critical Hard Conflict in the Conflict Center.
3. Interactive Conflict Center (src/views/ConflictCenterView.jsx): Displays root-cause diagnoses, affected stakeholders, and actionable resolution options for operational managers.`
  },
  {
    num: 6,
    title: 'Which parts of the process did you automate, and which did you leave under human control? Why?',
    answer: `We followed the principle of 'Automate Computation, Empower Human Judgment':

• Automated:
  - Demand matrix computation based on operating calendars and public holidays.
  - Hard constraint enforcement (preventing double-bookings, leave violations, fatigue breaches).
  - Shift balancing, preference optimization, and candidate scoring for substitutions.
  - Real-time delta impact validation when changes are attempted.
• Human Control:
  - Final decision on emergency substitutions (human manager selects candidate).
  - Force overrides (manager can override a warning if business exigencies demand it).
  - Formal roster publishing: A human operations manager explicitly reviews the conflict log and locks the roster state as 'Published'.
• Rationale: In D2C operations, client relationships and human employee morale require context that algorithms cannot fully know. The system acts as an intelligent co-pilot rather than an opaque black box.`
  },
  {
    num: 7,
    title: 'If the company doubled its team and brand count, what would you change about your solution?',
    answer: `If DataStraw scaled to 70+ employees and 30+ brands:

1. Backend Constraint Engine: Shift from in-browser deterministic execution to serverless edge workers (e.g. Supabase Edge Functions or Python OR-Tools solver) to handle combinatorial complexity in the background.
2. Autonomous Pod Federation: Partition scheduling into independent sub-problems where each Pod Lead generates and manages their pod roster autonomously, while a meta-scheduler handles cross-pod floating swaps.
3. Algorithmic Comp-Off Banks: Implement an automated FIFO comp-off expiration and accrual ledger.
4. WebSocket Real-Time Sync: Use Supabase Realtime to broadcast live schedule changes to team members' mobile devices instantly.`
  },
  {
    num: 8,
    title: 'If you had one additional week to work on this, what would you improve first?',
    answer: `With an additional week, the top improvements would be:

1. Integer Linear Programming (ILP) Solver: Integrate an LP/MIP solver (such as Google OR-Tools via WebAssembly) to find mathematically optimal Pareto frontiers between fairness and client SLA compliance.
2. Drag-and-Drop Matrix Shift Swapping: Implement HTML5 Drag-and-Drop within the Company-wide matrix, allowing managers to drag a shift pill onto another employee with live ghost impact previews.
3. Self-Service Employee Portal & Shift Swaps: Enable specialists to request shift swaps with pod peers directly, routing to Pod Leads for one-click approval.
4. Native Calendar Integration: Generate iCal / Google Calendar subscription feeds for each employee.`
  }
];

export default function DocumentationView() {
  const [expandedIndex, setExpandedIndex] = useState(0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">System Architecture & Assessment Defense</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              Section 8 Q&A
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive architectural defense and operational reasoning answering all eight assessment questions
          </p>
        </div>
      </div>

      {/* Accordion of Questions */}
      <div className="space-y-3">
        {QUESTIONS.map((q, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={q.num}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-slate-925 border-sky-500/40 shadow-xl'
                  : 'bg-slate-925/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full p-5 text-left flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <span className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-sky-500/20 mt-0.5">
                    Q{q.num}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug">{q.title}</h3>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-sky-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-800/80">
                  <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line pl-10">
                    {q.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
