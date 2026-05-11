import { LogOut, Trash2, X, Plus, Dumbbell, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkoutTemplate, UserTrainingProfile, ExerciseUserStats } from '../../domain/entities';
import { estimateWorkoutDuration } from '../../domain/use-cases/workoutEstimation';
import { Card } from './Card';

// --- LogoutModal ---
interface LogoutModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ open, onCancel, onConfirm }: LogoutModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm bg-dark-card border border-dark-border rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <LogOut size={32} />
              </div>
              <h2 className="text-xl font-bold">Sair da Conta?</h2>
              <p className="text-sm text-white/40">Você precisará entrar novamente para acessar seus treinos e progresso.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button onClick={onConfirm} data-testid="btn-confirm-logout" className="flex-1 py-4 bg-red-500 rounded-2xl text-white font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform">
                Sair
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- DeleteTemplateModal ---
interface DeleteTemplateModalProps {
  templateId: string | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteTemplateModal({ templateId, onCancel, onConfirm }: DeleteTemplateModalProps) {
  return (
    <AnimatePresence>
      {templateId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full bg-dark-card border border-dark-border rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold">Excluir Treino?</h2>
              <p className="text-sm text-white/40">Esta ação não pode ser desfeita. O template do treino será removido permanentemente.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onCancel} className="flex-1 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => onConfirm(templateId)}
                className="flex-1 py-4 bg-red-500 rounded-2xl text-white font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- WorkoutSelectorModal ---
interface WorkoutSelectorModalProps {
  open: boolean;
  templates: WorkoutTemplate[];
  userTrainingProfile: UserTrainingProfile;
  exerciseUserStats: ExerciseUserStats[];
  onClose: () => void;
  onSelectTemplate: (template: WorkoutTemplate) => void;
  onCreateWorkout: () => void;
}

export function WorkoutSelectorModal({
  open,
  templates,
  userTrainingProfile,
  exerciseUserStats,
  onClose,
  onSelectTemplate,
  onCreateWorkout,
}: WorkoutSelectorModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            className="relative w-full bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Iniciar Treino</h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {templates.map(template => {
                const hasSheets = template.sheets && template.sheets.length > 0;
                const totalExercises = hasSheets
                  ? template.sheets!.reduce((acc, s) => acc + (s.exerciseIds?.length || s.exercises?.length || 0), 0)
                  : (template.exerciseIds?.length || 0);
                const sheetToEstimate = hasSheets ? template.sheets![0] : null;
                const estimatedMinutes = sheetToEstimate
                  ? estimateWorkoutDuration(sheetToEstimate.exercises, userTrainingProfile, exerciseUserStats)
                  : 0;
                return (
                  <Card
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    className="flex justify-between items-center hover:bg-white/5"
                  >
                    <div>
                      <h3 className="font-bold">{template.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-white/40 font-bold uppercase flex items-center gap-1">
                          <Clock size={10} className="text-brand-red" />{estimatedMinutes} min
                        </p>
                        <p className="text-[10px] text-white/40 font-bold uppercase flex items-center gap-1">
                          <Dumbbell size={10} className="text-brand-red" />{totalExercises} exercícios
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-brand-red" />
                  </Card>
                );
              })}
              <button
                onClick={onCreateWorkout}
                className="w-full py-4 border border-dashed border-dark-border rounded-2xl text-white/40 font-bold flex items-center justify-center gap-2 hover:bg-white/5"
              >
                <Plus size={20} /> Criar Novo Treino
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- SheetSelectorModal ---
interface SheetSelectorModalProps {
  template: WorkoutTemplate | null;
  onClose: () => void;
  onSelectSheet: (template: WorkoutTemplate, index: number) => void;
}

export function SheetSelectorModal({ template, onClose, onSelectSheet }: SheetSelectorModalProps) {
  return (
    <AnimatePresence>
      {template && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="relative w-full max-w-sm bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6"
          >
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold">Escolha a Ficha</h3>
              <p className="text-xs text-white/40">Qual treino você vai esmagar hoje?</p>
            </div>
            <div className="grid gap-3">
              {template.sheets?.map((sheet, index) => (
                <button
                  key={sheet.id}
                  onClick={() => onSelectSheet(template, index)}
                  className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:border-brand-red/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                      <Dumbbell size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{sheet.name}</p>
                      <p className="text-[10px] text-white/40 uppercase font-bold">
                        {(sheet.exerciseIds?.length || sheet.exercises?.length || 0)} exercícios
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-white/20" />
                </button>
              ))}
            </div>
            <button onClick={onClose} className="w-full py-4 text-white/40 font-bold text-sm">
              Cancelar
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
