import React from "react";
import { motion } from "motion/react";
import { Medal, UserPlus, UserCheck } from "lucide-react";
import { cn } from "../../../utils/cn";
import { Ranking, Community, UserProfile } from "../../../domain/entities";

interface CommunityRankingTabProps {
  ranking: Ranking[];
  activeCommunity: Community;
  userProfile: UserProfile | null;
  onFollowToggle: (email: string, isFollowing?: boolean) => void;
}

export const CommunityRankingTab: React.FC<CommunityRankingTabProps> = ({
  ranking, activeCommunity, userProfile, onFollowToggle,
}) => (
  <motion.div
    key="ranking"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="p-6 space-y-6"
  >
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-white/5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/60">
          Top Atletas - {activeCommunity.name}
        </h2>
      </div>
      <div className="divide-y divide-white/5">
        {ranking.map((item, index) => {
          const isMe = item.userId === userProfile?.email;
          return (
            <div key={item.userId} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center">
                  {index < 3 ? (
                    <Medal className={cn("w-5 h-5", index === 0 ? "text-yellow-500" : index === 1 ? "text-slate-400" : "text-amber-600")} />
                  ) : (
                    <span className="text-[10px] font-black text-white/40">{index + 1}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <img src={item.userAvatar} className="w-10 h-10 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{item.userName}</p>
                      {isMe && <span className="text-[8px] px-1.5 py-0.5 rounded bg-brand-red/10 text-brand-red font-bold uppercase">Você</span>}
                    </div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.xp} XP • {item.streak} Dias</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isMe && (
                  <button
                    onClick={() => onFollowToggle(item.userId, item.isFollowing)}
                    className={cn("p-2 rounded-lg transition-all", item.isFollowing ? "bg-brand-red/10 text-brand-red" : "bg-white/5 text-white/40 hover:bg-white/10")}
                  >
                    {item.isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  </button>
                )}
                <p className="text-xs font-bold text-brand-red">#{index + 1}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </motion.div>
);
