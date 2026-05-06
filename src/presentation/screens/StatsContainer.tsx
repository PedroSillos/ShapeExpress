import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  WorkoutSession,
  WorkoutTemplate,
  BodyAssessment,
} from '../../domain/entities';
import { cn } from '../../utils/cn';
import { StatsView } from './StatsView';
import { EvolutionView } from './EvolutionView';

interface StatsContainerProps {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  assessments: BodyAssessment[];
  onCreateWorkout: () => void;
  onGoToStore: () => void;
  onNewAssessment: () => void;
  onDeleteAssessment: (id: string) => void;
  onEditAssessment: (a: BodyAssessment) => void;
  initialTab?: 'stats' | 'evolution';
  readOnly?: boolean;
}

export function StatsContainer({
  sessions,
  templates,
  assessments,
  onCreateWorkout,
  onGoToStore,
  onNewAssessment,
  onDeleteAssessment,
  onEditAssessment,
  initialTab = 'stats',
  readOnly = false,
}: StatsContainerProps) {
  const [subTab, setSubTab] = useState<'stats' | 'evolution'>(initialTab);
  const [direction, setDirection] = useState(0);

  const handleSubTabChange = (tab: 'stats' | 'evolution') => {
    if (tab === subTab) return;
    setDirection(tab === 'evolution' ? 1 : -1);
    setSubTab(tab);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">
          {subTab === 'stats' ? 'Estatísticas' : 'Evolução'}
        </h2>
        <div className="flex bg-white/5 p-1 rounded-xl">
          <button
            onClick={() => handleSubTabChange('stats')}
            className={cn(
              'px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all',
              subTab === 'stats' ? 'bg-brand-red text-black' : 'text-white/40',
            )}
          >
            Geral
          </button>
          <button
            onClick={() => handleSubTabChange('evolution')}
            className={cn(
              'px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all',
              subTab === 'evolution' ? 'bg-brand-red text-black' : 'text-white/40',
            )}
          >
            Física
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={subTab}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 50 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              const threshold = 50;
              if (info.offset.x < -threshold && subTab === 'stats') handleSubTabChange('evolution');
              else if (info.offset.x > threshold && subTab === 'evolution') handleSubTabChange('stats');
            }}
            className="h-full touch-pan-y"
          >
            {subTab === 'stats' ? (
              <StatsView
                sessions={sessions}
                templates={templates}
                onCreateWorkout={onCreateWorkout}
                onGoToStore={onGoToStore}
                hideHeader
                readOnly={readOnly}
              />
            ) : (
              <EvolutionView
                assessments={assessments}
                onAdd={onNewAssessment}
                onDelete={onDeleteAssessment}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
