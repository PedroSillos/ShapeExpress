import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, ChevronDown, Info, Search, SlidersHorizontal, Play, Check, Plus, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addMonths, parseISO } from 'date-fns';
import { cn } from '../../utils/cn';
import { STORAGE_KEYS } from '../../shared/lib/storageKeys';
import { EXERCISES } from '../../constants';
import { Card } from '../components/Card';
import { ConfigureExercisesView } from '../components/ConfigureExercisesView';
import iconMusculacao from '@/src/assets/icons/icon-musculacao.svg';
import { ALL_SPORTS } from '../../features/sports/constants';
import { exerciseBelongsToSport } from '../../domain/use-cases/sportExercises';
import { 
  WorkoutTemplate, 
  WorkoutCycle, 
  WorkoutSheet, 
  WorkoutCategory, 
  MuscleGroup, 
  MuscleSubgroup, 
  ExerciseCategory, 
  Equipment, 
  Exercise, 
  UserProfile 
} from '../../domain/entities';

// ---------------------------------------------------------------------------
// ProtocolInfoStep — step 1 of the workout creation flow
// ---------------------------------------------------------------------------

/** Shared label style — matches "NOME DO TREINO" exactly */
const LABEL_CLASS = 'text-[10px] text-white/40 font-bold uppercase tracking-widest px-1';

interface InlineCycle {
  id: string;
  startDate: string;
  endDate: string;
}

interface ProtocolInfoStepProps {
  initialTemplate?: WorkoutTemplate;
  selectedSport: string;
  sportColor: string;
  isNameFilled: boolean;
  isDuplicateName: boolean;
  protocolName: string;
  setProtocolName: (v: string) => void;
  isMulticycle: boolean;
  onToggleMulticycle: (next: boolean) => void;
  inlineCycles: InlineCycle[];
  setInlineCycles: React.Dispatch<React.SetStateAction<InlineCycle[]>>;
  onCancel: () => void;
  onNext: () => void;
}

function ProtocolInfoStep({
  initialTemplate,
  selectedSport,
  sportColor,
  isNameFilled,
  isDuplicateName,
  protocolName,
  setProtocolName,
  isMulticycle,
  onToggleMulticycle,
  inlineCycles,
  setInlineCycles,
  onCancel,
  onNext,
}: ProtocolInfoStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMulticicloInfo, setShowMulticicloInfo] = useState(false);

  const canAdvance = isNameFilled && !isDuplicateName;

  const toggleMulticycle = () => {
    const next = !isMulticycle;
    onToggleMulticycle(next);
  };

  const addInlineCycle = () => {
    const last = inlineCycles[inlineCycles.length - 1];
    // Next cycle starts exactly 1 month after the previous one started,
    // keeping the same day-of-month across all cycles.
    const lastStart = parseISO(last.startDate);
    const nextStart = addMonths(lastStart, 1);
    const nextEnd = addMonths(nextStart, 1);
    // End is the day before the following cycle starts
    const nextEndMinusOne = new Date(nextEnd.getTime() - 86_400_000);
    setInlineCycles(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        startDate: format(nextStart, 'yyyy-MM-dd'),
        endDate: format(nextEndMinusOne, 'yyyy-MM-dd'),
      },
    ]);
  };

  const removeInlineCycle = (id: string) => {
    if (inlineCycles.length === 1) return;
    setInlineCycles(prev => {
      const filtered = prev.filter(c => c.id !== id);
      // Recalculate from the first cycle's start, keeping same day-of-month
      return filtered.map((c, idx) => {
        if (idx === 0) return c;
        const firstStart = parseISO(filtered[0].startDate);
        const newStart = addMonths(firstStart, idx);
        const newEnd = new Date(addMonths(firstStart, idx + 1).getTime() - 86_400_000);
        return { ...c, startDate: format(newStart, 'yyyy-MM-dd'), endDate: format(newEnd, 'yyyy-MM-dd') };
      });
    });
  };

  const updateInlineCycle = (id: string, field: 'startDate' | 'endDate', value: string) => {
    setInlineCycles(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div
        className="relative overflow-hidden -mx-6 mb-6"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${sportColor} 80%, #000) 0%, ${sportColor} 100%)`,
        }}
      >
        <div className="px-6 pt-10 pb-8 flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white leading-tight">
              {initialTemplate ? 'Editar treino' : 'Novo treino'}
            </h1>
            <p className="text-white/70 text-sm font-semibold">{selectedSport}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
              <img
                src={ALL_SPORTS.find(s => s.id === selectedSport)?.icon ?? iconMusculacao}
                alt=""
                className="w-12 h-12 brightness-0 invert"
              />
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 p-2 bg-black/20 rounded-full text-white/70 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        {/* decorative circles */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
      </div>

      <Card className="space-y-5 p-6">
        {/* Nome do treino */}
        <div className="space-y-2">
          <label className={LABEL_CLASS}>Nome do Treino</label>
          <input
            type="text"
            value={protocolName}
            onChange={(e) => setProtocolName(e.target.value)}
            placeholder={`Meu treino de ${selectedSport}`}
            className={cn(
              'w-full bg-dark-surface border rounded-2xl p-4 focus:outline-none transition-colors',
              isDuplicateName
                ? 'border-red-500/60 focus:border-red-500'
                : 'border-dark-border focus:border-gray-400'
            )}
          />
          {isDuplicateName && (
            <p className="text-[10px] text-red-400 font-bold px-1">
              Já existe um treino com este nome.
            </p>
          )}
        </div>

        {/* Toggle seção avançado */}
        <button
          onClick={() => setShowAdvanced(v => !v)}
          className="flex items-center justify-between w-full py-1"
        >
          <span className={LABEL_CLASS}>Avançado</span>
          <ChevronDown
            size={16}
            className="transition-transform duration-300"
            style={{
              color: 'rgba(255,255,255,0.3)',
              transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Seção avançado colapsável */}
        <AnimatePresence initial={false}>
          {showAdvanced && (
            <motion.div
              key="advanced"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-1">

                {/* Multiciclo toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={LABEL_CLASS}>Multiciclo</span>
                    <button
                      onClick={() => setShowMulticicloInfo(true)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                      aria-label="Saiba mais sobre Multiciclo"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                  <button
                    role="switch"
                    aria-checked={isMulticycle}
                    onClick={toggleMulticycle}
                    className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none flex-shrink-0"
                    style={{ backgroundColor: isMulticycle ? sportColor : 'rgba(255,255,255,0.1)' }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                      style={{ transform: isMulticycle ? 'translateX(24px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>

                {/* Basic mode: single start/end */}
                {!isMulticycle && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className={LABEL_CLASS}>Início</label>
                      <input
                        type="date"
                        value={inlineCycles[0].startDate}
                        onChange={(e) => updateInlineCycle(inlineCycles[0].id, 'startDate', e.target.value)}
                        className="w-full bg-dark-surface border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={LABEL_CLASS}>Fim</label>
                      <input
                        type="date"
                        value={inlineCycles[0].endDate}
                        onChange={(e) => updateInlineCycle(inlineCycles[0].id, 'endDate', e.target.value)}
                        className="w-full bg-dark-surface border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Multicycle mode: list of cycles */}
                {isMulticycle && (
                  <div className="space-y-3">
                    {inlineCycles.map((cycle, idx) => (
                      <div
                        key={cycle.id}
                        className="bg-dark-surface border border-dark-border rounded-2xl p-4 space-y-3"
                      >
                        {/* Cycle header */}
                        <div className="flex items-center justify-between">
                          <span className={LABEL_CLASS}>Ciclo {idx + 1}</span>
                          <button
                            onClick={() => removeInlineCycle(cycle.id)}
                            disabled={inlineCycles.length === 1}
                            aria-label={`Remover Ciclo ${idx + 1}`}
                            className={cn(
                              'p-1 rounded-lg transition-colors',
                              inlineCycles.length === 1
                                ? 'text-white/10 cursor-not-allowed'
                                : 'text-white/40 hover:text-white/70'
                            )}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Cycle dates */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className={LABEL_CLASS}>Início</label>
                            <input
                              type="date"
                              value={cycle.startDate}
                              onChange={(e) => updateInlineCycle(cycle.id, 'startDate', e.target.value)}
                              className="w-full bg-dark-card border border-dark-border rounded-xl p-3 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className={LABEL_CLASS}>Fim</label>
                            <input
                              type="date"
                              value={cycle.endDate}
                              onChange={(e) => updateInlineCycle(cycle.id, 'endDate', e.target.value)}
                              className="w-full bg-dark-card border border-dark-border rounded-xl p-3 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add cycle */}
                    <button
                      onClick={addInlineCycle}
                      className="w-full py-3 bg-white/5 border border-dashed border-white/10 rounded-2xl text-white/40 font-bold text-xs flex items-center justify-center gap-2 hover:border-white/20 hover:text-white/60 transition-all"
                    >
                      <Plus size={14} /> Adicionar ciclo
                    </button>
                  </div>
                )}

                {/* Modal explicação Multiciclo */}
                <AnimatePresence>
                  {showMulticicloInfo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/70 z-[300] flex items-end justify-center p-4"
                      onClick={() => setShowMulticicloInfo(false)}
                    >
                      <motion.div
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="w-full max-w-md bg-dark-card rounded-3xl p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: `${sportColor}25` }}
                        >
                          <Info size={20} style={{ color: sportColor }} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-white">O que é Multiciclo?</h3>
                          <p className="text-sm text-white/50 leading-relaxed">
                            Um treino multiciclo é dividido em ciclos com{' '}
                            <span className="text-white/80 font-semibold">períodos de tempo definidos</span>.
                          </p>
                          <p className="text-sm text-white/50 leading-relaxed">
                            Você configura os exercícios de cada ciclo separadamente. Útil para definir progressão ao longo do tempo.
                          </p>
                          <p className="text-sm text-white/50 leading-relaxed">
                            <span className="text-white/80 font-semibold">Indicado para usuários avançados.</span>
                          </p>
                        </div>
                        <button
                          onClick={() => setShowMulticicloInfo(false)}
                          className="w-full py-3 rounded-2xl font-bold text-sm text-white/60 bg-white/5"
                        >
                          Entendi
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão Avançar */}
        <button
          onClick={onNext}
          disabled={!canAdvance}
          className={cn(
            'w-full py-4 rounded-2xl font-bold transition-all active:scale-95',
            canAdvance
              ? 'text-white shadow-lg'
              : 'bg-white/10 text-white/20 cursor-not-allowed'
          )}
          style={canAdvance ? { backgroundColor: sportColor, boxShadow: `0 8px 24px ${sportColor}40` } : undefined}
        >
          Avançar
        </button>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface CreateWorkoutViewProps {
  onSave: (t: WorkoutTemplate) => void;
  onCancel: () => void;
  initialTemplate?: WorkoutTemplate;
  userProfile: UserProfile;
  studentEmail?: string;
  initialSport?: string;
  existingTemplates?: WorkoutTemplate[];
}

export function CreateWorkoutView({ 
  onSave, 
  onCancel, 
  initialTemplate,
  userProfile,
  studentEmail,
  initialSport,
  existingTemplates = [],
}: CreateWorkoutViewProps) {
  const [step, setStep] = useState<'protocol-info' | 'cycle-list' | 'num-sheets' | 'exercise-selection' | 'exercise-configuration'>(
    initialTemplate 
      ? (initialTemplate.category === 'multicycle' ? 'cycle-list' : 'exercise-selection') 
      : 'protocol-info'
  );
  const [protocolName, setProtocolName] = useState(initialTemplate?.name || '');
  const [category, setCategory] = useState<WorkoutCategory>(initialTemplate?.category || 'basic');
  const [startDate, setStartDate] = useState(initialTemplate?.startDate || format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initialTemplate?.endDate || format(addMonths(new Date(), 1), 'yyyy-MM-dd'));

  // Inline cycles used in the protocol-info step.
  // Seeded from the existing template's cycles (if editing) or a single default cycle.
  const [inlineCycles, setInlineCycles] = useState<Array<{ id: string; startDate: string; endDate: string }>>(() => {
    if (initialTemplate?.cycles && initialTemplate.cycles.length > 0) {
      return initialTemplate.cycles.map(c => ({ id: c.id, startDate: c.startDate, endDate: c.endDate }));
    }
    const start = initialTemplate?.startDate || format(new Date(), 'yyyy-MM-dd');
    const end = initialTemplate?.endDate || format(
      new Date(addMonths(parseISO(start), 1).getTime() - 86_400_000),
      'yyyy-MM-dd'
    );
    return [{ id: Math.random().toString(36).substr(2, 9), startDate: start, endDate: end }];
  });

  // Toggle state for the multicycle switch in protocol-info step
  const [isMulticycleToggle, setIsMulticycleToggle] = useState(
    initialTemplate?.category === 'multicycle'
  );

  // Snapshot of cycles before turning the toggle off, so they are restored if re-enabled
  const savedCyclesRef = React.useRef<Array<{ id: string; startDate: string; endDate: string }>>([]);

  const handleToggleMulticycle = (next: boolean) => {
    setIsMulticycleToggle(next);
    if (!next) {
      // Save current cycles before collapsing
      savedCyclesRef.current = inlineCycles;
      setInlineCycles(prev => [prev[0]]);
    } else {
      // Restore saved cycles if any (user toggled back on)
      if (savedCyclesRef.current.length > 1) {
        setInlineCycles(savedCyclesRef.current);
        savedCyclesRef.current = [];
      } else {
        // First time enabling: add a second cycle automatically
        setInlineCycles(prev => {
          const first = prev[0];
          const nextStart = addMonths(parseISO(first.startDate), 1);
          const nextEnd = new Date(addMonths(nextStart, 1).getTime() - 86_400_000);
          return [
            first,
            {
              id: Math.random().toString(36).substr(2, 9),
              startDate: format(nextStart, 'yyyy-MM-dd'),
              endDate: format(nextEnd, 'yyyy-MM-dd'),
            },
          ];
        });
      }
    }
  };

  // Duplicate name check — case-insensitive, ignoring the template being edited
  const isDuplicateName = useMemo(() => {
    const trimmed = protocolName.trim().toLowerCase();
    if (!trimmed) return false;
    return existingTemplates.some(
      t => t.name.trim().toLowerCase() === trimmed && t.id !== initialTemplate?.id
    );
  }, [protocolName, existingTemplates, initialTemplate?.id]);
  
  const [cycles, setCycles] = useState<WorkoutCycle[]>(initialTemplate?.cycles || []);
  const [currentCycleIndex, setCurrentCycleIndex] = useState<number | null>(null);

  const [numSheets, setNumSheets] = useState(initialTemplate?.sheets?.length || 1);
  const [sheets, setSheets] = useState<WorkoutSheet[]>(() => {
    if (initialTemplate?.sheets) return initialTemplate.sheets;
    return [{ id: Math.random().toString(36).substr(2, 9), name: '', order: 0, exerciseIds: [], exercises: [] }];
  });

  const defaultSport = useMemo(() => {
    if (userProfile?.specialties?.length) return userProfile.specialties[0];
    try {
      const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null');
      if (wa?.sports?.length) return wa.sports[0] as string;
    } catch {}
    return 'Musculação';
  }, [userProfile]);

  const [selectedSport, setSelectedSport] = useState<string>(
    initialTemplate?.sport ?? initialSport ?? defaultSport
  );

  const sport = selectedSport;

  // Draft saving logic
  useEffect(() => {
    if (initialTemplate) return; // Don't save drafts when editing existing templates
    
    const draft = {
      protocolName,
      category,
      selectedSport,
      startDate,
      endDate,
      cycles,
      numSheets,
      sheets,
      step
    };
    localStorage.setItem(STORAGE_KEYS.WORKOUT_DRAFT, JSON.stringify(draft));
  }, [protocolName, category, selectedSport, startDate, endDate, cycles, numSheets, sheets, step, initialTemplate]);

  // Load draft on mount
  useEffect(() => {
    if (initialTemplate) return;
    
    const savedDraft = localStorage.getItem(STORAGE_KEYS.WORKOUT_DRAFT);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Only ask if there's actual progress
        if (draft.protocolName || draft.cycles.length > 0 || draft.sheets[0].exerciseIds.length > 0) {
          if (confirm('Você tem um rascunho de treino não finalizado. Deseja continuar de onde parou?')) {
            setProtocolName(draft.protocolName);
            setCategory(draft.category);
            if (draft.selectedSport) setSelectedSport(draft.selectedSport);
            setStartDate(draft.startDate);
            setEndDate(draft.endDate);
            setCycles(draft.cycles);
            setNumSheets(draft.numSheets);
            setSheets(draft.sheets);
            setStep(draft.step);
          } else {
            localStorage.removeItem(STORAGE_KEYS.WORKOUT_DRAFT);
          }
        }
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }, [initialTemplate]);

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEYS.WORKOUT_DRAFT);
  };
  
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [showFichasInfo, setShowFichasInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedMuscleSubgroup, setSelectedMuscleSubgroup] = useState<MuscleSubgroup | 'Todos'>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'Todos'>('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'Todos'>('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [selectedExerciseForVideo, setSelectedExerciseForVideo] = useState<Exercise | null>(null);

  const activeSheet = sheets[activeSheetIndex];

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSport = exerciseBelongsToSport(ex.id, selectedSport);
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscleGroup === 'Todos' || ex.muscleGroup === selectedMuscleGroup;
    const matchesSubgroup = selectedMuscleSubgroup === 'Todos' || ex.muscleSubgroup === selectedMuscleSubgroup;
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'Todos' || ex.equipment === selectedEquipment;
    return matchesSport && matchesSearch && matchesMuscle && matchesSubgroup && matchesCategory && matchesEquipment;
  });

  const muscleSubgroupsMap: Record<string, MuscleSubgroup[]> = {
    'Peito': ['Peito superior', 'Peito médio', 'Peito inferior'],
    'Costas': ['Dorsal', 'Trapézio', 'Lombar'],
    'Pernas': ['Quadríceps', 'Posterior', 'Glúteos', 'Adutor', 'Abdutor', 'Panturrilha'],
    'Ombros': ['Deltoide Anterior', 'Deltoide Lateral', 'Deltoide Posterior'],
    'Braços': ['Bíceps', 'Tríceps', 'Antebraço'],
    'Core': ['Abdominais', 'Oblíquos', 'Lombar (Core)'],
  };

  const toggleExercise = (id: string) => {
    setSheets(prev => {
      const newSheets = [...prev];
      const sheet = { ...newSheets[activeSheetIndex] };
      if (sheet.exerciseIds.includes(id)) {
        sheet.exerciseIds = sheet.exerciseIds.filter(i => i !== id);
        sheet.exercises = sheet.exercises.filter(e => e.exerciseId !== id);
      } else {
        sheet.exerciseIds = [...sheet.exerciseIds, id];
        sheet.exercises = [...sheet.exercises, {
          exerciseId: id,
          sets: '8-10',
          numSets: 3,
          rest: '1 min',
          notes: ''
        }];
      }
      newSheets[activeSheetIndex] = sheet;
      return newSheets;
    });
  };

  const handleProtocolInfoNext = () => {
    if (!protocolName.trim()) return alert('Insira o nome do treino.');
    if (isDuplicateName) return;

    if (!isMulticycleToggle || inlineCycles.length === 1) {
      // Basic flow: single cycle or toggle off
      setCategory('basic');
      setStartDate(inlineCycles[0].startDate);
      setEndDate(inlineCycles[0].endDate);
      // Start with 1 sheet if coming fresh (not editing an existing template)
      if (!initialTemplate) {
        setSheets([
          { id: Math.random().toString(36).substr(2, 9), name: '', order: 0, exerciseIds: [], exercises: [] },
        ]);
      }
      setStep('num-sheets');
    } else {
      // Multicycle flow: convert inline cycles to WorkoutCycles
      setCategory('multicycle');
      setStartDate(inlineCycles[0].startDate);
      setEndDate(inlineCycles[inlineCycles.length - 1].endDate);
      const converted = inlineCycles.map((c, idx) => ({
        id: c.id,
        name: `Ciclo ${idx + 1}`,
        startDate: c.startDate,
        endDate: c.endDate,
        sheets: [],
      }));
      setCycles(converted);
      setStep('cycle-list');
    }
  };

  const handleNumSheetsNext = () => {
    // Normalise names and go straight to exercise selection
    setSheets(prev => prev.map((sheet, i) => ({
      ...sheet,
      name: sheet.name.trim() || `Treino ${String.fromCharCode(65 + i)}`,
      order: i,
    })));
    setStep('exercise-selection');
  };

  const handleExerciseSelectionNext = () => {
    if (sheets.some(s => (s.exerciseIds?.length || s.exercises?.length || 0) === 0)) {
      return alert('Todas as vezes por semana devem ter pelo menos um exercício.');
    }
    setStep('exercise-configuration');
  };

  const handleFinalSave = (updatedSheets: WorkoutSheet[]) => {
    if (category === 'multicycle') {
      // If we are editing a cycle, update it in the cycles list
      if (currentCycleIndex !== null) {
        const newCycles = [...cycles];
        newCycles[currentCycleIndex] = {
          ...newCycles[currentCycleIndex],
          sheets: updatedSheets
        };
        setCycles(newCycles);
        setStep('cycle-list');
        setCurrentCycleIndex(null);
        // Reset sheets for next cycle
        setSheets([{ id: Math.random().toString(36).substr(2, 9), name: '', order: 0, exerciseIds: [], exercises: [] }]);
        setNumSheets(1);
        setActiveSheetIndex(0);
      } else {
        // This shouldn't happen in multicycle if we follow the flow
        alert('Erro ao salvar ciclo.');
      }
    } else {
      clearDraft();
      onSave({
        id: initialTemplate?.id || Date.now().toString(),
        userId: studentEmail,
        name: protocolName,
        sport: selectedSport,
        category,
        startDate,
        endDate,
        sheets: updatedSheets,
        exerciseIds: [],
        exercises: []
      });
    }
  };

  const handleSaveWorkout = () => {
    if (category === 'multicycle') {
      const emptyCycles = cycles.filter(c => c.sheets.length === 0);
      if (cycles.length === 0) {
        return alert('Adicione pelo menos um ciclo ao treino multiciclo.');
      }
      if (emptyCycles.length > 0) {
        setValidationErrors(emptyCycles.map(c => c.id));
        return alert('Todos os ciclos devem ter vezes por semana configuradas antes de finalizar. Confira os ciclos destacados.');
      }
    }
    clearDraft();
    onSave({
      id: initialTemplate?.id || Date.now().toString(),
      userId: studentEmail,
      name: protocolName,
      sport: selectedSport,
      category,
      startDate,
      endDate,
      cycles: category === 'multicycle' ? cycles : undefined,
      sheets: category === 'basic' ? sheets : undefined,
      exerciseIds: [],
      exercises: []
    });
  };

  const addCycle = () => {
    const lastCycle = cycles[cycles.length - 1];
    const newStartDate = lastCycle ? lastCycle.endDate : startDate;
    const newEndDate = format(addMonths(parseISO(newStartDate), 1), 'yyyy-MM-dd');

    const newCycle: WorkoutCycle = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Ciclo ${cycles.length + 1}`,
      startDate: newStartDate,
      endDate: newEndDate,
      sheets: []
    };
    setCycles([...cycles, newCycle]);
  };

  const editCycle = (index: number) => {
    setCurrentCycleIndex(index);
    const cycle = cycles[index];
    if (cycle.sheets && cycle.sheets.length > 0) {
      setSheets(cycle.sheets);
      setNumSheets(cycle.sheets.length);
    } else {
      setSheets([
        { id: Math.random().toString(36).substr(2, 9), name: '', order: 0, exerciseIds: [], exercises: [] },
        { id: Math.random().toString(36).substr(2, 9), name: '', order: 1, exerciseIds: [], exercises: [] },
      ]);
      setNumSheets(2);
    }
    setActiveSheetIndex(0);
    setStep('num-sheets');
  };

  const deleteCycle = (index: number) => {
    setCycles(cycles.filter((_, i) => i !== index));
  };

  if (step === 'protocol-info') {
    const sportColor = ALL_SPORTS.find(s => s.id === selectedSport)?.bg ?? '#dc2626';
    const isNameFilled = protocolName.trim().length > 0;

    return (
      <ProtocolInfoStep
        initialTemplate={initialTemplate}
        selectedSport={selectedSport}
        sportColor={sportColor}
        isNameFilled={isNameFilled}
        isDuplicateName={isDuplicateName}
        protocolName={protocolName}
        setProtocolName={setProtocolName}
        isMulticycle={isMulticycleToggle}
        onToggleMulticycle={handleToggleMulticycle}
        inlineCycles={inlineCycles}
        setInlineCycles={setInlineCycles}
        onCancel={onCancel}
        onNext={handleProtocolInfoNext}
      />
    );
  }

  if (step === 'cycle-list') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Ciclos do Treino {protocolName}</h2>
          <button onClick={() => setStep('protocol-info')} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        </div>

        <div className="space-y-4">
          {cycles.map((cycle, index) => {
            const hasError = validationErrors.includes(cycle.id);
            return (
              <Card key={cycle.id} className={cn(
                "p-6 space-y-4 transition-colors",
                hasError ? "border-red-500/50 bg-red-500/5" : ""
              )}>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1 mr-4">
                    <input 
                      type="text" 
                      value={cycle.name}
                      onChange={(e) => {
                        const newCycles = [...cycles];
                        newCycles[index].name = e.target.value;
                        setCycles(newCycles);
                      }}
                      placeholder="Nome do Ciclo"
                      className="w-full bg-transparent border-none p-0 font-bold text-lg focus:ring-0 focus:outline-none placeholder:text-white/20"
                    />
                    <p className="text-[10px] text-white/40 font-bold uppercase">
                      {format(parseISO(cycle.startDate), 'dd/MM')} - {format(parseISO(cycle.endDate), 'dd/MM')}
                    </p>
                    <p className={cn(
                      "text-[10px] font-bold uppercase",
                      cycle.sheets.length > 0 ? "text-brand-red" : (hasError ? "text-red-500" : "text-white/20")
                    )}>
                      {cycle.sheets.length > 0 ? `${cycle.sheets.length} Vezes por semana configuradas` : 'Nenhuma vez por semana configurada'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        if (hasError) setValidationErrors(prev => prev.filter(id => id !== cycle.id));
                        editCycle(index);
                      }} 
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        cycle.sheets.length > 0 ? "bg-brand-red/10 text-brand-red" : (hasError ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-white/5 text-white/60 hover:text-white")
                      )}
                    >
                      {cycle.sheets.length > 0 ? <Edit size={16} /> : <Plus size={16} />}
                    </button>
                    <button onClick={() => deleteCycle(index)} className="p-2 bg-white/5 rounded-lg text-red-400/60 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[8px] text-white/20 font-bold uppercase px-1">Início</label>
                  <input 
                    type="date" 
                    value={cycle.startDate}
                    onChange={(e) => {
                      const newCycles = [...cycles];
                      newCycles[index].startDate = e.target.value;
                      setCycles(newCycles);
                    }}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl p-2 focus:outline-none focus:border-gray-400 transition-colors text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-white/20 font-bold uppercase px-1">Fim</label>
                  <input 
                    type="date" 
                    value={cycle.endDate}
                    onChange={(e) => {
                      const newCycles = [...cycles];
                      newCycles[index].endDate = e.target.value;
                      setCycles(newCycles);
                    }}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl p-2 focus:outline-none focus:border-gray-400 transition-colors text-[10px]"
                  />
                </div>
              </div>
            </Card>
          );
        })}

          <button 
            onClick={addCycle}
            className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-2xl text-white/40 font-bold text-sm flex items-center justify-center gap-2 hover:border-white/20 transition-all"
          >
            <Plus size={18} /> Adicionar Novo Ciclo
          </button>
        </div>

        <button 
          onClick={handleSaveWorkout}
          disabled={cycles.length === 0}
          className={cn(
            "w-full py-4 rounded-2xl text-black font-bold shadow-lg active:scale-95 transition-all",
            cycles.length === 0 ? "bg-white/10 text-white/20 cursor-not-allowed" : "red-gradient shadow-brand-red/20"
          )}
        >
          Finalizar Treino Multiciclo
        </button>
      </div>
    );
  }

  if (step === 'num-sheets') {
    const sportColor = ALL_SPORTS.find(s => s.id === selectedSport)?.bg ?? '#dc2626';
    const cycleLabel = category === 'multicycle' ? cycles[currentCycleIndex!]?.name : null;

    const addSheet = () => {
      setSheets(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          order: prev.length,
          exerciseIds: [],
          exercises: [],
        },
      ]);
    };

    const removeSheet = (id: string) => {
      if (sheets.length === 1) return;
      setSheets(prev => prev.filter(s => s.id !== id));
    };

    const allSheetsFilled = sheets.every(s => s.name.trim().length > 0);

    return (
      <div className="space-y-6 pb-12">
        {/* Info modal */}
        <AnimatePresence>
          {showFichasInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[300] flex items-end justify-center p-4"
              onClick={() => setShowFichasInfo(false)}
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="w-full max-w-md bg-dark-card rounded-3xl p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${sportColor}25` }}
                >
                  <Info size={20} style={{ color: sportColor }} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">O que é uma Ficha?</h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Uma <span className="text-white/80 font-semibold">ficha</span> representa um dia de treino da semana.
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Por exemplo, com <span className="text-white/80 font-semibold">3 fichas</span> você terá Treino A, Treino B e Treino C — cada um com seus próprios exercícios.
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Você alterna entre as fichas a cada sessão ao longo da semana.
                  </p>
                </div>
                <button
                  onClick={() => setShowFichasInfo(false)}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white/60 bg-white/5"
                >
                  Entendi
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div
          className="relative overflow-hidden -mx-6 mb-6"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${sportColor} 80%, #000) 0%, ${sportColor} 100%)`,
          }}
        >
          <div className="px-6 pt-10 pb-8 flex items-end justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white leading-tight">
                {cycleLabel ?? 'Fichas'}
              </h1>
              <p className="text-white/70 text-sm font-semibold">{protocolName}</p>
            </div>
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
              <img
                src={ALL_SPORTS.find(s => s.id === selectedSport)?.icon ?? iconMusculacao}
                alt=""
                className="w-12 h-12 brightness-0 invert"
              />
            </div>
          </div>
          <button
            onClick={() => setStep(category === 'basic' ? 'protocol-info' : 'cycle-list')}
            className="absolute top-4 left-4 p-2 bg-black/20 rounded-full text-white/70 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
        </div>

        <Card className="space-y-4 p-6">
          {/* Info icon aligned right */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowFichasInfo(true)}
              className="text-white/30 hover:text-white/60 transition-colors"
              aria-label="O que é uma ficha?"
            >
              <Info size={14} />
            </button>
          </div>

          {/* Sheet cards */}
          <div className="space-y-3">
            {sheets.map((sheet, index) => (
              <div key={sheet.id} className="space-y-1.5">
                <p className={LABEL_CLASS}>Nome da ficha</p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={sheet.name}
                    placeholder={`Ficha ${String.fromCharCode(65 + index)}`}
                    onChange={(e) => {
                      setSheets(prev => {
                        const updated = [...prev];
                        updated[index] = { ...updated[index], name: e.target.value };
                        return updated;
                      });
                    }}
                    className="flex-1 bg-dark-surface border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
                  />
                  <button
                    onClick={() => removeSheet(sheet.id)}
                    disabled={sheets.length === 1}
                    aria-label={`Remover Ficha ${index + 1}`}
                    className={cn(
                      'p-1 rounded-lg transition-colors flex-shrink-0',
                      sheets.length === 1
                        ? 'text-white/10 cursor-not-allowed'
                        : 'text-white/40 hover:text-white/70'
                    )}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add sheet button */}
            <button
              onClick={addSheet}
              className="w-full py-3 bg-white/5 border border-dashed border-white/10 rounded-2xl text-white/40 font-bold text-xs flex items-center justify-center gap-2 hover:border-white/20 hover:text-white/60 transition-all"
            >
              <Plus size={14} /> Adicionar ficha
            </button>
          </div>

          <button
            onClick={handleNumSheetsNext}
            disabled={!allSheetsFilled}
            className={cn(
              'w-full py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all',
              allSheetsFilled
                ? 'text-white'
                : 'bg-white/10 text-white/20 cursor-not-allowed'
            )}
            style={allSheetsFilled ? { backgroundColor: sportColor, boxShadow: `0 8px 24px ${sportColor}40` } : undefined}
          >
            Avançar
          </button>
        </Card>
      </div>
    );
  }

  if (step === 'exercise-configuration') {
    return (
      <ConfigureExercisesView 
        sheets={sheets}
        onSave={handleFinalSave}
        onBack={() => setStep('exercise-selection')}
      />
    );
  }

  const sportColor = ALL_SPORTS.find(s => s.id === selectedSport)?.bg ?? '#dc2626';

  return (
    <div className="fixed inset-0 z-40 bg-dark-surface flex flex-col">
      {/* Header — fixed at top */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${sportColor} 80%, #000) 0%, ${sportColor} 100%)`,
        }}
      >
        <div className="px-6 pt-10 pb-8 flex items-end justify-between">
          <div className="space-y-1 flex-1 pr-4">
            <h1 className="text-2xl font-black text-white leading-tight">Selecionar Exercícios</h1>
            <p className="text-white/70 text-sm font-semibold">{protocolName}</p>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <img
              src={ALL_SPORTS.find(s => s.id === selectedSport)?.icon ?? iconMusculacao}
              alt=""
              className="w-12 h-12 brightness-0 invert"
            />
          </div>
        </div>
        <button
          onClick={() => setStep('num-sheets')}
          className="absolute top-4 left-4 p-2 bg-black/20 rounded-full text-white/70 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Scrollable middle — tabs + search + filters + exercise list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Sheet Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {sheets.map((sheet, index) => {
            const isActive = activeSheetIndex === index;
            const isLocked = index > 0 && sheets.slice(0, index).some(s => (s.exerciseIds?.length || 0) === 0);
            return (
              <button
                key={sheet.id}
                onClick={() => { if (!isLocked) setActiveSheetIndex(index); }}
                disabled={isLocked}
                className={cn(
                  "px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all",
                  isActive ? "text-white shadow-lg" : isLocked ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-white/5 text-white/40"
                )}
                style={isActive ? { backgroundColor: sportColor, boxShadow: `0 4px 16px ${sportColor}40` } : undefined}
              >
                {sheet.name} ({(sheet.exerciseIds?.length || sheet.exercises?.length || 0)})
                {isLocked && <span className="ml-1 opacity-50">🔒</span>}
              </button>
            );
          })}
        </div>

        {/* Search + filters */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar exercícios..."
                className="w-full bg-dark-card border border-dark-border rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-gray-400 transition-colors text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-3 rounded-2xl border transition-all flex items-center justify-center gap-2",
                showFilters || selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos'
                  ? "border-transparent"
                  : "bg-dark-card border-dark-border text-white/40"
              )}
              style={
                showFilters || selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos'
                  ? { backgroundColor: `${sportColor}1a`, borderColor: `${sportColor}4d`, color: sportColor }
                  : undefined
              }
            >
              <SlidersHorizontal size={20} />
              {(selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && !showFilters && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sportColor }} />
              )}
            </button>
          </div>

          {!showFilters && (selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {selectedCategory !== 'Todos' && (
                <button
                  onClick={() => setSelectedCategory('Todos')}
                  className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                  style={{ backgroundColor: `${sportColor}1a`, border: `1px solid ${sportColor}33`, color: sportColor }}
                >
                  {selectedCategory} <X size={10} />
                </button>
              )}
              {selectedEquipment !== 'Todos' && (
                <button
                  onClick={() => setSelectedEquipment('Todos')}
                  className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                  style={{ backgroundColor: `${sportColor}1a`, border: `1px solid ${sportColor}33`, color: sportColor }}
                >
                  {selectedEquipment} <X size={10} />
                </button>
              )}
              {selectedMuscleGroup !== 'Todos' && (
                <button
                  onClick={() => { setSelectedMuscleGroup('Todos'); setSelectedMuscleSubgroup('Todos'); }}
                  className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                  style={{ backgroundColor: `${sportColor}1a`, border: `1px solid ${sportColor}33`, color: sportColor }}
                >
                  {selectedMuscleGroup} <X size={10} />
                </button>
              )}
              {selectedMuscleSubgroup !== 'Todos' && (
                <button
                  onClick={() => setSelectedMuscleSubgroup('Todos')}
                  className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                  style={{ backgroundColor: `${sportColor}1a`, border: `1px solid ${sportColor}33`, color: sportColor }}
                >
                  {selectedMuscleSubgroup} <X size={10} />
                </button>
              )}
            </div>
          )}

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Todos', 'Musculação', 'Alongamento', 'Exercício em casa', 'Funcional'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as any)}
                      className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border"
                      style={
                        selectedCategory === cat
                          ? { backgroundColor: sportColor, borderColor: sportColor, color: '#fff' }
                          : undefined
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Todos', 'Barra', 'Halter', 'Máquina', 'Peso corporal', 'Elástico', 'Kettlebell'].map((eq) => (
                    <button
                      key={eq}
                      onClick={() => setSelectedEquipment(eq as any)}
                      className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border"
                      style={
                        selectedEquipment === eq
                          ? { backgroundColor: sportColor, borderColor: sportColor, color: '#fff' }
                          : undefined
                      }
                    >
                      {eq}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Full Body'].map((group) => (
                    <button
                      key={group}
                      onClick={() => { setSelectedMuscleGroup(group as any); setSelectedMuscleSubgroup('Todos'); }}
                      className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border"
                      style={
                        selectedMuscleGroup === group
                          ? { backgroundColor: sportColor, borderColor: sportColor, color: '#fff' }
                          : undefined
                      }
                    >
                      {group}
                    </button>
                  ))}
                </div>

                {selectedMuscleGroup !== 'Todos' && muscleSubgroupsMap[selectedMuscleGroup] && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['Todos', ...muscleSubgroupsMap[selectedMuscleGroup]].map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSelectedMuscleSubgroup(sub as any)}
                        className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border"
                        style={
                          selectedMuscleSubgroup === sub
                            ? { backgroundColor: sportColor, borderColor: sportColor, color: '#fff' }
                            : undefined
                        }
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Exercise list — selected first */}
        <div className="space-y-2 pr-1 custom-scrollbar">
          {[...filteredExercises]
            .sort((a, b) => {
              const aSelected = activeSheet.exerciseIds.includes(a.id) ? 0 : 1;
              const bSelected = activeSheet.exerciseIds.includes(b.id) ? 0 : 1;
              return aSelected - bSelected;
            })
            .map(ex => {
            const isSelected = activeSheet.exerciseIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                onClick={() => toggleExercise(ex.id)}
                className={cn(
                  "flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all",
                  isSelected ? "bg-dark-card border-transparent" : "bg-dark-card border-dark-border hover:border-white/10"
                )}
                style={isSelected ? { borderColor: `${sportColor}4d`, backgroundColor: `${sportColor}0d` } : undefined}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{ex.name}</h4>
                    {ex.youtubeUrl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedExerciseForVideo(ex); }}
                        className="p-1 rounded-full transition-colors"
                        style={{ backgroundColor: `${sportColor}1a`, color: sportColor }}
                      >
                        <Play size={10} fill="currentColor" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase">{ex.muscleGroup}</p>
                    {ex.muscleSubgroup && (
                      <>
                        <span className="text-[10px] text-white/20">•</span>
                        <p className="text-[10px] font-bold uppercase" style={{ color: `${sportColor}cc` }}>{ex.muscleSubgroup}</p>
                      </>
                    )}
                    <span className="text-[10px] text-white/20">•</span>
                    <p className="text-[10px] text-white/40 font-bold uppercase">{ex.category}</p>
                    <span className="text-[10px] text-white/20">•</span>
                    <p className="text-[10px] text-white/40 font-bold uppercase">{ex.equipment}</p>
                  </div>
                </div>
                <div
                  className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ml-3"
                  style={isSelected ? { backgroundColor: sportColor, borderColor: sportColor } : undefined}
                >
                  {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer — fixed at bottom, always visible */}
      <div className="flex-shrink-0 px-6 pt-3 pb-8 bg-dark-surface border-t border-dark-border">
        <button
          onClick={() => {
            if (activeSheetIndex < sheets.length - 1) {
              setActiveSheetIndex(activeSheetIndex + 1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              handleExerciseSelectionNext();
            }
          }}
          disabled={activeSheet.exerciseIds.length === 0}
          className={cn(
            "w-full py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-all",
            activeSheet.exerciseIds.length === 0
              ? "bg-white/10 text-white/20 cursor-not-allowed"
              : "text-white"
          )}
          style={
            activeSheet.exerciseIds.length > 0
              ? { backgroundColor: sportColor, boxShadow: `0 8px 24px ${sportColor}40` }
              : undefined
          }
        >
          {activeSheetIndex < sheets.length - 1 ? 'Próxima ficha' : 'Avançar'}
        </button>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedExerciseForVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-6"
            onClick={() => setSelectedExerciseForVideo(null)}
          >
            <div className="w-full max-w-2xl bg-dark-card rounded-3xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="aspect-video bg-black relative">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${selectedExerciseForVideo.youtubeUrl}?autoplay=1`}
                  title={selectedExerciseForVideo.name}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6 flex justify-between items-center">
                <h3 className="font-bold text-lg">{selectedExerciseForVideo.name}</h3>
                <button 
                  onClick={() => setSelectedExerciseForVideo(null)}
                  className="px-6 py-2 bg-white/10 rounded-xl font-bold text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
