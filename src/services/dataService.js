/**
 * DATASTRAW UNIFIED DATA SERVICE
 * Abstraction layer supporting:
 * 1. Client-side local reactive store (backed by localStorage for persistence)
 * 2. Supabase PostgreSQL client (when credentials are provided via VITE_SUPABASE_URL)
 * 3. Seed data reset and relational integrity validation
 */

import { createClient } from '@supabase/supabase-js';
import { 
  PODS, 
  EMPLOYEES, 
  PROCESSES, 
  BRANDS, 
  BRAND_PROCESS_RULES, 
  EMPLOYEE_ASSIGNMENTS, 
  PUBLIC_HOLIDAYS_2026, 
  INITIAL_LEAVES, 
  INITIAL_COMP_OFFS 
} from '../data/mockData';

const STORAGE_KEY = 'datastraw_roster_system_v1';

// Optional Supabase client initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-ref'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

class DataService {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage, falling back to seed data', e);
    }
    return this.getInitialSeedState();
  }

  getInitialSeedState() {
    return {
      pods: [...PODS],
      employees: [...EMPLOYEES],
      processes: [...PROCESSES],
      brands: [...BRANDS],
      brandProcessRules: [...BRAND_PROCESS_RULES],
      assignments: [...EMPLOYEE_ASSIGNMENTS],
      publicHolidays: [...PUBLIC_HOLIDAYS_2026],
      leaves: [...INITIAL_LEAVES],
      compOffs: [...INITIAL_COMP_OFFS],
      rosters: {},
      conflicts: {}
    };
  }

  persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist state to localStorage', e);
    }
  }

  resetToSeed() {
    this.state = this.getInitialSeedState();
    this.persistState();
    return this.state;
  }

  // -------------------------------------------------------------
  // PODS
  // -------------------------------------------------------------
  async getPods() {
    if (supabase) {
      const { data, error } = await supabase.from('pods').select('*');
      if (!error && data?.length) return data;
    }
    return [...this.state.pods];
  }

  // -------------------------------------------------------------
  // EMPLOYEES
  // -------------------------------------------------------------
  async getEmployees() {
    if (supabase) {
      const { data, error } = await supabase.from('employees').select('*');
      if (!error && data?.length) return data;
    }
    return [...this.state.employees];
  }

  async getEmployeeById(id) {
    return this.state.employees.find((e) => e.id === id) || null;
  }

  async updateEmployee(id, updates) {
    this.state.employees = this.state.employees.map((emp) =>
      emp.id === id ? { ...emp, ...updates, updated_at: new Date().toISOString() } : emp
    );
    this.persistState();
    return this.getEmployeeById(id);
  }

  async addEmployee(newEmployee) {
    const id = newEmployee.id || `emp-${String(this.state.employees.length + 1).padStart(2, '0')}`;
    const employee = {
      id,
      role: 'Operations Specialist',
      skills: ['CS'],
      weekly_off_preference: 0,
      weekly_offs_quota: 4,
      avatar_color: '#0284c7',
      is_active: true,
      ...newEmployee,
      created_at: new Date().toISOString()
    };
    this.state.employees.push(employee);
    this.persistState();
    return employee;
  }

  // -------------------------------------------------------------
  // BRANDS
  // -------------------------------------------------------------
  async getBrands() {
    if (supabase) {
      const { data, error } = await supabase.from('brands').select('*');
      if (!error && data?.length) return data;
    }
    return [...this.state.brands];
  }

  async getBrandById(id) {
    return this.state.brands.find((b) => b.id === id) || null;
  }

  async updateBrand(id, updates) {
    this.state.brands = this.state.brands.map((b) =>
      b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
    );
    this.persistState();
    return this.getBrandById(id);
  }

  // -------------------------------------------------------------
  // PROCESSES
  // -------------------------------------------------------------
  async getProcesses() {
    return [...this.state.processes];
  }

  // -------------------------------------------------------------
  // BRAND PROCESS RULES
  // -------------------------------------------------------------
  async getBrandProcessRules() {
    return [...this.state.brandProcessRules];
  }

  async updateBrandProcessRule(id, updates) {
    this.state.brandProcessRules = this.state.brandProcessRules.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    );
    this.persistState();
  }

  // -------------------------------------------------------------
  // ASSIGNMENTS
  // -------------------------------------------------------------
  async getAssignments() {
    return [...this.state.assignments];
  }

  async updateAssignment(id, updates) {
    this.state.assignments = this.state.assignments.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    this.persistState();
  }

  async addAssignment(assignment) {
    const id = assignment.id || `assign-${Date.now()}`;
    const newAssign = { id, is_primary: true, ...assignment };
    this.state.assignments.push(newAssign);
    this.persistState();
    return newAssign;
  }

  async removeAssignment(id) {
    this.state.assignments = this.state.assignments.filter((a) => a.id !== id);
    this.persistState();
  }

  // -------------------------------------------------------------
  // PUBLIC HOLIDAYS, LEAVES, COMP OFFS
  // -------------------------------------------------------------
  async getPublicHolidays() {
    return [...this.state.publicHolidays];
  }

  async getLeaves() {
    return [...this.state.leaves];
  }

  async addLeave(leave) {
    const id = leave.id || `leave-${Date.now()}`;
    const newLeave = { id, status: 'approved', ...leave };
    this.state.leaves.push(newLeave);
    this.persistState();
    return newLeave;
  }

  async removeLeave(id) {
    this.state.leaves = this.state.leaves.filter((l) => l.id !== id);
    this.persistState();
  }

  async getCompOffs() {
    return [...this.state.compOffs];
  }

  async addCompOff(compOff) {
    const id = compOff.id || `comp-${Date.now()}`;
    const newComp = { id, status: 'approved', ...compOff };
    this.state.compOffs.push(newComp);
    this.persistState();
    return newComp;
  }

  // -------------------------------------------------------------
  // ROSTER PERSISTENCE
  // -------------------------------------------------------------
  async getRoster(rosterId) {
    return this.state.rosters[rosterId] || null;
  }

  async saveRoster(rosterId, rosterData) {
    this.state.rosters[rosterId] = {
      ...rosterData,
      updated_at: new Date().toISOString()
    };
    this.persistState();
    return this.state.rosters[rosterId];
  }

  // -------------------------------------------------------------
  // RELATIONAL INTEGRITY VERIFICATION
  // -------------------------------------------------------------
  validateIntegrity() {
    const errors = [];
    const empIds = new Set(this.state.employees.map((e) => e.id));
    const brandIds = new Set(this.state.brands.map((b) => b.id));
    const podIds = new Set(this.state.pods.map((p) => p.id));
    const procIds = new Set(this.state.processes.map((pr) => pr.id));

    // 1. Pod Leads reference valid employees
    for (const pod of this.state.pods) {
      if (pod.lead_id && !empIds.has(pod.lead_id)) {
        errors.push(`Pod ${pod.id} lead ${pod.lead_id} does not exist in employees.`);
      }
    }

    // 2. Employees belong to valid pods
    for (const emp of this.state.employees) {
      if (!podIds.has(emp.pod_id)) {
        errors.push(`Employee ${emp.id} references invalid pod ${emp.pod_id}.`);
      }
    }

    // 3. Brands belong to valid pods
    for (const brand of this.state.brands) {
      if (!podIds.has(brand.pod_id)) {
        errors.push(`Brand ${brand.id} references invalid pod ${brand.pod_id}.`);
      }
    }

    // 4. Assignments reference valid employees, brands, and processes
    for (const assign of this.state.assignments) {
      if (!empIds.has(assign.employee_id)) {
        errors.push(`Assignment ${assign.id} references invalid employee ${assign.employee_id}.`);
      }
      if (!brandIds.has(assign.brand_id)) {
        errors.push(`Assignment ${assign.id} references invalid brand ${assign.brand_id}.`);
      }
      if (!procIds.has(assign.process_id)) {
        errors.push(`Assignment ${assign.id} references invalid process ${assign.process_id}.`);
      }
    }

    // 5. Check 80% single-resource ratio
    const singleResourceCount = this.state.brands.filter((b) => b.is_single_resource).length;
    const ratio = (singleResourceCount / this.state.brands.length) * 100;

    return {
      isValid: errors.length === 0,
      errors,
      metrics: {
        totalEmployees: this.state.employees.length,
        totalBrands: this.state.brands.length,
        singleResourceBrands: singleResourceCount,
        multiResourceBrands: this.state.brands.length - singleResourceCount,
        singleResourceRatio: Math.round(ratio),
        totalPods: this.state.pods.length,
        totalAssignments: this.state.assignments.length
      }
    };
  }
}

export const dataService = new DataService();
