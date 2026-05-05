import React from "react";
import { Users, Settings, Plus, Search, ChevronLeft } from "lucide-react";
import { Community } from "../../../domain/entities";

interface CommunityHeaderProps {
  activeCommunity: Community | null;
  onBack: () => void;
  onSettings: () => void;
  onCreate: () => void;
  onSearch: () => void;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  activeCommunity, onBack, onSettings, onCreate, onSearch,
}) => (
  <div className="px-6 py-4 border-b border-white/5 bg-dark-surface/50 backdrop-blur-md sticky top-0 z-30">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {activeCommunity ? (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red">
            <Users size={24} />
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold">{activeCommunity ? activeCommunity.name : "Comunidades"}</h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
            {activeCommunity ? "Comunidade" : "Explore e participe"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {activeCommunity && (
          <button onClick={onSettings} className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
        )}
        {!activeCommunity && (
          <>
            <button onClick={onCreate} className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors">
              <Plus size={20} />
            </button>
            <button onClick={onSearch} className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors">
              <Search size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);
