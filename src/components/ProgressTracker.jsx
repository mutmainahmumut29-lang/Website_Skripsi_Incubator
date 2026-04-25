import React from 'react';
import { cn } from '../lib/utils';
import { Egg, PowerOff, Play } from 'lucide-react';

export function ProgressTracker({ data, onStart, onStop }) {
  const TOTAL_DAYS = 22;
  const { sessionActive, elapsedDays, elapsedHours } = data;

  // Calculate percentage, maxing out at 100%
  const percentage = sessionActive ? Math.min((elapsedDays / TOTAL_DAYS) * 100, 100) : 0;
  
  // Phase Logic
  let phaseText = "System Idle - Menunggu Inkubasi";
  let phaseColor = "text-slate-400";
  let phaseBg = "bg-slate-800/50 text-slate-400";

  if (sessionActive) {
    if (elapsedDays <= 18) {
      phaseText = "Fase Pembalikan (Active)";
      phaseColor = "text-emerald-400";
      phaseBg = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    } else {
      phaseText = "Fase Hatching (Stop Moving - High Humidity)";
      phaseColor = "text-amber-400";
      phaseBg = "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
  }

  // SVG specific setup
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-slate-900 border border-white/5 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full transition-all relative overflow-hidden">
      {/* Background Gradient */}
      {sessionActive && (
        <div className={cn(
          "absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-1000",
          elapsedDays <= 18 ? "bg-emerald-500" : "bg-amber-500"
        )} />
      )}

      {/* Control Panel (Left) */}
      <div className="flex flex-col gap-5 flex-1 relative z-10 w-full md:w-auto">
        <div>
          <h2 className="text-2xl font-light text-white tracking-tight mb-1">
            Status <span className="font-semibold">Inkubasi</span>
          </h2>
          <p className="text-slate-400 text-sm">
            {sessionActive ? "Sistem berjalan dan memonitor lingkungan." : "Tekan tombol mulai untuk memulai siklus 22 hari."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {!sessionActive ? (
            <button
              onClick={() => {
                if (window.confirm("Mulai siklus inkubasi telur baru?")) {
                  onStart();
                }
              }}
              className="flex items-center gap-2 bg-emerald-500 text-emerald-950 font-bold px-6 py-3 rounded-xl hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <Play className="w-5 h-5 fill-current" />
              Mulai Inkubasi Baru
            </button>
          ) : (
            <button
              onClick={() => {
                if (window.confirm("Hentikan siklus dan ambil telur? Proses ini tidak bisa dibatalkan.")) {
                  onStop();
                }
              }}
              className="flex items-center gap-2 bg-slate-800 text-rose-400 font-semibold px-6 py-3 rounded-xl hover:bg-rose-500 hover:text-white transition-colors border border-white/5"
            >
              <PowerOff className="w-5 h-5" />
              Selesai & Ambil Telur
            </button>
          )}
        </div>
      </div>

      {/* Circular Progress Ring (Right) */}
      <div className="relative flex justify-center items-center shrink-0 mt-4 md:mt-0">
        <svg width="220" height="220" className="-rotate-90 drop-shadow-xl">
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-800"
          />
          {/* Progress circle */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-1000", sessionActive ? (elapsedDays <= 18 ? "text-emerald-500" : "text-amber-500") : "text-transparent")}
          />
        </svg>
        
        {/* Inside SVG Text Area */}
        <div className="absolute inset-0 flex flex-col justify-center items-center mt-2">
          {sessionActive ? (
            <>
              <div className="text-4xl font-bold tracking-tighter text-white tabular-nums">
                {elapsedDays}
              </div>
              <div className="text-slate-400 text-xs font-semibold tracking-widest uppercase">
                dari {TOTAL_DAYS}
              </div>
            </>
          ) : (
            <Egg className="w-12 h-12 text-slate-700" />
          )}
        </div>
      </div>

      {/* Stats Readout (Middle/Rightish depending on wrap) */}
      {sessionActive && (
        <div className="flex flex-col flex-1 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 w-full relative z-10">
           <div className={cn("inline-flex self-start px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4 animate-fade-in", phaseBg)}>
             {phaseText}
           </div>
           
           <div className="flex flex-col gap-1">
             <span className="text-slate-500 text-sm font-medium">Waktu Berjalan</span>
             <span className="text-2xl font-semibold text-white tracking-tight">
               Sudah {elapsedDays} Hari, {elapsedHours} Jam
             </span>
             <span className="text-slate-400 mt-2 text-sm">
               Target Selesai: 22 Hari Siklus Penuh
             </span>
           </div>
        </div>
      )}
    </div>
  );
}
