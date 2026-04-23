import React from 'react';
import { cn } from '../../utils/cn';

interface NavButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function NavButton({ active, icon, label, onClick }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
        active ? "text-brand-red scale-110" : "text-white/20 hover:text-white/40"
      )}
    >
      <div className={cn(
        "p-2 rounded-xl transition-colors",
        active ? "bg-brand-red/10" : "bg-transparent"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      {active && (
        <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-brand-red shadow-[0_0_8px_rgba(234,67,53,0.8)]" />
      )}
    </button>
  );
}
