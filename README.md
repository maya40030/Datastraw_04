# DataStraw Smart Roster Management System

> Enterprise Operations Platform & Deterministic Constraint-Satisfaction Roster Engine built for the DataStraw Technical Internship Assessment.

---

## 🌟 Executive Summary

The **DataStraw Smart Roster Management System** solves the underlying operational scheduling problem for growing customer experience companies managing multiple direct-to-consumer (D2C) brands.

Rather than acting as a static spreadsheet or generic calendar, the system uses a **multi-pass deterministic constraint-satisfaction scheduling algorithm** that strictly prioritizes non-negotiable client coverage demands and approved leaves over individual preferences. It features dedicated handling for **~80% single-resource accounts**, real-time conflict triage, dynamic absence simulation, and intelligent backup staff recommendations.

---

## 🏗️ Technology Stack & Architecture

- **Frontend & App Scaffold**: React 18 with Vite 6 (Fast HMR, modern ESNext modular bundle).
- **Styling & UI System**: Tailwind CSS v3 with Lucide React Icons (Enterprise B2B SaaS theme, high-contrast badges, dense data grids).
- **Data Visualizations**: Recharts (Pod capacity utilization, shift status distribution, and coverage compliance).
- **Database & Persistence**: Supabase PostgreSQL relational schema (`supabase/schema.sql` and `supabase/seed.sql`) with a unified data service layer supporting local storage fallback and one-click seed reset.
- **Export Engine**: CSV and JSON operational export engine.
- **Hosting & Production**: Vercel ready (`vercel.json` configured).

---

## 📋 Comprehensive Enterprise Seed Data

The application comes pre-loaded with realistic fictional operational data fulfilling all DataStraw specifications:

- **36 Employees** across 4 Pods (Alpha, Beta, Gamma, Delta), exceeding the $\ge 30$ minimum requirement.
- **4 Dedicated Pod Leads**:
  - Pod Alpha Lead: Aisha Sharma (`emp-01`)
  - Pod Beta Lead: Rohan Verma (`emp-10`)
  - Pod Gamma Lead: Priya Patel (`emp-19`)
  - Pod Delta Lead: Vikram Malhotra (`emp-28`)
- **4 Operational Processes**: Customer Support (`CS`), Abandoned Cart Conversions (`ACC`), Customer Retention (`RET`), Non-Delivery Report Management (`NDR`).
- **15 Client Brands**:
  - **12 Single-Resource Brands ($\approx 80\%$)**: Exactly 1 dedicated specialist managing all brand processes (e.g. GlowAura Skincare, BeanCraft Coffee, NutriPulse, PureBite Pet Care, Velox Gaming, etc.).
  - **3 Multi-Resource Brands ($\approx 20\%$)**: AuraFit Activewear (3 agents across CS, ACC, NDR), NovaGlow Electronics (2 agents sharing CS and dedicated ACC), and PrimeWave Logistics (3 agents with 365-day CS and dedicated NDR/Retention).
- **Process-Specific Operating Calendars**:
  - `365_days`: Operates all 365 days, including Sundays and public holidays (mandatory daily headcount).
  - `daily_no_holidays`: Operates Monday–Sunday, paused on public holidays.
  - `standard_business`: Operates Monday–Saturday (Sundays and public holidays off).
  - `weekdays_only`: Operates Monday–Friday.
- **Availability Constraints**: Pre-approved Planned Leaves (PL), Compensatory Offs (CO), and gazetted Public Holidays (PH).

---

## ⚙️ Core System Modules

### 1. Master Roster Operations Matrix (5 Stakeholder Views)
- **Company-Wide View**: High-density interactive matrix of all 36 employees across the month, color-coded by shift status with daily headcount tallies and monthly work/off summaries.
- **Pod-Wise View**: Filterable by pod, highlighting the assigned Pod Lead row and tracking pod capacity.
- **Brand-Wise View**: Tracks all 15 D2C brands, displaying daily required vs actual staffing headcount with green `MET` or red pulsating `GAP / BLACKOUT` badges.
- **Process-Wise View**: Grouped across Customer Support, ACC, Retention, and NDR.
- **Employee-Wise View**: Individual personal monthly calendar view with shift breakdown, leaves taken, comp-offs, and assigned accounts.

### 2. Deterministic Scheduling Engine (`src/engine/scheduler.js`)
- Runs a multi-pass constraint solver that guarantees **non-silent failure**:
  1. *Pass 1*: Pre-fills immutable non-working slots (Approved Leaves, Comp-Offs).
  2. *Pass 2*: Computes demand matrix for all brand-process operating calendars.
  3. *Pass 3*: Schedules mandatory single-resource brand coverage.
  4. *Pass 4*: Optimizes multi-resource brand coverage with round-robin shift balancing.
  5. *Pass 5*: Allocates weekly offs adhering to rolling 6-day fatigue limits and employee preferences.
  6. *Pass 6*: Generates explicit diagnostic conflict records for any unsatisfied demand.

### 3. Conflict Detection Engine & Triage Center (`src/views/ConflictCenterView.jsx`)
- Categorizes issues into:
  - **Critical Hard Violations**: Single-Resource Blackouts, Understaffed Coverage, Approved Leave Breaches, Fatigue Limit Breaches ($> 6$ consecutive days).
  - **Soft Warnings**: Weekly-off preference disparities, monthly off quotas.
- Actionable conflict cards with root causes and remediation recommendations.

### 4. In-Grid Shift Editor & Real-Time Impact Validator (`src/components/roster/`)
- In-grid cell click modal to adjust shift statuses.
- **Real-Time Delta Impact Analyzer**: Warns the manager *before* committing if a change creates a single-resource blackout or coverage gap.
- Formal "Publish Roster" workflow.

### 5. Dynamic Change Simulator & Intelligent Backup Recommender (`src/views/ChangeSimulatorView.jsx`)
- Simulates emergency absences after roster generation.
- **Single vs Multi-Resource Impact Evaluation**:
  - Single-resource accounts flag an immediate blackout.
  - Multi-resource accounts evaluate if remaining assigned staff can absorb the absence without external backup.
- **Intelligent Backup Recommender**: Multi-criteria ranking algorithm scoring candidates by certified skill match (+40), same-pod affinity (+30), and availability status (+20). Includes one-click substitution.

### 6. Operational Analytics & Export Engine (`src/views/AnalyticsView.jsx`)
- Recharts visualizations for pod utilization and shift breakdown.
- One-click CSV export of the full monthly matrix and JSON state backup.

---

## 🚀 Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/datastraw-roster-system.git
cd datastraw-roster-system

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# The application will run at http://localhost:3000

# 4. Build for production
npm run build
```

---

## 🗄️ Supabase PostgreSQL Setup (Optional)

1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and execute the contents of `supabase/schema.sql` (Creates all 13 tables, foreign keys, and indexes).
4. Paste and execute the contents of `supabase/seed.sql` (Inserts the 36 staff, 15 brands, 4 pods, and rules).
5. Copy your project URL and anon public key into `.env`:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
*(Note: If no Supabase credentials are provided, the application runs automatically in offline/local-persistence mode using the identical relational dataset).*

---

## 💡 Section 8: "Tell Us How You Think" (Assessment Q&A)

### 1. How did you model employees, brands, processes, pods, and their relationships?
We modeled the domain using a normalized relational architecture (`supabase/schema.sql`) that cleanly decouples organizational hierarchy from operational scheduling rules:
- **Pods & Pod Leads**: 4 Operational Pods (Alpha, Beta, Gamma, Delta), each with a dedicated Pod Lead. Pod Leads oversee their pod specialists and serve as senior escalation points.
- **Employees**: 36 realistic employee profiles with attributes for pod membership, role, certified process skills, preferred weekly-off day, and monthly off quota.
- **Client Brands**: 15 D2C brands divided strictly according to the assessment's specifications: 12 single-resource accounts (~80%) and 3 multi-resource accounts (~20%).
- **Operating Rules**: Operating calendars are NOT bound to employees; they are configured per **Brand-Process** pair. This allows Brand 1 Customer Support to operate 365 days while its NDR process operates on a standard business schedule (Sundays & Public Holidays off).
- **Employee Brand Assignments**: A junction table maps qualified specialists to brand-process pairs, distinguishing primary assignments from floating pod backup capacity.

### 2. How does your system generate a roster and determine whether it satisfies the required constraints?
The system uses a multi-pass deterministic constraint-satisfaction engine (`src/engine/scheduler.js`). It strictly enforces a priority hierarchy between Mandatory (Hard) Constraints and Preferences (Soft Constraints):
1. **Pass 1 (Immutable Non-Working Slots)**: Pre-fills approved planned leaves (PL) and earned compensatory offs (CO). No employee on approved leave can ever be scheduled.
2. **Pass 2 (Demand Matrix Generation)**: Evaluates each day's operating calendar per brand-process, calculating required headcount (e.g. 365-day Sunday shifts vs holiday pauses).
3. **Pass 3 (Single-Resource Brand Assignment)**: Dedicates primary specialists to the 12 single-resource accounts as non-negotiable priority slots.
4. **Pass 4 (Multi-Resource Optimization)**: Balances shifts across shared agents using round-robin equity and workload balancing.
5. **Pass 5 (Preference & Fairness Optimization)**: Allocates weekly offs adhering to rolling 6-day fatigue limits, preferred days off, and monthly off quotas.
6. **Non-Silent Failure Guarantee**: If any mandatory slot cannot be satisfied, the engine generates an explicit Conflict Record with full diagnostic context rather than producing an invalid roster.

### 3. How did you handle the difference between single-resource brands and brands with multiple employees?
- **Single-Resource Brands (12 accounts, 80%)**: Exactly 1 dedicated specialist manages all brand processes. The scheduling engine recognizes that any weekly off or planned leave taken by this specialist creates a critical coverage gap. The system prioritizes their schedule and, when an absence occurs, immediately flags a `Single-Resource Blackout` and triggers the intelligent backup recommender to suggest same-pod qualified substitutes.
- **Multi-Resource Brands (3 accounts, 20%)**: Multiple employees are assigned with either specialized or overlapping processes. When one specialist takes leave, the engine evaluates whether the remaining assigned staff can absorb the coverage demand to meet the minimum headcount without requiring external backup.

### 4. What happens when an employee manages all processes for a brand but is unavailable on a required working day?
When a dedicated single-resource specialist becomes unavailable:
1. **Non-Silent Detection**: The system flags a `Single-Resource Blackout` conflict, alerting the operations manager that the brand has 0% operational coverage on that date.
2. **Multi-Criteria Backup Recommendation (`src/engine/backupRecommender.js`)**: The engine searches the entire 36-employee pool and ranks replacement candidates based on certified process skill match (+40), same-pod affinity (+30), schedule availability on that date (+20), and workload equity (+10).
3. **One-Click Substitution**: The operations manager can review the ranked recommendations and click *Deploy as Substitute*, reallocating the backup, restoring coverage, and re-auditing the roster in $< 15\text{ms}$.

### 5. How does your system handle conflicting requirements or insufficient staffing?
1. **Hard Priority over Soft Preferences**: A required client operating day ALWAYS overrides an employee's preferred weekly-off day. The engine schedules the mandatory coverage and generates a soft `Preference Disparity` warning rather than dropping coverage.
2. **Unfulfillable Hard Constraints**: If demand exceeds qualified available staff (e.g. all certified agents are on approved leave), the engine refuses to corrupt the data. It marks the shift unfilled and logs a Critical Hard Conflict in the Conflict Center.
3. **Interactive Conflict Center (`src/views/ConflictCenterView.jsx`)**: Displays root-cause diagnoses, affected stakeholders, and actionable resolution options for operational managers.

### 6. Which parts of the process did you automate, and which did you leave under human control? Why?
- **Automated**: Demand matrix computation based on operating calendars and public holidays; hard constraint enforcement (preventing double-bookings, leave violations, fatigue breaches); shift balancing, preference optimization, and candidate scoring for substitutions; real-time delta impact validation.
- **Human Control**: Final decision on emergency substitutions; force overrides; formal roster publishing (a human operations manager explicitly reviews the conflict log and locks the roster state as `Published`).
- **Rationale**: In D2C operations, client relationships and human employee morale require context that algorithms cannot fully know. The system acts as an intelligent co-pilot rather than an opaque black box.

### 7. If the company doubled its team and brand count, what would you change about your solution?
1. **Backend Constraint Engine**: Shift from in-browser deterministic execution to serverless edge workers (e.g. Supabase Edge Functions or Python OR-Tools solver) to handle combinatorial complexity in the background.
2. **Autonomous Pod Federation**: Partition scheduling into independent sub-problems where each Pod Lead generates and manages their pod roster autonomously, while a meta-scheduler handles cross-pod floating swaps.
3. **Algorithmic Comp-Off Banks**: Implement an automated FIFO comp-off expiration and accrual ledger.
4. **WebSocket Real-Time Sync**: Use Supabase Realtime to broadcast live schedule changes to team members' mobile devices instantly.

### 8. If you had one additional week to work on this, what would you improve first?
1. **Integer Linear Programming (ILP) Solver**: Integrate an LP/MIP solver (such as Google OR-Tools via WebAssembly) to find mathematically optimal Pareto frontiers between fairness and client SLA compliance.
2. **Drag-and-Drop Matrix Shift Swapping**: Implement HTML5 Drag-and-Drop within the Company-wide matrix, allowing managers to drag a shift pill onto another employee with live ghost impact previews.
3. **Self-Service Employee Portal & Shift Swaps**: Enable specialists to request shift swaps with pod peers directly, routing to Pod Leads for one-click approval.
4. **Native Calendar Integration**: Generate iCal / Google Calendar subscription feeds for each employee.

---

## 🏆 Assessment Completion Matrix (10 of 10 Parts Complete)

| Part | Module Name | Status |
|---|---|:---:|
| **Part 1** | Architectural Foundation, App Shell & B2B Design Tokens | **DONE** |
| **Part 2** | Relational Schemas & 36-Staff, 15-Brand Seed Data | **DONE** |
| **Part 3** | Master Operational Entity Management CRUD | **DONE** |
| **Part 4** | Operating Calendars, Public Holidays, Leaves & Comp-Offs | **DONE** |
| **Part 5** | Deterministic Scheduling Engine (Multi-Pass Pipeline) | **DONE** |
| **Part 6** | Conflict Detection Engine & Triage Health Center | **DONE** |
| **Part 7** | Multi-Stakeholder Roster Views (Company, Pod, Brand, Process, Staff) | **DONE** |
| **Part 8** | Interactive In-Grid Editor & Real-Time Delta Impact Validator | **DONE** |
| **Part 9** | Dynamic Change Management & Intelligent Backup Recommender | **DONE** |
| **Part 10**| Operational Analytics, CSV/JSON Export, Q&A Defense & Deployment | **DONE** |

---

Developed with precision for DataStraw.
