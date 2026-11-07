import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Edit3, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import EmployeeModal from '../components/employees/EmployeeModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EmployeesView() {
  const { employees, pods, processes, brands, assignments } = useApp();

  const [search, setSearch] = useState('');
  const [selectedPod, setSelectedPod] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesPod = selectedPod === 'all' || emp.pod_id === selectedPod;
      const matchesRole = selectedRole === 'all' || emp.role === selectedRole;
      const matchesSkill = selectedSkill === 'all' || emp.skills.includes(selectedSkill);

      return matchesSearch && matchesPod && matchesRole && matchesSkill;
    });
  }, [employees, search, selectedPod, selectedRole, selectedSkill]);

  const handleEdit = (emp) => {
    setEditingEmployee(emp);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Staff & Pod Directory</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {filteredEmployees.length} of {employees.length} Staff
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage operational team profiles, pod assignments, process qualifications, and shift preferences
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-925 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by staff name or email..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {/* Pod Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400">Pod:</span>
          <select
            value={selectedPod}
            onChange={(e) => setSelectedPod(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Pods</option>
            {pods.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400">Role:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Roles</option>
            <option value="Pod Lead" className="bg-slate-900">Pod Lead</option>
            <option value="Senior Specialist" className="bg-slate-900">Senior Specialist</option>
            <option value="Operations Specialist" className="bg-slate-900">Operations Specialist</option>
          </select>
        </div>

        {/* Skill Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400">Process Skill:</span>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Processes</option>
            {processes.map((pr) => (
              <option key={pr.id} value={pr.id} className="bg-slate-900">
                {pr.code} - {pr.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Master Table */}
      <div className="bg-slate-925 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Pod & Lead Status</th>
                <th className="py-3 px-4">Role Classification</th>
                <th className="py-3 px-4">Certified Skills</th>
                <th className="py-3 px-4">Assigned Accounts</th>
                <th className="py-3 px-4">Weekly Off Pref</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.map((emp) => {
                const pod = pods.find((p) => p.id === emp.pod_id);
                const isLead = pod?.lead_id === emp.id;
                const empAssignments = assignments.filter((a) => a.employee_id === emp.id);
                const assignedBrands = brands.filter((b) => empAssignments.some((a) => a.brand_id === b.id));

                return (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-850/60 transition-colors group"
                  >
                    {/* Employee Profile */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                          style={{ backgroundColor: emp.avatar_color || '#0284c7' }}
                        >
                          {emp.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                            <span>{emp.name}</span>
                            {isLead && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                                LEAD
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Pod */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: pod?.color || '#38bdf8' }}
                        />
                        <span className="font-medium text-slate-200 truncate max-w-[140px]">
                          {pod?.name || 'Unassigned'}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          emp.role === 'Pod Lead'
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : emp.role === 'Senior Specialist'
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>

                    {/* Certified Skills */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.skills.map((skillId) => {
                          const proc = processes.find((p) => p.id === skillId);
                          return (
                            <span
                              key={skillId}
                              className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20"
                              title={proc?.name}
                            >
                              {skillId}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Assigned Accounts */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {assignedBrands.length > 0 ? (
                          assignedBrands.map((b) => (
                            <span
                              key={b.id}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                b.is_single_resource
                                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                              }`}
                              title={`${b.name} (${b.is_single_resource ? 'Dedicated' : 'Multi-Staff'})`}
                            >
                              {b.code}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Floating Backup Pool</span>
                        )}
                      </div>
                    </td>

                    {/* Weekly Off Preference */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{DAYS[emp.weekly_off_preference ?? 0]} ({emp.weekly_offs_quota}/mo)</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit Employee"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employee={editingEmployee}
      />
    </div>
  );
}
