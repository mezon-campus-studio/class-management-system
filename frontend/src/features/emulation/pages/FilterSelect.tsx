import React from 'react';

interface FilterSelectProps {
  label: string;
  val: number;
  options: number[];
  onChange: (value: number) => void;
}

export const FilterSelect = ({ label, val, options, onChange }: FilterSelectProps) => (
  <div className="flex items-center gap-2 px-2">
    <span className="text-xs text-ink-3 font-bold">{label}:</span>
    <select 
      value={val}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-xs font-bold border-none bg-surface-2 rounded-md focus:ring-0 cursor-pointer py-1 px-2"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);