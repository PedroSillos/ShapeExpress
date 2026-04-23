import { GoogleGenAI } from "@google/genai";
import { WorkoutSession, UserProfile, StagnationReport, ProgressScore, Community } from "../../domain/entities";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "" });

export async function getAICoachAdvice(
  userProfile: UserProfile,
  sessions: WorkoutSession[],
  stagnationReports: StagnationReport[],
  progressScore: ProgressScore | null
): Promise<string> {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Você é um Personal Trainer IA de elite chamado "Shape Express Coach". 
            Analise os dados do usuário e forneça conselhos motivadores e técnicos para sua evolução.
            
            Perfil do Usuário:
            - Nome: ${userProfile?.name}
            - Objetivo: ${userProfile?.objective}
            - Nível: ${userProfile?.experienceLevel || 'Intermediário'}
            
            Dados Recentes:
            - Total de Treinos: ${sessions.length}
            - Score de Progresso: ${progressScore?.score || 'N/A'} (${progressScore?.classification || 'N/A'})
            - Relatórios de Estagnação: ${JSON.stringify(stagnationReports)}
            
            Responda em Português (Brasil). Seja conciso, use emojis e foque em como superar a estagnação se houver, ou como manter o ritmo se estiver progredindo bem.
            Limite a resposta a no máximo 3 parágrafos curtos.`
          }
        ]
      }
    ]
  });

  try {
    const response = await model;
    return response.text || "Não consegui gerar um conselho no momento. Continue treinando firme!";
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
    const prompt = `
      Com base no perfil do atleta abaixo, sugira as 3 comunidades mais adequadas para ele entre as disponíveis.
      
      Perfil do Atleta:
      - Nome: ${userProfile.name}
      - Objetivo: ${userProfile.objective}
      - Nível: ${userLevel}
      - Liga: ${userLeague}
      
      Comunidades Disponíveis:
      ${communities.map(c => `- ID: ${c.id}, Nome: ${c.name}, Descrição: ${c.description}, Tags: ${c.tags}`).join('\n')}
      
      Comunidades que ele já participa: ${userCommunityIds.join(', ')}
      
      Retorne APENAS um array JSON com os IDs das comunidades recomendadas. Exemplo: ["id1", "id2"]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    const text = response.text || "[]";
    const recommendedIds = JSON.parse(text.match(/\[.*\]/)?.[0] || '[]');
    return communities.filter(c => recommendedIds.includes(c.id));
  } catch (error) {
    console.error('AI Recommendation error:', error);
    // Fallback: return some popular communities he's not in
    return communities.filter(c => !userCommunityIds.includes(c.id)).slice(0, 2);
  }
}
