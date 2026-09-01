"use client";

import { Minus, Plus } from "lucide-react";

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  teamLogo?: string | null;
}

export default function ScoreInput({ label, value, onChange, teamLogo }: ScoreInputProps) {
  const decrement = (amount: number = 1) => {
    onChange(Math.max(0, value - amount));
  };
  const increment = (amount: number = 1) => {
    onChange(Math.min(200, value + amount));
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-bg-card border border-border-1 max-w-[130px]">
        {teamLogo && (
          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 bg-white">
            <img src={teamLogo} alt="" className="w-full h-full object-contain" />
          </div>
        )}
        <span className="text-[11px] font-extrabold text-text-2 uppercase tracking-wider truncate">
          {label}
        </span>
      </div>

      {/* Score Box */}
      <div
        className="w-24 h-20 flex items-center justify-center rounded-2xl bg-bg-surface border-2 border-border-2 text-4xl font-black text-text-1 tabular-nums shadow-inner relative group hover:border-primary/50 transition-colors"
        key={value}
      >
        <span className="anim-pop font-mono tracking-tight">{value}</span>
        <span className="text-[9px] font-bold text-text-4 absolute bottom-1 uppercase">pts</span>
      </div>

      {/* Stepper Buttons (+ / -) */}
      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          onClick={() => decrement(1)}
          className="w-11 h-11 rounded-2xl bg-bg-surface border border-border-2 text-text-2 flex items-center justify-center font-bold active:scale-85 transition-all hover:bg-bg-card hover:text-text-1 hover:border-text-3 shadow-md"
          aria-label={`Diminuer ${label}`}
        >
          <Minus size={18} />
        </button>
        <button
          type="button"
          onClick={() => increment(1)}
          className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold active:scale-85 transition-all shadow-lg shadow-primary/30 hover:brightness-110"
          aria-label={`Augmenter ${label}`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Quick +/- 5 Presets */}
      <div className="flex items-center gap-1.5 mt-0.5">
        <button
          type="button"
          onClick={() => decrement(5)}
          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-bg-card text-text-3 hover:text-text-1 hover:bg-bg-card-hover border border-border-1 active:scale-95 transition-all"
        >
          -5
        </button>
        <button
          type="button"
          onClick={() => increment(5)}
          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-bg-card text-text-3 hover:text-text-1 hover:bg-bg-card-hover border border-border-1 active:scale-95 transition-all"
        >
          +5
        </button>
      </div>
    </div>
  );
}
