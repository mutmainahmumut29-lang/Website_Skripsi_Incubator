import React from 'react';
import { Container, RotateCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

export function StatusCard({ title, value, type }) {
  let icon = null;
  let colorClass = "text-slate-200";
  let displayValue = value;

  if (type === 'water') {
    icon = <Container className="w-5 h-5 text-slate-400" />;
    if (value === true) {
      displayValue = "Safe / Terisi";
      colorClass = "text-emerald-400";
    } else {
      displayValue = "Empty / Refill Needed";
      colorClass = "text-rose-400 animate-pulse font-bold";
    }
  } else if (type === 'tray') {
    // Logika UI Khusus saat Fase Hatching aktif (Hari 19-22)
    if (value === 'STOPPED') {
       icon = <AlertCircle className="w-5 h-5 text-amber-500" />;
       displayValue = "Fase Hatching (Berhenti)";
       colorClass = "text-amber-400 font-bold";
    } else {
       icon = <RotateCw className="w-5 h-5 text-slate-400" />;
       try {
         displayValue = formatDistanceToNow(new Date(value), { addSuffix: true });
         colorClass = "text-blue-400";
       } catch {
         displayValue = "Menunggu jadwal...";
         colorClass = "text-slate-500";
       }
    }
  }

  return (
    <div className={cn(
      "rounded-2xl bg-slate-900 border p-6 shadow-xl flex items-center justify-between transition-all duration-500",
      value === false && type === 'water' ? "border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.1)]" : "border-white/5",
      value === 'STOPPED' && type === 'tray' ? "border-amber-500/30 bg-amber-500/5" : ""
    )}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-800 rounded-xl border border-white/5 shadow-inner">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-1">{title}</span>
          <span className={cn("text-lg font-semibold", colorClass)}>{displayValue}</span>
        </div>
      </div>
    </div>
  );
}