import {
  UserProfile, UserStats, WorkoutTemplate, WorkoutSession, BodyAssessment,
} from '../../domain/entities';

interface UseDataSyncParams {
  api: any;
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  assessments: BodyAssessment[];
  setSessions: (fn: any) => void;
  setTemplates: (fn: any) => void;
  setAssessments: (fn: any) => void;
  setUserProfile: (p: UserProfile) => void;
  setUserStats: (s: UserStats) => void;
}

export function useDataSync({
  api,
  sessions, templates, assessments,
  setSessions, setTemplates, setAssessments,
  setUserProfile, setUserStats,
}: UseDataSyncParams) {
  const updateProfile = async (p: UserProfile) => {
    setUserProfile(p);
    await api.updateProfile(p);
  };

  const updateStats = async (s: UserStats) => {
    setUserStats(s);
    await api.updateStats(s);
  };

  const createTemplate = async (t: WorkoutTemplate) => {
    setTemplates((prev: WorkoutTemplate[]) => [...prev, t]);
    await api.createTemplate(t);
  };

  const updateTemplate = async (t: WorkoutTemplate) => {
    setTemplates((prev: WorkoutTemplate[]) => prev.map((tmp: WorkoutTemplate) => tmp.id === t.id ? t : tmp));
    await api.updateTemplate(t);
  };

  const deleteTemplate = async (id: string) => {
    setTemplates((prev: WorkoutTemplate[]) => prev.filter((t: WorkoutTemplate) => t.id !== id));
    await api.deleteTemplate(id);
  };

  const createSession = async (s: WorkoutSession) => {
    setSessions((prev: WorkoutSession[]) => [s, ...prev]);
    await api.createSession(s);
  };

  const updateSession = async (s: WorkoutSession) => {
    setSessions((prev: WorkoutSession[]) => prev.map((sess: WorkoutSession) => sess.id === s.id ? s : sess));
    await api.updateSession(s);
  };

  const deleteSession = async (id: string) => {
    setSessions((prev: WorkoutSession[]) => prev.filter((s: WorkoutSession) => s.id !== id));
    await api.deleteSession(id);
  };

  const createAssessment = async (a: BodyAssessment) => {
    setAssessments((prev: BodyAssessment[]) => [a, ...prev]);
    await api.createAssessment(a);
  };

  const updateAssessment = async (a: BodyAssessment) => {
    setAssessments((prev: BodyAssessment[]) => prev.map((item: BodyAssessment) => item.id === a.id ? a : item));
    await api.updateAssessment(a);
  };

  const deleteAssessment = async (id: string) => {
    setAssessments((prev: BodyAssessment[]) => prev.filter((a: BodyAssessment) => a.id !== id));
    await api.deleteAssessment(id);
  };

  return {
    updateProfile, updateStats,
    createTemplate, updateTemplate, deleteTemplate,
    createSession, updateSession, deleteSession,
    createAssessment, updateAssessment, deleteAssessment,
  };
}
