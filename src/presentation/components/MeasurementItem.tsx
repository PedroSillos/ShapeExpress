import React from 'react';

interface MeasurementItemProps {
  label: string;
  value?: number;
  unit: string;
}

export function MeasurementItem({ label, value, unit }: MeasurementItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <span className="text-xs text-white/40 font-bold uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold">{value || '-'}</span>
        <span className="text-[10px] text-white/20 font-bold uppercase">{unit}</span>
      </div>
    </div>
  );
}
