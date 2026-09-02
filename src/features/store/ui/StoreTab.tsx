import React, { useState, useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Search, X, Star, ShoppingBag, Settings, Edit, Trash2, Pen, Plus, GripVertical, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreItem, StorePurchase, WorkoutTemplate, WorkoutTemplateExercise } from '@/src/domain/entities';
import { EXERCISES } from '@/src/domain/entities/exercises';
import { getInputMode, getDefaultSpeed } from '@/src/domain/use-cases/exerciseInputMode';
import { cn } from '@/src/utils/cn';

// Icons
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StoreSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-video bg-white/5" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-2/3" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-5 bg-white/5 rounded w-20" />
              <div className="h-9 bg-white/5 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── StoreItemCard ────────────────────────────────────────────────────────────

interface StoreItemCardProps {
  item: StoreItem;
  template: WorkoutTemplate | null;
  sport: string;
  sportColor: string;
  sportIcon: string;
  displayExercises: WorkoutTemplateExercise[];
  openSettingsId: string | null;
  setOpenSettingsId: (id: string | null) => void;
  dropdownPos: { top: number; right: number };
  setDropdownPos: (pos: { top: number; right: number }) => void;
  onRenameStoreItem?: (itemId: string, newTitle: string) => void;
  onUpdateStoreItem?: (item: StoreItem) => void;
  onUpdateTemplate?: (template: WorkoutTemplate) => void;
}

function StoreItemCard({
  item,
  template,
  sport,
  sportColor,
  sportIcon,
  displayExercises,
  openSettingsId,
  setOpenSettingsId,
  dropdownPos,
  setDropdownPos,
  onRenameStoreItem,
  onUpdateStoreItem,
  onUpdateTemplate,
}: StoreItemCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(item.title);
  const renameInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editPrice, setEditPrice] = useState((item.price / 100).toFixed(2));
  const [editDuration, setEditDuration] = useState(item.duration.toString());
  const [editDurationUnit, setEditDurationUnit] = useState<'weeks' | 'months'>(item.durationUnit);
  
  // Draft state for exercise editing
  const [editDraft, setEditDraft] = useState<WorkoutTemplate | null>(null);
  
  // Exercise search modal state
  const [showExSearch, setShowExSearch] = useState(false);
  const [exSearchQuery, setExSearchQuery] = useState('');
  
  // Drag and drop state
  const dragFromIdx = useRef(-1);

  const startRename = () => {
    setRenameValue(item.title);
    setOpenSettingsId(null);
    setIsRenaming(true);
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== item.title) {
      onRenameStoreItem?.(item.id, trimmed);
    }
    setIsRenaming(false);
  };

  const startEditing = () => {
    if (!template) {
      alert('Template não encontrado');
      return;
    }
    setEditPrice((item.price / 100).toFixed(2));
    setEditDuration(item.duration.toString());
    setEditDurationUnit(item.durationUnit);
    setEditDraft(JSON.parse(JSON.stringify(template))); // Deep copy
    setOpenSettingsId(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditPrice((item.price / 100).toFixed(2));
    setEditDuration(item.duration.toString());
    setEditDurationUnit(item.durationUnit);
    setEditDraft(null);
    setShowExSearch(false);
    setExSearchQuery('');
  };

  const commitEdit = () => {
    const priceValue = parseFloat(editPrice);
    if (isNaN(priceValue) || priceValue < 0) {
      alert('Preço inválido');
      return;
    }
    const durationValue = parseInt(editDuration);
    if (isNaN(durationValue) || durationValue < 1) {
      alert('Duração inválida');
      return;
    }
    const priceCents = Math.round(priceValue * 100);
    
    // Update price, duration, or durationUnit if changed
    const itemChanged = priceCents !== item.price || durationValue !== item.duration || editDurationUnit !== item.durationUnit;
    if (itemChanged) {
      onUpdateStoreItem?.({ ...item, price: priceCents, duration: durationValue, durationUnit: editDurationUnit });
    }
    
    // Update template exercises if changed
    if (editDraft && template) {
      const exercisesChanged = JSON.stringify(getDraftExercises()) !== JSON.stringify(displayExercises);
      if (exercisesChanged) {
        onUpdateTemplate?.(editDraft);
      }
    }
    
    setIsEditing(false);
    setEditDraft(null);
  };

  // ── Exercise editing helpers ─────────────────────────────────────────────

  /** Returns the exercises array for editing */
  const getDraftExercises = (): WorkoutTemplateExercise[] => {
    if (!editDraft) return displayExercises;
    
    // For multicycle templates
    if (editDraft.category === 'multicycle' && editDraft.cycles?.length) {
      const cycle = editDraft.cycles[0];
      if (cycle.sheets?.length) {
        return cycle.sheets[0].exercises ?? [];
      }
    }
    
    // For basic templates with sheets
    if (editDraft.sheets?.length) {
      return editDraft.sheets[0].exercises ?? [];
    }
    
    // For basic templates without sheets
    return editDraft.exercises ?? [];
  };

  /** Updates the exercises array in the draft */
  const setDraftExercises = (exs: WorkoutTemplateExercise[]) => {
    if (!editDraft) return;
    
    setEditDraft(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as WorkoutTemplate;
      
      // For multicycle templates
      if (next.category === 'multicycle' && next.cycles?.length) {
        const cycle = next.cycles[0];
        if (cycle.sheets?.length) {
          cycle.sheets[0].exercises = exs;
        }
      } 
      // For basic templates with sheets
      else if (next.sheets?.length) {
        next.sheets[0].exercises = exs;
      } 
      // For basic templates without sheets
      else {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: `linear-gradient(145deg, color-mix(in srgb, ${sportColor} 8%, #1a1a1a) 0%, #151515 60%)`,
        border: `1px solid color-mix(in srgb, ${sportColor} 30%, transparent)`,
      }}
    >
      {/* Top accent stripe */}
      <div className="h-1 w-full" style={{ background: sportColor }} />

      <div className="p-4 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-0.5 pr-2">
            {isRenaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') setIsRenaming(false);
                }}
                className="text-base font-black text-white leading-snug bg-white/10 border border-brand-red/50 rounded-lg px-2 py-0.5 outline-none w-full"
              />
            ) : (
              <h3 className="text-base font-black text-white leading-snug">{item.title}</h3>
            )}
            <p className="text-[10px] text-white/25 font-bold uppercase tracking-wide">
              Duração: {item.duration} {item.durationUnit === 'weeks' ? item.duration === 1 ? 'semana' : 'semanas' : item.duration === 1 ? 'mês' : 'meses'}
            </p>
          </div>

          {/* Sport icon with name + Settings menu */}
          <div className="relative shrink-0 flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: sportColor }}
              >
                <img
                  src={sportIcon}
                  alt={sport}
                  className="w-4 h-4 brightness-0 invert"
                />
              </div>
              <span className="text-xs font-bold text-white/70">{sport}</span>
            </div>
            <button
              onClick={(e) => {
                if (openSettingsId === item.id) {
                  setOpenSettingsId(null);
                } else {
                  const btn = e.currentTarget;
                  const r = btn.getBoundingClientRect();
                  setDropdownPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
                  setOpenSettingsId(item.id);
                }
              }}
              className="p-2 text-white/20 hover:text-white transition-colors"
            >
              <Settings size={17} />
            </button>
          </div>
        </div>

        {/* Settings dropdown */}
        {openSettingsId === item.id && ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOpenSettingsId(null)} />
            <div
              style={{ position: 'fixed', top: dropdownPos.top, right: dropdownPos.right }}
              className="w-36 bg-dark-card border border-dark-border rounded-2xl shadow-2xl z-[100] overflow-hidden"
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
                onClick={() => {
                  if (confirm(`Excluir "${item.title}" da loja?`)) {
                    setOpenSettingsId(null);
                    alert('Funcionalidade de exclusão será implementada.');
                  } else {
                    setOpenSettingsId(null);
                  }
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-xs font-bold text-red-400 hover:bg-white/5 transition-colors border-t border-dark-border"
              >
                <Trash2 size={13} /> Excluir
              </button>
            </div>
          </>,
          document.body
        )}

        {/* Exercise list */}
        {(isEditing ? getDraftExercises() : displayExercises).length > 0 && (
          <div className="space-y-1.5">
            {(isEditing ? getDraftExercises() : displayExercises).slice(0, isEditing ? undefined : 4).map((ex, idx) => {
              const exercise = EXERCISES.find((e) => e.id === ex.exerciseId);
              if (!exercise) return null;
              
              if (isEditing) {
                // Edit mode: full editing controls
                return (
                  <div
                    key={ex.exerciseId + idx}
                    data-drag-idx={idx}
                    className="flex items-center gap-2 px-2 py-2.5 rounded-xl bg-white/6 border border-white/10 transition-opacity"
                  >
                    {/* Drag handle */}
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
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <p className="text-xs font-bold text-white/85 truncate text-center">{exercise.name}</p>
                      <div className="flex items-end justify-center gap-1.5">
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
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-wide">
                            {getInputMode(exercise) === 'duration_distance' || getInputMode(exercise) === 'duration_only' || getInputMode(exercise) === 'duration_speed' ? 'tempo' : 'reps.'}
                          </span>
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
              
              // View mode: read-only display
              return (
                <div
                  key={ex.exerciseId + idx}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/4 border border-white/6"
                >
                  <span className="text-sm font-black text-white/30 w-5 shrink-0 text-center tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="w-px h-4 bg-white/10 shrink-0" />
                  <span className="text-sm font-bold text-white/80 flex-1 truncate">
                    {exercise.name}
                  </span>
                  <span className="text-xs font-bold text-white/40 shrink-0 tabular-nums">
                    {ex.numSets} × {ex.sets}
                  </span>
                </div>
              );
            })}
            {!isEditing && displayExercises.length > 4 && (
              <p className="text-[10px] text-white/20 italic text-center pt-1">
                + {displayExercises.length - 4} exercícios
              </p>
            )}
            {isEditing && (
              <button
                onClick={() => setShowExSearch(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/15 text-xs font-bold text-white/40 hover:text-white/70 hover:border-white/25 active:scale-95 transition-all"
              >
                <Plus size={13} /> Adicionar exercício
              </button>
            )}
          </div>
        )}

        {/* Edit mode toolbar (simplified for now) */}
        {isEditing && (
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wide block mb-2">
                Editar Preço
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white/60">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-bold outline-none focus:border-brand-red/50"
                  placeholder="0,00"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wide block mb-2">
                Duração do Anúncio
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-20 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-bold outline-none focus:border-brand-red/50 text-center"
                />
                <select
                  value={editDurationUnit}
                  onChange={(e) => setEditDurationUnit(e.target.value as 'weeks' | 'months')}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-bold outline-none focus:border-brand-red/50"
                >
                  <option value="weeks">Semanas</option>
                  <option value="months">Meses</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={cancelEditing}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white/50 bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
              >
                <X size={13} /> Cancelar
              </button>
              <button
                onClick={commitEdit}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all"
                style={{ backgroundColor: sportColor }}
              >
                ✓ Salvar
              </button>
            </div>
          </div>
        )}

        {/* Store attributes: price, rating, sales */}
        {!isEditing && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-brand-red font-black text-lg">
                {formatPrice(item.price)}
              </span>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <div className="flex items-center gap-1.5">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">
                    {item.rating > 0 ? item.rating.toFixed(1) : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag size={12} />
                  <span className="font-bold">{item.salesCount} vendas</span>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center">
              {item.status === 'draft' && (
                <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded text-[9px] font-black text-yellow-400 uppercase tracking-wider">
                  Rascunho
                </span>
              )}
              {item.status === 'published' && (
                <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                  Publicado
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Exercise Search Modal */}
      <AnimatePresence>
        {showExSearch && (
          <>
            <div
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

// ─── StoreTab ─────────────────────────────────────────────────────────────────

export interface StoreTabProps {
  storeItems: StoreItem[];
  myPurchases: StorePurchase[];
  templates: WorkoutTemplate[];
  isLoadingItems: boolean;
  onGoToWorkouts: () => void;
  claimFreeItem: (itemId: string) => Promise<{ success: boolean; purchaseId: string }>;
  onRenameStoreItem?: (itemId: string, newTitle: string) => void;
  onUpdateStoreItem?: (item: StoreItem) => void;
  onUpdateTemplate?: (template: WorkoutTemplate) => void;
  tabSwitcher?: React.ReactNode;
  userEmail?: string;
  userType?: 'athlete' | 'trainer';
  /** Currently active sport — used to filter store items shown to athletes */
  activeSport?: string;
}

export function StoreTab({
  storeItems,
  myPurchases,
  templates,
  isLoadingItems,
  onGoToWorkouts,
  claimFreeItem,
  onRenameStoreItem,
  onUpdateStoreItem,
  onUpdateTemplate,
  tabSwitcher,
  userEmail,
  userType,
  activeSport,
}: StoreTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [paidBlockedMsg, setPaidBlockedMsg] = useState<string | null>(null);

  const purchasedItemIds = new Set(myPurchases.map((p) => p.itemId));
  const storeWorkouts = storeItems.filter((i) => i.type === 'workout');
  const myPurchasedItems = storeWorkouts.filter((i) => purchasedItemIds.has(i.id));
  const myAnnouncements = userEmail && userType === 'trainer'
    ? storeWorkouts.filter((i) => i.creatorEmail.toLowerCase() === userEmail.toLowerCase())
    : [];
  const myAnnouncementIds = new Set(myAnnouncements.map((a) => a.id));

  // For athletes: only show items matching the active sport (items without a sport are shown to all).
  // Trainers see all items in the search catalogue.
  const sportFilteredWorkouts = (userType === 'athlete' && activeSport)
    ? storeWorkouts.filter((i) => !('sport' in i) || !(i as any).sport || (i as any).sport === activeSport)
    : storeWorkouts;

  const totalCount = sportFilteredWorkouts.length;

  const filteredWorkouts = searchTerm.trim()
    ? sportFilteredWorkouts.filter((i) =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) && !myAnnouncementIds.has(i.id)
      )
    : sportFilteredWorkouts.filter((i) => !myAnnouncementIds.has(i.id));

  const handleBuyItem = useCallback(
    async (item: StoreItem) => {
      if (buyingId) return;

      // Paid items are disabled — payment system is offline
      if (item.price !== 0) {
        setPaidBlockedMsg('Sistema de pagamentos fora do ar. Tente novamente mais tarde.');
        return;
      }

      setBuyingId(item.id);
      try {
        await claimFreeItem(item.id);
      } catch (err) {
        console.error('[StoreTab] claimFreeItem error:', err);
      } finally {
        setBuyingId(null);
      }
    },
    [buyingId, claimFreeItem],
  );

  return (
    <div className="space-y-6">
      {/* Payment unavailable modal */}
      <AnimatePresence>
        {paidBlockedMsg && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaidBlockedMsg(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="fixed inset-x-6 top-1/2 -translate-y-1/2 z-[160] bg-dark-card border border-dark-border rounded-3xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                  <ShoppingBag size={24} className="text-red-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white">Pagamento indisponível</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{paidBlockedMsg}</p>
                </div>
              </div>
              <button
                onClick={() => setPaidBlockedMsg(null)}
                className="w-full py-3 rounded-2xl bg-white/10 text-white text-sm font-bold active:scale-95 transition-transform"
              >
                Entendido
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Hero Header */}
      <div
        className="relative overflow-hidden -mx-6 mb-6"
        style={{ background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 60%, #4ADE80 100%)' }}
      >
        <div className="px-6 pt-10 pb-8 flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white leading-tight">Loja</h1>
            <p className="text-white/70 text-sm font-semibold">Compre treinos de especialistas</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShoppingBag size={36} className="text-white" />
          </div>
        </div>
        {tabSwitcher}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Search Button */}
      <button
        onClick={() => setShowSearchModal(true)}
        className="w-full py-3 bg-white/5 border border-emerald-500/50 text-white/60 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Search size={16} />
        Buscar treinos
      </button>

      {/* My Purchases - Only for athletes */}
      {userType === 'athlete' && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
            Minhas Compras
          </p>
          
          {myPurchasedItems.length > 0 ? (
            <div className="space-y-3">
              {myPurchasedItems.map((item) => {
                const purchase = myPurchases.find((p) => p.itemId === item.id);
                const purchaseDate = purchase?.purchasedAt 
                  ? new Date(purchase.purchasedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                  : null;
                
                return (
                  <div
                    key={item.id}
                    className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3 hover:border-emerald-500/30 transition-all"
                  >
                    {/* Header with title and badge */}
                    <div className="space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold leading-tight flex-1">{item.title}</h3>
                        <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-[9px] font-black text-emerald-400 uppercase tracking-wider flex-shrink-0">
                          Adquirido
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-[11px] text-white/30 font-medium">por {item.creatorName}</p>
                      {purchaseDate && (
                        <p className="text-[10px] text-white/25 font-bold uppercase tracking-wide">Comprado em {purchaseDate}</p>
                      )}
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/40 uppercase tracking-wide"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-white/40">
                      <div className="flex items-center gap-1.5">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{item.rating > 0 ? item.rating.toFixed(1) : '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag size={12} />
                        <span className="font-bold">{item.salesCount} vendas</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={onGoToWorkouts}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Acessar
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag size={24} className="text-white/15" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white/60">Nenhuma compra realizada</p>
                <p className="text-xs text-white/30 leading-relaxed">
                  Explore treinos de especialistas e impulsione seus resultados
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Storefront - Only for trainers */}
      {userType === 'trainer' && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
            Minha Vitrine
          </p>
          
          {myAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {myAnnouncements.map((item) => {
                // Find the corresponding template
                const template = item.type === 'workout' 
                  ? templates.find(t => t.id === item.templateId)
                  : null;
                
                const sport = template?.sport ?? 'Musculação';
                const sportColor = SPORT_COLORS[sport] ?? '#dc2626';
                const sportIcon = SPORT_ICONS[sport] ?? iconMusculacao;
                
                // Get exercises from template
                const exercises = template?.exercises ?? [];
                const sheetExercises = template?.sheets?.[0]?.exercises ?? [];
                const cycleExercises = template?.category === 'multicycle' && template?.cycles?.length
                  ? template.cycles[0]?.sheets?.[0]?.exercises ?? []
                  : [];
                const displayExercises = exercises.length > 0 ? exercises : sheetExercises.length > 0 ? sheetExercises : cycleExercises;

                return (
                  <StoreItemCard
                    key={item.id}
                    item={item}
                    template={template}
                    sport={sport}
                    sportColor={sportColor}
                    sportIcon={sportIcon}
                    displayExercises={displayExercises}
                    openSettingsId={openSettingsId}
                    setOpenSettingsId={setOpenSettingsId}
                    dropdownPos={dropdownPos}
                    setDropdownPos={setDropdownPos}
                    onRenameStoreItem={onRenameStoreItem}
                    onUpdateStoreItem={onUpdateStoreItem}
                    onUpdateTemplate={onUpdateTemplate}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white/60">Nenhum treino à venda</p>
                <p className="text-xs text-white/30 leading-relaxed">
                  Comece a vender seus treinos e alcance mais alunos
                </p>
              </div>
              <button
                onClick={onGoToWorkouts}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                Publicar Treino
              </button>
            </div>
          )}
        </div>
      )}

      {isLoadingItems && <StoreSkeleton />}

      {/* Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSearchModal(false);
                setSearchTerm('');
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-[80vh] bg-dark-surface border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Buscar Treinos</h3>
                  <button
                    onClick={() => {
                      setShowSearchModal(false);
                      setSearchTerm('');
                    }}
                    className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar treinos..."
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Workouts List */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredWorkouts.length > 0 ? (
                  <div className="space-y-3">
                    {filteredWorkouts.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3 hover:border-brand-red/30 transition-all">
                          {/* Header with title and purchased badge */}
                          <div className="space-y-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold leading-tight flex-1">{item.title}</h3>
                              {purchasedItemIds.has(item.id) && (
                                <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-[9px] font-black text-emerald-400 uppercase tracking-wider flex-shrink-0">
                                  Adquirido
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{item.description}</p>
                            )}
                            <p className="text-[11px] text-white/30 font-medium">por {item.creatorName}</p>
                          </div>

                          {/* Tags */}
                          {item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {item.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/40 uppercase tracking-wide"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-white/40">
                            <div className="flex items-center gap-1.5">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              <span className="font-bold">{item.rating > 0 ? item.rating.toFixed(1) : '—'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ShoppingBag size={12} />
                              <span className="font-bold">{item.salesCount} vendas</span>
                            </div>
                          </div>

                          {/* Price + CTA */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-brand-red font-black text-base">
                              {item.price === 0 ? 'GRÁTIS' : formatPrice(item.price)}
                            </span>
                            {purchasedItemIds.has(item.id) ? (
                              <button
                                onClick={onGoToWorkouts}
                                className="px-4 py-2.5 bg-emerald-500 text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
                              >
                                Acessar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBuyItem(item)}
                                disabled={buyingId === item.id}
                                className="px-4 py-2.5 bg-brand-red text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-brand-red/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {buyingId === item.id ? '...' : 'Comprar'}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Search size={24} className="text-white/15" />
                    </div>
                    <p className="text-sm text-white/30">
                      {searchTerm
                        ? `Nenhum treino encontrado para "${searchTerm}"`
                        : 'Digite para buscar treinos'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
