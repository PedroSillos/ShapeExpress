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

export async function generateWorkoutAI(onboardingAnswers: {
  sports: string[];
  objective?: string;
  experience?: string;
  height?: number;
  weight?: number;
  age?: number;
}): Promise<{ name: string; exercises: { exerciseId: string; numSets: number; sets: string; rest: string }[] } | null> {
  try {
    const data = await callBackendAI('/api/ai/generate-first-workout', onboardingAnswers);
    return data;
  } catch (error) {
    console.error('Generate workout error:', error);
    return null;
  }
}


