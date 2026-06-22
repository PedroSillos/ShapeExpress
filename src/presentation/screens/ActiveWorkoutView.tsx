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
    const newExercises = [...sessionRef.current.exercises];
    const set = newExercises[activeExerciseIndex].sets[setIndex];
    const wasCompleted = set.completed;

    // If user changes weight or reps on a completed set, uncheck it
    const isValueChange = ('weight' in updates || 'reps' in updates) && wasCompleted;

    newExercises[activeExerciseIndex].sets[setIndex] = {
      ...set,
      ...updates,
      ...(isValueChange ? { completed: false } : {}),
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

    setSession({ ...sessionRef.current, exercises: newExercises });
  };

  const deleteSet = (setIndex: number) => {
    if (activeExercise.sets.length <= 1) return;
    const newExercises = [...session.exercises];
    newExercises[activeExerciseIndex].sets.splice(setIndex, 1);
    setSession({ ...session, exercises: newExercises });
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
        <ProgressBar progress={Math.max(completedSets, totalSets * 0.08)} max={totalSets} className="h-3" />
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
          className="flex-1 overflow-y-auto px-6 pt-2 pb-6 space-y-3 touch-pan-y no-scrollbar"
        >
          {activeExercise ? (
            <>
              {/* Tabs + info card — physically connected */}
              <div>
                <div className="flex items-start gap-2 overflow-x-auto no-scrollbar" style={{overflowY: 'visible'}}>
                  {(session.exercises || []).map((ex, i) => (
                    <button
                      key={ex.id}
                      onClick={() => { setActiveExerciseIndex(i); setActiveSetIndex(0); }}
                      className={cn(
                        'px-5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors',
                        i === activeExerciseIndex ? 'bg-brand-red text-black rounded-b-none' : 'bg-white/5 text-white/40'
                      )}
                      style={i === activeExerciseIndex ? { paddingTop: '0.625rem', paddingBottom: '1.5rem' } : { paddingTop: '0.625rem', paddingBottom: '0.625rem' }}
                    >
                      {EXERCISES.find(e => e.id === ex.exerciseId)?.name}
                    </button>
                  ))}
                </div>
                {/* Info card — physically attached to active tab */}
                <div className="rounded-b-2xl rounded-tr-2xl bg-brand-red/80 px-4 pt-2 pb-3 space-y-2">
                  {exerciseDetails?.youtubeUrl && (
                    <button
                      onClick={() => setShowVideoModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 rounded-full text-sm font-bold text-brand-red shrink-0 self-start"
                    >
                      <Play size={14} fill="currentColor" />
                      Ver vídeo
                    </button>
                  )}
                  <div className="flex gap-2">
                    <Badge className="bg-black/70 text-brand-red text-xs px-3 py-1 rounded-full font-bold">{exerciseDetails?.muscleGroup}</Badge>
                    {exerciseDetails?.muscleSubgroup && (
                      <Badge className="bg-black/60 text-brand-red/70 text-xs px-3 py-1 rounded-full font-bold">{exerciseDetails?.muscleSubgroup}</Badge>
                    )}
                  </div>
                  {/* Series sub-tabs */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {activeExercise.sets.map((_, si) => (
                      <button
                        key={si}
                        onClick={() => setActiveSetIndex(si)}
                        className={cn(
                          'px-6 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors',
                          si === activeSetIndex ? 'bg-black/70 text-brand-red' : 'bg-black/50 text-brand-red/50'
                        )}
                      >
                        {si + 1}/{activeExercise.sets.length}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Single set */}
              {(() => {
                const set = activeExercise.sets[activeSetIndex];
                if (!set) return null;
                return (
                  <>
                    {/* Weight/reps card */}
                    <div className="mt-3 rounded-2xl border border-white/5 overflow-hidden">
                      <div className={cn('relative z-10 p-6 space-y-4', set.completed ? 'bg-brand-red/10' : 'bg-white/5')}>
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
                      </div>
                    </div>
                    <button disabled={!set.completed && !(set.weight > 0 && set.reps > 0)} onClick={() => updateSet(activeSetIndex, { completed: !set.completed })} className={cn('mt-3 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50', set.completed || (set.weight > 0 && set.reps > 0) ? 'bg-brand-red text-black' : 'bg-white/10 text-white/60')}>
                      <CheckCircle2 size={18} fill={set.completed ? '#E53E3E' : 'none'} stroke={set.completed ? '#000' : 'currentColor'} />
                      {set.completed ? 'Série concluída' : 'Concluir série'}
                    </button>
                  </>
                );
              })()}
            </>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="p-6 glass border-t border-white/10 flex justify-center items-center">
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
            disabled={!activeExercise?.sets[activeSetIndex]?.completed}
            onClick={goNext}
            className={cn(
              'p-3 rounded-xl font-bold disabled:opacity-20',
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

