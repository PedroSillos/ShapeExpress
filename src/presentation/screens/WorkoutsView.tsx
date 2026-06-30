import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Dumbbell, 
  Settings, 
  Edit, 
  Trash2, 
  Clock, 
  Flame,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  WorkoutTemplate, 
  WorkoutSession, 
  UserTrainingProfile, 
  ExerciseUserStats, 
  UserCalorieProfile, 
  BodyAssessment, 
  UserProfile,
  WorkoutSheet
} from '../../domain/entities';
import { 
  estimateWorkoutDuration, 
  estimateWorkoutCalories 
} from '../../domain/use-cases/workoutEstimation';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { cn } from '../../utils/cn';
import { EXERCISES } from '../../constants';

export function WorkoutsView({ 
  templates, 
  sessions, 
  onStartWorkout, 
  onCreateWorkout, 
  onEditWorkout, 
  onDeleteWorkout, 
  onGoToStore, 
  onEditSession, 
  onDeleteSession, 
  scrollToHistory, 
  onScrollHandled,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile,
  trainers = [],
  onCreateAd
}: { 
  templates: WorkoutTemplate[], 
  sessions: WorkoutSession[], 
  onStartWorkout: (t: WorkoutTemplate, sheetIndex?: number) => void, 
  onCreateWorkout: () => void, 
  onEditWorkout: (t: WorkoutTemplate) => void, 
  onDeleteWorkout: (id: string) => void, 
  onGoToStore: () => void, 
  onEditSession: (s: WorkoutSession) => void, 
  onDeleteSession: (id: string) => void, 
  onCreateAd?: (t: WorkoutTemplate) => void,
  scrollToHistory?: boolean, 
  onScrollHandled?: () => void,
  userProfile: UserTrainingProfile,
  exerciseStats: ExerciseUserStats[],
  calorieProfile: UserCalorieProfile,
  assessments: BodyAssessment[],
  mainUserProfile: UserProfile,
  trainers?: UserProfile[]
}) {
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
  const [selectingSheetTemplate, setSelectingSheetTemplate] = useState<WorkoutTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToHistory && historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth' });
      onScrollHandled?.();
    }
  }, [scrollToHistory, onScrollHandled]);

  // Draft recovery logic
  useEffect(() => {
    const savedDraft = localStorage.getItem('workout_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Only ask if there's actual progress
        if (draft.protocolName || (draft.cycles && draft.cycles.length > 0) || (draft.sheets && draft.sheets[0] && draft.sheets[0].exerciseIds && draft.sheets[0].exerciseIds.length > 0)) {
          if (confirm('Você tem um rascunho de treino não finalizado. Deseja continuar de onde parou?')) {
            onCreateWorkout(); // This will trigger the CreateWorkoutView which has its own draft loading logic
          } else {
            localStorage.removeItem('workout_draft');
          }
        }
      } catch (e) {
        console.error('Error checking draft', e);
      }
    }
  }, [onCreateWorkout]);

  return (
    <div className="space-y-6 pb-20 pt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Treinos</h2>
        <button onClick={onCreateWorkout} className="p-2 bg-brand-red/10 text-brand-red rounded-full"><Plus size={20} /></button>
      </div>

      <div className="space-y-4">
        {templates.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/20">
              <Dumbbell size={32} />
            </div>
            <div>
              <p className="text-white/40 font-bold">Ainda não foram criados treinos</p>
              <p className="text-xs text-white/20">Crie seu primeiro treino para começar a evoluir.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onCreateWorkout}
                className="px-6 py-3 bg-brand-red/10 text-brand-red rounded-xl font-bold text-sm active:scale-95 transition-transform"
              >
                Criar Meu Primeiro Treino
              </button>
              <button 
                onClick={onGoToStore}
                className="px-6 py-3 bg-white/5 text-white/60 rounded-xl font-bold text-sm active:scale-95 transition-transform border border-white/5"
              >
                Adquirir Novo Treino
              </button>
            </div>
          </div>
        ) : (
          templates.map(template => {
            const getNextSheetInfo = (t: WorkoutTemplate) => {
              let sheets: WorkoutSheet[] = [];
              let cycleName = '';
              
              if (t.category === 'multicycle' && t.cycles) {
                const now = new Date();
                const currentCycle = t.cycles.find(c => {
                  const start = parseISO(c.startDate);
                  const end = parseISO(c.endDate);
                  return now >= start && now <= end;
                });
                if (currentCycle) {
                  sheets = currentCycle.sheets;
                  cycleName = currentCycle.name;
                }
              } else if (t.sheets) {
                sheets = t.sheets;
              }
              
              if (sheets.length === 0) return null;
              
              const workoutSessions = sessions.filter(s => s.workoutId === t.id);
              const nextIndex = workoutSessions.length % sheets.length;
              return {
                sheet: sheets[nextIndex],
                index: nextIndex,
                cycleName
              };
            };

            const nextSheetInfo = getNextSheetInfo(template);
            const hasSheets = template.sheets && template.sheets.length > 0;
            const totalExercises = template.category === 'multicycle'
              ? template.cycles?.reduce((acc, c) => acc + c.sheets.reduce((sAcc, s) => sAcc + (s.exerciseIds?.length || s.exercises?.length || 0), 0), 0)
              : template.sheets && template.sheets.length > 0
                ? template.sheets.reduce((acc, s) => acc + (s.exerciseIds?.length || s.exercises?.length || 0), 0)
                : (template.exerciseIds?.length || template.exercises?.length || 0);

            const trainer = template.creatorEmail && template.creatorEmail !== mainUserProfile.email 
              ? trainers.find(t => t.email === template.creatorEmail)
              : null;

            return (
              <Card key={template.id} className="group overflow-hidden relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{template.name}</h3>
                      <Badge className={cn(
                        "bg-white/5 text-white/40 border border-white/10",
                        template.category === 'multicycle' && "bg-brand-red/10 text-brand-red border-brand-red/20"
                      )}>
                        {template.category === 'multicycle' ? 'Multiciclo' : 'Básico'}
                      </Badge>
                    </div>
                    {trainer && (
                      <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider">
                        Criado por {trainer.name}
                      </p>
                    )}
                    <p className="text-[10px] text-white/20 font-bold uppercase">
                      {format(parseISO(template.startDate), 'dd/MM/yy')} - {format(parseISO(template.endDate), 'dd/MM/yy')}
                    </p>
                    <p className="text-xs text-white/40">
                      {template.category === 'multicycle'
                        ? `${template.cycles?.length || 0} Ciclos • `
                        : template.sheets && template.sheets.length > 0
                          ? `${template.sheets.length} ${template.sheets.length === 1 ? 'Ficha' : 'Fichas'} • `
                          : ''}
                      {totalExercises} {totalExercises === 1 ? 'Exercício' : 'Exercícios'}
                    </p>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={() => setOpenSettingsId(openSettingsId === template.id ? null : template.id)}
                      className="p-2 text-white/20 hover:text-white transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {openSettingsId === template.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenSettingsId(null)}
                          />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute right-0 top-10 w-32 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-20 overflow-hidden"
                          >
                            <button 
                              onClick={() => { onEditWorkout(template); setOpenSettingsId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold hover:bg-white/5 transition-colors"
                            >
                              <Edit size={14} /> Editar
                            </button>
                            <button 
                              onClick={() => { onDeleteWorkout(template.id); setOpenSettingsId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-400 hover:bg-white/5 transition-colors border-t border-dark-border"
                            >
                              <Trash2 size={14} /> Excluir
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                {nextSheetInfo && (
                  <div className="mb-4 p-4 bg-brand-red/5 rounded-2xl border border-brand-red/20 space-y-2 relative group/session">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Sessão de Hoje</p>
                      {nextSheetInfo.cycleName && (
                        <Badge className="bg-brand-red/10 text-brand-red border border-brand-red/20">{nextSheetInfo.cycleName}</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                          <Dumbbell size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{nextSheetInfo.sheet.name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-white/40 font-bold uppercase">{nextSheetInfo.sheet.exercises.length} exercícios</p>
                            <span className="text-white/10">•</span>
                            <p className="text-[10px] text-brand-red font-bold uppercase flex items-center gap-1">
                              <Clock size={10} />
                              {estimateWorkoutDuration(nextSheetInfo.sheet.exercises, userProfile, exerciseStats)} min
                            </p>
                            <span className="text-white/10">•</span>
                            <p className="text-[10px] text-orange-400 font-bold uppercase flex items-center gap-1">
                              <Flame size={10} />
                              {Math.round(estimateWorkoutCalories(
                                nextSheetInfo.sheet.exercises,
                                assessments.length > 0 ? assessments[0].weight : mainUserProfile?.initialWeight,
                                userProfile,
                                exerciseStats,
                                calorieProfile
                              ))} kcal
                            </p>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          if (template.category === 'multicycle') {
                            onStartWorkout(template, nextSheetInfo.index);
                          } else if (hasSheets && template.sheets!.length > 1) {
                            setSelectingSheetTemplate(template);
                          } else {
                            onStartWorkout(template, 0);
                          }
                        }}
                        className="p-3 bg-brand-red text-white rounded-xl shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
                      >
                        Começar
                      </button>
                    </div>
                  </div>
                )}
                {/* Basic template (no sheets): show a direct start button */}
                {!nextSheetInfo && !hasSheets && template.exercises && template.exercises.length > 0 && (
                  <button
                    onClick={() => onStartWorkout(template)}
                    className="w-full py-3 bg-brand-red rounded-2xl text-white font-bold text-sm shadow-[0_4px_0_0_rgba(150,10,10,0.5)] active:scale-95 transition-transform flex items-center justify-center gap-2 mb-1"
                  >
                    <Dumbbell size={16} />
                    Começar Treino
                  </button>
                )}

                {mainUserProfile.userType === 'treinador' && onCreateAd && (
                  <button
                    onClick={() => onCreateAd(template)}
                    className="w-full mt-4 py-3 bg-brand-red/10 text-brand-red border border-brand-red/20 rounded-xl font-bold text-sm hover:bg-brand-red/20 transition-colors active:scale-95"
                  >
                    Criar Anúncio na Loja
                  </button>
                )}
              </Card>
            );
          })
        )}
      </div>

      <div ref={historyRef} className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Histórico de Sessões</h2>
        </div>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-white/20 font-bold">Nenhuma sessão registrada</p>
            </div>
          ) : (
            sessions.slice().reverse().map(session => (
              <Card key={session.id} className="relative group">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                      {format(parseISO(session.date), 'EEEE, d MMMM', { locale: ptBR })}
                    </p>
                    <h3 className="font-bold">{templates.find(t => t.id === session.workoutId)?.name || 'Treino'}</h3>
                    <p className="text-xs text-white/40">
                      {session.duration} min • {session.totalVolume}kg total • {session.xpEarned} XP
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onEditSession(session)}
                      className="p-2 text-white/20 hover:text-white transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => onDeleteSession(session.id)}
                      className="p-2 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {session.exercises.slice(0, 4).map((ex, idx) => (
                    <div key={idx} className="text-[10px] text-white/40 flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-brand-red" />
                      {EXERCISES.find(e => e.id === ex.exerciseId)?.name || 'Exercício'}
                    </div>
                  ))}
                  {session.exercises.length > 4 && (
                    <div className="text-[10px] text-white/20 italic">
                      + {session.exercises.length - 4} outros
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Sheet Selector Modal */}
      <AnimatePresence>
        {selectingSheetTemplate && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectingSheetTemplate(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-dark-card border border-dark-border rounded-3xl p-6 z-[110] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Escolha o Treino</h3>
                <button onClick={() => setSelectingSheetTemplate(null)} className="p-2 text-white/20 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                {selectingSheetTemplate.sheets?.map((sheet, idx) => (
                  <button
                    key={sheet.id}
                    onClick={() => {
                      onStartWorkout(selectingSheetTemplate, idx);
                      setSelectingSheetTemplate(null);
                    }}
                    className="w-full p-4 bg-white/5 hover:bg-brand-red/10 border border-white/5 hover:border-brand-red/20 rounded-2xl text-left transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold group-hover:text-brand-red transition-colors">{sheet.name}</p>
                        <p className="text-xs text-white/40">{sheet.exercises.length} exercícios</p>
                      </div>
                      <ChevronRight size={18} className="text-white/20 group-hover:text-brand-red transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper components for the local scope if not globally available
// Since they are imported, we assume they are available.
// If needed, we can define them here or ensure they are exported from components.
