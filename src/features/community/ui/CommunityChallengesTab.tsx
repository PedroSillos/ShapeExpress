import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Flame, Trophy, CheckCircle2, Clock, Target, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { endOfDay, endOfWeek, endOfMonth, differenceInSeconds } from "date-fns";
import { cn } from "../../../utils/cn";
import { Challenge, UserChallenge } from "../../../domain/entities";
import { calculateChallengeXP } from "../../../constants";
import { toast } from "sonner";

interface CommunityChallengesTabProps {
  challenges: Challenge[];
  userChallenges: UserChallenge[];
  communityId: string;
  api: any;
  canCreate: boolean;
  onChallengeCreated: (c: Challenge) => void;
  onCollect: (c: Challenge) => void;
  onCancel: (c: Challenge) => void;
}

const ChallengeTimer: React.FC<{ category: string; durationDays: number }> = ({ category, durationDays }) => {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const target =
        category === "daily" ? endOfDay(now) :
        category === "weekly" ? endOfWeek(now, { weekStartsOn: 1 }) :
        endOfMonth(now);
      const diff = differenceInSeconds(target, now);
      if (diff <= 0) { setTimeLeft("Expirado"); return; }
      const d = Math.floor(diff / 86400);
      const h = Math.floor((diff % 86400) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft(d > 0
        ? `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`
        : `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [category, durationDays]);
  return <span>{timeLeft}</span>;
};

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400",
  medium: "bg-yellow-500/20 text-yellow-400",
  hard: "bg-orange-500/20 text-orange-400",
  epic: "bg-purple-500/20 text-purple-400",
};

const ChallengeGroup: React.FC<{
  title: string;
  category: string;
  challenges: Challenge[];
  userChallenges: UserChallenge[];
  onCollect: (c: Challenge) => void;
  onCancel: (c: Challenge) => void;
}> = ({ title, category, challenges, userChallenges, onCollect, onCancel }) => {
  const group = challenges.filter((c) => {
    if (c.category !== category) return false;
    return !userChallenges.find((uc) => uc.challengeId === c.id)?.cancelled;
  });
  if (group.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-white/40">{title}</h2>
      {group.map((challenge) => {
        const uc = userChallenges.find((u) => u.challengeId === challenge.id);
        const pct = uc ? (uc.progress / challenge.goal) * 100 : 0;
        const isCompleted = (uc?.progress ?? 0) >= challenge.goal;
        const isCollected = uc?.collected;

        return (
          <div key={challenge.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                  <Flame size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm">{challenge.title}</h3>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest", DIFFICULTY_STYLES[challenge.difficulty])}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-white/40">{challenge.description}</p>
                  <div className="flex items-center gap-1 mt-1 text-white/30">
                    <Clock size={12} />
                    <span className="text-[10px] uppercase tracking-wider font-bold">
                      <ChallengeTimer category={challenge.category} durationDays={challenge.durationDays} />
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs font-bold text-brand-red">+{challenge.rewardXp} XP</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-white/40">Progresso</span>
                <span>{uc?.progress ?? 0} / {challenge.goal}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pct)}%` }}
                  className={cn("h-full", isCompleted ? "bg-green-500" : "bg-brand-red")}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {challenge.category === "community" && !isCollected && (
                <button onClick={() => onCancel(challenge)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors text-white/60">
                  Cancelar
                </button>
              )}
              {isCollected ? (
                <button disabled className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/40 cursor-not-allowed flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> Entregue
                </button>
              ) : (
                <button
                  onClick={() => onCollect(challenge)}
                  disabled={!isCompleted}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors",
                    isCompleted ? "bg-brand-red text-black hover:bg-brand-red/90" : "bg-white/5 border border-white/10 text-white/40 cursor-not-allowed"
                  )}
                >
                  <Trophy size={16} /> Entregar
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CreateChallengeModal: React.FC<{
  communityId: string;
  api: any;
  onClose: () => void;
  onCreated: (c: Challenge) => void;
}> = ({ communityId, api, onClose, onCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "epic">("medium");
  const [category, setCategory] = useState<"daily" | "weekly" | "community">("community");
  const [durationDays, setDurationDays] = useState(7);
  const [goal, setGoal] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rewardXp = calculateChallengeXP(difficulty, durationDays);

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Preencha o título e a descrição.");
      return;
    }
    setIsSubmitting(true);
    try {
      const newChallenge = await api.createChallenge({
        title, description, difficulty, category,
        durationDays, goal, rewardXp,
        type: "custom", icon: "flame", communityId,
      });
      if (newChallenge) {
        onCreated(newChallenge);
        toast.success("Desafio criado com sucesso!");
        onClose();
      }
    } catch (e) {
      toast.error("Erro ao criar desafio.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-dark-surface rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold">Criar Desafio</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto no-scrollbar">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Maratona de Supino"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Levante um total de 5000kg no Supino Reto."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              >
                <option value="daily" className="bg-dark-bg">Diário</option>
                <option value="weekly" className="bg-dark-bg">Semanal</option>
                <option value="community" className="bg-dark-bg">Comunidade</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Dificuldade</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              >
                <option value="easy" className="bg-dark-bg">Fácil</option>
                <option value="medium" className="bg-dark-bg">Médio</option>
                <option value="hard" className="bg-dark-bg">Difícil</option>
                <option value="epic" className="bg-dark-bg">Épico</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Duração (dias)</label>
              <input
                type="number" min="1" max="30" value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Meta</label>
              <input
                type="number" min="1" value={goal}
                onChange={(e) => setGoal(parseInt(e.target.value) || 1)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          </div>

          <div className="p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-brand-red">Recompensa Estimada</p>
              <p className="text-xs text-brand-red/60">Baseada na dificuldade e duração</p>
            </div>
            <div className="flex items-center gap-1 text-brand-red font-bold text-lg">
              <Sparkles size={18} />
              <span>{rewardXp} XP</span>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleCreate}
            disabled={!title.trim() || !description.trim() || isSubmitting}
            className="w-full py-4 bg-brand-red text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Criar Desafio"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const CommunityChallengesTab: React.FC<CommunityChallengesTabProps> = ({
  challenges, userChallenges, communityId, api, canCreate, onChallengeCreated, onCollect, onCancel,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <motion.div
        key="challenges"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="p-6 space-y-6"
      >
        {canCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2 text-white/60"
          >
            <Plus size={16} /> Criar Desafio
          </button>
        )}

        {challenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
              <Target size={32} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Ainda não existe nenhum desafio nessa comunidade</h3>
              <p className="text-xs text-white/40 mt-1">
                {canCreate ? "Clique em \"Criar Desafio\" para começar." : "Aguarde o criador adicionar desafios."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <ChallengeGroup title="Desafios Diários" category="daily" challenges={challenges} userChallenges={userChallenges} onCollect={onCollect} onCancel={onCancel} />
            <ChallengeGroup title="Desafios Semanais" category="weekly" challenges={challenges} userChallenges={userChallenges} onCollect={onCollect} onCancel={onCancel} />
            <ChallengeGroup title="Desafios da Comunidade" category="community" challenges={challenges} userChallenges={userChallenges} onCollect={onCollect} onCancel={onCancel} />
          </>
        )}
      </motion.div>

      {showCreateModal && (
        <CreateChallengeModal
          communityId={communityId}
          api={api}
          onClose={() => setShowCreateModal(false)}
          onCreated={(c) => { onChallengeCreated(c); setShowCreateModal(false); }}
        />
      )}
    </>
  );
};
