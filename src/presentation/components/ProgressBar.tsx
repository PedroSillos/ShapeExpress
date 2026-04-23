import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

export const ProgressBar = ({ progress, max, className }: { progress: number, max: number, className?: string }) => (
  <div className={cn("h-1.5 w-full bg-dark-border rounded-full overflow-hidden", className)}>
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${Math.min((progress / max) * 100, 100)}%` }}
      className="h-full red-gradient"
    />
  </div>
);
