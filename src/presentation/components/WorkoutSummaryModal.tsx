import { Trophy, Share2, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutSession, UserStats, ProgressionAlert, StagnationReport } from '../../domain/entities';
import { ProgressBar } from './ProgressBar';
import { cn } from '../../utils/cn';

interface WorkoutSummaryModalProps {
  session: WorkoutSession | null;
  userStats: UserStats;
  progressionAlerts: ProgressionAlert[];
  stagnationReports: StagnationReport[];
  onClose: () => void;
}

export function WorkoutSummaryModal({
  session,
  userStats,
  progressionAlerts,
  stagnationReports,
  onClose,
}: WorkoutSummaryModalProps) {
  return (
    <AnimatePresence>
      {session && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="relative w-full max-h-[90vh] overflow-y-auto no-scrollbar bg-dark-card border border-brand-red/30 rounded-[40px] p-8 shadow-2xl text-center space-y-8"
          >
            <div className="absolute top-0 left-0 w-full h-32 red-gradient opacity-10 blur-3xl -translate-y-1/2" />

            <div className="space-y-4 relative">
              <div className="w-24 h-24 red-gradient rounded-full flex items-center justify-center mx-auto shadow-lg shadow-brand-red/20">
                <Trophy size={48} color="currentColor" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-display font-bold red-text-gradient">Treino Concluído!</h2>
                <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">Você superou seus limites hoje</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
                <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Volume</p>
                <p className="text-xl font-display font-bold text-brand-red">
                  {session.totalVolume} <span className="text-[10px] font-sans text-white/40">kg</span>
                </p>
              </div>
              <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
                <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Duração</p>
                <p className="text-xl font-display font-bold text-brand-red">
                  {Math.floor((session.duration || 0) / 60)} <span className="text-[10px] font-sans text-white/40">min</span>
                </p>
              </div>
              <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
                <p className="text-[10px] text-white/40 font-bold uppercase mb-1">Calorias</p>
                <p className="text-xl font-display font-bold text-orange-400">
                  {session.caloriesBurned || 0} <span className="text-[10px] font-sans text-white/40">kcal</span>
                </p>
              </div>
            </div>

            <div className="bg-brand-red/10 rounded-3xl p-6 border border-brand-red/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-brand-red uppercase tracking-widest">Recompensa</span>
                <span className="text-lg font-display font-bold text-brand-red">+{session.xpEarned} XP</span>
              </div>
              <ProgressBar progress={userStats.xp} max={1000} className="h-2" />
              <p className="text-[10px] text-brand-red/60 font-bold uppercase tracking-widest mt-2">
                Próximo Nível em {1000 - userStats.xp} XP
              </p>
            </div>

            {progressionAlerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 text-left px-2">Evolução</h3>
                {progressionAlerts.map((alert, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl p-4 text-left"
                  >
                    <span className="text-2xl">{alert.icon}</span>
                    <div>
                      <h4 className={cn('font-bold text-sm', alert.color)}>{alert.title}</h4>
                      <p className="text-xs text-white/40 font-medium">{alert.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {stagnationReports.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/20 text-left px-2">Insights Inteligentes</h3>
                {stagnationReports.map((report, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="bg-white/5 border border-white/5 rounded-2xl p-4 text-left space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{report.exerciseName}</h4>
                        <p className={cn(
                          'text-[10px] font-bold uppercase tracking-widest',
                          report.level === 'severa' ? 'text-brand-red' : 'text-orange-400',
                        )}>
                          Estagnação {report.level}
                        </p>
                      </div>
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        report.level === 'severa' ? 'bg-brand-red/10 text-brand-red' : 'bg-orange-400/10 text-orange-400',
                      )}>
                        <HelpCircle size={16} />
                      </div>
                    </div>
                    <p className="text-xs text-white/40 font-medium">
                      Motivo: {report.type} ({report.sessionsCount} sessões)
                    </p>
                    <div className={cn(
                      'rounded-xl p-3 border',
                      report.level === 'severa' ? 'bg-brand-red/10 border-brand-red/20' : 'bg-orange-400/10 border-orange-400/20',
                    )}>
                      <p className={cn(
                        'text-[10px] font-bold uppercase tracking-widest mb-1',
                        report.level === 'severa' ? 'text-brand-red' : 'text-orange-400',
                      )}>
                        Sugestão Shape Express
                      </p>
                      <p className={cn(
                        'text-xs font-medium',
                        report.level === 'severa' ? 'text-brand-red/80' : 'text-orange-400/80',
                      )}>
                        {report.suggestion}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-5 bg-white/5 rounded-3xl font-bold hover:bg-white/10 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Meu Treino no Shape Express',
                      text: `Acabei de treinar! Volume: ${session.totalVolume}kg, Duração: ${Math.floor((session.duration || 0) / 60)}min. #ShapeExpress #Fitness`,
                      url: window.location.href,
                    }).catch(console.error);
                  }
                }}
                className="flex-1 py-5 red-gradient text-black rounded-3xl font-bold shadow-xl shadow-brand-red/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Share2 size={20} />
                Compartilhar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
