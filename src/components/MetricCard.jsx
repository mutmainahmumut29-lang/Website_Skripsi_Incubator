import React from "react";
import { cn } from "../lib/utils";
import { Thermometer, Droplets } from "lucide-react";

export function MetricCard({ title, value, unit, type }) {
  // Logic for color
  let colorClass = "text-slate-200";
  let bgGradient = "";
  let icon = null;

  if (type === "temperature") {
    icon = <Thermometer className="w-6 h-6 text-slate-400" />;
    if (value < 37 || value > 38) {
      colorClass = "text-rose-400";
      bgGradient = "from-rose-500/5 to-transparent";
    } else {
      colorClass = "text-emerald-400";
      bgGradient = "from-emerald-500/5 to-transparent";
    }
  } else if (type === "humidity") {
    icon = <Droplets className="w-6 h-6 text-slate-400" />;
    if (value < 50) {
      colorClass = "text-amber-400";
      bgGradient = "from-amber-500/5 to-transparent";
    } else {
      colorClass = "text-emerald-400";
      bgGradient = "from-emerald-500/5 to-transparent";
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300">
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br opacity-50 transition-colors duration-500",
          bgGradient,
        )}
      />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-slate-400 font-medium tracking-wide uppercase text-sm">
            {title}
          </h3>
          {icon}
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className={cn(
              "text-5xl font-bold tracking-tighter tabular-nums drop-shadow-sm transition-colors duration-300",
              colorClass,
            )}
          >
            {value.toFixed(1)}
          </span>
          <span className="text-slate-500 font-medium text-lg">{unit}</span>
        </div>
      </div>
    </div>
  );
}
