import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from './Toast';

export default function AppShell({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Primary Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-900/50 p-6">
          <div className="max-w-[1700px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <Toast />
    </div>
  );
}
