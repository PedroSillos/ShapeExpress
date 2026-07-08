import React from 'react';
import { Trophy, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card } from './Card';
import { InitialsAvatar } from '@/src/shared/ui/InitialsAvatar';

export interface TrainerCardProps {
  key?: any;
  trainer: any;
  showDistance?: boolean;
  onConnect: (code: string) => Promise<void>;
  studentConnections?: any[];
  onViewProfile?: (t: any) => void;
}

export function TrainerCard({ trainer, showDistance, onConnect, studentConnections = [], onViewProfile }: TrainerCardProps) {
  const connection = studentConnections.find(c => c.trainerEmail === trainer.email);
  const isPending = connection?.status === 'pending';
  const isConnected = connection?.status === 'accepted';

  return (
    <Card 
      className="p-4 hover:border-brand-red/30 transition-all group cursor-pointer"
      onClick={() => onViewProfile?.(trainer)}
    >
      <div className="flex gap-4">
        <div className="relative">
          <InitialsAvatar
            name={trainer.name ?? ''}
            sizeClass="w-16 h-16"
            roundedClass="rounded-2xl"
            className="border border-white/10 group-hover:border-brand-red/50 transition-all"
          />
          {showDistance && (
            <div className="absolute -bottom-1 -right-1 bg-brand-red text-black text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-lg">
              {trainer.distance}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-sm">{trainer.name}</h4>
              <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider">{trainer.specialty || 'Treinador Elite'}</p>
            </div>
            <div className="flex items-center gap-1 bg-brand-red/10 px-2 py-1 rounded-lg">
              <Trophy size={10} className="text-brand-red" />
              <span className="text-[10px] font-bold text-brand-red">{trainer.rating || '5.0'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex flex-col">
              <span className="text-[8px] text-white/20 uppercase font-bold">Alunos</span>
              <span className="text-[10px] font-bold">{trainer.students || (((trainer.email?.charCodeAt(0) || 1) + (trainer.name?.charCodeAt(0) || 1)) % 50 + 10)}</span>
            </div>
            <div className="w-px h-4 bg-white/5" />
            <div className="flex flex-col">
              <span className="text-[8px] text-white/20 uppercase font-bold">Exp.</span>
              <span className="text-[10px] font-bold">{trainer.experience || '5+ anos'}</span>
            </div>
            
            {isConnected ? (
              <div className="ml-auto flex items-center gap-1 text-brand-red">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-bold uppercase tracking-widest">Conectado</span>
              </div>
            ) : isPending ? (
              <div className="ml-auto flex items-center gap-1 text-amber-500">
                <RefreshCw size={14} className="animate-spin-slow" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Solicitado</span>
              </div>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onConnect(trainer.personalCode);
                }}
                className="ml-auto px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-brand-red hover:text-black hover:border-brand-red transition-all"
              >
                Conectar
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
