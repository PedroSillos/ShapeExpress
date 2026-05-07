import React from 'react';
import { cn } from '../../utils/cn';
import logoImg from '../../assets/logo.png';
import iconImg from '../../assets/icon.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconOnly?: boolean;
}

export const Logo = ({ size = 'md', className, iconOnly = false }: LogoProps) => {
  const sizes = {
    sm: { width: 120, height: 120 },
    md: { width: 180, height: 180 },
    lg: { width: 240, height: 240 }
  };
  const s = sizes[size];
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img 
        src={iconOnly ? iconImg : logoImg} 
        alt="Shape Express" 
        width={s.width}
        height={s.height}
        className="object-contain"
      />
    </div>
  );
};

export default Logo;
