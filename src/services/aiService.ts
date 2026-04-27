import { GoogleGenerativeAI } from "@google/generative-ai";
import { WorkoutSession, UserProfile, StagnationReport, ProgressScore } from "../types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getAICoachAdvice(
  userProfile: UserProfile,
  sessions: WorkoutSession[],
  stagnationReports: StagnationReport[],
  progressScore: ProgressScore | null
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Você é um Personal Trainer IA de elite chamado "Shape Express Coach". 
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
Limite a resposta a no máximo 3 parágrafos curtos.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || "Não consegui gerar um conselho no momento. Continue treinando firme!";
  } catch (error) {
    console.error("AI Coach Error:", error);
    return "O Coach está ocupado no momento, mas ele diz: Não desista!";
  }
}
