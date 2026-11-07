-- ==============================================================================
-- DATASTRAW SMART ROSTER MANAGEMENT SYSTEM
-- PostgreSQL / Supabase Relational Database Schema
-- ==============================================================================

-- Drop tables if re-initializing (in dependency order)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS conflict_records CASCADE;
DROP TABLE IF EXISTS roster_assignments CASCADE;
DROP TABLE IF EXISTS rosters CASCADE;
DROP TABLE IF EXISTS comp_offs CASCADE;
DROP TABLE IF EXISTS employee_leaves CASCADE;
DROP TABLE IF EXISTS public_holidays CASCADE;
DROP TABLE IF EXISTS employee_brand_assignments CASCADE;
DROP TABLE IF EXISTS brand_processes CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS processes CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS pods CASCADE;

-- 1. Operational Pods
CREATE TABLE pods (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lead_id VARCHAR(50), -- FK to employees added via ALTER TABLE to avoid circularity
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Employees (>= 30 required, 36 seeded)
CREATE TABLE employees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Operations Specialist', -- 'Pod Lead', 'Senior Specialist', 'Operations Specialist'
    pod_id VARCHAR(50) NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL DEFAULT '{}', -- ['CS', 'ACC', 'RET', 'NDR']
    weekly_off_preference INT DEFAULT 0, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    weekly_offs_quota INT DEFAULT 4, -- Target weekly offs per month (approx 1 per week)
    avatar_color VARCHAR(20) DEFAULT '#0284c7',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circular FK reference for Pod Leads
ALTER TABLE pods 
ADD CONSTRAINT fk_pod_lead 
FOREIGN KEY (lead_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 3. Operational Processes
CREATE TABLE processes (
    id VARCHAR(50) PRIMARY KEY, -- 'CS', 'ACC', 'RET', 'NDR'
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(30) DEFAULT '#0284c7',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Client Brands (15 brands: 12 single-resource ~80%, 3 multi-resource ~20%)
CREATE TABLE brands (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    pod_id VARCHAR(50) NOT NULL REFERENCES pods(id) ON DELETE CASCADE,
    is_single_resource BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    color VARCHAR(30) DEFAULT '#38bdf8',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Brand-Process Working Rules & Operating Calendars
-- Operating rules can differ per process within the same brand
CREATE TABLE brand_processes (
    id VARCHAR(100) PRIMARY KEY, -- brand_id + '_' + process_id
    brand_id VARCHAR(50) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    process_id VARCHAR(50) NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    operating_calendar VARCHAR(50) NOT NULL DEFAULT 'standard_business', 
    -- '365_days': Open 365 days (including Sundays and Public Holidays)
    -- 'daily_no_holidays': Mon-Sun, paused on Public Holidays
    -- 'standard_business': Mon-Sat, Sundays and Public Holidays OFF
    -- 'weekdays_only': Mon-Fri, Weekends and Public Holidays OFF
    min_headcount INT NOT NULL DEFAULT 1,
    weekend_min_headcount INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_brand_process UNIQUE (brand_id, process_id)
);

-- 6. Employee Assignments to Brands and Processes
CREATE TABLE employee_brand_assignments (
    id VARCHAR(100) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    brand_id VARCHAR(50) NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
    process_id VARCHAR(50) NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_emp_brand_proc UNIQUE (employee_id, brand_id, process_id)
);

-- 7. Public Holidays Calendar
CREATE TABLE public_holidays (
    id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Employee Planned Leaves
CREATE TABLE employee_leaves (
    id VARCHAR(100) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL DEFAULT 'planned_leave', -- 'planned_leave', 'sick_leave', 'emergency'
    status VARCHAR(30) NOT NULL DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Compensatory Offs (Comp-Offs) Ledger
CREATE TABLE comp_offs (
    id VARCHAR(100) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    earned_reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Monthly Rosters
CREATE TABLE rosters (
    id VARCHAR(100) PRIMARY KEY, -- 'roster-2026-11'
    month INT NOT NULL, -- 1-12
    year INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft', -- 'draft', 'generating', 'validated', 'published'
    coverage_score NUMERIC(5, 2) DEFAULT 0.00,
    generated_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_month_year UNIQUE (month, year)
);

-- 11. Daily Roster Assignments
CREATE TABLE roster_assignments (
    id VARCHAR(120) PRIMARY KEY, -- roster_id + '_' + employee_id + '_' + date
    roster_id VARCHAR(100) NOT NULL REFERENCES rosters(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    shift_status VARCHAR(30) NOT NULL, -- 'working', 'weekly_off', 'planned_leave', 'comp_off', 'public_holiday'
    brand_id VARCHAR(50) REFERENCES brands(id) ON DELETE SET NULL,
    process_id VARCHAR(50) REFERENCES processes(id) ON DELETE SET NULL,
    is_backup_fill BOOLEAN DEFAULT FALSE,
    original_employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_roster_emp_date UNIQUE (roster_id, employee_id, date)
);

-- 12. Conflict Records
CREATE TABLE conflict_records (
    id VARCHAR(120) PRIMARY KEY,
    roster_id VARCHAR(100) NOT NULL REFERENCES rosters(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'critical', 'warning'
    conflict_type VARCHAR(50) NOT NULL, -- 'understaffed', 'single_resource_blackout', 'overlap', 'leave_violation', 'consecutive_days'
    brand_id VARCHAR(50) REFERENCES brands(id) ON DELETE CASCADE,
    process_id VARCHAR(50) REFERENCES processes(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    suggested_action TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. System Audit Log
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    actor VARCHAR(100) DEFAULT 'Operations Manager',
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high-performance matrix querying & constraint evaluation
CREATE INDEX idx_emp_pod ON employees(pod_id);
CREATE INDEX idx_brand_pod ON brands(pod_id);
CREATE INDEX idx_brand_proc_brand ON brand_processes(brand_id);
CREATE INDEX idx_brand_proc_proc ON brand_processes(process_id);
CREATE INDEX idx_emp_brand_assign_emp ON employee_brand_assignments(employee_id);
CREATE INDEX idx_emp_brand_assign_brand ON employee_brand_assignments(brand_id);
CREATE INDEX idx_roster_assign_roster_date ON roster_assignments(roster_id, date);
CREATE INDEX idx_roster_assign_brand ON roster_assignments(brand_id);
CREATE INDEX idx_roster_assign_emp ON roster_assignments(employee_id);
CREATE INDEX idx_conflicts_roster ON conflict_records(roster_id);
CREATE INDEX idx_conflicts_date ON conflict_records(date);
