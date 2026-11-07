import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState('roster');
  const [rosterViewMode, setRosterViewMode] = useState('company'); // 'company', 'pod', 'brand', 'process', 'employee'
  
  // Date context (November 2026 default)
  const [selectedMonth, setSelectedMonth] = useState(10); // 0-indexed (10 = November)
  const [selectedYear, setSelectedYear] = useState(2026);
  
  // Filter states
  const [selectedPodId, setSelectedPodId] = useState('all');
  const [selectedBrandId, setSelectedBrandId] = useState('all');
  const [selectedProcessId, setSelectedProcessId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Domain Entities State
  const [pods, setPods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [brands, setBrands] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [brandProcessRules, setBrandProcessRules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [publicHolidays, setPublicHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [compOffs, setCompOffs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Operational metrics
  const [metrics, setMetrics] = useState({
    totalEmployees: 0,
    totalBrands: 0,
    singleResourceBrands: 0,
    multiResourceBrands: 0,
    activePods: 0,
    coverageSlaRate: 98.2,
    activeConflictsCount: 0,
    rosterStatus: 'Draft'
  });

  // Global Toast notification system
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Hydrate Data from Service
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        loadedPods, 
        loadedEmployees, 
        loadedBrands, 
        loadedProcesses, 
        loadedRules, 
        loadedAssignments, 
        loadedHolidays, 
        loadedLeaves, 
        loadedCompOffs
      ] = await Promise.all([
        dataService.getPods(),
        dataService.getEmployees(),
        dataService.getBrands(),
        dataService.getProcesses(),
        dataService.getBrandProcessRules(),
        dataService.getAssignments(),
        dataService.getPublicHolidays(),
        dataService.getLeaves(),
        dataService.getCompOffs()
      ]);

      setPods(loadedPods);
      setEmployees(loadedEmployees);
      setBrands(loadedBrands);
      setProcesses(loadedProcesses);
      setBrandProcessRules(loadedRules);
      setAssignments(loadedAssignments);
      setPublicHolidays(loadedHolidays);
      setLeaves(loadedLeaves);
      setCompOffs(loadedCompOffs);

      // Verify Relational Integrity
      const validation = dataService.validateIntegrity();

      setMetrics((prev) => ({
        ...prev,
        totalEmployees: validation.metrics.totalEmployees,
        totalBrands: validation.metrics.totalBrands,
        singleResourceBrands: validation.metrics.singleResourceBrands,
        multiResourceBrands: validation.metrics.multiResourceBrands,
        activePods: validation.metrics.totalPods,
      }));
    } catch (err) {
      console.error('Failed to hydrate data', err);
      addToast('Failed to load roster data store', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        rosterViewMode,
        setRosterViewMode,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        selectedPodId,
        setSelectedPodId,
        selectedBrandId,
        setSelectedBrandId,
        selectedProcessId,
        setSelectedProcessId,
        searchQuery,
        setSearchQuery,
        metrics,
        setMetrics,
        toasts,
        addToast,
        removeToast,
        // Entities & Operations
        pods,
        employees,
        brands,
        processes,
        brandProcessRules,
        assignments,
        publicHolidays,
        leaves,
        compOffs,
        isLoading,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
