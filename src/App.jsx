import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import EmployeesView from './views/EmployeesView';
import PodsView from './views/PodsView';
import BrandsView from './views/BrandsView';
import RulesView from './views/RulesView';
import ConflictCenterView from './views/ConflictCenterView';
import RosterView from './views/RosterView';
import ChangeSimulatorView from './views/ChangeSimulatorView';
import AnalyticsView from './views/AnalyticsView';
import DocumentationView from './views/DocumentationView';
import { dataService } from './services/dataService';

function MasterDashboard() {
  const { 
    activeTab, 
    setActiveTab, 
    metrics, 
    pods, 
    employees, 
    brands, 
    processes, 
    assignments, 
    refreshData, 
    addToast,
    currentRoster,
    conflicts,
    softWarnings,
    generateRoster,
    isGenerating,
    selectedMonth,
    selectedYear
  } = useApp();

  const [teamSubTab, setTeamSubTab] = useState('directory');

  const handleResetData = async () => {
    dataService.resetToSeed();
    await refreshData();
    await generateRoster(true);
    addToast('Database reset to official DataStraw 36-staff baseline seed.', 'success');
  };

  // Route based on activeTab
  if (activeTab === 'roster') {
    return <RosterView />;
  }

  if (activeTab === 'conflicts') {
    return <ConflictCenterView />;
  }

  if (activeTab === 'simulator') {
    return <ChangeSimulatorView />;
  }

  if (activeTab === 'brands') {
    return <BrandsView />;
  }

  if (activeTab === 'team') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setTeamSubTab('directory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              teamSubTab === 'directory'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Staff Directory ({employees.length})
          </button>
          <button
            onClick={() => setTeamSubTab('pods')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              teamSubTab === 'pods'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900'
            }`}
          >
            Pods & Leadership (4 Pods)
          </button>
        </div>

        {teamSubTab === 'directory' ? <EmployeesView /> : <PodsView />}
      </div>
    );
  }

  if (activeTab === 'rules') {
    return <RulesView />;
  }

  if (activeTab === 'analytics') {
    return <AnalyticsView />;
  }

  if (activeTab === 'documentation') {
    return <DocumentationView />;
  }

  return <RosterView />;
}

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <MasterDashboard />
      </AppShell>
    </AppProvider>
  );
}
