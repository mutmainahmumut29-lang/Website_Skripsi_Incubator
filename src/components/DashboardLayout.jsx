// src/components/DashboardLayout.jsx
import React from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils'; // Pastikan import utilitas classNames kamu

export function DashboardLayout({ children, isOffline }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-6 lg:p-8 font-sans selection:bg-slate-700">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Banner Peringatan Kritis Jika Alat Mati */}
        {isOffline && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-xl flex items-center justify-center gap-3 animate-pulse shadow-[0_0_20px_rgba(225,29,72,0.2)]">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-bold tracking-wider uppercase">
              ERROR KRITIS: KONEKSI KE PERANGKAT TERPUTUS. PERIKSA POWER/WIFI ESP32.
            </span>
          </div>
        )}

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-light text-white tracking-tight">
              Incubator <span className="font-semibold text-slate-100">Dash</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time Telemetry & Diagnostics</p>
          </div>
          
          {/* Indikator Status di Kanan Atas */}
          <div className={cn(
            "flex items-center gap-3 px-5 py-2.5 rounded-full border shadow-sm transition-colors duration-500",
            isOffline 
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          )}>
            {isOffline ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Activity className="w-4 h-4 animate-pulse" />
            )}
            <span className="text-sm font-bold tracking-wider uppercase">
              {isOffline ? "System Error" : "System Status: Online"}
            </span>
          </div>
        </header>

        <main className={cn("space-y-6 transition-opacity duration-500", isOffline && "opacity-50 pointer-events-none")}>
          {children}
        </main>
      </div>
    </div>
  );
}