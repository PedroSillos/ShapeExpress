import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../../utils/cn";

interface SettingsTabGeneralProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  isPublic: boolean;
  setIsPublic: (v: boolean) => void;
  allowMemberPosts: boolean;
  setAllowMemberPosts: (v: boolean) => void;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}

export const SettingsTabGeneral: React.FC<SettingsTabGeneralProps> = ({
  name, setName, description, setDescription,
  isPublic, setIsPublic, allowMemberPosts, setAllowMemberPosts,
  canDelete, isDeleting, onDelete,
}) => (
  <>
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red">Informações Básicas</h3>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Nome</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none h-24"
        />
      </div>
    </div>

    <div className="space-y-4 pt-4 border-t border-white/5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red">Privacidade e Permissões</h3>

      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div>
          <p className="font-bold text-sm">Comunidade Pública</p>
          <p className="text-xs text-white/40">
            {isPublic ? "Qualquer um pode encontrar e participar" : "Novos membros precisam de aprovação"}
          </p>
        </div>
        <button
          onClick={() => setIsPublic(!isPublic)}
          className={cn("w-12 h-6 rounded-full transition-colors relative", isPublic ? "bg-brand-red" : "bg-white/10")}
        >
          <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", isPublic ? "left-7" : "left-1")} />
        </button>
      </div>

      {!isPublic && (
        <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <span className="text-yellow-400 text-base mt-0.5">⚠️</span>
          <p className="text-xs text-yellow-400/80 leading-relaxed">
            Comunidade privada. Novos membros só entrarão após aprovação do criador ou de um moderador na aba <strong>Membros</strong>.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
        <div>
          <p className="font-bold text-sm">Membros podem postar</p>
          <p className="text-xs text-white/40">Permitir posts no feed da comunidade</p>
        </div>
        <button
          onClick={() => setAllowMemberPosts(!allowMemberPosts)}
          className={cn("w-12 h-6 rounded-full transition-colors relative", allowMemberPosts ? "bg-brand-red" : "bg-white/10")}
        >
          <div className={cn("w-4 h-4 bg-white rounded-full absolute top-1 transition-all", allowMemberPosts ? "left-7" : "left-1")} />
        </button>
      </div>
    </div>

    {canDelete && (
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">Zona de Perigo</h3>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
        >
          {isDeleting ? <Loader2 className="animate-spin" size={20} /> : "Excluir Comunidade"}
        </button>
      </div>
    )}
  </>
);
