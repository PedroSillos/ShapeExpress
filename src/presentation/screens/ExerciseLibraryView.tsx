import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronRight, Play, Info, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { 
  Exercise, MuscleGroup, MuscleSubgroup, ExerciseCategory, Equipment 
} from '../../domain/entities';
import { EXERCISES } from '../../constants';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

export function ExerciseLibraryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'Todos'>('Todos');
  const [selectedMuscleSubgroup, setSelectedMuscleSubgroup] = useState<MuscleSubgroup | 'Todos'>('Todos');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'Todos'>('Todos');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'Todos'>('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const muscleSubgroupsMap: Record<string, MuscleSubgroup[]> = {
    'Peito': ['Peito superior', 'Peito médio', 'Peito inferior'],
    'Costas': ['Dorsal', 'Trapézio', 'Lombar'],
    'Pernas': ['Quadríceps', 'Posterior', 'Glúteos', 'Adutor', 'Abdutor', 'Panturrilha'],
    'Ombros': ['Deltoide Anterior', 'Deltoide Lateral', 'Deltoide Posterior'],
    'Braços': ['Bíceps', 'Tríceps', 'Antebraço'],
    'Core': ['Abdominais', 'Oblíquos', 'Lombar (Core)'],
  };

  const filteredExercises = EXERCISES.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMuscle = selectedMuscleGroup === 'Todos' || ex.muscleGroup === selectedMuscleGroup;
    const matchesSubgroup = selectedMuscleSubgroup === 'Todos' || ex.muscleSubgroup === selectedMuscleSubgroup;
    const matchesCategory = selectedCategory === 'Todos' || ex.category === selectedCategory;
    const matchesEquipment = selectedEquipment === 'Todos' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesSubgroup && matchesCategory && matchesEquipment;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Biblioteca</h2>
        <Badge className="bg-brand-red/20 text-brand-red">{filteredExercises.length} exercícios</Badge>
      </div>

      <div className="space-y-4">
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

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Grupo Muscular</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Core'].map(group => (
                      <button
                        key={group}
                        onClick={() => {
                          setSelectedMuscleGroup(group as any);
                          setSelectedMuscleSubgroup('Todos');
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap",
                          selectedMuscleGroup === group 
                            ? "bg-brand-red border-brand-red text-black" 
                            : "bg-white/5 border-white/10 text-white/40"
                        )}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMuscleGroup !== 'Todos' && muscleSubgroupsMap[selectedMuscleGroup] && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Subgrupo</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                      {['Todos', ...muscleSubgroupsMap[selectedMuscleGroup]].map(sub => (
                        <button
                          key={sub}
                          onClick={() => setSelectedMuscleSubgroup(sub as any)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border whitespace-nowrap",
                            selectedMuscleSubgroup === sub 
                              ? "bg-brand-red/20 border-brand-red/40 text-brand-red" 
                              : "bg-white/5 border-white/10 text-white/40"
                          )}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Equipamento</p>
                    <select 
                      value={selectedEquipment}
                      onChange={(e) => setSelectedEquipment(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Barra">Barra</option>
                      <option value="Halter">Halter</option>
                      <option value="Máquina">Máquina</option>
                      <option value="Peso corporal">Peso corporal</option>
                      <option value="Elástico">Elástico</option>
                      <option value="Kettlebell">Kettlebell</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Categoria</p>
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as any)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Musculação">Musculação</option>
                      <option value="Alongamento">Alongamento</option>
                      <option value="Exercício em casa">Em casa</option>
                      <option value="Funcional">Funcional</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid gap-3">
        {filteredExercises.map(ex => (
          <Card 
            key={ex.id} 
            className="p-4 hover:border-brand-red/30 transition-all group cursor-pointer"
            onClick={() => setSelectedExercise(ex)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-white/20 group-hover:text-brand-red transition-colors">
                <Dumbbell size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">{ex.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{ex.muscleGroup}</span>
                  <span className="text-[10px] text-white/20">•</span>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{ex.equipment}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-white/10 group-hover:text-white/40 transition-colors" />
            </div>
          </Card>
        ))}
      </div>

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-dark-surface border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-bold">{selectedExercise.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-brand-red/10 text-brand-red border-brand-red/20">{selectedExercise.muscleGroup}</Badge>
                      {selectedExercise.muscleSubgroup && (
                        <Badge className="bg-white/5 text-white/60 border-white/10">{selectedExercise.muscleSubgroup}</Badge>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedExercise(null)}
                    className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                  {selectedExercise.youtubeUrl ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={48} className="text-brand-red opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Dumbbell size={48} className="text-white/10 mx-auto" />
                      <p className="text-xs text-white/20">Vídeo demonstrativo em breve</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Equipamento</p>
                    <p className="text-sm font-bold">{selectedExercise.equipment}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Categoria</p>
                    <p className="text-sm font-bold">{selectedExercise.category}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/40">
                    <Info size={14} />
                    <h4 className="text-xs font-bold uppercase tracking-widest">Instruções</h4>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Mantenha a postura ereta, execute o movimento de forma controlada e foque na contração muscular do {selectedExercise.muscleGroup.toLowerCase()}. Respire de forma rítmica durante toda a execução.
                  </p>
                </div>

                <button 
                  onClick={() => setSelectedExercise(null)}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
