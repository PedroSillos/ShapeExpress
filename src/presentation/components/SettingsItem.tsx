import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

export function SettingsItem({ icon, label, onClick, className }: SettingsItemProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group active:scale-[0.98]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight size={18} className="text-white/20 group-hover:text-white/40 transition-colors" />
    </button>
  );
}
