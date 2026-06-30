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
  Square,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { 
  WorkoutSession, 
  WorkoutTemplate, 
  UserTrainingProfile, 
  ExerciseUserStats, 
  UserProfile,
  WorkoutSet
} from '../../domain/entities';
import { getInputMode, isSetReadyToComplete } from '../../domain/use-cases/exerciseInputMode';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { ProgressBar } from '../components/ProgressBar';
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
  mainUserProfile: UserProfile;
}

function StepperButton({ label, onStep }: { label: string; onStep: () => void }) {
  const callbackRef = React.useRef(onStep);
  React.useEffect(() => { callbackRef.current = onStep; });

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const iterRef = React.useRef(0);
  const isTouchRef = React.useRef(false);

  const stop = () => { if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; } };

  const fire = () => {
    callbackRef.current();
    iterRef.current = 0;
    const schedule = () => {
      iterRef.current++;
      const delay = Math.max(80, 500 - iterRef.current * 40);
      timeoutRef.current = setTimeout(() => { callbackRef.current(); schedule(); }, delay);
    };
    timeoutRef.current = setTimeout(schedule, 500);
  };

  return (
    <button
      onTouchStart={(e) => { e.preventDefault(); isTouchRef.current = true; fire(); }}
      onTouchEnd={stop}
      onMouseDown={(e) => { if (isTouchRef.current) { isTouchRef.current = false; return; } e.preventDefault(); fire(); }}
      onMouseUp={stop} onMouseLeave={stop}
      onClick={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      className="p-3 bg-black/40 border border-white/10 rounded-xl text-white/60 font-bold text-lg active:scale-95 transition-transform shrink-0 select-none"
    >
      {label}
    </button>
  );
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
  mainUserProfile
}: ActiveWorkoutViewProps) {
  const sessionRef = React.useRef(session);
  React.useEffect(() => { sessionRef.current = session; }, [session]);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [restCountdown, setRestCountdown] = useState<number | null>(null);
  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showConfirmDeleteSet, setShowConfirmDeleteSet] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop timer whenever active set changes
  React.useEffect(() => {
    setTimerRunning(false);
    setTimerRemaining(null);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, [activeExerciseIndex, activeSetIndex]);

  // Countdown interval
  React.useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            setTimerRunning(false);
            // auto-complete the set
            updateSet(activeSetIndex, { completed: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [timerRunning]);
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


  useEffect(() => {
    if (!session.startTime || isEditing) return;
    const start = new Date(session.startTime).getTime();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startTime, isEditing]);



  useEffect(() => {
    if (restCountdown === null) return;
    if (restCountdown <= 0) { setRestCountdown(null); goNext(); return; }
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
    const inputMode = getInputMode(exerciseDetails ?? { inputMode: undefined } as any);
    const isDuration = inputMode === 'duration_distance' || inputMode === 'duration_only';
    newExercises[activeExerciseIndex].sets.push({
      id: Date.now().toString(),
      reps: isDuration ? 0 : (lastSet?.reps || 10),
      weight: isDuration || inputMode === 'reps_only' ? 0 : (lastSet?.weight || 0),
      completed: false,
      rest: lastSet?.rest || '1 min',
      ...(isDuration ? { durationSeconds: lastSet?.durationSeconds || 0 } : {}),
      ...(inputMode === 'duration_distance' ? { distanceMeters: lastSet?.distanceMeters } : {}),
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
    const newExercises = [...sessionRef.current.exercises];
    const set = newExercises[activeExerciseIndex].sets[setIndex];
    const wasCompleted = set.completed;

    // If user changes weight or reps on a completed set, uncheck it
    const isValueChange = ('weight' in updates || 'reps' in updates) && wasCompleted;

    newExercises[activeExerciseIndex].sets[setIndex] = {
      ...set,
      ...updates,
      ...(isValueChange ? { completed: false, corrected: true } : {}),
      ...(updates.completed ? { corrected: false } : {}),
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
      if (!set.corrected) {
        if (isLastStep) {
          setShowConfirmFinish(true);
        } else {
          setRestCountdown(parseRestTime(set.rest || '60s'));
        }
      }
    } else if (wasCompleted && updates.completed) {
      setLastActionTime(Date.now());
    }

    setSession({ ...sessionRef.current, exercises: newExercises });
  };

  const deleteSet = (setIndex: number) => {
    if (activeExercise.sets.length <= 1) return;
    const newExercises = [...session.exercises];
    newExercises[activeExerciseIndex].sets.splice(setIndex, 1);
    const remainingSets = newExercises[activeExerciseIndex].sets;
    const nextIncomplete = remainingSets.findIndex((s, i) => i >= setIndex && !s.completed && !s.corrected);
    const target = nextIncomplete !== -1 ? nextIncomplete : Math.max(0, setIndex - 1);
    // Update session first, then navigate — React 19 batches these so target render happens once
    setSession({ ...session, exercises: newExercises });
    setActiveSetIndex(target);
  };


  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = session.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);

  // Build flat list of (exerciseIndex, setIndex) pairs
  const flatSteps = session.exercises.flatMap((ex, ei) =>
    ex.sets.map((_, si) => ({ ei, si }))
  );
  const currentStep = flatSteps.findIndex(s => s.ei === activeExerciseIndex && s.si === activeSetIndex);
  const isLastStep = currentStep === flatSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const currentExerciseAllSetsDone = activeExercise?.sets.every(s => s.completed || s.corrected) ?? false;

  const currentSetNavigable = !!(activeExercise?.sets[activeSetIndex]?.completed || activeExercise?.sets[activeSetIndex]?.corrected);

  const goNext = () => {
    if (!currentSetNavigable) return;
    if (isLastStep) { setShowConfirmFinish(true); return; }
    const next = flatSteps[currentStep + 1];
    if (next.ei !== activeExerciseIndex && !currentExerciseAllSetsDone) return;
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
        <h2 className="text-xl font-bold mb-2">Treino vazio</h2>
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
        <button
          onClick={() => { setRestCountdown(null); goNext(); }}
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
      <div className="px-6 pt-6 pb-4 flex items-center gap-4">
        <button onClick={() => isEditing ? onCancel() : setShowConfirmCancel(true)} className="p-2 bg-white/5 rounded-full shrink-0"><X size={20} /></button>
        {(() => {
          const ratio = totalSets > 0 ? completedSets / totalSets : 0;
          const t = completedSets === 0 ? 0 : 0.5 + ratio * 0.5;
          const color = t === 0
            ? 'rgba(255,255,255,0.4)'
            : `rgb(${Math.round(255 + t * (220 - 255))},${Math.round(255 + t * (38 - 255))},${Math.round(255 + t * (38 - 255))})`;
          return <ProgressBar progress={15 + ratio * 85} max={100} className="h-3" color={color} />;
        })()}
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
                  <h3 className="text-xl font-bold">Descartar treino?</h3>
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

        {showConfirmDeleteSet && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmDeleteSet(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-dark-surface border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500"><Trash2 size={32} /></div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Remover série?</h3>
                  <p className="text-white/40 text-sm">Esta série será removida do treino.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full pt-4">
                  <button onClick={() => setShowConfirmDeleteSet(false)} className="py-4 bg-white/5 border border-white/5 rounded-2xl font-bold text-sm">Cancelar</button>
                  <button onClick={() => { deleteSet(activeSetIndex); setShowConfirmDeleteSet(false); }} className="py-4 bg-red-500 text-white rounded-2xl font-bold text-sm">Remover</button>
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
                  <h3 className="text-xl font-bold">Finalizar treino?</h3>
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

        {showVideoModal && exerciseDetails && (
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
          className="flex-1 overflow-y-auto px-6 pt-2 pb-6 space-y-3 touch-pan-y no-scrollbar"
        >
          {activeExercise ? (
            <>
              {/* Tabs + info card — physically connected */}
              <div>
                <div className="flex items-start gap-2 overflow-x-auto no-scrollbar" style={{overflowY: 'visible'}}>
                  {(session.exercises || []).map((ex, i) => {
                    const isUnlocked = i === 0 || session.exercises[i - 1].sets.every(s => s.completed || s.corrected);
                    return (
                      <button
                        key={ex.id}
                        onClick={() => { if (isUnlocked) { setActiveExerciseIndex(i); setActiveSetIndex(0); } }}
                        className={cn(
                          'px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors',
                          i === activeExerciseIndex ? 'bg-brand-red text-black' : isUnlocked ? 'bg-white/5 text-white/40' : 'bg-white/5 text-white/20 opacity-40'
                        )}
                      >
                        {EXERCISES.find(e => e.id === ex.exerciseId)?.name}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 rounded-2xl bg-white/5 border border-white/5 px-4 pt-2 pb-3 space-y-2">
                  <button
                    onClick={() => {
                      if (exerciseDetails?.youtubeUrl) {
                        setShowVideoModal(true);
                      } else {
                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent((exerciseDetails?.name ?? '') + ' como fazer exercício')}`, '_blank');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-bold text-white/60"
                  >
                    <Play size={14} fill="currentColor" />
                    Ver vídeo
                  </button>
                  <div className="flex gap-2">
                    <Badge className="bg-black/40 text-white/60 text-xs px-3 py-1 rounded-full font-bold">{exerciseDetails?.muscleGroup}</Badge>
                    {exerciseDetails?.muscleSubgroup && (
                      <Badge className="bg-black/40 text-white/60 text-xs px-3 py-1 rounded-full font-bold">{exerciseDetails?.muscleSubgroup}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Series sub-tabs */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {activeExercise.sets.map((set, si) => {
                  const isUnlocked = si === 0 || activeExercise.sets[si - 1].completed || activeExercise.sets[si - 1].corrected;
                  return (
                    <button
                      key={si}
                      onClick={() => { if (isUnlocked) setActiveSetIndex(si); }}
                      className={cn(
                        'px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors',
                        si === activeSetIndex ? 'bg-brand-red text-black' : isUnlocked ? 'bg-white/5 text-white/40' : 'bg-white/5 text-white/20 opacity-40'
                      )}
                    >
                      {si + 1}/{activeExercise.sets.length}
                    </button>
                  );
                })}
                <button onClick={addSet} className="px-3 py-2 bg-white/5 rounded-lg text-white/40 font-bold text-lg shrink-0">+</button>
              </div>

              {/* Single set */}
              {(() => {
                const set = activeExercise.sets[activeSetIndex];
                if (!set) return null;
                return (
                  <>
                    {/* Set inputs — conditional by inputMode */}
                    {(() => {
                      const inputMode = getInputMode(exerciseDetails ?? { inputMode: undefined } as any);
                      const formatDuration = (secs: number) => {
                        const m = Math.floor(secs / 60);
                        const s = secs % 60;
                        return `${m}:${s.toString().padStart(2, '0')}`;
                      };
                      const parseDuration = (val: string): number => {
                        if (val.includes(':')) {
                          const [m, s] = val.split(':').map(Number);
                          return (m || 0) * 60 + (s || 0);
                        }
                        return Number(val) || 0;
                      };

                      return (
                        <div className="rounded-2xl border border-white/5 overflow-hidden">
                          <div className={cn('relative z-10 p-6 space-y-4', set.completed ? 'bg-brand-red/10' : 'bg-white/5')}>
                            {activeExercise.sets.length > 1 && (
                              <button onClick={() => setShowConfirmDeleteSet(true)} className="absolute top-3 right-3 p-1.5 bg-white/5 rounded-lg text-white/30 hover:text-white/60 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            )}

                            {/* weight_reps */}
                            {(inputMode === 'weight_reps') && (
                              <>
                                <div className="space-y-2">
                                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">Peso (kg)</p>
                                  <div className="flex items-center gap-2 w-full">
                                    <StepperButton label="−" onStep={() => { const w = sessionRef.current.exercises[activeExerciseIndex].sets[activeSetIndex].weight; updateSet(activeSetIndex, { weight: Math.max(0, w - 1) }); }} />
                                    <input type="number" value={set.weight || ''} onChange={(e) => updateSet(activeSetIndex, { weight: Number(e.target.value) })} className="min-w-0 flex-1 bg-black/40 border border-white/10 rounded-xl py-4 px-3 text-center font-bold text-xl text-white focus:outline-none focus:border-gray-400 appearance-none" placeholder="0" />
                                    <StepperButton label="+" onStep={() => { const w = sessionRef.current.exercises[activeExerciseIndex].sets[activeSetIndex].weight; updateSet(activeSetIndex, { weight: w + 1 }); }} />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">Repetições</p>
                                  <div className="flex items-center gap-2 w-full">
                                    <StepperButton label="−" onStep={() => { const r = sessionRef.current.exercises[activeExerciseIndex].sets[activeSetIndex].reps; updateSet(activeSetIndex, { reps: Math.max(0, r - 1) }); }} />
                                    <input type="number" value={set.reps || ''} onChange={(e) => updateSet(activeSetIndex, { reps: Number(e.target.value) })} className="min-w-0 flex-1 bg-black/40 border border-white/10 rounded-xl py-4 px-3 text-center font-bold text-xl text-white focus:outline-none focus:border-gray-400 appearance-none" placeholder="0" />
                                    <StepperButton label="+" onStep={() => { const r = sessionRef.current.exercises[activeExerciseIndex].sets[activeSetIndex].reps; updateSet(activeSetIndex, { reps: r + 1 }); }} />
                                  </div>
                                </div>
                              </>
                            )}

                            {/* reps_only */}
                            {inputMode === 'reps_only' && (
                              <div className="space-y-2">
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">Repetições</p>
                                <div className="flex items-center gap-2 w-full">
                                  <StepperButton label="−" onStep={() => { const r = sessionRef.current.exercises[activeExerciseIndex].sets[activeSetIndex].reps; updateSet(activeSetIndex, { reps: Math.max(0, r - 1) }); }} />
                                  <input type="number" value={set.reps || ''} onChange={(e) => updateSet(activeSetIndex, { reps: Number(e.target.value) })} className="min-w-0 flex-1 bg-black/40 border border-white/10 rounded-xl py-4 px-3 text-center font-bold text-xl text-white focus:outline-none focus:border-gray-400 appearance-none" placeholder="0" />
                                  <StepperButton label="+" onStep={() => { const r = sessionRef.current.exercises[activeExerciseIndex].sets[activeSetIndex].reps; updateSet(activeSetIndex, { reps: r + 1 }); }} />
                                </div>
                              </div>
                            )}

                            {/* duration fields — shared between duration_distance, duration_only */}
                            {(inputMode === 'duration_distance' || inputMode === 'duration_only') && (
                              <div className="space-y-2">
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">
                                  {timerRunning || (timerRemaining !== null && timerRemaining > 0) ? 'Tempo restante' : 'Duração (min:ss)'}
                                </p>
                                <div className="flex items-center gap-2 w-full">
                                  {/* Reset to target */}
                                  <button
                                    onTouchStart={(e) => e.preventDefault()}
                                    onClick={() => {
                                      setTimerRunning(false);
                                      setTimerRemaining(null);
                                    }}
                                    className="p-3 bg-black/40 border border-white/10 rounded-xl text-white/60 active:scale-95 transition-transform shrink-0"
                                  >
                                    <RotateCcw size={20} />
                                  </button>
                                  {/* Display: countdown when running, editable target when stopped */}
                                  {timerRunning || (timerRemaining !== null && timerRemaining > 0) ? (
                                    <div className={cn(
                                      'min-w-0 flex-1 rounded-xl py-4 px-3 text-center font-bold text-2xl font-mono border',
                                      (timerRemaining ?? 0) <= 10 ? 'text-brand-red border-brand-red/30 bg-brand-red/10' : 'text-white border-white/10 bg-black/40'
                                    )}>
                                      {formatDuration(timerRemaining ?? 0)}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      value={set.durationSeconds ? formatDuration(set.durationSeconds) : ''}
                                      onChange={(e) => updateSet(activeSetIndex, { durationSeconds: parseDuration(e.target.value) })}
                                      className="min-w-0 flex-1 bg-black/40 border border-white/10 rounded-xl py-4 px-3 text-center font-bold text-xl text-white focus:outline-none focus:border-gray-400"
                                      placeholder="0:00"
                                    />
                                  )}
                                  {/* Start / stop */}
                                  <button
                                    onTouchStart={(e) => e.preventDefault()}
                                    onClick={() => {
                                      if (timerRunning) {
                                        setTimerRunning(false);
                                      } else {
                                        const target = set.durationSeconds ?? 0;
                                        if (target <= 0) return;
                                        if (timerRemaining === null || timerRemaining <= 0) setTimerRemaining(target);
                                        setTimerRunning(true);
                                      }
                                    }}
                                    className={cn(
                                      'p-3 border rounded-xl active:scale-95 transition-transform shrink-0',
                                      timerRunning ? 'bg-brand-red/20 border-brand-red text-brand-red' : 'bg-black/40 border-white/10 text-white/60'
                                    )}
                                  >
                                    {timerRunning ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* distance — only for duration_distance */}
                            {inputMode === 'duration_distance' && (
                              <div className="space-y-2">
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest text-center">Distância (m)</p>
                                <div className="flex items-center gap-2 w-full">
                                  <StepperButton label="−" onStep={() => { const d = sessionRef.current.exercises[activeExerciseIndex].sets[activeSetIndex].distanceMeters ?? 0; updateSet(activeSetIndex, { distanceMeters: Math.max(0, d - 100) }); }} />
                                  <input type="number" value={set.distanceMeters ?? ''} onChange={(e) => updateSet(activeSetIndex, { distanceMeters: Number(e.target.value) })} className="min-w-0 flex-1 bg-black/40 border border-white/10 rounded-xl py-4 px-3 text-center font-bold text-xl text-white focus:outline-none focus:border-gray-400 appearance-none" placeholder="0" />
                                  <StepperButton label="+" onStep={() => { const d = sessionRef.current.exercises[activeExerciseIndex].sets[activeSetIndex].distanceMeters ?? 0; updateSet(activeSetIndex, { distanceMeters: d + 100 }); }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    <button disabled={set.completed || !isSetReadyToComplete(set, getInputMode(exerciseDetails ?? { inputMode: undefined } as any))} onClick={() => {
                      updateSet(activeSetIndex, { completed: true });
                      if (set.corrected) {
                        // Find next incomplete set in the flat step list after current position
                        const nextIncomplete = flatSteps.findIndex((s, i) => i > currentStep && !sessionRef.current.exercises[s.ei].sets[s.si].completed);
                        if (nextIncomplete !== -1) {
                          setSwipeDirection(1);
                          setActiveExerciseIndex(flatSteps[nextIncomplete].ei);
                          setActiveSetIndex(flatSteps[nextIncomplete].si);
                        }
                      }
                    }} className={cn('mt-3 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-colors disabled:cursor-not-allowed', set.completed ? 'bg-white/5 text-white/40' : isSetReadyToComplete(set, getInputMode(exerciseDetails ?? { inputMode: undefined } as any)) ? 'bg-brand-red text-black' : 'bg-white/10 text-white/60 opacity-50')}>
                      <CheckCircle2 size={18} fill={set.completed ? 'currentColor' : 'none'} stroke="currentColor" />
                      {set.completed ? 'Série concluída' : set.corrected ? 'Corrigir série' : 'Concluir série'}
                    </button>
                  </>
                );
              })()}
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.15 }}
        className="py-3 px-6 glass border-t border-white/10 flex justify-center items-center"
      >
        <div className="flex items-center gap-3">
          <button
            disabled={isFirstStep}
            onClick={goPrev}
            className="p-3 bg-white/5 rounded-xl disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-white/50 font-bold w-14 text-center">{currentStep + 1}/{totalSets}</span>
          <button
            disabled={!currentSetNavigable}
            onClick={goNext}
            className={cn(
              'p-3 rounded-xl font-bold disabled:opacity-20',
              isLastStep ? 'bg-brand-red text-black px-5 text-xs' : 'bg-white/5'
            )}
          >
            {isLastStep ? 'Finalizar' : <ChevronRight size={20} />}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

