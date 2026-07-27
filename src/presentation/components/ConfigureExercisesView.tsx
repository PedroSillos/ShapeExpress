import React, { useState, useRef } from 'react';
import { ChevronLeft, Play, Dumbbell, TrendingUp, History, Edit, RefreshCw, X, Plus, Search, SlidersHorizontal, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { EXERCISES } from '../../constants';
import { WorkoutSheet, WorkoutTemplateExercise, Exercise, MuscleGroup, MuscleSubgroup, ExerciseCategory, Equipment } from '../../domain/entities';
import { getInputMode } from '../../domain/use-cases/exerciseInputMode';
import { ALL_SPORTS } from '../../features/sports/constants';
import iconMusculacao from '@/src/assets/icons/icon-musculacao.svg';

interface ConfigureExercisesViewProps {
  sheets: WorkoutSheet[];
  onSave: (updatedSheets: WorkoutSheet[]) => void;
  onBack: () => void;
  sportColor?: string;
  sportId?: string;
  protocolName?: string;
}

export function ConfigureExercisesView({ 
  sheets, 
  onSave, 
  onBack,
  sportColor = '#dc2626',
  sportId,
  protocolName,
}: ConfigureExercisesViewProps) {
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localSheets, setLocalSheets] = useState<WorkoutSheet[]>(sheets);
  const [selectedExerciseForVideo, setSelectedExerciseForVideo] = useState<Exercise | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [showSubstitutionList, setShowSubstitutionList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedMuscleSubgroup, setSelectedMuscleSubgroup] = useState<MuscleSubgroup | 'Todos'>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'Todos'>('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'Todos'>('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const activeSheet = localSheets[activeSheetIndex];
  const currentExerciseId = activeSheet.exerciseIds[currentIndex];
  const exercise = EXERCISES.find(e => e.id === currentExerciseId);
  const currentConfig = activeSheet.exercises[currentIndex];

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscleGroup === 'Todos' || ex.muscleGroup === selectedMuscleGroup;
    const matchesSubgroup = selectedMuscleSubgroup === 'Todos' || ex.muscleSubgroup === selectedMuscleSubgroup;
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'Todos' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesSubgroup && matchesCategory && matchesEquipment && ex.id !== currentExerciseId;
  });

  const muscleSubgroupsMap: Record<string, MuscleSubgroup[]> = {
    'Peito': ['Peito superior', 'Peito médio', 'Peito inferior'],
    'Costas': ['Dorsal', 'Trapézio', 'Lombar'],
    'Pernas': ['Quadríceps', 'Posterior', 'Glúteos', 'Adutor', 'Abdutor', 'Panturrilha'],
    'Ombros': ['Deltoide Anterior', 'Deltoide Lateral', 'Deltoide Posterior'],
    'Braços': ['Bíceps', 'Tríceps', 'Antebraço'],
    'Core': ['Abdominais', 'Oblíquos', 'Lombar (Core)'],
  };

  const updateConfig = (updates: Partial<WorkoutTemplateExercise>) => {
    const newSheets = [...localSheets];
    const newExercises = [...newSheets[activeSheetIndex].exercises];
    newExercises[currentIndex] = { ...newExercises[currentIndex], ...updates };
    newSheets[activeSheetIndex].exercises = newExercises;
    setLocalSheets(newSheets);
  };

  const handleNext = () => {
    if (currentIndex < activeSheet.exerciseIds.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeSheetIndex < localSheets.length - 1) {
      setActiveSheetIndex(activeSheetIndex + 1);
      setCurrentIndex(0);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onSave(localSheets);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (activeSheetIndex > 0) {
      setActiveSheetIndex(activeSheetIndex - 1);
      setCurrentIndex(localSheets[activeSheetIndex - 1].exerciseIds.length - 1);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  const repOptions = ['6–8', '8–10', '10–12', '12–15', 'Personalizado'];
  const restOptions = ['1 min', '2 min', '3 min', '5 min', 'Personalizado'];

  const isCustomReps = !repOptions.slice(0, 4).includes(currentConfig.sets);
  const isCustomRest = !restOptions.slice(0, 4).includes(currentConfig.rest);

  return (
    <div className="fixed inset-0 bg-dark-surface z-[100] flex flex-col">
      {/* Header */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${sportColor} 80%, #000) 0%, ${sportColor} 100%)`,
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 bg-black/20 rounded-full text-white/80 hover:text-white flex-shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center flex-1 px-3">
            <h2 className="font-bold text-lg text-white leading-tight">Configurar Treino</h2>
            {protocolName && (
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest truncate">{protocolName}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <img
              src={ALL_SPORTS.find(s => s.id === sportId)?.icon ?? iconMusculacao}
              alt=""
              className="w-6 h-6 brightness-0 invert"
            />
          </div>
        </div>
        {/* decorative circles */}
        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-2 right-10 w-8 h-8 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Sheet Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar p-4 bg-dark-card/50 border-b border-white/5">
        {localSheets.map((sheet, index) => (
          <button
            key={sheet.id}
            onClick={() => {
              setActiveSheetIndex(index);
              setCurrentIndex(0);
              scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
              activeSheetIndex === index ? "text-white shadow-lg" : "text-white/40"
            )}
            style={
              activeSheetIndex === index
                ? { backgroundColor: sportColor, boxShadow: `0 4px 16px ${sportColor}40` }
                : { backgroundColor: 'rgba(255,255,255,0.05)' }
            }
          >
            {sheet.name}
          </button>
        ))}
      </div>

      {/* Exercise List for active sheet */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 bg-dark-card/30 border-b border-white/5 flex-shrink-0">
        {activeSheet.exerciseIds.map((exId, index) => {
          const ex = EXERCISES.find(e => e.id === exId);
          const isActive = index === currentIndex;
          const isConfigured = index < currentIndex;
          return (
            <button
              key={exId}
              onClick={() => {
                setCurrentIndex(index);
                scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border",
                isActive
                  ? "text-white border-transparent"
                  : isConfigured
                  ? "text-white/60 border-transparent"
                  : "text-white/30 border-transparent"
              )}
              style={
                isActive
                  ? { backgroundColor: `${sportColor}22`, borderColor: sportColor, color: sportColor }
                  : isConfigured
                  ? { backgroundColor: 'rgba(255,255,255,0.07)' }
                  : { backgroundColor: 'rgba(255,255,255,0.03)' }
              }
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
                style={
                  isActive
                    ? { backgroundColor: sportColor, color: '#fff' }
                    : isConfigured
                    ? { backgroundColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }
                    : { backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' }
                }
              >
                {index + 1}
              </span>
              {ex?.name ?? `Exercício ${index + 1}`}
            </button>
          );
        })}
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Exercise Info */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${sportColor}1a`, color: sportColor }}
          >
            <Dumbbell size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-2xl font-bold">{exercise?.name}</h3>
              {exercise?.youtubeUrl && (
                <button 
                  onClick={() => setSelectedExerciseForVideo(exercise)}
                  className="p-1.5 rounded-full hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `${sportColor}1a`, color: sportColor }}
                >
                  <Play size={14} fill="currentColor" />
                </button>
              )}
            </div>
            <p className="text-sm text-white/40 font-medium">Grupo: {exercise?.muscleGroup}</p>
          </div>
        </div>

        {/* Number of Sets */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${sportColor}1a`, color: sportColor }}
            >
              <Dumbbell size={16} />
            </div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Quantidade de Séries</h4>
          </div>
          <div className="flex items-center justify-between bg-dark-card border border-dark-border rounded-2xl p-4">
            <button 
              onClick={() => updateConfig({ numSets: Math.max(1, currentConfig.numSets - 1) })}
              className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center text-xl font-bold hover:bg-white/5 transition-colors"
            >
              -
            </button>
            <span className="text-3xl font-display font-bold" style={{ color: sportColor }}>{currentConfig.numSets}</span>
            <button 
              onClick={() => updateConfig({ numSets: Math.min(10, currentConfig.numSets + 1) })}
              className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center text-xl font-bold hover:bg-white/5 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Reps / Duration — conditional by inputMode */}
        {(() => {
          const inputMode = getInputMode(exercise ?? { inputMode: undefined } as any);
          const isDuration = inputMode === 'duration_distance' || inputMode === 'duration_only';

          if (isDuration) {
            // For cardio/duration exercises: configure duration per set (in seconds)
            const durationOptions = ['30s', '1 min', '2 min', '5 min', '10 min', '30 min', 'Personalizado'];
            const isCustomDuration = !durationOptions.slice(0, 6).includes(currentConfig.sets);
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${sportColor}1a`, color: sportColor }}
                  >
                    <TrendingUp size={16} />
                  </div>
                  <h4 className="font-bold uppercase text-xs tracking-widest">Duração por Série</h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {durationOptions.map(option => {
                    const isSelected = option === 'Personalizado' ? isCustomDuration : currentConfig.sets === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          if (option === 'Personalizado') {
                            if (!isCustomDuration) updateConfig({ sets: '60' });
                          } else {
                            updateConfig({ sets: option });
                          }
                        }}
                        className={cn(
                          "py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden",
                          isSelected
                            ? "text-white shadow-lg"
                            : "bg-dark-card border border-dark-border text-white/40"
                        )}
                        style={isSelected ? { backgroundColor: sportColor, boxShadow: `0 0 15px ${sportColor}4d` } : undefined}
                      >
                        {option}
                        {isSelected && <motion.div layoutId="rep-glow" className="absolute inset-0 bg-white/10" />}
                      </button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {isCustomDuration && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={currentConfig.sets}
                        onChange={(e) => updateConfig({ sets: e.target.value })}
                        placeholder="ex: 45s ou 1:30"
                        className="w-full bg-dark-card border border-white/5 rounded-xl p-3 focus:ring-0 focus:outline-none text-center font-bold text-sm"
                        style={{ color: sportColor }}
                      />
                      <p className="text-[8px] text-white/20 text-center uppercase font-bold tracking-widest mt-2">Duração personalizada por série</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // weight_reps or reps_only
          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${sportColor}1a`, color: sportColor }}
                >
                  <TrendingUp size={16} />
                </div>
                <h4 className="font-bold uppercase text-xs tracking-widest">
                  {inputMode === 'reps_only' ? 'Repetições por Série' : 'Séries / Repetições'}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {repOptions.map(option => {
                  const isSelected = option === 'Personalizado' ? isCustomReps : currentConfig.sets === option;
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        if (option === 'Personalizado') {
                          if (!isCustomReps) {
                            const baseVal = currentConfig.sets.includes('–') ? currentConfig.sets.split('–')[1] : currentConfig.sets;
                            updateConfig({ sets: Array(currentConfig.numSets).fill(baseVal || '10').join(',') });
                          }
                        } else {
                          updateConfig({ sets: option });
                        }
                      }}
                      className={cn(
                        "py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden",
                        isSelected
                          ? "text-white shadow-lg"
                          : "bg-dark-card border border-dark-border text-white/40"
                      )}
                      style={isSelected ? { backgroundColor: sportColor, boxShadow: `0 0 15px ${sportColor}4d` } : undefined}
                    >
                      {option}
                      {isSelected && <motion.div layoutId="rep-glow" className="absolute inset-0 bg-white/10" />}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence>
                {isCustomReps && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: currentConfig.numSets }).map((_, i) => {
                        const repsArray = currentConfig.sets.split(',').map(s => s.trim());
                        const currentVal = repsArray[i] !== undefined ? repsArray[i] : (repsArray[0] || '10');
                        return (
                          <div key={i} className="flex flex-col items-center gap-1 bg-dark-card border border-white/5 rounded-xl p-2">
                            <span className="text-[8px] text-white/20 font-bold uppercase">Série {i + 1}</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={currentVal}
                              onChange={(e) => {
                                const newReps = [...repsArray];
                                while (newReps.length < currentConfig.numSets) {
                                  newReps.push(newReps[newReps.length - 1] || '10');
                                }
                                newReps[i] = e.target.value;
                                updateConfig({ sets: newReps.join(',') });
                              }}
                              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-center font-bold text-sm"
                              style={{ color: sportColor }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[8px] text-white/20 text-center uppercase font-bold tracking-widest">Repetições individuais por série</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })()}

        {/* Rest Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${sportColor}1a`, color: sportColor }}
            >
              <History size={16} />
            </div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Descanso</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {restOptions.map(option => {
              const isSelected = option === 'Personalizado' ? isCustomRest : currentConfig.rest === option;
              return (
                <button
                  key={option}
                  onClick={() => {
                    if (option === 'Personalizado') {
                      if (!isCustomRest) {
                        const baseVal = currentConfig.rest.includes('min') 
                          ? (parseInt(currentConfig.rest) * 60).toString() + 's'
                          : currentConfig.rest;
                        updateConfig({ rest: Array(currentConfig.numSets).fill(baseVal || '60s').join(',') });
                      }
                    } else {
                      updateConfig({ rest: option });
                    }
                  }}
                  className={cn(
                    "py-4 rounded-2xl font-bold text-sm transition-all relative overflow-hidden",
                    isSelected 
                      ? "text-white shadow-lg"
                      : "bg-dark-card border border-dark-border text-white/40"
                  )}
                  style={isSelected ? { backgroundColor: sportColor, boxShadow: `0 0 15px ${sportColor}4d` } : undefined}
                >
                  {option}
                  {isSelected && <motion.div layoutId="rest-glow" className="absolute inset-0 bg-white/10" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Observation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
              <Edit size={16} />
            </div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Observação</h4>
          </div>
          <textarea 
            value={currentConfig.notes || ''}
            onChange={(e) => updateConfig({ notes: e.target.value })}
            placeholder="Dicas de execução, carga anterior..."
            className="w-full bg-dark-card border border-dark-border rounded-2xl p-4 text-sm font-medium focus:outline-none focus:border-gray-400 transition-colors min-h-[100px]"
          />
        </div>

        {/* Substitutions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
              <RefreshCw size={16} />
            </div>
            <h4 className="font-bold uppercase text-xs tracking-widest">Substituições (Opcional)</h4>
          </div>
          
          <div className="space-y-2">
            {currentConfig.substitutions?.map((subId, idx) => {
              const subEx = EXERCISES.find(e => e.id === subId);
              return (
                <div key={idx} className="flex items-center justify-between bg-dark-card border border-dark-border rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${sportColor}1a`, color: sportColor }}
                    >
                      <Dumbbell size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{subEx?.name}</p>
                      <p className="text-xs text-white/40">{subEx?.muscleGroup}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const newSubs = currentConfig.substitutions?.filter(id => id !== subId);
                      updateConfig({ substitutions: newSubs });
                    }}
                    className="p-2 text-white/40 hover:text-red-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              );
            })}
            
            <button
              onClick={() => setShowSubstitutionList(true)}
              className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-white/60 font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Adicionar Opção
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-dark-surface border-t border-dark-border flex gap-4">
        <button 
          onClick={handleBack}
          className="flex-1 py-4 bg-white/5 rounded-2xl text-white/60 font-bold active:scale-95 transition-transform"
        >
          Voltar
        </button>
        <button 
          onClick={handleNext}
          className="flex-[2] py-4 rounded-2xl text-white font-bold shadow-lg active:scale-95 transition-transform"
          style={{ backgroundColor: sportColor, boxShadow: `0 8px 24px ${sportColor}40` }}
        >
          {currentIndex < activeSheet.exerciseIds.length - 1 || activeSheetIndex < localSheets.length - 1 
            ? 'Avançar' 
            : 'Finalizar Configuração'}
        </button>
      </div>

      <AnimatePresence>
        {showSubstitutionList && (
          <div className="fixed inset-0 z-[400] flex flex-col bg-dark-surface">
            <div className="p-6 flex items-center gap-4 border-b border-dark-border">
              <button onClick={() => setShowSubstitutionList(false)} className="p-2 bg-white/5 rounded-full">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-bold">Selecionar Substituição</h2>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
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
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sportColor }}></span>
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
                        onClick={() => {
                          setSelectedMuscleGroup('Todos');
                          setSelectedMuscleSubgroup('Todos');
                        }}
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
                            onClick={() => {
                              setSelectedMuscleGroup(group as any);
                              setSelectedMuscleSubgroup('Todos');
                            }}
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

              <div className="space-y-2">
                {filteredExercises.map(ex => {
                  const isSelected = currentConfig.substitutions?.includes(ex.id);
                  return (
                    <div 
                      key={ex.id}
                      onClick={() => {
                        const currentSubs = currentConfig.substitutions || [];
                        if (!isSelected) {
                          updateConfig({ substitutions: [...currentSubs, ex.id] });
                          setShowSubstitutionList(false);
                        }
                      }}
                      className={cn(
                        "flex justify-between items-center p-4 rounded-2xl border cursor-pointer transition-all",
                        isSelected ? "opacity-50 border-transparent" : "bg-dark-card border-dark-border hover:border-white/10"
                      )}
                      style={isSelected ? { backgroundColor: `${sportColor}0d`, borderColor: `${sportColor}4d` } : undefined}
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
                              className="p-1 rounded-full hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: `${sportColor}1a`, color: sportColor }}
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
                        style={isSelected ? { backgroundColor: sportColor, borderColor: sportColor } : { borderColor: 'rgba(255,255,255,0.1)' }}
                      >
                        {isSelected && <Check size={14} strokeWidth={4} className="text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedExerciseForVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[500] flex items-center justify-center p-6"
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
