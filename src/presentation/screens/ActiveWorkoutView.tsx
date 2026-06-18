import React, { useState, useEffect, useMemo } from 'react';
import {
  Dumbbell,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Play,
  User,
  Scale,
  Trash2,
  Clock,
  TrendingUp,
  Award,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { 
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import { 
  WorkoutSession, 
  WorkoutTemplate, 
  UserTrainingProfile, 
  ExerciseUserStats, 
  UserCalorieProfile, 
  BodyAssessment, 
  UserProfile,
  WorkoutSet
} from '../../domain/entities';
import { estimateWorkoutDuration, estimateWorkoutCalories } from '../../domain/use-cases/workoutEstimation';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { cn } from '../../utils/cn';
import { getYouTubeEmbedUrl } from '../../utils/youtube';
import { EXERCISES } from '../../constants';

interface ActiveWorkoutViewProps {
  session: WorkoutSession;
  setSession: (s: WorkoutSession) => void;
  onFinish: (metrics: { avgSetDuration: number, avgRestDuration: number, totalDuration: number }) => void;
  onCancel: () => void;
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  isEditing?: boolean;
  userProfile: UserTrainingProfile;
  exerciseStats: ExerciseUserStats[];
  calorieProfile: UserCalorieProfile;
  assessments: BodyAssessment[];
  mainUserProfile: UserProfile;
}

export function ActiveWorkoutView({ 
  session, 
  setSession, 
  onFinish, 
  onCancel, 
  sessions, 
  templates, 
  isEditing,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile
}: ActiveWorkoutViewProps) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [restCountdown, setRestCountdown] = useState<number | null>(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const activeExercise = session.exercises && session.exercises.length > 0 ? session.exercises[activeExerciseIndex] : null;
  const exerciseDetails = activeExercise ? EXERCISES.find(e => e.id === activeExercise.exerciseId) : null;
  
  const [elapsedTime, setElapsedTime] = useState(session.duration || 0);
  const [lastActionTime, setLastActionTime] = useState(Date.now());
  const [sessionMetrics, setSessionMetrics] = useState({
    totalSetDuration: 0,
    setCount: 0,
    totalRestDuration: 0,
    restCount: 0
  });

  // Get template for estimation
  const template = templates.find(t => t.id === session.workoutId);
  const sheet = template?.sheets?.find(s => s.id === session.sheetId) || (template?.sheets ? template.sheets[0] : null);
  const currentConfig = sheet?.exercises[activeExerciseIndex] || null;
  
  const estimatedTotalMinutes = useMemo(() => {
    if (!sheet) return 0;
    return estimateWorkoutDuration(sheet.exercises, userProfile, exerciseStats);
  }, [sheet, userProfile, exerciseStats]);

  const remainingMinutes = useMemo(() => {
    const elapsedMinutes = elapsedTime / 60;
    return Math.max(0, Math.ceil(estimatedTotalMinutes - elapsedMinutes));
  }, [estimatedTotalMinutes, elapsedTime]);

  useEffect(() => {
    if (!session.startTime || isEditing) return;
    const start = new Date(session.startTime).getTime();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startTime, isEditing]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const [restTimers] = useState<Record<string, never>>({});

  useEffect(() => {
    if (restCountdown === null) return;
    if (restCountdown <= 0) { setRestCountdown(null); return; }
    const t = setTimeout(() => setRestCountdown(c => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
  }, [restCountdown]);


  const parseRestTime = (restStr: string, setIndex?: number): number => {
    if (!restStr) return 60;
    
    if (restStr.includes(',')) {
      const rests = restStr.split(',').map(s => s.trim());
      const specificRest = rests[setIndex ?? 0] || rests[0];
      return parseRestTime(specificRest);
    }

    const match = restStr.match(/(\d+)/);
    if (!match) return 60;
    
    if (restStr.includes(':')) {
      const parts = restStr.split(':');
      if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    }

    const val = parseInt(match[1]);
    if (restStr.includes('min')) return val * 60;
    return val;
  };

  const addSet = () => {
    const newExercises = [...session.exercises];
    const lastSet = activeExercise.sets[activeExercise.sets.length - 1];
    newExercises[activeExerciseIndex].sets.push({
      id: Date.now().toString(),
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
      completed: false,
      rest: lastSet?.rest || '1 min'
    });
    setSession({ ...session, exercises: newExercises });
  };

  const handleSwapExercise = (newExerciseId: string) => {
    const newExercises = [...session.exercises];
    newExercises[activeExerciseIndex] = {
      ...newExercises[activeExerciseIndex],
      exerciseId: newExerciseId,
      // Keep the same sets structure, but reset completion and weight
      sets: newExercises[activeExerciseIndex].sets.map(set => ({
        ...set,
        completed: false,
        weight: 0
      }))
    };
    setSession({ ...session, exercises: newExercises });
  };

  const updateSet = (setIndex: number, updates: Partial<WorkoutSet>) => {
    const newExercises = [...session.exercises];
    const set = newExercises[activeExerciseIndex].sets[setIndex];
    const wasCompleted = set.completed;
    
    newExercises[activeExerciseIndex].sets[setIndex] = {
      ...set,
      ...updates
    };

    if (!wasCompleted && updates.completed) {
      const now = Date.now();
      const setDuration = (now - lastActionTime) / 1000;
      setSessionMetrics(prev => ({
        ...prev,
        totalSetDuration: prev.totalSetDuration + setDuration,
        setCount: prev.setCount + 1
      }));
      setLastActionTime(now);
      setRestCountdown(parseRestTime(set.rest || '60s'));
    } else if (wasCompleted && updates.completed) {
      setLastActionTime(Date.now());
    }

    setSession({ ...session, exercises: newExercises });
  };

  const deleteSet = (setIndex: number) => {
    if (activeExercise.sets.length <= 1) return;
    const newExercises = [...session.exercises];
    newExercises[activeExerciseIndex].sets.splice(setIndex, 1);
    setSession({ ...session, exercises: newExercises });
  };

  const currentVolume = useMemo(() => {
    return session.exercises.reduce((acc, ex) => 
      acc + ex.sets.reduce((sAcc, s) => sAcc + (s.completed ? s.reps * s.weight : 0), 0), 0
    );
  }, [session]);

  const caloriesPerMinute = useMemo(() => {
    if (!sheet) return 0;
    const weightKg = assessments.length > 0 ? assessments[0].weight : mainUserProfile?.initialWeight;
    const totalEstimatedCalories = estimateWorkoutCalories(
      sheet.exercises,
      weightKg,
      userProfile,
      exerciseStats,
      calorieProfile
    );
    const totalEstimatedMinutes = estimateWorkoutDuration(sheet.exercises, userProfile, exerciseStats);
    return totalEstimatedMinutes > 0 ? totalEstimatedCalories / totalEstimatedMinutes : 0;
  }, [sheet, assessments, mainUserProfile, userProfile, exerciseStats, calorieProfile]);

  const currentCalories = useMemo(() => {
    return Math.floor(caloriesPerMinute * (elapsedTime / 60));
  }, [caloriesPerMinute, elapsedTime]);

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  // Build flat list of (exerciseIndex, setIndex) pairs
  const flatSteps = session.exercises.flatMap((ex, ei) =>
    ex.sets.map((_, si) => ({ ei, si }))
  );
  const currentStep = flatSteps.findIndex(s => s.ei === activeExerciseIndex && s.si === activeSetIndex);
  const isLastStep = currentStep === flatSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const goNext = () => {
    if (isLastStep) { setShowConfirmFinish(true); return; }
    const next = flatSteps[currentStep + 1];
    setSwipeDirection(1);
    setActiveExerciseIndex(next.ei);
    setActiveSetIndex(next.si);
  };

  const goPrev = () => {
    if (isFirstStep) return;
    const prev = flatSteps[currentStep - 1];
    setSwipeDirection(-1);
    setActiveExerciseIndex(prev.ei);
    setActiveSetIndex(prev.si);
  };

  if (!activeExercise) {
    return (
      <div className="fixed inset-0 bg-dark-surface z-[100] flex flex-col items-center justify-center p-6 text-center">
        <Dumbbell size={48} className="text-white/10 mb-4" />
        <h2 className="text-xl font-bold mb-2">Treino Vazio</h2>
        <p className="text-sm text-white/40 mb-6">Este treino não possui exercícios configurados.</p>
        <button onClick={onCancel} className="px-8 py-4 bg-white/5 rounded-2xl font-bold">Voltar</button>
      </div>
    );
  }

  if (restCountdown !== null && restCountdown > 0) {
    return (
      <div className="fixed inset-0 bg-dark-surface z-[100] flex flex-col items-center justify-center gap-8 p-6">
        <p className="text-white/40 font-bold uppercase tracking-widest text-sm">Descansando...</p>
        <div className="w-40 h-40 rounded-full border-4 border-brand-red/30 flex items-center justify-center">
          <span className="text-6xl font-black text-brand-red font-mono">{restCountdown}</span>
        </div>
        <p className="text-white/30 text-sm">segundos</p>
        <button
          onClick={() => setRestCountdown(null)}
          className="px-8 py-4 bg-white/5 rounded-2xl font-bold text-white/60 active:scale-95 transition-transform"
        >
          Pular descanso
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-dark-surface z-[100] flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-dark-border">
        <button onClick={() => isEditing ? onCancel() : setShowConfirmCancel(true)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
        <div className="text-center">
          <h2 className="font-bold">{isEditing ? 'Editar Treino' : 'Treinando Agora'}</h2>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 text-brand-red font-mono text-sm font-bold">
              <div className="flex items-center gap-1">
                <Play size={12} fill="currentColor" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
              {!isEditing && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame size={12} fill="currentColor" />
                  <span>{currentCalories} kcal</span>
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[8px] text-white/40 font-bold uppercase tracking-wider">
                  Est: {estimatedTotalMinutes}m
                </span>
                <span className="text-[8px] text-white/20">•</span>
                <span className="text-[8px] text-brand-red font-bold uppercase tracking-wider">
                  Faltam: {remainingMinutes}m
                </span>
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={() => {
            if (isEditing) {
              onFinish({
                avgSetDuration: sessionMetrics.setCount > 0 ? sessionMetrics.totalSetDuration / sessionMetrics.setCount : userProfile?.avg_set_duration,
                avgRestDuration: sessionMetrics.restCount > 0 ? sessionMetrics.totalRestDuration / sessionMetrics.restCount : userProfile?.avg_rest_duration,
                totalDuration: elapsedTime
              });
            } else {
              setShowConfirmFinish(true);
            }
          }} 
          className="px-4 py-2 bg-brand-red text-black text-xs font-bold rounded-full"
        >
          {isEditing ? 'Salvar' : 'Finalizar'}
        </button>
      </div>

      <AnimatePresence>
        {showConfirmCancel && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmCancel(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-dark-surface border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <Trash2 size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Descartar Treino?</h3>
                  <p className="text-white/40 text-sm">Tem certeza que deseja cancelar? Todo o progresso deste treino será perdido.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full pt-4">
                  <button 
                    onClick={() => setShowConfirmCancel(false)}
                    className="py-4 bg-white/5 border border-white/5 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={onCancel}
                    className="py-4 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showConfirmFinish && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmFinish(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-dark-surface border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-red" />
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Finalizar Treino?</h3>
                  <p className="text-white/40 text-sm">Você completou todos os exercícios de hoje? Seu progresso será salvo no histórico.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full pt-4">
                  <button 
                    onClick={() => setShowConfirmFinish(false)}
                    className="py-4 bg-white/5 border border-white/5 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={() => {
                      onFinish({
                        avgSetDuration: sessionMetrics.setCount > 0 ? sessionMetrics.totalSetDuration / sessionMetrics.setCount : userProfile?.avg_set_duration,
                        avgRestDuration: sessionMetrics.restCount > 0 ? sessionMetrics.totalRestDuration / sessionMetrics.restCount : userProfile?.avg_rest_duration,
                        totalDuration: elapsedTime
                      });
                      setShowConfirmFinish(false);
                    }}
                    className="py-4 bg-brand-red text-black rounded-2xl font-bold text-sm hover:bg-brand-red/90 transition-colors shadow-lg shadow-brand-red/20"
                  >
                    Finalizar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showVideoModal && exerciseDetails?.youtubeUrl && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVideoModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-dark-surface border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Execução: {exerciseDetails.name}</h3>
                <button onClick={() => setShowVideoModal(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              {getYouTubeEmbedUrl(exerciseDetails.youtubeUrl) ? (
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative">
                  <iframe 
                    src={getYouTubeEmbedUrl(exerciseDetails.youtubeUrl)!}
                    title={`Vídeo de execução: ${exerciseDetails.name}`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-sm text-white/40">Vídeo não disponível para incorporação.</p>
                  <a href={exerciseDetails.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-brand-red font-bold mt-2 block">Ver no YouTube</a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" custom={swipeDirection}>
        <motion.div 
          key={`${activeExerciseIndex}-${activeSetIndex}`}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x < -50) goNext();
            else if (info.offset.x > 50) goPrev();
          }}
          initial={{ opacity: 0, x: swipeDirection * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -swipeDirection * 50 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-6 space-y-6 touch-pan-y no-scrollbar"
        >
          {/* Exercise tabs — indicator only */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {(session.exercises || []).map((ex, i) => (
              <button
                key={ex.id}
                onClick={() => { setActiveExerciseIndex(i); setActiveSetIndex(0); }}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors',
                  i === activeExerciseIndex ? 'bg-brand-red text-black' : 'bg-white/5 text-white/40'
                )}
              >
                {EXERCISES.find(e => e.id === ex.exerciseId)?.name}
              </button>
            ))}
          </div>

          {activeExercise ? (
            <>
              {/* Exercise header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {exerciseDetails?.youtubeUrl && (
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-bold text-red-500"
                    >
                      <Play size={12} fill="currentColor" />
                      Ver Vídeo
                    </button>
                  )}
                  <Badge className="bg-brand-red/20 text-brand-red text-[10px] px-2 py-0.5">{exerciseDetails?.muscleGroup}</Badge>
                </div>
                <div className="flex justify-between items-end">
                  <h3 className="text-2xl font-bold">{exerciseDetails?.name}</h3>
                  <span className="text-white/40 font-bold text-sm">
                    Série {activeSetIndex + 1}/{activeExercise.sets.length}
                  </span>
                </div>
              </div>

              {/* Single set */}
              {(() => {
                const set = activeExercise.sets[activeSetIndex];
                if (!set) return null;
                return (
                  <div className="rounded-2xl border border-white/5 overflow-hidden">
                    <div className={cn('relative z-10 p-6 space-y-4', set.completed ? 'bg-brand-red/10' : 'bg-white/5')}>
                      <div className="space-y-2">
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">Peso (kg)</p>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><Scale size={14} /></div>
                          <input type="number" value={set.weight || ''} onChange={(e) => updateSet(activeSetIndex, { weight: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-9 pr-3 text-center font-bold text-xl text-white focus:outline-none focus:border-gray-400 appearance-none" placeholder="0" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">Repetições</p>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"><User size={14} /></div>
                          <input type="number" value={set.reps || ''} onChange={(e) => updateSet(activeSetIndex, { reps: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-9 pr-3 text-center font-bold text-xl text-white focus:outline-none focus:border-gray-400 appearance-none" placeholder="0" />
                        </div>
                      </div>
                      <button onClick={() => updateSet(activeSetIndex, { completed: !set.completed })} className={cn('w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-colors', set.completed ? 'bg-brand-red text-black' : 'bg-white/10 text-white/60')}>
                        <CheckCircle2 size={18} fill={set.completed ? 'currentColor' : 'none'} />
                        {set.completed ? 'Série Concluída' : 'Concluir Série'}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* History */}
              <ExerciseHistoryDashboard exerciseId={activeExercise.exerciseId} sessions={sessions} />
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="p-6 glass border-t border-white/10 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase">Volume Total</p>
          <p className="text-xl font-bold">{currentVolume} kg</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30 font-bold">{currentStep + 1}/{totalSets}</span>
          <button
            disabled={isFirstStep}
            onClick={goPrev}
            className="p-3 bg-white/5 rounded-xl disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goNext}
            className={cn(
              'p-3 rounded-xl font-bold',
              isLastStep ? 'bg-brand-red text-black px-5 text-xs' : 'bg-white/5'
            )}
          >
            {isLastStep ? 'Finalizar' : <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExerciseHistoryDashboard({ exerciseId, sessions }: { exerciseId: string, sessions: WorkoutSession[] }) {
  const historyData = useMemo(() => {
    const data: { date: string, volume: number, maxWeight: number }[] = [];
    
    sessions.forEach(s => {
      const exSession = s.exercises.find(ex => ex.exerciseId === exerciseId);
      if (exSession) {
        let volume = 0;
        let maxWeight = 0;
        exSession.sets.forEach(set => {
          if (set.completed) {
            volume += set.weight * set.reps;
            if (set.weight > maxWeight) maxWeight = set.weight;
          }
        });
        
        if (volume > 0) {
          data.push({
            date: format(parseISO(s.date), 'dd/MM'),
            volume,
            maxWeight
          });
        }
      }
    });
    
    return data.reverse().slice(-5);
  }, [exerciseId, sessions]);

  if (historyData.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-3 space-y-2 h-32">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Volume (kg)</p>
          <TrendingUp size={12} className="text-brand-red" />
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData}>
              <Bar dataKey="volume" fill="#E53E3E" radius={[2, 2, 0, 0]} />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-dark-surface border border-white/10 p-2 rounded-lg text-[10px] shadow-xl">
                        <p className="font-bold text-brand-red">{payload[0].value} kg</p>
                        <p className="text-white/40">{payload[0].payload.date}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-3 space-y-2 h-32">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Carga Máx (kg)</p>
          <Award size={12} className="text-blue-400" />
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData}>
              <Bar dataKey="maxWeight" fill="#60A5FA" radius={[2, 2, 0, 0]} />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-dark-surface border border-white/10 p-2 rounded-lg text-[10px] shadow-xl">
                        <p className="font-bold text-blue-400">{payload[0].value} kg</p>
                        <p className="text-white/40">{payload[0].payload.date}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
