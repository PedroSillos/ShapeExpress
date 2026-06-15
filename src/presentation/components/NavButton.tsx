import React from 'react';
import { cn } from '../../utils/cn';

interface NavButtonProps {
  active: boolean;
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
}

export function NavButton({ active, icon, label, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 transition-all duration-200 relative active:scale-90',
        active ? 'text-brand-red' : 'text-white/30 hover:text-white/50'
      )}
    >
      <div className={cn(
        'w-12 h-9 rounded-xl flex items-center justify-center transition-colors',
        active ? 'bg-brand-red/15' : 'bg-transparent'
      )}>
        {icon}
      </div>
      {label && (
        <span className={cn('text-[9px] font-bold uppercase tracking-widest', active ? 'text-brand-red' : 'text-white/20')}>
          {label}
        </span>
      )}
    </button>
  );
}
