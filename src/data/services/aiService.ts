import { WorkoutSession, UserProfile, StagnationReport, ProgressScore, Community } from "../../domain/entities";
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

export async function getRecommendedCommunities(
  userProfile: UserProfile,
  userLevel: number,
  userLeague: string,
  communities: Community[],
  userCommunityIds: string[]
): Promise<Community[]> {
  try {
    const data = await callBackendAI('/api/ai/recommend-communities', {
      userProfile,
      userLevel,
      userLeague,
      communities,
      userCommunityIds,
    });
    
    const recommendedIds = data.recommendations || [];
    return communities.filter(c => recommendedIds.includes(c.id));
  } catch (error) {
    console.error('AI Recommendation error:', error);
    // Fallback: return some popular communities he's not in
    return communities.filter(c => !userCommunityIds.includes(c.id)).slice(0, 2);
  }
}
