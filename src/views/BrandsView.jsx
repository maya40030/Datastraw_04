import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Users, 
  Settings2, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';
import BrandAssignmentModal from '../components/brands/BrandAssignmentModal';

export default function BrandsView() {
  const { brands, pods, processes, employees, assignments, brandProcessRules } = useApp();

  const [search, setSearch] = useState('');
  const [selectedPod, setSelectedPod] = useState('all');
  const [filterType, setFilterType] = useState('all'); // 'all', 'single', 'multi'
  const [activeBrandModal, setActiveBrandModal] = useState(null);

  // Filtered brands
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesSearch = 
        brand.name.toLowerCase().includes(search.toLowerCase()) ||
        brand.code.toLowerCase().includes(search.toLowerCase());
      
      const matchesPod = selectedPod === 'all' || brand.pod_id === selectedPod;
      const matchesType = 
        filterType === 'all' ||
        (filterType === 'single' && brand.is_single_resource) ||
        (filterType === 'multi' && !brand.is_single_resource);

      return matchesSearch && matchesPod && matchesType;
    });
  }, [brands, search, selectedPod, filterType]);

  const singleResourceCount = brands.filter((b) => b.is_single_resource).length;
  const multiResourceCount = brands.length - singleResourceCount;
  const singleRatio = Math.round((singleResourceCount / (brands.length || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Client Brands & Operational Staffing</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {filteredBrands.length} of {brands.length} Brands
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure single-resource and multi-resource staffing allocations and process mappings without code modifications
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 font-semibold">
            Single: {singleResourceCount} ({singleRatio}%)
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
            Multi: {multiResourceCount} ({100 - singleRatio}%)
          </span>
        </div>
      </div>

      {/* Operational Ratio Notice Banner */}
      <div className="p-4 rounded-xl bg-slate-925 border border-slate-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <span className="font-semibold text-white">Assessment Staffing Rule:</span> Exactly ~80% of brands are managed by a single dedicated employee handling all processes. When an employee on a single-resource brand takes a weekly off or planned leave, the scheduling engine automatically evaluates coverage gaps and proposes backup substitutions.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-925 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brands by name or code..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
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

        {/* Resource Allocation Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs">
          <span className="text-slate-400">Staffing Model:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Models</option>
            <option value="single" className="bg-slate-900">Single-Resource (80%)</option>
            <option value="multi" className="bg-slate-900">Multi-Resource (20%)</option>
          </select>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBrands.map((brand) => {
          const pod = pods.find((p) => p.id === brand.pod_id);
          const brandAssigns = assignments.filter((a) => a.brand_id === brand.id);
          const assignedStaff = employees.filter((e) => brandAssigns.some((a) => a.employee_id === e.id));
          const rules = brandProcessRules.filter((r) => r.brand_id === brand.id);

          return (
            <div
              key={brand.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                brand.is_single_resource
                  ? 'bg-slate-925 border-slate-800 hover:border-sky-500/40'
                  : 'bg-slate-925 border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-500/5'
              }`}
            >
              <div>
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold font-mono text-xs text-white shadow-sm"
                      style={{ backgroundColor: brand.color || '#0284c7' }}
                    >
                      {brand.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{brand.name}</h3>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: pod?.color || '#38bdf8' }}
                        />
                        {pod?.name}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      brand.is_single_resource
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {brand.is_single_resource ? 'Single (1:1)' : 'Multi-Staff'}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {brand.description}
                </p>

                {/* Assigned Processes & Calendars */}
                <div className="mt-4">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1.5">
                    Operating Processes & Calendars
                  </div>
                  <div className="space-y-1">
                    {rules.map((rule) => {
                      const proc = processes.find((p) => p.id === rule.process_id);
                      return (
                        <div
                          key={rule.id}
                          className="bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sky-400">{rule.process_id}</span>
                            <span className="text-slate-300">{proc?.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            {rule.operating_calendar === '365_days' ? '365 Days' : rule.operating_calendar.replace(/_/g, ' ')}
                            {' • '}min {rule.min_headcount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Staff Members */}
                <div className="mt-4">
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold mb-1.5">
                    Assigned Employees ({assignedStaff.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg flex items-center gap-1.5 text-xs text-slate-200"
                      >
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] text-white"
                          style={{ backgroundColor: staff.avatar_color || '#0284c7' }}
                        >
                          {staff.name[0]}
                        </div>
                        <span className="font-medium text-[11px]">{staff.name}</span>
                      </div>
                    ))}
                    {assignedStaff.length === 0 && (
                      <span className="text-xs text-rose-400 italic flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> No staff assigned!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer / Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {brand.is_single_resource ? 'High Vulnerability' : 'Redundancy Capable'}
                </span>
                <button
                  onClick={() => setActiveBrandModal(brand)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Manage Allocations</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Editor Modal */}
      {activeBrandModal && (
        <BrandAssignmentModal
          isOpen={!!activeBrandModal}
          onClose={() => setActiveBrandModal(null)}
          brand={activeBrandModal}
        />
      )}
    </div>
  );
}
