import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
  Plus, ChevronRight, Settings, Trash2, Edit, Dumbbell,
  X, Check, Search, GripVertical, Pen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutTemplate, WorkoutTemplateExercise } from '../../domain/entities';
import { EXERCISES } from '@/src/domain/entities/exercises';
import { getInputMode, getDefaultSpeed } from '@/src/domain/use-cases/exerciseInputMode';
import { cn } from '../../utils/cn';

import iconMusculacao     from '@/src/assets/icons/icon-musculacao.svg';
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconCorrida        from '@/src/assets/icons/icon-corrida.svg';
import iconCiclismo       from '@/src/assets/icons/icon-ciclismo.svg';
import iconNatacao        from '@/src/assets/icons/icon-natacao.svg';
import iconCrossfit       from '@/src/assets/icons/icon-crossfit.svg';
import iconTriatlo        from '@/src/assets/icons/icon-triatlo.svg';
import iconYoga           from '@/src/assets/icons/icon-yoga.svg';

// ─── Sport maps ──────────────────────────────────────────────────────────────

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

const DEFAULT_COLOR = '#ea580c';

function sportOf(t: WorkoutTemplate): string {
  if (t.sport) return t.sport;
  const known = Object.keys(SPORT_COLORS);
  return known.find(s => t.name.toLowerCase().includes(s.toLowerCase())) ?? 'Musculação';
}

function getFirstExercises(t: WorkoutTemplate): WorkoutTemplateExercise[] {
  if (t.category === 'multicycle' && t.cycles?.length) {
    return t.cycles[0].sheets?.[0]?.exercises ?? [];
  }
  if (t.sheets?.length) return t.sheets[0].exercises ?? [];
  return t.exercises ?? [];
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface WorkoutTemplatesViewProps {
  studentName?: string;
  templates: WorkoutTemplate[];
  onSelect: (t: WorkoutTemplate) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onBack?: () => void;
  onUpdateTemplate?: (t: WorkoutTemplate) => void;
}

// ─── Header ──────────────────────────────────────────────────────────────────

function TemplatesHeader({
  studentName,
  onBack,
  onAdd,
}: {
  studentName?: string;
  onBack?: () => void;
  onAdd: () => void;
}) {
  const color = DEFAULT_COLOR;
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
        <div className="space-y-1 flex-1 pr-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-white/60 hover:text-white transition-colors mb-3 active:scale-95"
            >
              <ChevronRight size={16} className="rotate-180" />
              <span className="text-xs font-bold">Voltar</span>
            </button>
          )}
          <h1 className="text-2xl font-black text-white leading-tight">Treinos</h1>
          {studentName && (
            <p className="text-2xl font-black text-white leading-tight">{studentName}</p>
          )}
        </div>
        <button
          onClick={onAdd}
          className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center active:scale-95 transition-transform hover:bg-white/25"
        >
          <Dumbbell size={24} className="text-white" />
        </button>
      </div>
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
    </div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onDelete,
  onUpdateTemplate,
}: {
  template: WorkoutTemplate;
  onDelete: (id: string) => void;
  onUpdateTemplate?: (t: WorkoutTemplate) => void;
}) {
  const sport = sportOf(template);
  const color = SPORT_COLORS[sport] ?? DEFAULT_COLOR;
  const icon  = SPORT_ICONS[sport];

  // ── Settings dropdown ────────────────────────────────────────────────────
  const [openSettings, setOpenSettings] = useState(false);
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  // ── Rename ───────────────────────────────────────────────────────────────
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(template.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ── Inline edit ──────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<WorkoutTemplate>(template);
  const [selectedCycleIdx, setSelectedCycleIdx] = useState(0);
  const [selectedSheetIdx, setSelectedSheetIdx] = useState(0);
  const [showExSearch, setShowExSearch] = useState(false);
  const [exSearchQuery, setExSearchQuery] = useState('');
  const dragFromIdx = useRef<number>(-1);

  useEffect(() => {
    if (!isEditing) setEditDraft(template);
  }, [template, isEditing]);

  const startEditing = () => {
    setEditDraft(JSON.parse(JSON.stringify(template)));
    setOpenSettings(false);
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

  const startRename = () => {
    setRenameValue(template.name);
    setOpenSettings(false);
    setIsRenaming(true);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const commitRename = () => {
    // Persist via onUpdateTemplate keeping everything else intact
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== template.name) {
      onUpdateTemplate?.({ ...template, name: trimmed });
    }
    setIsRenaming(false);
  };

  // ── Draft exercise helpers ───────────────────────────────────────────────
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
    setDraftExercises(getDraftExercises().map((ex, i) => {
      if (i !== idx) return ex;
      if (field === 'numSets') return { ...ex, numSets: Math.max(1, parseInt(value) || 1) };
      return { ...ex, sets: value };
    }));
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
    if (getDraftExercises().some(e => e.exerciseId === exerciseId)) return;
    const exerciseData = EXERCISES.find(e => e.id === exerciseId);
    const exInputMode = getInputMode(exerciseData ?? { inputMode: undefined } as any);
    const isDuration = exInputMode === 'duration_only' || exInputMode === 'duration_distance' || exInputMode === 'duration_speed';
    const newEx: WorkoutTemplateExercise = {
      exerciseId,
      sets: isDuration ? '5 min' : '8-10',
      numSets: 3,
      rest: '60s',
      ...(exInputMode === 'duration_speed' ? { speedKmh: getDefaultSpeed(exerciseId) } : {}),
    };
    setDraftExercises([...getDraftExercises(), newEx]);
    setShowExSearch(false);
    setExSearchQuery('');
  };

  const filteredExercises = useMemo(() => {
    const q = exSearchQuery.trim().toLowerCase();
    if (!q) return EXERCISES.slice(0, 40);
    return EXERCISES.filter(e => e.name.toLowerCase().includes(q)).slice(0, 40);
  }, [exSearchQuery]);

  // ── View state ───────────────────────────────────────────────────────────
  const sheetCount =
    template.category === 'multicycle'
      ? (template.cycles?.[0]?.sheets?.length ?? 0)
      : (template.sheets?.length ?? 0);

  const subtitle =
    template.category === 'multicycle'
      ? `${template.cycles?.length ?? 0} Ciclos`
      : `${sheetCount} ${sheetCount === 1 ? 'ficha' : 'fichas'} por semana`;

  const exercises = getFirstExercises(template);
  const preview   = exercises.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(145deg, color-mix(in srgb, ${color} 8%, #1a1a1a) 0%, #151515 60%)`,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {/* Top accent stripe */}
      <div className="h-1 w-full" style={{ background: color }} />

      <div className="p-4 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-0.5">
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
              <h3 className="text-base font-black text-white leading-snug truncate">{template.name}</h3>
            )}
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">{subtitle}</p>
          </div>

          {/* Sport icon + settings */}
          <div className="flex items-center gap-1 shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              {icon
                ? <img src={icon} alt={sport} className="w-4 h-4 brightness-0 invert" />
                : <Dumbbell size={16} className="text-white" />}
            </div>
            <button
              ref={settingsBtnRef}
              onClick={() => {
                if (openSettings) {
                  setOpenSettings(false);
                } else {
                  if (settingsBtnRef.current) {
                    const r = settingsBtnRef.current.getBoundingClientRect();
                    setDropdownPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
                  }
                  setOpenSettings(true);
                }
              }}
              className="p-2 text-white/20 hover:text-white transition-colors"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>

        {/* Settings dropdown — portal */}
        {openSettings && ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOpenSettings(false)} />
            <div
              style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }}
              className="w-44 bg-dark-card border border-dark-border rounded-2xl shadow-2xl z-[100] overflow-hidden"
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
                <Edit size={13} /> Editar treino
              </button>
              <button
                onClick={() => { setOpenSettings(false); onDelete(template.id); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-400 hover:bg-white/5 transition-colors border-t border-dark-border"
              >
                <Trash2 size={13} /> Excluir
              </button>
            </div>
          </>,
          document.body
        )}

        {/* Exercise list — view mode */}
        {!isEditing && (() => {
          // Build sheets to show
          type SheetRow = { label: string | null; exercises: WorkoutTemplateExercise[] };
          let sheetsToShow: SheetRow[] = [];

          if (template.category === 'multicycle' && template.cycles?.length) {
            const cycles = template.cycles;
            const hasMultiple = cycles.length > 1;
            const clampedCycleIdx = Math.min(selectedCycleIdx, cycles.length - 1);
            const activeCycle = cycles[clampedCycleIdx];
            const sheets = activeCycle.sheets ?? [];
            const hasMultipleSheets = sheets.length > 1;
            const clampedSheetIdx = Math.min(selectedSheetIdx, Math.max(0, sheets.length - 1));
            const activeSheet = sheets[clampedSheetIdx];

            return (
              <div className="space-y-2">
                {hasMultiple && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {cycles.map((cycle, ci) => {
                      const isActive = ci === clampedCycleIdx;
                      return (
                        <button key={ci} onClick={() => { setSelectedCycleIdx(ci); setSelectedSheetIdx(0); }}
                          className={cn('shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                            isActive ? 'text-white' : 'text-white/30 bg-white/5 hover:text-white/60')}
                          style={isActive ? { backgroundColor: color } : {}}>
                          {cycle.name ?? `Ciclo ${ci + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}
                {hasMultipleSheets && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {sheets.map((sheet, si) => {
                      const isActive = si === clampedSheetIdx;
                      return (
                        <button key={si} onClick={() => setSelectedSheetIdx(si)}
                          className={cn('shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                            isActive ? 'text-white' : 'text-white/30 bg-white/5 hover:text-white/60')}
                          style={isActive ? { backgroundColor: color } : {}}>
                          {sheet.name ?? `Ficha ${si + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={`${clampedCycleIdx}-${clampedSheetIdx}`}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }} className="space-y-1.5">
                    {(activeSheet?.exercises ?? []).map((ex, idx) => {
                      const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
                      if (!exercise) return null;
                      return (
                        <div key={ex.exerciseId + idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/6">
                          <span className="text-sm font-black text-white/30 w-5 shrink-0 text-center tabular-nums">{idx + 1}</span>
                          <span className="w-px h-4 bg-white/10 shrink-0" />
                          <span className="text-sm font-bold text-white/80 flex-1 truncate">{exercise.name}</span>
                          <span className="text-xs font-bold text-white/40 shrink-0 tabular-nums">{ex.numSets} × {ex.sets}</span>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          }

          // Non-multicycle
          if (template.sheets?.length) {
            sheetsToShow = template.sheets.map(s => ({ label: s.name, exercises: s.exercises ?? [] }));
          } else if (template.exercises?.length) {
            sheetsToShow = [{ label: null, exercises: template.exercises }];
          }

          if (sheetsToShow.length === 0) return null;

          const hasMultipleSheets = sheetsToShow.length > 1;
          const clampedIdx = Math.min(selectedSheetIdx, sheetsToShow.length - 1);
          const activeSheet = sheetsToShow[clampedIdx];

          return (
            <div className="space-y-2">
              {hasMultipleSheets && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {sheetsToShow.map((sheet, si) => {
                    const isActive = si === clampedIdx;
                    return (
                      <button key={si} onClick={() => setSelectedSheetIdx(si)}
                        className={cn('shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                          isActive ? 'text-white' : 'text-white/30 bg-white/5 hover:text-white/60')}
                        style={isActive ? { backgroundColor: color } : {}}>
                        {sheet.label ?? `Ficha ${si + 1}`}
                      </button>
                    );
                  })}
                </div>
              )}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={clampedIdx}
                  initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }} className="space-y-1.5">
                  {activeSheet.exercises.map((ex, idx) => {
                    const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
                    if (!exercise) return null;
                    return (
                      <div key={ex.exerciseId + idx} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/6">
                        <span className="text-sm font-black text-white/30 w-5 shrink-0 text-center tabular-nums">{idx + 1}</span>
                        <span className="w-px h-4 bg-white/10 shrink-0" />
                        <span className="text-sm font-bold text-white/80 flex-1 truncate">{exercise.name}</span>
                        <span className="text-xs font-bold text-white/40 shrink-0 tabular-nums">{ex.numSets} × {ex.sets}</span>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
          );
        })()}

        {/* Exercise list — edit mode */}
        {isEditing && (() => {
          type SheetRow = { label: string | null; exercises: WorkoutTemplateExercise[] };

          // Multicycle edit
          if (editDraft.category === 'multicycle' && editDraft.cycles?.length) {
            const cycles = editDraft.cycles;
            const hasMultiple = cycles.length > 1;
            const clampedCycleIdx = Math.min(selectedCycleIdx, cycles.length - 1);
            const sheets = cycles[clampedCycleIdx].sheets ?? [];
            const hasMultipleSheets = sheets.length > 1;
            const clampedSheetIdx = Math.min(selectedSheetIdx, Math.max(0, sheets.length - 1));

            return (
              <div className="space-y-2">
                {hasMultiple && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {cycles.map((cycle, ci) => {
                      const isActive = ci === clampedCycleIdx;
                      return (
                        <button key={ci} onClick={() => { setSelectedCycleIdx(ci); setSelectedSheetIdx(0); }}
                          className={cn('shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                            isActive ? 'text-white' : 'text-white/30 bg-white/5 hover:text-white/60')}
                          style={isActive ? { backgroundColor: color } : {}}>
                          {cycle.name ?? `Ciclo ${ci + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}
                {hasMultipleSheets && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    {sheets.map((sheet, si) => {
                      const isActive = si === clampedSheetIdx;
                      return (
                        <button key={si} onClick={() => setSelectedSheetIdx(si)}
                          className={cn('shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                            isActive ? 'text-white' : 'text-white/30 bg-white/5 hover:text-white/60')}
                          style={isActive ? { backgroundColor: color } : {}}>
                          {sheet.name ?? `Ficha ${si + 1}`}
                        </button>
                      );
                    })}
                  </div>
                )}
                {renderEditExercises(color)}
              </div>
            );
          }

          // Non-multicycle edit: build sheet tabs
          let sheetsToShow: SheetRow[] = [];
          if (editDraft.sheets?.length) {
            sheetsToShow = editDraft.sheets.map(s => ({ label: s.name, exercises: s.exercises ?? [] }));
          } else {
            sheetsToShow = [{ label: null, exercises: editDraft.exercises ?? [] }];
          }
          const hasMultipleSheets = sheetsToShow.length > 1;
          const clampedIdx = Math.min(selectedSheetIdx, sheetsToShow.length - 1);

          return (
            <div className="space-y-2">
              {hasMultipleSheets && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {sheetsToShow.map((sheet, si) => {
                    const isActive = si === clampedIdx;
                    return (
                      <button key={si} onClick={() => setSelectedSheetIdx(si)}
                        className={cn('shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95',
                          isActive ? 'text-white' : 'text-white/30 bg-white/5 hover:text-white/60')}
                        style={isActive ? { backgroundColor: color } : {}}>
                        {sheet.label ?? `Ficha ${si + 1}`}
                      </button>
                    );
                  })}
                </div>
              )}
              {renderEditExercises(color)}
            </div>
          );
        })()}

        {/* Edit mode toolbar */}
        {isEditing && (
          <div className="flex items-center gap-2 pt-1">
            <button onClick={cancelEditing}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all">
              <X size={13} /> Descartar
            </button>
            <button onClick={commitEdit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all"
              style={{ backgroundColor: color }}>
              <Check size={13} /> Salvar
            </button>
          </div>
        )}

      </div>

      {/* Exercise search bottom-sheet */}
      <AnimatePresence>
        {showExSearch && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowExSearch(false); setExSearchQuery(''); }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200]" />
            <motion.div
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-dark-border rounded-t-3xl z-[210] flex flex-col"
              style={{ maxHeight: '70vh' }}
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
                <h3 className="text-base font-black">Adicionar exercício</h3>
                <button onClick={() => { setShowExSearch(false); setExSearchQuery(''); }} className="p-2 text-white/20 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="px-5 pb-3 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
                  <Search size={14} className="text-white/30 shrink-0" />
                  <input autoFocus type="text" placeholder="Buscar exercício…" value={exSearchQuery}
                    onChange={e => setExSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none" />
                  {exSearchQuery && (
                    <button onClick={() => setExSearchQuery('')} className="text-white/30 hover:text-white">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-y-auto flex-1 px-5 pb-6 space-y-1">
                {filteredExercises.map(ex => {
                  const alreadyAdded = getDraftExercises().some(e => e.exerciseId === ex.id);
                  return (
                    <button key={ex.id} disabled={alreadyAdded} onClick={() => addDraftEx(ex.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all active:scale-95',
                        alreadyAdded ? 'opacity-40 cursor-not-allowed bg-white/3' : 'bg-white/5 hover:bg-white/8 border border-white/6',
                      )}>
                      <div>
                        <p className="text-sm font-bold text-white leading-snug">{ex.name}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">{ex.muscleGroup}</p>
                      </div>
                      {alreadyAdded ? <Check size={14} className="text-white/30 shrink-0" /> : <Plus size={14} className="text-white/40 shrink-0" />}
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

  // ── Render edit exercise rows (shared between multicycle and basic) ────────
  function renderEditExercises(sportColor: string) {
    const exs = getDraftExercises();
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`edit-${selectedCycleIdx}-${selectedSheetIdx}`}
          initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.15 }} className="space-y-1.5"
        >
          {exs.map((ex, idx) => {
            const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
            if (!exercise) return null;
            return (
              <div key={ex.exerciseId + idx} data-drag-idx={idx}
                className="flex items-center gap-2 px-2 py-2.5 rounded-xl bg-white/6 border border-white/10">
                <span
                  className="text-white/25 active:text-white/60 cursor-grab active:cursor-grabbing shrink-0 select-none p-0.5"
                  onPointerDown={e => { dragFromIdx.current = idx; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
                  onPointerUp={e => {
                    const from = dragFromIdx.current; dragFromIdx.current = -1;
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
                    if (to >= 0 && to !== dragFromIdx.current) { reorderDraftEx(dragFromIdx.current, to); dragFromIdx.current = to; }
                  }}
                >
                  <GripVertical size={16} />
                </span>
                <span className="text-xs font-black text-white/25 w-4 shrink-0 text-center tabular-nums">{idx + 1}</span>
                <span className="w-px self-stretch bg-white/10 shrink-0" />
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <p className="text-xs font-bold text-white/85 truncate flex-1 min-w-0">{exercise.name}</p>
                  <div className="flex items-end gap-1.5 shrink-0">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">séries</span>
                      <input type="number" min={1} value={ex.numSets}
                        onChange={e => updateDraftExField(idx, 'numSets', e.target.value)}
                        className="w-9 text-center text-xs font-bold bg-white/10 border border-white/15 rounded-lg px-1 py-0.5 outline-none text-white" />
                    </div>
                    <span className="text-white/25 text-xs mb-0.5">×</span>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">
                        {['duration_distance', 'duration_only', 'duration_speed'].includes(getInputMode(exercise)) ? 'tempo' : 'reps.'}
                      </span>
                      <input type="text" value={ex.sets}
                        onChange={e => updateDraftExField(idx, 'sets', e.target.value)}
                        className="w-9 text-center text-xs font-bold bg-white/10 border border-white/15 rounded-lg px-1 py-0.5 outline-none text-white" />
                    </div>
                  </div>
                </div>
                <button onClick={() => confirm(`Remover "${exercise.name}" do treino?`) && removeDraftEx(idx)}
                  className="p-1.5 text-white/25 hover:text-white/60 active:scale-90 transition-all shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
          <button onClick={() => setShowExSearch(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/15 text-xs font-bold text-white/40 hover:text-white/70 hover:border-white/25 active:scale-95 transition-all">
            <Plus size={13} /> Adicionar exercício
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function WorkoutTemplatesView({
  studentName,
  templates,
  onSelect,
  onAdd,
  onDelete,
  onBack,
  onUpdateTemplate,
}: WorkoutTemplatesViewProps) {
  return (
    <div className="pb-24">
      <TemplatesHeader studentName={studentName} onBack={onBack} onAdd={onAdd} />

      <div className="space-y-6">
        <button
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white active:scale-95 transition-transform"
          style={{
            background: `color-mix(in srgb, ${DEFAULT_COLOR} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${DEFAULT_COLOR} 50%, transparent)`,
          }}
        >
          Adicionar treino
        </button>

        {templates.length === 0 ? (
          <div className="text-center py-14 space-y-5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <Dumbbell size={36} className="text-white/20" />
            </div>
            <div>
              <p className="text-white/50 font-black text-base">Nenhum treino criado</p>
              <p className="text-xs text-white/25 mt-1">Adicione o primeiro treino para este aluno.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onDelete={onDelete}
                  onUpdateTemplate={onUpdateTemplate}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
