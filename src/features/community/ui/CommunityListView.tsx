import React from "react";
import { Users, UserPlus } from "lucide-react";
import { Community } from "../../../domain/entities";

interface CommunityListViewProps {
  communities: Community[];
  userCommunityIds: string[];
  activeCommunity: Community | null;
  onSelect: (c: Community) => void;
  onJoin: (id: string) => void;
}

export const CommunityListView: React.FC<CommunityListViewProps> = ({
  communities, userCommunityIds, activeCommunity, onSelect, onJoin,
}) => {
  if (activeCommunity && !userCommunityIds.includes(activeCommunity.id)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
          <Users size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold">Comunidade {activeCommunity.name}</h2>
          <p className="text-sm text-white/60 max-w-xs mx-auto">
            {activeCommunity.description || "Junte-se a esta comunidade para ver posts, desafios, ranking e conversar com outros membros."}
          </p>
        </div>
        <button
          onClick={() => onJoin(activeCommunity.id)}
          className="px-8 py-4 bg-brand-red text-black rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-brand-red/90 transition-colors flex items-center gap-2"
        >
          <UserPlus size={18} />
          Entrar na Comunidade
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {communities.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand-red">
            <Users size={18} />
            <h2 className="text-xs font-bold uppercase tracking-widest">Minhas Comunidades</h2>
          </div>
          <div className="flex flex-col gap-3">
            {communities.map((community) => (
              <div
                key={community.id}
                onClick={() => onSelect(community)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
                    <Users size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold truncate">{community.name}</h3>
                    <p className="text-xs text-white/40">{community.membersCount} membros</p>
                  </div>
                  {userCommunityIds.includes(community.id) ? (
                    <div className="px-4 py-2 bg-white/10 rounded-lg text-white font-bold text-xs shrink-0">Acessar</div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onJoin(community.id); }}
                      className="px-4 py-2 bg-brand-red rounded-lg text-black font-bold text-xs active:scale-95 transition-transform shrink-0"
                    >
                      Entrar
                    </button>
                  )}
                </div>
                {community.description && (
                  <p className="text-xs text-white/60 line-clamp-2">{community.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-sm font-bold">Nenhuma comunidade</h3>
            <p className="text-xs text-white/40 mt-1">Crie ou pesquise uma comunidade para começar.</p>
          </div>
        </div>
      )}
    </div>
  );
};
