import {
  UserProfile, UserStats, WorkoutTemplate, WorkoutSession, BodyAssessment,
} from '../../domain/entities';

interface UseDataSyncParams {
  api: any;
  setUserProfile: (p: UserProfile) => void;
  setUserStats: (s: UserStats) => void;
}

export function useDataSync({
  api,
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

  // NOTE: api.createTemplate / updateTemplate / deleteTemplate (useWorkoutState) already
  // update React state internally — do NOT call setTemplates here to avoid duplicates.
  const createTemplate = async (t: WorkoutTemplate) => {
    await api.createTemplate(t);
  };

  const updateTemplate = async (t: WorkoutTemplate) => {
    await api.updateTemplate(t);
  };

  const deleteTemplate = async (id: string) => {
    await api.deleteTemplate(id);
  };

  // NOTE: api.createSession / updateSession / deleteSession (useWorkoutState) already
  // update React state internally — do NOT call setSessions here to avoid duplicates.
  const createSession = async (s: WorkoutSession) => {
    console.log('🔗 [useDataSync.createSession] Chamando api.createSession');
    console.log('🔗 [useDataSync.createSession] Sessão a ser criada:', s);
    
    try {
      await api.createSession(s);
      console.log('✅ [useDataSync.createSession] api.createSession concluído');
    } catch (error) {
      console.error('❌ [useDataSync.createSession] Erro ao chamar api.createSession:', error);
      throw error;
    }
  };

  const updateSession = async (s: WorkoutSession) => {
    await api.updateSession(s);
  };

  const deleteSession = async (id: string) => {
    await api.deleteSession(id);
  };

  const createAssessment = async (a: BodyAssessment) => {
    await api.createAssessment(a);
  };

  const updateAssessment = async (a: BodyAssessment) => {
    await api.updateAssessment(a);
  };

  const deleteAssessment = async (id: string) => {
    await api.deleteAssessment(id);
  };

  return {
    updateProfile, updateStats,
    createTemplate, updateTemplate, deleteTemplate,
    createSession, updateSession, deleteSession,
    createAssessment, updateAssessment, deleteAssessment,
  };
}
