import React, { useState, useEffect } from "react";
import { Target, Trash2, Flame } from "lucide-react";
import { cn } from "../../../utils/cn";
import { Challenge } from "../../../domain/entities";
import { toast } from "sonner";

interface SettingsTabChallengesProps {
  communityId: string;
  api: any;
  canManage: boolean;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-orange-500/20 text-orange-400",
  epic: "bg-purple-500/20 text-purple-400",
};

export const SettingsTabChallenges: React.FC<SettingsTabChallengesProps> = ({
  communityId, api, canManage,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getChallengesByCommunity(communityId)
      .then((data: Challenge[]) => setChallenges(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [communityId]);

  const handleDelete = async (challenge: Challenge) => {
    if (!confirm(`Excluir o desafio "${challenge.title}"?`)) return;
    await api.deleteChallenge(challenge.id);
    setChallenges((prev) => prev.filter((c) => c.id !== challenge.id));
    toast.success("Desafio excluído.");
  };

  if (isLoading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (challenges.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
        <Target size={28} />
      </div>
      <p className="text-sm font-bold">Nenhum desafio criado</p>
      <p className="text-xs text-white/40">Crie desafios na página de Desafios da comunidade.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red">Desafios da Comunidade</h3>
      <div className="space-y-3">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
                <Flame size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm">{challenge.title}</p>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest", DIFFICULTY_STYLES[challenge.difficulty])}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="text-[10px] text-white/40">{challenge.durationDays}d • +{challenge.rewardXp} XP</p>
              </div>
            </div>
            {canManage && (
              <button
                onClick={() => handleDelete(challenge)}
                className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
