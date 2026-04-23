import React from 'react';

interface SelectGroupProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  options: { value: string; label: string }[];
}

export function SelectGroup({ label, value, onChange, icon, options }: SelectGroupProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 z-10 pointer-events-none">
          {icon}
        </div>
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-dark-card border border-dark-border rounded-xl py-3.5 pl-12 pr-10 text-sm font-medium focus:outline-none focus:border-gray-400 transition-colors appearance-none text-white"
        >
          <option value="" disabled>Selecione uma opção</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-dark-surface">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
