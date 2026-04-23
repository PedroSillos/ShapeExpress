import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dumbbell, 
  Plus, 
  Flame, 
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
  Zap,
  History,
  RefreshCw
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
  const [swipeDirection, setSwipeDirection] = useState(0);
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

  const [restTimers, setRestTimers] = useState<Record<string, { remaining: number, total: number }>>({});

  if (!activeExercise) {
    return (
      <div className="fixed inset-0 bg-dark-surface z-[100] flex flex-col items-center justify-center p-6 text-center">
        <Dumbbell size={48} className="text-white/10 mb-4" />
        <h2 className="text-xl font-bold mb-2">Treino Vazio</h2>
        <p className="text-sm text-white/40 mb-6">Este treino não possui exercícios configurados.</p>
        <button onClick={onCancel} className="px-8 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors">
          Voltar
        </button>
      </div>
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      let finishedTimer = false;
      setRestTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (next[id].remaining > 0) {
            const newRemaining = next[id].remaining - 1;
            if (newRemaining === 0) finishedTimer = true;
            next[id] = { ...next[id], remaining: newRemaining };
            changed = true;
          } else {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });

      if (finishedTimer) {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

      const restTime = parseRestTime(set.rest || '1 min');
      
      setRestTimers(prev => ({
        ...prev,
        [set.id]: { remaining: restTime, total: restTime }
      }));
    } else if (wasCompleted && updates.completed === false) {
      setRestTimers(prev => {
        const next = { ...prev };
        delete next[set.id];
        return next;
      });
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

  const handleExerciseSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && activeExerciseIndex < session.exercises.length - 1) {
      setSwipeDirection(1);
      setActiveExerciseIndex(activeExerciseIndex + 1);
    } else if (direction === 'right' && activeExerciseIndex > 0) {
      setSwipeDirection(-1);
      setActiveExerciseIndex(activeExerciseIndex - 1);
    }
  };

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
          key={activeExerciseIndex}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            const threshold = 50;
            if (info.offset.x < -threshold) handleExerciseSwipe('left');
            else if (info.offset.x > threshold) handleExerciseSwipe('right');
          }}
          initial={{ opacity: 0, x: swipeDirection * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -swipeDirection * 50 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto p-6 space-y-6 touch-pan-y no-scrollbar"
        >
          {/* Progress Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {(session.exercises || []).map((ex, i) => (
            <button 
              key={ex.id}
              onClick={() => setActiveExerciseIndex(i)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors",
                i === activeExerciseIndex ? "bg-brand-red text-black" : "bg-white/5 text-white/40"
              )}
            >
              {EXERCISES.find(e => e.id === ex.exerciseId)?.name}
            </button>
          ))}
        </div>

        {activeExercise ? (
          <>
            {/* Exercise Header */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-brand-red/20 text-brand-red">{exerciseDetails?.muscleGroup}</Badge>
                    {exerciseDetails?.youtubeUrl && (
                      <button 
                        onClick={() => setShowVideoModal(true)}
                        className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-full text-[10px] font-bold text-red-500 hover:bg-red-500/20 transition-colors"
                      >
                        <Play size={10} fill="currentColor" />
                        Ver Vídeo
                      </button>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold">{exerciseDetails?.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40 font-bold uppercase">Volume Exercício</p>
                  <p className="text-lg font-bold">
                    {(activeExercise.sets || []).reduce((acc, s) => acc + (s.completed ? s.reps * s.weight : 0), 0)} kg
                  </p>
                </div>
              </div>
            </div>

            {/* Exercise History Mini Dashboard */}
            <ExerciseHistoryDashboard 
              exerciseId={activeExercise.exerciseId} 
              sessions={sessions} 
            />

            {/* Sets Table */}
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <div className="col-span-1">#</div>
                <div className="col-span-3 text-center">Peso (kg)</div>
                <div className="col-span-3 text-center">Reps</div>
                <div className="col-span-4 text-center">Status</div>
                <div className="col-span-1 text-right"></div>
              </div>

              {(activeExercise.sets || []).map((set, i) => {
            const timer = restTimers[set.id];
            const progress = timer ? ((timer.total - timer.remaining) / timer.total) * 100 : 0;
            
            return (
              <div key={set.id} className="relative overflow-hidden rounded-2xl border border-white/5">
                {/* Progress Fill Background */}
                {timer && (
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    className="absolute inset-0 bg-brand-red/10 origin-left z-0"
                    transition={{ duration: 1, ease: "linear" }}
                  />
                )}
                <div className={cn("relative z-10 grid grid-cols-12 gap-2 items-center p-4 transition-colors", set.completed ? "bg-brand-red/10" : "bg-white/5")}>
                  <div className="col-span-1 font-bold text-white/40">{i + 1}</div>
                  <div className="col-span-3 flex justify-center">
                    <div className="relative w-full max-w-[85px]">
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                        <Scale size={12} />
                      </div>
                      <input 
                        type="number" 
                        value={set.weight || ''} 
                        onChange={(e) => updateSet(i, { weight: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-8 pr-2 text-center font-bold text-sm text-white focus:outline-none focus:border-gray-400 transition-all appearance-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <div className="relative w-full max-w-[85px]">
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                        <User size={12} />
                      </div>
                      <input 
                        type="number" 
                        value={set.reps || ''} 
                        onChange={(e) => updateSet(i, { reps: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-8 pr-2 text-center font-bold text-sm text-white focus:outline-none focus:border-gray-400 transition-all appearance-none"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="col-span-4 flex items-center justify-center gap-3">
                    {timer ? (
                      <div className="flex items-center gap-1 text-brand-red font-mono text-xs font-bold bg-brand-red/10 px-2 py-1 rounded-lg border border-brand-red/20 animate-pulse">
                        <Clock size={12} />
                        <span>{timer.remaining}s</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-white/20 font-mono text-[10px] font-bold">
                        <Clock size={10} />
                        <span>{set.rest || '1 min'}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => updateSet(i, { completed: !set.completed })}
                      className={cn("p-1 rounded-lg transition-colors", set.completed ? "text-brand-red" : "text-white/30 hover:text-white/50")}
                    >
                      <CheckCircle2 size={26} fill={set.completed ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button 
                      onClick={() => deleteSet(i)}
                      className="p-1 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button 
            onClick={addSet}
            className="w-full py-4 border border-dashed border-dark-border rounded-2xl text-white/40 font-bold flex items-center justify-center gap-2 hover:bg-white/5"
          >
            <Plus size={20} /> Adicionar Série
          </button>
        </div>

        {/* History Preview */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 text-white/40">
            <History size={16} />
            <h4 className="text-[10px] font-bold uppercase tracking-widest">Histórico Recente</h4>
          </div>
          <div className="space-y-2">
            {sessions
              .filter(s => s.exercises.some(ex => ex.exerciseId === activeExercise.exerciseId))
              .slice(0, 3)
              .map(s => {
                const exSession = s.exercises.find(ex => ex.exerciseId === activeExercise.exerciseId);
                if (!exSession) return null;
                const totalVol = exSession.sets.reduce((acc, set) => acc + (set.completed ? set.reps * set.weight : 0), 0);
                return (
                  <div key={s.id} className="flex justify-between items-center text-xs p-3 bg-white/2 rounded-xl border border-white/5">
                    <span className="text-white/40">{format(parseISO(s.date), 'dd/MM/yyyy')}</span>
                    <span className="font-bold">{exSession.sets.length} séries • {exSession.sets[0]?.weight || 0} kg</span>
                    <span className="text-brand-red font-bold">{totalVol} kg</span>
                  </div>
                );
              })}
            {sessions.filter(s => s.exercises.some(ex => ex.exerciseId === activeExercise.exerciseId)).length === 0 && (
              <p className="text-xs text-white/20 italic text-center py-2">Nenhum histórico encontrado para este exercício.</p>
            )}
          </div>
        </div>

        {/* Substitutions */}
        {currentConfig?.substitutions && currentConfig.substitutions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-white/40">
              <RefreshCw size={16} />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Substituições</h4>
            </div>
            <div className="space-y-2">
              {[currentConfig.exerciseId, ...currentConfig.substitutions]
                .filter(id => id !== activeExercise.exerciseId)
                .map((subId, idx) => {
                const subEx = EXERCISES.find(e => e.id === subId);
                if (!subEx) return null;
                return (
                  <div key={idx} className="flex items-center justify-between bg-dark-card border border-dark-border rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                        <Dumbbell size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{subEx.name}</p>
                        <p className="text-xs text-white/40">{subEx.muscleGroup}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSwapExercise(subId)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors"
                    >
                      Substituir
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/10">
            <Zap size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold">Nenhum exercício</h3>
            <p className="text-xs text-white/40">Esta sessão não possui exercícios configurados.</p>
          </div>
        </div>
      )}
    </motion.div>
    </AnimatePresence>

      {/* Footer Summary */}
      <div className="p-6 glass border-t border-white/10 flex justify-between items-center">
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase">Volume Total Sessão</p>
          <p className="text-xl font-bold">{currentVolume} kg</p>
        </div>
        <div className="flex gap-2">
          <button 
            disabled={activeExerciseIndex === 0}
            onClick={() => setActiveExerciseIndex(prev => prev - 1)}
            className="p-3 bg-white/5 rounded-xl disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </button>
          {activeExerciseIndex === session.exercises.length - 1 ? (
            <button 
              onClick={() => setShowConfirmFinish(true)}
              className="px-6 py-3 bg-brand-red text-black text-xs font-bold rounded-xl shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
            >
              Finalizar
            </button>
          ) : (
            <button 
              onClick={() => setActiveExerciseIndex(prev => prev + 1)}
              className="p-3 bg-white/5 rounded-xl"
            >
              <ChevronRight size={20} />
            </button>
          )}
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
