import React from "react";
import { motion } from "motion/react";
import { Search, X, Loader2, UserPlus, UserCheck } from "lucide-react";
import { cn } from "../../../utils/cn";
import { Community, UserProfile } from "../../../domain/entities";

interface CommunitySearchModalProps {
  searchQuery: string;
  isSearching: boolean;
  searchResults: { users: any[]; communities: Community[] };
  userProfile: UserProfile | null;
  onSearch: (q: string) => void;
  onClose: () => void;
  onJoin: (id: string) => void;
  onFollowToggle: (email: string, isFollowing?: boolean) => void;
}

export const CommunitySearchModal: React.FC<CommunitySearchModalProps> = ({
  searchQuery, isSearching, searchResults, userProfile,
  onSearch, onClose, onJoin, onFollowToggle,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col"
  >
    <div className="p-6 flex items-center gap-4 border-b border-white/5">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
        <input
          autoFocus
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar atletas ou comunidades..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>
      <button onClick={onClose} className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-colors">
        <X size={20} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
      {isSearching ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-brand-red" size={32} />
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Buscando...</p>
        </div>
      ) : searchQuery.trim() ? (
        <>
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Atletas</h2>
            {searchResults.users.length > 0 ? (
              <div className="space-y-3">
                {searchResults.users.map((user) => (
                  <div key={user.email} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={user.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                      <div>
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-[10px] text-white/40">{user.email}</p>
                      </div>
                    </div>
                    {user.email !== userProfile?.email && (
                      <button
                        onClick={() => onFollowToggle(user.email, user.isFollowing)}
                        className={cn("p-2 rounded-lg transition-all", user.isFollowing ? "bg-brand-red/10 text-brand-red" : "bg-white/5 text-white/40 hover:bg-white/10")}
                      >
                        {user.isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/20 italic">Nenhum atleta encontrado.</p>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Comunidades</h2>
            {searchResults.communities.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {searchResults.communities.map((community) => (
                  <div key={community.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">{community.name}</h3>
                        <p className="text-[10px] text-white/40">{community.membersCount} membros</p>
                      </div>
                      <button
                        onClick={() => { onJoin(community.id); onClose(); }}
                        className="px-4 py-2 bg-brand-red rounded-xl text-black font-bold text-[10px]"
                      >
                        Entrar
                      </button>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-2">{community.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/20 italic">Nenhuma comunidade encontrada.</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20">
            <Search size={32} />
          </div>
          <div>
            <p className="text-sm font-bold text-white/40">Busca Global</p>
            <p className="text-xs text-white/20 mt-1">Encontre atletas para seguir ou novas comunidades para treinar junto.</p>
          </div>
        </div>
      )}
    </div>
  </motion.div>
);
