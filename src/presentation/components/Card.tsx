import React from 'react';
import { cn } from '../../utils/cn';

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className, onClick }) => (
  <div 
    onClick={onClick}
    className={cn("bg-dark-card border border-dark-border rounded-2xl p-4 shadow-xl", onClick && "cursor-pointer active:scale-95 transition-transform", className)}
  >
    {children}
  </div>
);
