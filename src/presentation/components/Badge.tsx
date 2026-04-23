import React from 'react';
import { cn } from '../../utils/cn';

export const Badge: React.FC<{ children: React.ReactNode, className?: string, variant?: string }> = ({ children, className, variant }) => (
  <span className={cn(
    "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
    variant === 'outline' ? "border border-white/10 bg-transparent" : "bg-white/10",
    className
  )}>
    {children}
  </span>
);
