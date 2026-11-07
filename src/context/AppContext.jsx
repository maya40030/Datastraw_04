import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState('roster');
  const [rosterViewMode, setRosterViewMode] = useState('company'); // 'company', 'pod', 'brand', 'process', 'employee'
  
  // Date context (defaulting to current active planning period: November 2026)
  const [selectedMonth, setSelectedMonth] = useState(10); // 0-indexed (10 = November)
  const [selectedYear, setSelectedYear] = useState(2026);
  
  // Filter states
  const [selectedPodId, setSelectedPodId] = useState('all');
  const [selectedBrandId, setSelectedBrandId] = useState('all');
  const [selectedProcessId, setSelectedProcessId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Operational metrics
  const [metrics, setMetrics] = useState({
    totalEmployees: 36,
    totalBrands: 15,
    singleResourceBrands: 12,
    multiResourceBrands: 3,
    activePods: 4,
    coverageSlaRate: 97.4,
    activeConflictsCount: 0,
    rosterStatus: 'Draft' // 'Draft' | 'Generating' | 'Validated' | 'Published'
  });

  // Global Toast notification system
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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
