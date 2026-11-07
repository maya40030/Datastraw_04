import React from 'react';
import { useApp } from '../context/AppContext';
import PodCard from '../components/pods/PodCard';
import { Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function PodsView() {
  const { pods, employees } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Operational Pods & Pod Leadership</h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
              4 Pods Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational hierarchy, pod lead governance, skill capacity balance, and brand clustering
          </p>
        </div>
      </div>

      {/* 4 Pod Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {pods.map((pod) => (
          <PodCard key={pod.id} pod={pod} />
        ))}
      </div>
    </div>
  );
}
