import React from 'react';
import { cn } from '../../utils/cn';

interface InputGroupProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
  error?: string;
  id?: string;
}

export function InputGroup({ label, value, onChange, onBlur, icon, type = "text", placeholder, error, id }: InputGroupProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'date') {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      
      let formatted = v;
      if (v.length >= 5) {
        formatted = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
      } else if (v.length >= 3) {
        formatted = `${v.slice(0, 2)}/${v.slice(2)}`;
      }
      
      if (v.length === 8) {
        const day = v.slice(0, 2);
        const month = v.slice(2, 4);
        const year = v.slice(4, 8);
        onChange(`${year}-${month}-${day}`);
      } else {
        onChange(formatted);
      }
    } else {
      onChange(e.target.value);
    }
  };

  let displayValue = value;
  if (type === 'date' && value) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-');
      displayValue = `${d}/${m}/${y}`;
    }
  }

  return (
    <div className="space-y-1.5" id={id}>
      <label className={cn("text-[10px] font-bold uppercase tracking-widest px-2", error ? "text-red-500" : "text-white/40")}>{label}</label>
      <div className="relative">
        <div className={cn("absolute left-4 top-1/2 -translate-y-1/2", error ? "text-red-500/50" : "text-white/20")}>
          {icon}
        </div>
        <input 
          type={type === 'date' ? 'text' : type}
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={type === 'date' ? 'DD/MM/AAAA' : placeholder}
          maxLength={type === 'date' ? 10 : undefined}
          className={cn(
            "w-full bg-dark-card border rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none transition-colors placeholder:text-white/10",
            error ? "border-red-500 focus:border-gray-400" : "border-dark-border focus:border-gray-400"
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500 px-2 mt-1">{error}</p>}
    </div>
  );
}
