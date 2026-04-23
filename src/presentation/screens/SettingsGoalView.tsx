import React, { useState } from 'react';
import { Target, Flame, Zap, Heart, ChevronLeft } from 'lucide-react';
import { Card } from '../components/Card';
import { cn } from '../../utils/cn';

interface SettingsGoalViewProps {
  onSave: () => void;
  onCancel: () => void;
}

export function SettingsGoalView({ onSave, onCancel }: SettingsGoalViewProps) {
  const [selectedGoal, setSelectedGoal] = useState('hypertrophy');
  const goals = [
    { id: 'hypertrophy', label: 'Hipertrofia', icon: <Flame size={20} />, description: 'Foco em ganho de massa muscular.' },
    { id: 'weight-loss', label: 'Emagrecimento', icon: <Zap size={20} />, description: 'Foco em queima de gordura.' },
    { id: 'conditioning', label: 'Condicionamento', icon: <Heart size={20} />, description: 'Melhorar resistência e saúde.' },
    { id: 'strength', label: 'Força Pura', icon: <Target size={20} />, description: 'Foco em cargas máximas.' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Objetivo Principal</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Escolha seu foco</h3>
        <div className="grid grid-cols-1 gap-3">
          {goals.map((goal) => (
            <button 
              key={goal.id}
              onClick={() => setSelectedGoal(goal.id)}
              className={cn(
                "w-full text-left transition-all duration-300",
                selectedGoal === goal.id ? "scale-[1.02]" : "opacity-60 grayscale"
              )}
            >
              <Card className={cn(
                "flex items-center gap-4 p-6 border-2",
                selectedGoal === goal.id ? "border-brand-red bg-brand-red/5" : "border-transparent"
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  selectedGoal === goal.id ? "bg-brand-red text-black" : "bg-white/5 text-white/40"
                )}>
                  {goal.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold">{goal.label}</h4>
                  <p className="text-xs text-white/40">{goal.description}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <button 
          onClick={onSave}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          Salvar Objetivo
        </button>
      </div>
    </div>
  );
}
