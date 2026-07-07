import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Student, WorkoutSession, WorkoutTemplate } from '../../domain/entities';
import { StatsContainer } from './StatsContainer';

interface StudentEvolutionViewProps {
  student: Student;
  trainerEmail: string;
  api: any;
  onBack: () => void;
}

export function StudentEvolutionView({ student, trainerEmail, api, onBack }: StudentEvolutionViewProps) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const studentEmailLower = student.email.toLowerCase();
        const [allSessions, allTemplates] = await Promise.all([
          api.queryDocs('sessions', 'userId', '==', studentEmailLower),
          api.queryDocs('templates', 'userId', '==', studentEmailLower),
        ]);

        const trainerTemplates = allTemplates.filter((t: WorkoutTemplate) => t.creatorEmail === trainerEmail);
        const trainerTemplateIds = new Set(trainerTemplates.map((t: WorkoutTemplate) => t.id));
        const trainerSessions = allSessions.filter((s: WorkoutSession) => trainerTemplateIds.has(s.workoutId));

        setSessions(trainerSessions);
        setTemplates(trainerTemplates);
      } catch (error) {
        console.error('Error fetching student evolution data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [student.email, trainerEmail, api]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
        <p className="text-white/60 font-medium">Carregando evolução de {student.name}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold">Evolução do Aluno</h2>
          <p className="text-sm text-white/40">{student.name}</p>
        </div>
      </div>
      <StatsContainer
        key="student-evolution-stats"
        sessions={sessions}
        templates={templates}
        readOnly
      />
    </div>
  );
}
