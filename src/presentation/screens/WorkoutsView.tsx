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
  ChevronRight,
  Play,
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
  WorkoutSheet,
} from '../../domain/entities';
import {
  estimateWorkoutDuration,
  estimateWorkoutCalories,
} from '../../domain/use-cases/workoutEstimation';
import { Badge } from '../components/Badge';
import { cn } from '../../utils/cn';
import { EXERCISES } from '../../constants';
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconFlame from '@/src/assets/icons/icon-flame.svg';
import iconAlarm from '@/src/assets/icons/icon-alarm.svg';
import iconZap from '@/src/assets/icons/icon-zap.svg';
import iconTrophy from '@/src/assets/icons/icon-trophy.svg';
import iconMusculacao from '@/src/assets/icons/icon-musculacao.svg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkoutsViewProps {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  onStartWorkout: (t: WorkoutTemplate, sheetIndex?: number) => void;
  onCreateWorkout: () => void;
  onEditWorkout: (t: WorkoutTemplate) => void;
  onDeleteWorkout: (id: string) => void;
  onGoToStore: () => void;
  onEditSession: (s: WorkoutSession) => void;
  onDeleteSession: (id: string) => void;
  onCreateAd?: (t: WorkoutTemplate) => void;
  scrollToHistory?: boolean;
  onScrollHandled?: () => void;
  userProfile: UserTrainingProfile;
  exerciseStats: ExerciseUserStats[];
  calorieProfile: UserCalorieProfile;
  assessments: BodyAssessment[];
  mainUserProfile: UserProfile;
  trainers?: UserProfile[];
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function StatChip({ icon, value, color }: { icon: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10">
      <img src={icon} alt="" className="w-3.5 h-3.5 brightness-0 invert" />
      <span className={cn('text-xs font-bold', color)}>{value}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-3">
      {children}
    </p>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function WorkoutsHeader({ sessionCount }: { sessionCount: number }) {
  return (
    <div
      className="relative overflow-hidden -mx-6 mb-6"
      style={{ background: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 60%, #E05C2A 100%)' }}
    >
      <div className="px-6 pt-10 pb-8 flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Shape Express</p>
          <h1 className="text-3xl font-black text-white leading-tight">Treinos</h1>
          {sessionCount > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <img src={iconTrophy} alt="" className="w-4 h-4 brightness-0 invert opacity-80" />
              <span className="text-white/80 text-xs font-bold">
                {sessionCount} {sessionCount === 1 ? 'sessão concluída' : 'sessões concluídas'}
              </span>
            </div>
          )}
        </div>
        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
          <img src={iconMusculacao} alt="" className="w-12 h-12 brightness-0 invert" />
        </div>
      </div>
      {/* decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
    </div>
  );
}


// ─── Template Card ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: WorkoutTemplate;
  sessions: WorkoutSession[];
  userProfile: UserTrainingProfile;
  exerciseStats: ExerciseUserStats[];
  calorieProfile: UserCalorieProfile;
  assessments: BodyAssessment[];
  mainUserProfile: UserProfile;
  trainers: UserProfile[];
  openSettingsId: string | null;
  setOpenSettingsId: (id: string | null) => void;
  onEditWorkout: (t: WorkoutTemplate) => void;
  onDeleteWorkout: (id: string) => void;
  onStartWorkout: (t: WorkoutTemplate, sheetIndex?: number) => void;
  onSelectSheet: (t: WorkoutTemplate) => void;
  onCreateAd?: (t: WorkoutTemplate) => void;
}

function TemplateCard({
  template,
  sessions,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile,
  trainers,
  openSettingsId,
  setOpenSettingsId,
  onEditWorkout,
  onDeleteWorkout,
  onStartWorkout,
  onSelectSheet,
  onCreateAd,
}: TemplateCardProps) {
  const hasSheets = !!(template.sheets && template.sheets.length > 0);

  const getNextSheetInfo = () => {
    let sheets: WorkoutSheet[] = [];
    let cycleName = '';

    if (template.category === 'multicycle' && template.cycles) {
      const now = new Date();
      const currentCycle = template.cycles.find((c) => {
        const start = parseISO(c.startDate);
        const end = parseISO(c.endDate);
        return now >= start && now <= end;
      });
      if (currentCycle) {
        sheets = currentCycle.sheets;
        cycleName = currentCycle.name;
      }
    } else if (template.sheets) {
      sheets = template.sheets;
    }

    if (sheets.length === 0) return null;
    const workoutSessions = sessions.filter((s) => s.workoutId === template.id);
    const nextIndex = workoutSessions.length % sheets.length;
    return { sheet: sheets[nextIndex], index: nextIndex, cycleName };
  };

  const nextSheetInfo = getNextSheetInfo();

  const totalExercises =
    template.category === 'multicycle'
      ? template.cycles?.reduce(
          (acc, c) =>
            acc + c.sheets.reduce((sAcc, s) => sAcc + (s.exerciseIds?.length || s.exercises?.length || 0), 0),
          0
        )
      : hasSheets
      ? template.sheets!.reduce((acc, s) => acc + (s.exerciseIds?.length || s.exercises?.length || 0), 0)
      : template.exerciseIds?.length || template.exercises?.length || 0;

  const trainer =
    template.creatorEmail && template.creatorEmail !== mainUserProfile.email
      ? trainers.find((t) => t.email === template.creatorEmail)
      : null;

  const completedCount = sessions.filter((s) => s.workoutId === template.id).length;

  const handleStart = () => {
    if (template.category === 'multicycle') {
      if (nextSheetInfo) onStartWorkout(template, nextSheetInfo.index);
    } else if (hasSheets && template.sheets!.length > 1) {
      onSelectSheet(template);
    } else {
      onStartWorkout(template, 0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden"
    >
      {/* Top accent stripe */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #E53E3E, #E05C2A)' }} />

      <div className="p-4 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-0.5 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-white leading-snug">{template.name}</h3>
              <Badge
                className={cn(
                  'text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider',
                  template.category === 'multicycle'
                    ? 'bg-brand-red/20 text-brand-red border border-brand-red/30'
                    : 'bg-white/8 text-white/40 border border-white/10'
                )}
              >
                {template.category === 'multicycle' ? 'Multiciclo' : 'Básico'}
              </Badge>
            </div>
            {trainer && (
              <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider">
                por {trainer.name}
              </p>
            )}
            <p className="text-[10px] text-white/25 font-bold uppercase tracking-wide">
              {format(parseISO(template.startDate), 'dd/MM/yy')} –{' '}
              {format(parseISO(template.endDate), 'dd/MM/yy')}
            </p>
          </div>

          {/* Settings menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setOpenSettingsId(openSettingsId === template.id ? null : template.id)}
              className="p-2 text-white/20 hover:text-white transition-colors"
            >
              <Settings size={17} />
            </button>
            <AnimatePresence>
              {openSettingsId === template.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenSettingsId(null)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    className="absolute right-0 top-9 w-32 bg-dark-card border border-dark-border rounded-2xl shadow-2xl z-20 overflow-hidden"
                  >
                    <button
                      onClick={() => { onEditWorkout(template); setOpenSettingsId(null); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold hover:bg-white/5 transition-colors"
                    >
                      <Edit size={13} /> Editar
                    </button>
                    <button
                      onClick={() => { onDeleteWorkout(template.id); setOpenSettingsId(null); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-400 hover:bg-white/5 transition-colors border-t border-dark-border"
                    >
                      <Trash2 size={13} /> Excluir
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/6 border border-white/8">
            <Dumbbell size={11} className="text-white/40" />
            <span className="text-[10px] font-bold text-white/50">
              {template.category === 'multicycle'
                ? `${template.cycles?.length || 0} ciclos`
                : hasSheets
                ? `${template.sheets!.length} ${template.sheets!.length === 1 ? 'ficha' : 'fichas'}`
                : `${totalExercises} exerc.`}
            </span>
          </div>
          {nextSheetInfo && (
            <>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/6 border border-white/8">
                <Clock size={11} className="text-white/40" />
                <span className="text-[10px] font-bold text-white/50">
                  {estimateWorkoutDuration(nextSheetInfo.sheet.exercises, userProfile, exerciseStats)} min
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/6 border border-white/8">
                <Flame size={11} className="text-orange-400/70" />
                <span className="text-[10px] font-bold text-orange-400/70">
                  {Math.round(
                    estimateWorkoutCalories(
                      nextSheetInfo.sheet.exercises,
                      assessments.length > 0 ? assessments[0].weight : mainUserProfile?.initialWeight,
                      userProfile,
                      exerciseStats,
                      calorieProfile
                    )
                  )}{' '}
                  kcal
                </span>
              </div>
            </>
          )}
          {completedCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-red/10 border border-brand-red/20">
              <img src={iconTrophy} alt="" className="w-2.5 h-2.5 brightness-0 invert opacity-60" />
              <span className="text-[10px] font-bold text-brand-red/80">{completedCount}×</span>
            </div>
          )}
        </div>

        {/* Next session pill (duolingo style) */}
        {nextSheetInfo && (
          <button
            onClick={handleStart}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl active:scale-95 transition-all border"
            style={{
              background: 'linear-gradient(135deg, rgba(229,62,62,0.12) 0%, rgba(224,92,42,0.08) 100%)',
              borderColor: 'rgba(229,62,62,0.25)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-red/20 flex items-center justify-center shrink-0">
                <img src={iconHalterofilismo} alt="" className="w-5 h-5 brightness-0 invert" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-white leading-tight">{nextSheetInfo.sheet.name}</p>
                <p className="text-[10px] text-white/40 font-bold mt-0.5">
                  {nextSheetInfo.sheet.exercises.length} exercícios
                  {nextSheetInfo.cycleName ? ` · ${nextSheetInfo.cycleName}` : ''}
                </p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-brand-red flex items-center justify-center shrink-0 shadow-lg shadow-brand-red/40">
              <Play size={14} className="text-white fill-white ml-0.5" />
            </div>
          </button>
        )}

        {/* Basic template without sheets */}
        {!nextSheetInfo && !hasSheets && template.exercises && template.exercises.length > 0 && (
          <button
            onClick={() => onStartWorkout(template)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl active:scale-95 transition-all border"
            style={{
              background: 'linear-gradient(135deg, rgba(229,62,62,0.12) 0%, rgba(224,92,42,0.08) 100%)',
              borderColor: 'rgba(229,62,62,0.25)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-red/20 flex items-center justify-center shrink-0">
                <img src={iconHalterofilismo} alt="" className="w-5 h-5 brightness-0 invert" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-white">{template.exercises.length} exercícios</p>
                <p className="text-[10px] text-white/40 font-bold mt-0.5">Toque para iniciar</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl bg-brand-red flex items-center justify-center shrink-0 shadow-lg shadow-brand-red/40">
              <Play size={14} className="text-white fill-white ml-0.5" />
            </div>
          </button>
        )}

        {mainUserProfile.userType === 'treinador' && onCreateAd && (
          <button
            onClick={() => onCreateAd(template)}
            className="w-full py-2.5 bg-brand-red/8 text-brand-red border border-brand-red/15 rounded-xl font-bold text-xs hover:bg-brand-red/15 transition-colors active:scale-95"
          >
            Criar Anúncio na Loja
          </button>
        )}
      </div>
    </motion.div>
  );
}


// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({
  session,
  templates,
  onEditSession,
  onDeleteSession,
}: {
  session: WorkoutSession;
  templates: WorkoutTemplate[];
  onEditSession: (s: WorkoutSession) => void;
  onDeleteSession: (id: string) => void;
}) {
  const templateName = templates.find((t) => t.id === session.workoutId)?.name || 'Treino';
  const mins = session.duration ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card border border-dark-border rounded-2xl p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-0.5 flex-1 pr-2">
          <p className="text-[10px] text-white/25 font-black uppercase tracking-widest">
            {format(parseISO(session.date), 'EEEE, d MMMM', { locale: ptBR })}
          </p>
          <h4 className="font-black text-sm text-white">{templateName}</h4>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEditSession(session)}
            className="p-1.5 text-white/20 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDeleteSession(session.id)}
            className="p-1.5 text-white/20 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
          <img src={iconAlarm} alt="" className="w-3 h-3 brightness-0 invert opacity-60" />
          <span className="text-[10px] font-bold text-blue-300/80">{mins} min</span>
        </div>
        {session.totalVolume > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
            <img src={iconHalterofilismo} alt="" className="w-3 h-3 brightness-0 invert opacity-60" />
            <span className="text-[10px] font-bold text-orange-300/80">{session.totalVolume} kg</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
          <img src={iconZap} alt="" className="w-3 h-3 brightness-0 invert opacity-60" />
          <span className="text-[10px] font-bold text-yellow-300/80">{session.xpEarned} XP</span>
        </div>
      </div>

      {/* Exercise list */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {session.exercises.slice(0, 4).map((ex, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[10px] text-white/35 font-bold">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#E53E3E' }} />
            {EXERCISES.find((e) => e.id === ex.exerciseId)?.name || 'Exercício'}
          </div>
        ))}
        {session.exercises.length > 4 && (
          <div className="text-[10px] text-white/20 italic col-span-2 mt-0.5">
            + {session.exercises.length - 4} outros
          </div>
        )}
      </div>
    </motion.div>
  );
}


// ─── Main Component ───────────────────────────────────────────────────────────

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
  onCreateAd,
}: WorkoutsViewProps) {
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
  const [selectingSheetTemplate, setSelectingSheetTemplate] = useState<WorkoutTemplate | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToHistory && historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth' });
      onScrollHandled?.();
    }
  }, [scrollToHistory, onScrollHandled]);

  // Draft recovery
  useEffect(() => {
    const savedDraft = localStorage.getItem('workout_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const hasDraftContent =
          draft.protocolName ||
          (draft.cycles && draft.cycles.length > 0) ||
          (draft.sheets && draft.sheets[0]?.exerciseIds?.length > 0);
        if (hasDraftContent) {
          if (confirm('Você tem um rascunho de treino não finalizado. Deseja continuar de onde parou?')) {
            onCreateWorkout();
          } else {
            localStorage.removeItem('workout_draft');
          }
        }
      } catch {
        // ignore malformed draft
      }
    }
  }, [onCreateWorkout]);

  return (
    <div className="pb-24">
      <WorkoutsHeader sessionCount={sessions.length} />

      <div className="space-y-6">
        {/* Create workout button */}
        <button
          onClick={onCreateWorkout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white/60 border border-dashed border-white/15 bg-white/3 active:scale-95 transition-transform hover:border-brand-red/40 hover:text-brand-red/70"
        >
          <Plus size={17} />
          Criar Treino
        </button>

        {/* Templates section */}
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-14 space-y-5">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                <img src={iconHalterofilismo} alt="" className="w-10 h-10 brightness-0 invert opacity-20" />
              </div>
              <div>
                <p className="text-white/50 font-black text-base">Nenhum treino criado</p>
                <p className="text-xs text-white/25 mt-1">Crie seu primeiro treino para começar a evoluir.</p>
              </div>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button
                  onClick={onCreateWorkout}
                  className="px-6 py-3 bg-brand-red text-white rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-lg shadow-brand-red/30"
                >
                  Criar Meu Primeiro Treino
                </button>
                <button
                  onClick={onGoToStore}
                  className="px-6 py-3 bg-white/5 text-white/50 rounded-2xl font-bold text-sm active:scale-95 transition-transform border border-white/8"
                >
                  Adquirir Treino na Loja
                </button>
              </div>
            </div>
          ) : (
            templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                sessions={sessions}
                userProfile={userProfile}
                exerciseStats={exerciseStats}
                calorieProfile={calorieProfile}
                assessments={assessments}
                mainUserProfile={mainUserProfile}
                trainers={trainers}
                openSettingsId={openSettingsId}
                setOpenSettingsId={setOpenSettingsId}
                onEditWorkout={onEditWorkout}
                onDeleteWorkout={onDeleteWorkout}
                onStartWorkout={onStartWorkout}
                onSelectSheet={setSelectingSheetTemplate}
                onCreateAd={onCreateAd}
              />
            ))
          )}
        </div>

        {/* History section */}
        <div ref={historyRef} className="space-y-4">
          <SectionLabel>Histórico de Sessões</SectionLabel>
          {sessions.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-white/3 border border-white/6">
              <p className="text-white/20 font-bold text-sm">Nenhuma sessão registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions
                .slice()
                .reverse()
                .map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    templates={templates}
                    onEditSession={onEditSession}
                    onDeleteSession={onDeleteSession}
                  />
                ))}
            </div>
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
              initial={{ opacity: 0, scale: 0.93, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 24 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-dark-card border border-dark-border rounded-3xl p-6 z-[110] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black">Escolha a Ficha</h3>
                <button
                  onClick={() => setSelectingSheetTemplate(null)}
                  className="p-2 text-white/20 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-3">
                {selectingSheetTemplate.sheets?.map((sheet, idx) => (
                  <button
                    key={sheet.id}
                    onClick={() => {
                      onStartWorkout(selectingSheetTemplate, idx);
                      setSelectingSheetTemplate(null);
                    }}
                    className="w-full p-4 bg-white/5 hover:bg-brand-red/10 border border-white/5 hover:border-brand-red/20 rounded-2xl text-left transition-all group active:scale-95"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-black text-sm group-hover:text-brand-red transition-colors">
                          {sheet.name}
                        </p>
                        <p className="text-xs text-white/35 mt-0.5">{sheet.exercises.length} exercícios</p>
                      </div>
                      <ChevronRight size={17} className="text-white/20 group-hover:text-brand-red transition-colors" />
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
