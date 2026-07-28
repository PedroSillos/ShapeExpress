import React, { useState, useEffect, useRef, useMemo } from 'react';
import { STORAGE_KEYS } from '../../shared/lib/storageKeys';
import {
  Plus,
  Dumbbell,
  Settings,
  Edit,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Calendar as CalendarIcon,
  Pen,
  Check,
  Search,
  GripVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  WorkoutTemplate,
  WorkoutSession,
  WorkoutTemplateExercise,
  UserTrainingProfile,
  ExerciseUserStats,
  UserCalorieProfile,
  BodyAssessment,
  UserProfile,
  fullName,
} from '../../domain/entities';
import { Badge } from '../components/Badge';
import { DeleteSessionModal } from '../components/AppModals';
import { cn } from '../../utils/cn';
import { EXERCISES } from '../../constants';
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconFlame from '@/src/assets/icons/icon-flame.svg';
import iconAlarm from '@/src/assets/icons/icon-alarm.svg';
import iconZap from '@/src/assets/icons/icon-zap.svg';
import iconTrophy from '@/src/assets/icons/icon-trophy.svg';
import iconMusculacao from '@/src/assets/icons/icon-musculacao.svg';
import iconCorrida from '@/src/assets/icons/icon-corrida.svg';
import iconCiclismo from '@/src/assets/icons/icon-ciclismo.svg';
import iconNatacao from '@/src/assets/icons/icon-natacao.svg';
import iconCrossfit from '@/src/assets/icons/icon-crossfit.svg';
import iconTriatlo from '@/src/assets/icons/icon-triatlo.svg';
import iconYoga from '@/src/assets/icons/icon-yoga.svg';

const SPORT_ICONS: Record<string, string> = {
  'Musculação':     iconMusculacao,
  'Halterofilismo': iconHalterofilismo,
  'Corrida':        iconCorrida,
  'Ciclismo':       iconCiclismo,
  'Natação':        iconNatacao,
  'Crossfit':       iconCrossfit,
  'Triatlo':        iconTriatlo,
  'Yoga':           iconYoga,
};

const SPORT_COLORS: Record<string, string> = {
  'Musculação':     '#dc2626',
  'Crossfit':       '#ea580c',
  'Corrida':        '#ca8a04',
  'Yoga':           '#16a34a',
  'Natação':        '#2563eb',
  'Ciclismo':       '#0891b2',
  'Halterofilismo': '#7c3aed',
  'Triatlo':        '#db2777',
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkoutsViewProps {
  templates: WorkoutTemplate[];
  sessions: WorkoutSession[];
  onStartWorkout: (t: WorkoutTemplate, sheetIndex?: number) => void;
  onCreateWorkout: () => void;
  onGenerateWithAI: (sport: string) => void;
  onDeleteWorkout: (id: string) => void;
  onRenameWorkout: (id: string, name: string) => void;
  onUpdateTemplate?: (t: WorkoutTemplate) => void;
  onGoToStore: () => void;
  onEditSession: (s: WorkoutSession) => void;
  onDeleteSession: (id: string) => void;
  onCreateAd?: (t: WorkoutTemplate) => void;
  scrollToHistory?: boolean;
  onScrollHandled?: () => void;
  highlightSessionId?: string | null;
  onHighlightHandled?: () => void;
  userProfile: UserTrainingProfile;
  exerciseStats: ExerciseUserStats[];
  calorieProfile: UserCalorieProfile;
  assessments: BodyAssessment[];
  mainUserProfile: UserProfile;
  trainers?: UserProfile[];
  isLoggedIn?: boolean;
  initialOpenCreateMenu?: boolean;
  onCreateMenuMounted?: () => void;
  /** Currently active sport (from global nav state). Used to filter templates. */
  activeSport?: string;
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

function WorkoutsHeader({ sport, color }: { sport: string; color: string }) {
  const icon = SPORT_ICONS[sport];
  // derive a darker shade for the gradient start (darken by ~25%)
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 60);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 60);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 60);
  const darker = `rgb(${r},${g},${b})`;

  return (
    <div
      className="relative overflow-hidden -mx-6 mb-6"
      style={{ background: `linear-gradient(135deg, ${darker} 0%, ${color} 60%, ${color}cc 100%)` }}
    >
      <div className="px-6 pt-10 pb-8 flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white leading-tight">Treinos</h1>
          <p className="text-white/70 text-sm font-semibold">{sport}</p>
        </div>
        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
          {icon
            ? <img src={icon} alt={sport} className="w-9 h-9 brightness-0 invert" />
            : <Dumbbell size={36} className="text-white" />}
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
  sport: string;
  sessions: WorkoutSession[];
  userProfile: UserTrainingProfile;
  exerciseStats: ExerciseUserStats[];
  calorieProfile: UserCalorieProfile;
  assessments: BodyAssessment[];
  mainUserProfile: UserProfile;
  trainers: UserProfile[];
  openSettingsId: string | null;
  setOpenSettingsId: (id: string | null) => void;
  onDeleteWorkout: (id: string) => void;
  onRenameWorkout: (id: string, name: string) => void;
  onUpdateTemplate?: (t: WorkoutTemplate) => void;
  onStartWorkout: (t: WorkoutTemplate, sheetIndex?: number) => void;
  onSelectSheet: (t: WorkoutTemplate) => void;
  onCreateAd?: (t: WorkoutTemplate) => void;
}

function TemplateCard({
  template,
  sport,
  sessions,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile,
  trainers,
  openSettingsId,
  setOpenSettingsId,
  onDeleteWorkout,
  onRenameWorkout,
  onUpdateTemplate,
  onStartWorkout,
  onSelectSheet,
  onCreateAd,
}: TemplateCardProps) {
  const hasSheets = !!(template.sheets && template.sheets.length > 0);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(template.name);
  const [selectedCycleIdx, setSelectedCycleIdx] = useState(0);
  const [selectedSheetIdx, setSelectedSheetIdx] = useState(0);
  const renameInputRef = useRef<HTMLInputElement>(null);
  // Touch-based drag-to-reorder state
  const dragFromIdx = useRef<number>(-1);

  // ── Inline edit state ──────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  // Deep clone of template used while editing — discarded on cancel
  const [editDraft, setEditDraft] = useState<WorkoutTemplate>(template);
  // Exercise search modal
  const [showExSearch, setShowExSearch] = useState(false);
  const [exSearchQuery, setExSearchQuery] = useState('');

  // Keep draft in sync if template prop changes externally
  useEffect(() => {
    if (!isEditing) setEditDraft(template);
  }, [template, isEditing]);

  const startEditing = () => {
    setEditDraft(JSON.parse(JSON.stringify(template)));
    setOpenSettingsId(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (!confirm('Descartar as alterações feitas no treino?')) return;
    setIsEditing(false);
    setEditDraft(template);
  };

  const commitEdit = () => {
    if (!confirm('Salvar as alterações no treino?')) return;
    onUpdateTemplate?.(editDraft);
    setIsEditing(false);
  };

  // ── Helpers to mutate editDraft exercises ─────────────────────────────────
  /** Returns the exercises array for the currently visible sheet/cycle in draft */
  const getDraftExercises = (): WorkoutTemplateExercise[] => {
    if (editDraft.category === 'multicycle' && editDraft.cycles?.length) {
      const ci = Math.min(selectedCycleIdx, editDraft.cycles.length - 1);
      const sheets = editDraft.cycles[ci].sheets ?? [];
      const si = Math.min(selectedSheetIdx, Math.max(0, sheets.length - 1));
      return sheets[si]?.exercises ?? [];
    }
    if (editDraft.sheets?.length) {
      const si = Math.min(selectedSheetIdx, editDraft.sheets.length - 1);
      return editDraft.sheets[si]?.exercises ?? [];
    }
    return editDraft.exercises ?? [];
  };

  /** Replaces the exercises array for the currently visible sheet/cycle in draft */
  const setDraftExercises = (exs: WorkoutTemplateExercise[]) => {
    setEditDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev)) as WorkoutTemplate;
      if (next.category === 'multicycle' && next.cycles?.length) {
        const ci = Math.min(selectedCycleIdx, next.cycles.length - 1);
        const sheets = next.cycles[ci].sheets ?? [];
        const si = Math.min(selectedSheetIdx, Math.max(0, sheets.length - 1));
        if (sheets[si]) sheets[si].exercises = exs;
      } else if (next.sheets?.length) {
        const si = Math.min(selectedSheetIdx, next.sheets.length - 1);
        if (next.sheets[si]) next.sheets[si].exercises = exs;
      } else {
        next.exercises = exs;
      }
      return next;
    });
  };

  const updateDraftExField = (idx: number, field: 'numSets' | 'sets', value: string) => {
    const exs = getDraftExercises().map((ex, i) => {
      if (i !== idx) return ex;
      if (field === 'numSets') return { ...ex, numSets: Math.max(1, parseInt(value) || 1) };
      return { ...ex, sets: value };
    });
    setDraftExercises(exs);
  };

  const removeDraftEx = (idx: number) => {
    setDraftExercises(getDraftExercises().filter((_, i) => i !== idx));
  };

  const reorderDraftEx = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const exs = [...getDraftExercises()];
    const [moved] = exs.splice(fromIdx, 1);
    exs.splice(toIdx, 0, moved);
    setDraftExercises(exs);
  };

  const addDraftEx = (exerciseId: string) => {
    const already = getDraftExercises().some(e => e.exerciseId === exerciseId);
    if (already) return;
    const newEx: WorkoutTemplateExercise = { exerciseId, sets: '8-10', numSets: 3, rest: '60s' };
    setDraftExercises([...getDraftExercises(), newEx]);
    setShowExSearch(false);
    setExSearchQuery('');
  };

  const filteredExercises = useMemo(() => {
    const q = exSearchQuery.trim().toLowerCase();
    if (!q) return EXERCISES.slice(0, 40);
    return EXERCISES.filter(e => e.name.toLowerCase().includes(q)).slice(0, 40);
  }, [exSearchQuery]);

  const startRename = () => {
    setRenameValue(template.name);
    setOpenSettingsId(null);
    setIsRenaming(true);
    // focus after render
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== template.name) onRenameWorkout(template.id, trimmed);
    setIsRenaming(false);
  };

  const trainer =
    template.creatorEmail && template.creatorEmail !== mainUserProfile.email
      ? trainers.find((t) => t.email === template.creatorEmail)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(145deg, color-mix(in srgb, ${SPORT_COLORS[sport] ?? '#dc2626'} 8%, #1a1a1a) 0%, #151515 60%)`,
        border: `1px solid color-mix(in srgb, ${SPORT_COLORS[sport] ?? '#dc2626'} 30%, transparent)`,
      }}
    >
      {/* Top accent stripe */}
      <div className="h-1 w-full" style={{ background: SPORT_COLORS[sport] ?? '#dc2626' }} />

      <div className="p-4 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-0.5 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setIsRenaming(false);
                  }}
                  className="text-base font-black text-white leading-snug bg-white/10 border border-brand-red/50 rounded-lg px-2 py-0.5 outline-none w-full"
                />
              ) : (
                <h3 className="text-base font-black text-white leading-snug">{template.name}</h3>
              )}

            </div>
            {trainer && (
              <p className="text-[10px] text-brand-red font-bold uppercase tracking-wider">
                por {fullName(trainer)}
              </p>
            )}
            {/* Show cycle dates when multicycle with 2+ cycles, otherwise show template dates */}
            {(() => {
              const isMulticycleWithMany =
                template.category === 'multicycle' &&
                template.cycles &&
                template.cycles.length > 1;
              const activeCycle = isMulticycleWithMany
                ? template.cycles![Math.min(selectedCycleIdx, template.cycles!.length - 1)]
                : null;
              const startDate = activeCycle?.startDate ?? template.startDate;
              const endDate = activeCycle?.endDate ?? template.endDate;
              return (
                <p className="text-[10px] text-white/25 font-bold uppercase tracking-wide">
                  {format(parseISO(startDate), 'dd/MM/yy')} –{' '}
                  {format(parseISO(endDate), 'dd/MM/yy')}
                </p>
              );
            })()}
          </div>

          {/* Settings menu */}
          <div className="relative shrink-0 flex items-center gap-1">
            {/* Sport icon */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: SPORT_COLORS[sport] ?? '#dc2626' }}
            >
              <img
                src={SPORT_ICONS[sport] ?? iconMusculacao}
                alt={sport}
                className="w-4 h-4 brightness-0 invert"
              />
            </div>
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
                    className="absolute right-0 top-9 w-36 bg-dark-card border border-dark-border rounded-2xl shadow-2xl z-20 overflow-hidden"
                  >
                    <button
                      onClick={startRename}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold hover:bg-white/5 transition-colors"
                    >
                      <Pen size={13} /> Renomear
                    </button>
                    <button
                      onClick={startEditing}
                      className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold hover:bg-white/5 transition-colors border-t border-dark-border"
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







        {/* Exercise list — tabbed cycles + tabbed sheets */}
        {(() => {
          const sportColor = SPORT_COLORS[sport] ?? '#dc2626';

          // ── Multicycle ────────────────────────────────────────────────────
          if (template.category === 'multicycle' && template.cycles && template.cycles.length > 0) {
            const cycles = template.cycles;
            const hasMultipleCycles = cycles.length > 1;
            const clampedCycleIdx = Math.min(selectedCycleIdx, cycles.length - 1);
            const activeCycle = cycles[clampedCycleIdx];
            const sheets = activeCycle.sheets ?? [];
            const hasMultipleSheets = sheets.length > 1;
            const clampedSheetIdx = Math.min(selectedSheetIdx, Math.max(0, sheets.length - 1));
            const activeSheet = sheets[clampedSheetIdx];

            return (
              <div className="space-y-2">
                {/* Cycle tabs */}
                {hasMultipleCycles && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {cycles.map((cycle, ci) => {
                      const isActive = ci === clampedCycleIdx;
                      return (
                        <button
                          key={ci}
                          onClick={() => { setSelectedCycleIdx(ci); setSelectedSheetIdx(0); }}
                          className={cn(
                            'shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                            isActive ? 'text-white' : 'text-white/30 bg-white/5 hover:text-white/60',
                          )}
                          style={isActive ? { backgroundColor: sportColor } : {}}
                        >
                          {cycle.name ?? `Ciclo ${ci + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sheet tabs */}
                {hasMultipleSheets && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {sheets.map((sheet, si) => {
                      const isActive = si === clampedSheetIdx;
                      return (
                        <button
                          key={si}
                          onClick={() => setSelectedSheetIdx(si)}
                          className={cn(
                            'shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                            isActive ? 'text-white' : 'text-white/30 bg-white/5 hover:text-white/60',
                          )}
                          style={isActive ? { backgroundColor: sportColor } : {}}
                        >
                          {sheet.name ?? `Ficha ${si + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Exercises */}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${clampedCycleIdx}-${clampedSheetIdx}`}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-1.5"
                  >
                    {(isEditing ? getDraftExercises() : (activeSheet?.exercises ?? [])).map((ex, idx) => {
                      const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
                      if (!exercise) return null;
                      if (isEditing) {
                        return (
                          <div
                            key={ex.exerciseId + idx}
                            data-drag-idx={idx}
                            className="flex items-center gap-2 px-2 py-2.5 rounded-xl bg-white/6 border border-white/10 transition-opacity"
                          >
                            {/* Drag handle — pointer events work on both mouse and touch */}
                            <span
                              className="text-white/25 active:text-white/60 cursor-grab active:cursor-grabbing shrink-0 select-none p-0.5"
                              title="Segurar para reordenar"
                              onPointerDown={e => {
                                dragFromIdx.current = idx;
                                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                              }}
                              onPointerUp={e => {
                                const from = dragFromIdx.current;
                                dragFromIdx.current = -1;
                                if (from === -1 || from === idx) return;
                                // Find target by walking up from the element under the pointer
                                const el = document.elementFromPoint(e.clientX, e.clientY);
                                const target = el?.closest('[data-drag-idx]') as HTMLElement | null;
                                const to = target ? parseInt(target.dataset.dragIdx ?? '-1') : -1;
                                if (to >= 0 && to !== from) reorderDraftEx(from, to);
                              }}
                              onPointerMove={e => {
                                if (dragFromIdx.current === -1) return;
                                const el = document.elementFromPoint(e.clientX, e.clientY);
                                const target = el?.closest('[data-drag-idx]') as HTMLElement | null;
                                const to = target ? parseInt(target.dataset.dragIdx ?? '-1') : -1;
                                if (to >= 0 && to !== dragFromIdx.current) {
                                  reorderDraftEx(dragFromIdx.current, to);
                                  dragFromIdx.current = to;
                                }
                              }}
                            >
                              <GripVertical size={16} />
                            </span>

                            {/* Number */}
                            <span className="text-xs font-black text-white/25 w-4 shrink-0 text-center tabular-nums">{idx + 1}</span>

                            {/* Divider */}
                            <span className="w-px self-stretch bg-white/10 shrink-0" />

                            {/* Name + inputs */}
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                              <p className="text-xs font-bold text-white/85 truncate flex-1 min-w-0">{exercise.name}</p>
                              <div className="flex items-end gap-1.5 shrink-0">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">séries</span>
                                  <input
                                    type="number"
                                    min={1}
                                    value={ex.numSets}
                                    onChange={e => updateDraftExField(idx, 'numSets', e.target.value)}
                                    className="w-9 text-center text-xs font-bold bg-white/10 border border-white/15 rounded-lg px-1 py-0.5 outline-none text-white"
                                  />
                                </div>
                                <span className="text-white/25 text-xs mb-0.5">×</span>
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">reps.</span>
                                  <input
                                    type="text"
                                    value={ex.sets}
                                    onChange={e => updateDraftExField(idx, 'sets', e.target.value)}
                                    className="w-9 text-center text-xs font-bold bg-white/10 border border-white/15 rounded-lg px-1 py-0.5 outline-none text-white"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Delete */}
                            <button
                              onClick={() => confirm(`Remover "${exercise.name}" do treino?`) && removeDraftEx(idx)}
                              className="p-1.5 text-white/25 hover:text-white/60 active:scale-90 transition-all shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      }
                      return (
                        <div key={ex.exerciseId + idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/6">
                          <span className="text-sm font-black text-white/30 w-5 shrink-0 text-center tabular-nums">{idx + 1}</span>
                          <span className="w-px h-4 bg-white/10 shrink-0" />
                          <span className="text-sm font-bold text-white/80 flex-1 truncate">{exercise.name}</span>
                          <span className="text-xs font-bold text-white/40 shrink-0 tabular-nums">{ex.numSets} × {ex.sets}</span>
                        </div>
                      );
                    })}
                    {isEditing && (
                      <button
                        onClick={() => setShowExSearch(true)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/15 text-xs font-bold text-white/40 hover:text-white/70 hover:border-white/25 active:scale-95 transition-all"
                      >
                        <Plus size={13} /> Adicionar exercício
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          }

          // ── Non-multicycle ────────────────────────────────────────────────
          let sheetsToShow: { label: string | null; exercises: WorkoutTemplateExercise[] }[] = [];

          if (hasSheets && template.sheets) {
            sheetsToShow = template.sheets.map(s => ({
              label: s.name,
              exercises: s.exercises ?? [],
            }));
          } else if (template.exercises && template.exercises.length > 0) {
            sheetsToShow = [{ label: null, exercises: template.exercises }];
          }

          if (sheetsToShow.length === 0) return null;

          const hasMultipleSheets = sheetsToShow.length > 1;
          const clampedIdx = Math.min(selectedSheetIdx, sheetsToShow.length - 1);
          const activeSheet = sheetsToShow[clampedIdx];

          return (
            <div className="space-y-2">
              {/* Sheet tabs */}
              {hasMultipleSheets && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {sheetsToShow.map((sheet, si) => {
                    const isActive = si === clampedIdx;
                    return (
                      <button
                        key={si}
                        onClick={() => setSelectedSheetIdx(si)}
                        className={cn(
                          'shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                          isActive ? 'text-white' : 'text-white/30 bg-white/5 hover:text-white/60',
                        )}
                        style={isActive ? { backgroundColor: sportColor } : {}}
                      >
                        {sheet.label ?? `Ficha ${si + 1}`}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Exercises */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={clampedIdx}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-1.5"
                >
                  {(isEditing ? getDraftExercises() : activeSheet.exercises).map((ex, idx) => {
                    const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
                    if (!exercise) return null;
                    if (isEditing) {
                      return (
                        <div
                          key={ex.exerciseId + idx}
                          data-drag-idx={idx}
                          className="flex items-center gap-2 px-2 py-2.5 rounded-xl bg-white/6 border border-white/10 transition-opacity"
                        >
                          {/* Drag handle — pointer events work on both mouse and touch */}
                          <span
                            className="text-white/25 active:text-white/60 cursor-grab active:cursor-grabbing shrink-0 select-none p-0.5"
                            title="Segurar para reordenar"
                            onPointerDown={e => {
                              dragFromIdx.current = idx;
                              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                            }}
                            onPointerUp={e => {
                              const from = dragFromIdx.current;
                              dragFromIdx.current = -1;
                              if (from === -1 || from === idx) return;
                              const el = document.elementFromPoint(e.clientX, e.clientY);
                              const target = el?.closest('[data-drag-idx]') as HTMLElement | null;
                              const to = target ? parseInt(target.dataset.dragIdx ?? '-1') : -1;
                              if (to >= 0 && to !== from) reorderDraftEx(from, to);
                            }}
                            onPointerMove={e => {
                              if (dragFromIdx.current === -1) return;
                              const el = document.elementFromPoint(e.clientX, e.clientY);
                              const target = el?.closest('[data-drag-idx]') as HTMLElement | null;
                              const to = target ? parseInt(target.dataset.dragIdx ?? '-1') : -1;
                              if (to >= 0 && to !== dragFromIdx.current) {
                                reorderDraftEx(dragFromIdx.current, to);
                                dragFromIdx.current = to;
                              }
                            }}
                          >
                            <GripVertical size={16} />
                          </span>

                          {/* Number */}
                          <span className="text-xs font-black text-white/25 w-4 shrink-0 text-center tabular-nums">{idx + 1}</span>

                          {/* Divider */}
                          <span className="w-px self-stretch bg-white/10 shrink-0" />

                          {/* Name + inputs */}
                          <div className="flex-1 min-w-0 flex items-center gap-3">
                            <p className="text-xs font-bold text-white/85 truncate flex-1 min-w-0">{exercise.name}</p>
                            <div className="flex items-end gap-1.5 shrink-0">
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">séries</span>
                                <input
                                  type="number"
                                  min={1}
                                  value={ex.numSets}
                                  onChange={e => updateDraftExField(idx, 'numSets', e.target.value)}
                                  className="w-9 text-center text-xs font-bold bg-white/10 border border-white/15 rounded-lg px-1 py-0.5 outline-none text-white"
                                />
                              </div>
                              <span className="text-white/25 text-xs mb-0.5">×</span>
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">reps.</span>
                                <input
                                  type="text"
                                  value={ex.sets}
                                  onChange={e => updateDraftExField(idx, 'sets', e.target.value)}
                                  className="w-9 text-center text-xs font-bold bg-white/10 border border-white/15 rounded-lg px-1 py-0.5 outline-none text-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => confirm(`Remover "${exercise.name}" do treino?`) && removeDraftEx(idx)}
                            className="p-1.5 text-white/25 hover:text-white/60 active:scale-90 transition-all shrink-0"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    }
                    return (
                      <div key={ex.exerciseId + idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/6">
                        <span className="text-sm font-black text-white/30 w-5 shrink-0 text-center tabular-nums">{idx + 1}</span>
                        <span className="w-px h-4 bg-white/10 shrink-0" />
                        <span className="text-sm font-bold text-white/80 flex-1 truncate">{exercise.name}</span>
                        <span className="text-xs font-bold text-white/40 shrink-0 tabular-nums">{ex.numSets} × {ex.sets}</span>
                      </div>
                    );
                  })}
                  {isEditing && (
                    <button
                      onClick={() => setShowExSearch(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/15 text-xs font-bold text-white/40 hover:text-white/70 hover:border-white/25 active:scale-95 transition-all"
                    >
                      <Plus size={13} /> Adicionar exercício
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })()}

        {/* Edit mode bottom toolbar */}
        {isEditing && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={cancelEditing}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
            >
              <X size={13} /> Descartar
            </button>
            <button
              onClick={commitEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all"
              style={{ backgroundColor: SPORT_COLORS[sport] ?? '#dc2626' }}
            >
              <Check size={13} /> Salvar
            </button>
          </div>
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

      {/* Exercise search bottom-sheet (only while editing) */}
      <AnimatePresence>
        {showExSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowExSearch(false); setExSearchQuery(''); }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border rounded-t-3xl z-[210] flex flex-col"
              style={{ maxHeight: '70vh' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
                <h3 className="text-base font-black">Adicionar exercício</h3>
                <button onClick={() => { setShowExSearch(false); setExSearchQuery(''); }} className="p-2 text-white/20 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              {/* Search input */}
              <div className="px-5 pb-3 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Search size={14} className="text-white/30 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar exercício…"
                    value={exSearchQuery}
                    onChange={e => setExSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                  />
                  {exSearchQuery && (
                    <button onClick={() => setExSearchQuery('')} className="text-white/30 hover:text-white">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
              {/* Exercise list */}
              <div className="overflow-y-auto flex-1 px-5 pb-6 space-y-1">
                {filteredExercises.map(ex => {
                  const alreadyAdded = getDraftExercises().some(e => e.exerciseId === ex.id);
                  return (
                    <button
                      key={ex.id}
                      disabled={alreadyAdded}
                      onClick={() => addDraftEx(ex.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all active:scale-95',
                        alreadyAdded
                          ? 'opacity-40 cursor-not-allowed bg-white/3'
                          : 'bg-white/5 hover:bg-white/8 border border-white/6',
                      )}
                    >
                      <div>
                        <p className="text-sm font-bold text-white leading-snug">{ex.name}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{ex.muscleGroup}</p>
                      </div>
                      {alreadyAdded
                        ? <Check size={14} className="text-white/30 shrink-0" />
                        : <Plus size={14} className="text-white/40 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


// ─── Date Filter Calendar ─────────────────────────────────────────────────────

const CAL_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;

function DateFilterCalendar({
  sessions,
  selectedDate,
  onSelect,
  onClear,
}: {
  sessions: WorkoutSession[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onClear: () => void;
}) {
  const [month, setMonth] = useState(() =>
    selectedDate ? startOfMonth(parseISO(selectedDate)) : startOfMonth(new Date())
  );

  const trainedDays = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => {
      try { set.add(format(parseISO(s.date), 'yyyy-MM-dd')); } catch {}
    });
    return set;
  }, [sessions]);

  // Build grid: weeks starting Sunday
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const gridEnd   = endOfMonth(month);
  const days: Date[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd || days.length % 7 !== 0) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
    if (days.length > 42) break;
  }

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMonth(m => subMonths(m, 1))}
          className="p-2 text-white/40 hover:text-white active:scale-90 transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-black capitalize">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </span>
        <button
          onClick={() => setMonth(m => addMonths(m, 1))}
          className="p-2 text-white/40 hover:text-white active:scale-90 transition-all"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {CAL_DAYS.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-black text-white/20 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day, i) => {
          const key       = format(day, 'yyyy-MM-dd');
          const inMonth   = isSameMonth(day, month);
          const hasTrain  = trainedDays.has(key);
          const isToday   = key === today;
          const isSelected = selectedDate === key;

          return (
            <button
              key={i}
              onClick={() => inMonth && onSelect(key)}
              disabled={!inMonth}
              className={cn(
                'aspect-square mx-auto w-9 rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90',
                !inMonth && 'opacity-0 pointer-events-none',
                isSelected && 'bg-brand-red shadow-[0_2px_0_0_rgba(150,10,10,0.6)]',
                !isSelected && isToday && 'border border-brand-red/50',
                !isSelected && !isToday && 'hover:bg-white/5',
              )}
            >
              <span className={cn(
                'text-xs font-black',
                isSelected ? 'text-white' : isToday ? 'text-brand-red' : inMonth ? 'text-white/80' : 'text-white/10',
              )}>
                {format(day, 'd')}
              </span>
              {hasTrain && (
                <span className={cn(
                  'w-1 h-1 rounded-full mt-0.5',
                  isSelected ? 'bg-white/60' : 'bg-brand-red',
                )} />
              )}
            </button>
          );
        })}
      </div>

      {/* Clear button */}
      {selectedDate && (
        <button
          onClick={onClear}
          className="mt-4 w-full py-2.5 rounded-xl border border-white/10 text-xs font-black text-white/40 hover:text-white hover:border-white/20 transition-colors active:scale-95"
        >
          Limpar filtro — ver todos
        </button>
      )}
    </div>
  );
}


// ─── Session Card ─────────────────────────────────────────────────────────────

function SessionCard({
  session,
  templates,
  onEditSession,
  onRequestDelete,
}: {
  session: WorkoutSession;
  templates: WorkoutTemplate[];
  onEditSession: (s: WorkoutSession) => void;
  onRequestDelete: (id: string) => void;
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
            onClick={() => onRequestDelete(session.id)}
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
  onGenerateWithAI,
  onDeleteWorkout,
  onRenameWorkout,
  onUpdateTemplate,
  onGoToStore,
  onEditSession,
  onDeleteSession,
  scrollToHistory,
  onScrollHandled,
  highlightSessionId,
  onHighlightHandled,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile,
  trainers = [],
  onCreateAd,
  isLoggedIn,
  initialOpenCreateMenu,
  onCreateMenuMounted,
  activeSport: activeSportProp = '',
}: WorkoutsViewProps) {
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
  const [selectingSheetTemplate, setSelectingSheetTemplate] = useState<WorkoutTemplate | null>(null);
  const [showCreateMenu, setShowCreateMenu] = useState(!!initialOpenCreateMenu);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  // Open the create menu whenever the parent signals it (works even if component was already mounted)
  useEffect(() => {
    if (initialOpenCreateMenu) {
      setShowCreateMenu(true);
      onCreateMenuMounted?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOpenCreateMenu]);
  // filterDate: when navigating from Dashboard, shows only sessions from that date
  const [filterDate, setFilterDate] = useState<string | null>(null);
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Resolve the display sport from the global activeSport prop, falling back to the
  // user's primary specialty (or guest onboarding answer) when the prop is empty.
  const sport = useMemo(() => {
    if (activeSportProp) return activeSportProp;
    if (mainUserProfile?.specialties?.length) return mainUserProfile.specialties[0];
    if (!isLoggedIn) {
      try {
        const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null');
        if (wa?.sports?.length) return wa.sports[0] as string;
      } catch {}
    }
    return 'Musculação';
  }, [activeSportProp, mainUserProfile, isLoggedIn]);

  // Filter templates to only show those matching the active sport.
  const visibleTemplates = useMemo(() => {
    return templates.filter(t => {
      const tSport = t.sport ?? (() => {
        const known = ['Musculação', 'Crossfit', 'Corrida', 'Yoga', 'Natação', 'Ciclismo', 'Halterofilismo', 'Triatlo'];
        return known.find(s => t.name.toLowerCase().includes(s.toLowerCase())) ?? 'Musculação';
      })();
      return tSport === sport;
    });
  }, [templates, sport]);

  const historyRef = useRef<HTMLDivElement>(null);

  // When arriving from Dashboard with a highlighted session, filter by that day
  useEffect(() => {
    if (highlightSessionId) {
      const session = sessions.find(s => s.id === highlightSessionId);
      if (session) {
        try {
          setFilterDate(format(parseISO(session.date), 'yyyy-MM-dd'));
        } catch {}
      }
      onHighlightHandled?.();
    }
  }, [highlightSessionId]);

  useEffect(() => {
    if (scrollToHistory && historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth' });
      onScrollHandled?.();
    }
  }, [scrollToHistory, onScrollHandled]);

  // Draft recovery
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEYS.WORKOUT_DRAFT);
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
            localStorage.removeItem(STORAGE_KEYS.WORKOUT_DRAFT);
          }
        }
      } catch {
        // ignore malformed draft
      }
    }
  }, [onCreateWorkout]);

  return (
    <div className="pb-24">
      <WorkoutsHeader sport={sport} color={SPORT_COLORS[sport] ?? '#dc2626'} />

      <div className="space-y-6">
        {/* Create workout button */}
        <button
          onClick={() => setShowCreateMenu(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white active:scale-95 transition-transform"
          style={{
            background: `color-mix(in srgb, ${SPORT_COLORS[sport] ?? '#dc2626'} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${SPORT_COLORS[sport] ?? '#dc2626'} 50%, transparent)`,
          }}
        >
          Adicionar treino
        </button>

        {/* Templates section */}
        <div className="space-y-4">
          {visibleTemplates.length === 0 ? (
            <div className="text-center py-14 space-y-5">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                <img src={iconHalterofilismo} alt="" className="w-10 h-10 brightness-0 invert opacity-20" />
              </div>
              <div>
                <p className="text-white/50 font-black text-base">Nenhum treino criado</p>
                <p className="text-xs text-white/25 mt-1">Adicione seu primeiro treino para começar a evoluir.</p>
              </div>
            </div>
          ) : (
            visibleTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                sport={template.sport ?? sport}
                sessions={sessions}
                userProfile={userProfile}
                exerciseStats={exerciseStats}
                calorieProfile={calorieProfile}
                assessments={assessments}
                mainUserProfile={mainUserProfile}
                trainers={trainers}
                openSettingsId={openSettingsId}
                setOpenSettingsId={setOpenSettingsId}
                onDeleteWorkout={onDeleteWorkout}
                onRenameWorkout={onRenameWorkout}
                onUpdateTemplate={onUpdateTemplate}
                onStartWorkout={onStartWorkout}
                onSelectSheet={setSelectingSheetTemplate}
                onCreateAd={onCreateAd}
              />
            ))
          )}
        </div>

        {/* History section */}
        <div ref={historyRef} className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
              Histórico de Sessões
            </p>
            <div className="flex items-center gap-1.5 shrink-0">
              {filterDate && (
                <button
                  onClick={() => setFilterDate(null)}
                  className="p-1 text-white/30 hover:text-white transition-colors"
                  aria-label="Limpar filtro"
                >
                  <X size={13} strokeWidth={2.5} />
                </button>
              )}
              <button
                onClick={() => setShowDateFilter(true)}
                className={cn(
                  'relative w-7 h-7 flex items-center justify-center rounded-lg border transition-colors active:scale-95',
                  filterDate
                    ? 'bg-brand-red/15 border-brand-red/40 text-brand-red'
                    : 'bg-white/5 border-white/10 text-white/40',
                )}
                aria-label="Filtrar por data"
              >
                <CalendarIcon size={13} strokeWidth={2.5} />
                {filterDate && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-red" />
                )}
              </button>
            </div>
          </div>
          {sessions.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-white/3 border border-white/6">
              <p className="text-white/20 font-bold text-sm">Nenhuma sessão registrada</p>
            </div>
          ) : (() => {
            const displayed = sessions
              .slice()
              .reverse()
              .filter(s => {
                if (!filterDate) return true;
                try { return format(parseISO(s.date), 'yyyy-MM-dd') === filterDate; } catch { return false; }
              });
            if (displayed.length === 0) {
              return (
                <div className="text-center py-10 rounded-2xl bg-white/3 border border-white/6">
                  <p className="text-white/20 font-bold text-sm">Nenhuma sessão neste dia</p>
                </div>
              );
            }
            return (
              <div className="space-y-3">
                {displayed.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    templates={templates}
                    onEditSession={onEditSession}
                    onRequestDelete={setSessionToDelete}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Date Filter Bottom Sheet — full calendar */}
      <AnimatePresence>
        {showDateFilter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDateFilter(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border rounded-t-3xl p-5 z-[110]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black">Filtrar por Data</h3>
                <button onClick={() => setShowDateFilter(false)} className="p-2 text-white/20 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <DateFilterCalendar
                sessions={sessions}
                selectedDate={filterDate}
                onSelect={(date) => { setFilterDate(date); setShowDateFilter(false); }}
                onClear={() => { setFilterDate(null); setShowDateFilter(false); }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

      {/* Create Workout Bottom Sheet */}
      <AnimatePresence>
        {showCreateMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateMenu(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-0 z-[110] flex items-center justify-center px-4"
            >
              <div className="w-full max-w-sm bg-dark-card border border-dark-border rounded-3xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-black text-white">Adicionar treino</h3>
                  <button
                    onClick={() => setShowCreateMenu(false)}
                    className="p-1.5 text-white/30 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => { setShowCreateMenu(false); onGoToStore(); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl active:scale-95 transition-transform"
                    style={{ background: 'rgba(22, 163, 74, 0.12)', border: '1px solid rgba(22, 163, 74, 0.25)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#16A34A' }}>
                      <ShoppingBag size={18} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-white">Comprar novo treino</p>
                      <p className="text-xs text-white/35 mt-0.5">Adquira um treino na Loja</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setShowCreateMenu(false); onGenerateWithAI(sport); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl active:scale-95 transition-transform"
                    style={{ background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.25)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#7C3AED' }}>
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-white">Gerar treino com IA</p>
                      <p className="text-xs text-white/35 mt-0.5">A IA cria um treino personalizado pra você</p>
                    </div>
                  </button>
                  <button
                    onClick={() => { setShowCreateMenu(false); onCreateWorkout(); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-brand-red/10 border border-brand-red/20 active:scale-95 transition-transform"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-red shrink-0">
                      <Plus size={18} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-white">Criar treino</p>
                      <p className="text-xs text-white/35 mt-0.5">Monte seu próprio treino do zero</p>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Session Modal */}
      <DeleteSessionModal
        sessionId={sessionToDelete}
        onCancel={() => setSessionToDelete(null)}
        onConfirm={(id) => {
          onDeleteSession(id);
          setSessionToDelete(null);
        }}
      />
    </div>
  );
}
