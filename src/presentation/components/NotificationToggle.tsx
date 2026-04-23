import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface NotificationToggleProps {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}

export function NotificationToggle({ label, description, active, onToggle }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="space-y-1">
        <p className="text-sm font-bold">{label}</p>
        <p className="text-[10px] text-white/40">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={cn(
          "w-12 h-6 rounded-full relative transition-colors duration-300",
          active ? "bg-brand-red" : "bg-dark-border"
        )}
      >
        <motion.div 
          animate={{ x: active ? 24 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        />
      </button>
    </div>
  );
}
