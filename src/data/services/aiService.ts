import { WorkoutSession, UserProfile, StagnationReport, ProgressScore } from "../../domain/entities";
import { tokenStore } from "./tokenStore";

const callBackendAI = async (endpoint: string, body: any): Promise<any> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenStore.idToken || ''}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Failed to get AI response');
  return response.json();
};

export async function generateFirstWorkoutAI(onboardingAnswers: {
  sports: string[];
  objective?: string;
  experience?: string;
  location?: string;
  height?: number;
  weight?: number;
  age?: number;
}): Promise<{ name: string; exercises: { exerciseId: string; numSets: number; sets: string; rest: string }[] } | null> {
  try {
    const data = await callBackendAI('/api/ai/generate-first-workout', onboardingAnswers);
    return data;
  } catch (error) {
    console.error('Generate first workout error:', error);
    return null;
  }
}

export async function getAICoachAdvice(
  userProfile: UserProfile,
  sessions: WorkoutSession[],
  stagnationReports: StagnationReport[],
  progressScore: ProgressScore | null
): Promise<string> {
  try {
    const data = await callBackendAI('/api/ai/coach-advice', {
      userProfile,
      sessions,
      stagnationReports,
      progressScore,
    });
    return data.advice || "Não consegui gerar um conselho no momento. Continue treinando firme!";
  } catch (error) {
    console.error("AI Coach Error:", error);
    return "O Coach está ocupado no momento, mas ele diz: Não desista!";
  }
}

