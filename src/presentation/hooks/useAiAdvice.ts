import { useEffect } from 'react';
import { getAICoachAdvice } from '../../data/services/aiService';
import { UserProfile, WorkoutSession, StagnationReport, ProgressScore } from '../../domain/entities';

interface UseAiAdviceParams {
  isLoggedIn: boolean;
  activeTab: string;
  userProfile: UserProfile;
  userSessions: WorkoutSession[];
  stagnationReports: StagnationReport[];
  progressScore: ProgressScore | null;
  aiAdvice: string | null;
  isAiLoading: boolean;
  setAiAdvice: (v: string) => void;
  setIsAiLoading: (v: boolean) => void;
}

export function useAiAdvice({
  isLoggedIn,
  activeTab,
  userProfile,
  userSessions,
  stagnationReports,
  progressScore,
  aiAdvice,
  isAiLoading,
  setAiAdvice,
  setIsAiLoading,
}: UseAiAdviceParams) {
  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'dashboard' || aiAdvice || isAiLoading || userSessions.length === 0) return;

    const fetch = async () => {
      setIsAiLoading(true);
      try {
        const advice = await getAICoachAdvice(userProfile, userSessions, stagnationReports, progressScore);
        setAiAdvice(advice);
      } catch (e) {
        console.error('Error fetching AI advice:', e);
      } finally {
        setIsAiLoading(false);
      }
    };
    fetch();
  }, [isLoggedIn, activeTab, userSessions, stagnationReports, progressScore, aiAdvice, isAiLoading, userProfile]);
}
