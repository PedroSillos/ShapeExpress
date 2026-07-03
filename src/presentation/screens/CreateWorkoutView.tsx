import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronLeft, Search, SlidersHorizontal, Play, Check, Plus, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addMonths, parseISO } from 'date-fns';
import { cn } from '../../utils/cn';
import { EXERCISES } from '../../constants';
import { Card } from '../components/Card';
import { ConfigureExercisesView } from '../components/ConfigureExercisesView';
import iconMusculacao from '@/src/assets/icons/icon-musculacao.svg';
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

interface CreateWorkoutViewProps {
  onSave: (t: WorkoutTemplate) => void;
  onCancel: () => void;
  initialTemplate?: WorkoutTemplate;
  userProfile: UserProfile;
  studentEmail?: string;
}

export function CreateWorkoutView({ 
  onSave, 
  onCancel, 
  initialTemplate,
  userProfile,
  studentEmail
}: CreateWorkoutViewProps) {
  const [step, setStep] = useState<'protocol-info' | 'cycle-list' | 'num-sheets' | 'sheet-names' | 'exercise-selection' | 'exercise-configuration'>(
    initialTemplate 
      ? (initialTemplate.category === 'multicycle' ? 'cycle-list' : 'exercise-selection') 
      : 'protocol-info'
  );
  const [protocolName, setProtocolName] = useState(initialTemplate?.name || '');
  const [category, setCategory] = useState<WorkoutCategory>(initialTemplate?.category || 'basic');
  const [startDate, setStartDate] = useState(initialTemplate?.startDate || format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initialTemplate?.endDate || format(addMonths(new Date(), 3), 'yyyy-MM-dd'));
  
  const [cycles, setCycles] = useState<WorkoutCycle[]>(initialTemplate?.cycles || []);
  const [currentCycleIndex, setCurrentCycleIndex] = useState<number | null>(null);

  const [numSheets, setNumSheets] = useState(initialTemplate?.sheets?.length || 1);
  const [sheets, setSheets] = useState<WorkoutSheet[]>(() => {
    if (initialTemplate?.sheets) return initialTemplate.sheets;
    return [{ id: Math.random().toString(36).substr(2, 9), name: '', order: 0, exerciseIds: [], exercises: [] }];
  });

  const sport = useMemo(() => {
    if ((userProfile as any)?.sports?.length) return (userProfile as any).sports[0] as string;
    try {
      const wa = JSON.parse(localStorage.getItem('welcome-answers') ?? 'null');
      if (wa?.sports?.length) return wa.sports[0] as string;
    } catch {}
    return 'Musculação';
  }, [userProfile]);

  // Draft saving logic
  useEffect(() => {
    if (initialTemplate) return; // Don't save drafts when editing existing templates
    
    const draft = {
      protocolName,
      category,
      startDate,
      endDate,
      cycles,
      numSheets,
      sheets,
      step
    };
    localStorage.setItem('workout_draft', JSON.stringify(draft));
  }, [protocolName, category, startDate, endDate, cycles, numSheets, sheets, step, initialTemplate]);

  // Load draft on mount
  useEffect(() => {
    if (initialTemplate) return;
    
    const savedDraft = localStorage.getItem('workout_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Only ask if there's actual progress
        if (draft.protocolName || draft.cycles.length > 0 || draft.sheets[0].exerciseIds.length > 0) {
          if (confirm('Você tem um rascunho de treino não finalizado. Deseja continuar de onde parou?')) {
            setProtocolName(draft.protocolName);
            setCategory(draft.category);
            setStartDate(draft.startDate);
            setEndDate(draft.endDate);
            setCycles(draft.cycles);
            setNumSheets(draft.numSheets);
            setSheets(draft.sheets);
            setStep(draft.step);
          } else {
            localStorage.removeItem('workout_draft');
          }
        }
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }, [initialTemplate]);

  const clearDraft = () => {
    localStorage.removeItem('workout_draft');
  };
  
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
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
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscleGroup === 'Todos' || ex.muscleGroup === selectedMuscleGroup;
    const matchesSubgroup = selectedMuscleSubgroup === 'Todos' || ex.muscleSubgroup === selectedMuscleSubgroup;
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'Todos' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesSubgroup && matchesCategory && matchesEquipment;
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
    if (category === 'basic') {
      setStep('num-sheets');
    } else {
      setStep('cycle-list');
    }
  };

  const handleNumSheetsNext = () => {
    setSheets(prev => {
      const newSheets = [...prev];
      if (numSheets > prev.length) {
        for (let i = prev.length; i < numSheets; i++) {
          newSheets.push({ 
            id: Math.random().toString(36).substr(2, 9), 
            name: '', 
            order: i,
            exerciseIds: [], 
            exercises: [] 
          });
        }
      } else if (numSheets < prev.length) {
        return prev.slice(0, numSheets);
      }
      return newSheets;
    });
    setStep('sheet-names');
  };

  const handleSheetNamesNext = () => {
    setSheets(prev => prev.map((sheet, i) => ({
      ...sheet,
      name: sheet.name.trim() || `Treino ${String.fromCharCode(65 + i)}`,
      order: i
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
      setSheets([{ id: Math.random().toString(36).substr(2, 9), name: '', order: 0, exerciseIds: [], exercises: [] }]);
      setNumSheets(1);
    }
    setActiveSheetIndex(0);
    setStep('num-sheets');
  };

  const deleteCycle = (index: number) => {
    setCycles(cycles.filter((_, i) => i !== index));
  };

  if (step === 'protocol-info') {
    return (
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div
          className="relative overflow-hidden -mx-6 mb-6"
          style={{ background: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 60%, #E05C2A 100%)' }}
        >
          <div className="px-6 pt-10 pb-8 flex items-end justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white leading-tight">
                {initialTemplate ? 'Editar treino' : 'Novo treino'}
              </h1>
              <p className="text-white/70 text-sm font-semibold">{sport}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                <img src={iconMusculacao} alt="" className="w-12 h-12 brightness-0 invert" />
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

        <Card className="space-y-6 p-6">
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Nome do Treino</label>
            <input 
              type="text" 
              value={protocolName}
              onChange={(e) => setProtocolName(e.target.value)}
              placeholder="Ex: Hipertrofia Elite"
              className="w-full bg-dark-surface border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Categoria</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCategory('basic')}
                className={cn(
                  "p-4 rounded-2xl border font-bold text-sm transition-all",
                  category === 'basic' ? "bg-brand-red border-brand-red text-black" : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                Básico
              </button>
              <button
                onClick={() => setCategory('multicycle')}
                className={cn(
                  "p-4 rounded-2xl border font-bold text-sm transition-all",
                  category === 'multicycle' ? "bg-brand-red border-brand-red text-black" : "bg-white/5 border-white/10 text-white/40"
                )}
              >
                Multiciclo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Início</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-dark-surface border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Fim</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-dark-surface border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors text-sm"
              />
            </div>
          </div>

          <button 
            onClick={handleProtocolInfoNext}
            className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
          >
            Avançar
          </button>
        </Card>
      </div>
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
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(category === 'basic' ? 'protocol-info' : 'cycle-list')} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold">{category === 'multicycle' ? `Vezes por Semana: ${cycles[currentCycleIndex!].name}` : 'Quantidade de Vezes por Semana'}</h2>
        </div>

        <Card className="space-y-6 p-6">
          <div className="space-y-4">
            <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Quantidade de Vezes por Semana</label>
            <div className="flex items-center justify-between bg-dark-surface border border-dark-border rounded-2xl p-4">
              <button 
                onClick={() => setNumSheets(Math.max(1, numSheets - 1))}
                className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center text-xl font-bold"
              >
                -
              </button>
              <span className="text-4xl font-display font-bold text-brand-red">{numSheets}</span>
              <button 
                onClick={() => setNumSheets(Math.min(30, numSheets + 1))}
                className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          <button 
            onClick={handleNumSheetsNext}
            className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
          >
            Avançar
          </button>
        </Card>
      </div>
    );
  }

  if (step === 'sheet-names') {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep('num-sheets')} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold">Nomear Vezes por Semana</h2>
        </div>

        <div className="space-y-4">
          {sheets.map((sheet, index) => (
            <div key={sheet.id} className="space-y-2">
              <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-1">Treino {index + 1}</label>
              <input 
                type="text" 
                value={sheet.name}
                placeholder={`Ex: Treino ${String.fromCharCode(65 + index)}`}
                onChange={(e) => {
                  const newSheets = [...sheets];
                  newSheets[index].name = e.target.value;
                  setSheets(newSheets);
                }}
                className="w-full bg-dark-card border border-dark-border rounded-2xl p-4 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          ))}
        </div>

        <button 
          onClick={handleSheetNamesNext}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          Avançar para Exercícios
        </button>
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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            if (initialTemplate) {
              onCancel();
            } else {
              setStep('sheet-names');
            }
          }} 
          className="p-2 bg-white/5 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold">Selecionar Exercícios</h2>
      </div>

      {/* Sheet Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {sheets.map((sheet, index) => (
          <button
            key={sheet.id}
            onClick={() => setActiveSheetIndex(index)}
            className={cn(
              "px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
              activeSheetIndex === index 
                ? "bg-brand-red border-brand-red text-black shadow-lg shadow-brand-red/20" 
                : "bg-white/5 border-white/10 text-white/40"
            )}
          >
            {sheet.name} ({(sheet.exerciseIds?.length || sheet.exercises?.length || 0)})
          </button>
        ))}
      </div>

      <div className="space-y-4">
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
                  ? "bg-brand-red/10 border-brand-red/30 text-brand-red" 
                  : "bg-dark-card border-dark-border text-white/40"
              )}
            >
              <SlidersHorizontal size={20} />
              {(selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && !showFilters && (
                <span className="w-2 h-2 bg-brand-red rounded-full"></span>
              )}
            </button>
          </div>

          {!showFilters && (selectedMuscleGroup !== 'Todos' || selectedEquipment !== 'Todos' || selectedCategory !== 'Todos') && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {selectedCategory !== 'Todos' && (
                <button 
                  onClick={() => setSelectedCategory('Todos')}
                  className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                >
                  {selectedCategory} <X size={10} />
                </button>
              )}
              {selectedEquipment !== 'Todos' && (
                <button 
                  onClick={() => setSelectedEquipment('Todos')}
                  className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                >
                  {selectedEquipment} <X size={10} />
                </button>
              )}
              {selectedMuscleGroup !== 'Todos' && (
                <button 
                  onClick={() => {
                    setSelectedMuscleGroup('Todos');
                    setSelectedMuscleSubgroup('Todos');
                  }}
                  className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
                >
                  {selectedMuscleGroup} <X size={10} />
                </button>
              )}
              {selectedMuscleSubgroup !== 'Todos' && (
                <button 
                  onClick={() => setSelectedMuscleSubgroup('Todos')}
                  className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
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
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                        selectedCategory === cat 
                          ? "bg-brand-red border-brand-red text-black" 
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                      )}
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
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                        selectedEquipment === eq 
                          ? "bg-brand-red border-brand-red text-black" 
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                      )}
                    >
                      {eq}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core', 'Full Body'].map((group) => (
                    <button
                      key={group}
                      onClick={() => {
                        setSelectedMuscleGroup(group as any);
                        setSelectedMuscleSubgroup('Todos');
                      }}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                        selectedMuscleGroup === group 
                          ? "bg-brand-red border-brand-red text-black" 
                          : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                      )}
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
                        className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border",
                          selectedMuscleSubgroup === sub 
                            ? "bg-brand-red border-brand-red text-black" 
                            : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                        )}
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

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredExercises.map(ex => {
            const isSelected = activeSheet.exerciseIds.includes(ex.id);
            return (
              <div 
                key={ex.id}
                onClick={() => toggleExercise(ex.id)}
                className={cn(
                  "flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all",
                  isSelected ? "bg-brand-red/5 border-brand-red/30" : "bg-dark-card border-dark-border hover:border-white/10"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{ex.name}</h4>
                    {ex.youtubeUrl && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExerciseForVideo(ex);
                        }}
                        className="p-1 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                      >
                        <Play size={10} fill="currentColor" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase">{ex.muscleGroup}</p>
                    {ex.muscleSubgroup && (
                      <>
                        <span className="text-[10px] text-white/20">•</span>
                        <p className="text-[10px] text-brand-red/60 font-bold uppercase">{ex.muscleSubgroup}</p>
                      </>
                    )}
                    <span className="text-[10px] text-white/20">•</span>
                    <p className="text-[10px] text-white/40 font-bold uppercase">{ex.category}</p>
                    <span className="text-[10px] text-white/20">•</span>
                    <p className="text-[10px] text-white/40 font-bold uppercase">{ex.equipment}</p>
                  </div>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                  isSelected ? "bg-brand-red border-brand-red text-black" : "border-white/10"
                )}>
                  {isSelected && <Check size={14} strokeWidth={4} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
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
            "w-full py-4 rounded-2xl text-black font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
            activeSheet.exerciseIds.length === 0 
              ? "bg-white/10 text-white/20 cursor-not-allowed" 
              : "red-gradient shadow-brand-red/20"
          )}
        >
          {activeSheetIndex < sheets.length - 1 ? 'Próximo Treino' : 'Configurar Exercícios'}
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
