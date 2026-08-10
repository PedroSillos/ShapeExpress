import React from 'react';
import { Trophy, ShieldCheck, RefreshCw, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { fullName } from '@/src/domain/entities';

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

  // Azul do header da tela de treinadores
  const trainerBlue = '#0284C7';
  const trainerBlueDark = '#0369a1'; // tom mais escuro para gradiente

  // Nome completo do treinador
  const trainerName = fullName(trainer) || trainer.email?.split('@')[0] || 'Treinador';
  const trainerInitial = trainerName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden cursor-pointer"
      onClick={() => onViewProfile?.(trainer)}
      style={{
        background: `linear-gradient(145deg, color-mix(in srgb, ${trainerBlue} 8%, #1a1a1a) 0%, #151515 60%)`,
        border: `1px solid color-mix(in srgb, ${trainerBlue} 30%, transparent)`,
      }}
    >
      {/* Top accent stripe */}
      <div className="h-1 w-full" style={{ background: trainerBlue }} />

      <div className="p-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl font-bold">
              {trainerInitial}
            </div>
            {showDistance && (
              <div className="absolute -bottom-1 -right-1 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-lg"
                style={{ backgroundColor: trainerBlue }}
              >
                {trainer.distance}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-base text-white leading-snug truncate">
                  {trainerName}
                </h4>
                {trainer.studentsCount && (
                  <p className="text-[10px] text-white/40 mt-0.5">
                    {trainer.studentsCount} alunos
                  </p>
                )}
              </div>
              
              {/* Rating badge */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${trainerBlue} 15%, transparent)` }}
              >
                <Trophy size={12} className="text-white/80" />
                <span className="text-[10px] font-bold text-white">5.0</span>
              </div>
            </div>

            {/* Status / Action button */}
            <div className="mt-3">
              {isConnected ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl w-fit"
                  style={{ backgroundColor: `color-mix(in srgb, ${trainerBlue} 20%, transparent)` }}
                >
                  <ShieldCheck size={14} className="text-white/80" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/80">
                    Conectado
                  </span>
                </div>
              ) : isPending ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 w-fit">
                  <RefreshCw size={14} className="text-amber-400 animate-spin-slow" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400">
                    Solicitado
                  </span>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnect(trainer.personalCode);
                  }}
                  className="px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest text-white transition-all flex items-center gap-1.5"
                  style={{ 
                    backgroundColor: `color-mix(in srgb, ${trainerBlue} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${trainerBlue} 30%, transparent)`
                  }}
                >
                  <UserPlus size={12} />
                  Conectar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
