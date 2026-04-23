import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo = ({ size = 'md', className }: LogoProps) => {
  const sizes = {
    sm: { icon: 24, box: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 24, box: 'w-10 h-10', text: 'text-2xl' },
    lg: { icon: 32, box: 'w-14 h-14', text: 'text-4xl' }
  };
  const s = sizes[size];
  
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className={cn(s.box, "bg-brand-red rounded-xl flex items-center justify-center shadow-lg shadow-brand-red/20 rotate-3")}>
        <Zap size={s.icon} className="text-black fill-current" />
      </div>
      <span className={cn(s.text, "font-black tracking-tighter text-white italic")}>SHAPE<span className="text-brand-red">EXPRESS</span></span>
    </div>
  );
};

export default Logo;
