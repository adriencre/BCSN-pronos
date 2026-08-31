"use client";

import { Minus, Plus } from "lucide-react";

interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function ScoreInput({ label, value, onChange }: ScoreInputProps) {
  const decrement = () => {
    if (value > 0) onChange(value - 1);
  };
  const increment = () => {
    if (value < 200) onChange(value + 1);
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <span className="text-xs font-bold text-text-3 uppercase tracking-wider text-center max-w-[120px] truncate">
        {label}
      </span>

      {/* Score Box */}
      <div
        className="w-20 h-16 flex items-center justify-center rounded-2xl bg-bg-surface border border-border-2 text-3xl font-black text-text-1 tabular-nums"
        key={value}
      >
        <span className="anim-pop">{value}</span>
      </div>

      {/* Buttons (+/-) */}
      <div className="flex items-center gap-2 mt-0.5">
        <button
          type="button"
          onClick={decrement}
          className="w-10 h-10 rounded-xl bg-bg-surface border border-border-2 text-text-2 flex items-center justify-center font-bold active:scale-90 transition-all hover:border-text-3"
          aria-label={`Diminuer ${label}`}
        >
          <Minus size={18} />
        </button>
        <button
          type="button"
          onClick={increment}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold active:scale-90 transition-all shadow-md shadow-primary/20"
          aria-label={`Augmenter ${label}`}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
