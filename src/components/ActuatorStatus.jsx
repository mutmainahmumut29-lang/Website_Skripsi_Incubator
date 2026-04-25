import React from 'react';
import { cn } from '../lib/utils';
import { Flame, Fan, Zap } from 'lucide-react';

export function ActuatorStatus({ actuators }) {
  const items = [
    { key: 'heater', label: 'Heater Component', icon: Flame, status: actuators.heater },
    { key: 'fan', label: 'Circulation Fan', icon: Fan, status: actuators.fan },
    { key: 'pump', label: 'Water Pump', icon: Zap, status: actuators.pump },
  ];

  return (
    <div className="rounded-2xl bg-slate-900 border border-white/5 shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5 bg-slate-900/50">
        <h3 className="text-slate-300 font-medium tracking-wide uppercase text-sm">Live Actuator Status</h3>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(({ key, label, icon: Icon, status }) => {
          const isActive = status;
          return (
            <div key={key} className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-xl border border-white/5">
              <div className={cn(
                "p-3 rounded-xl transition-colors duration-500",
                isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-slate-800 text-slate-500 border border-slate-700"
              )}>
                <Icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-400 text-sm font-medium">{label}</span>
                <span className={cn(
                  "text-sm font-bold mt-0.5 tracking-wider uppercase transition-colors duration-300",
                  isActive ? "text-emerald-400" : "text-slate-600"
                )}>
                  {isActive ? 'Active Mode' : 'Standby'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
