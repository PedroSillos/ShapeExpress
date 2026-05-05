import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Ban } from "lucide-react";

interface BanMemberModalProps {
  member: { id: string; name: string; avatar: string } | null;
  onClose: () => void;
  onConfirm: (reason: string, details: string, deletePosts: boolean) => void;
}

export const BanMemberModal: React.FC<BanMemberModalProps> = ({ member, onClose, onConfirm }) => {
  const [banReason, setBanReason] = useState("spam");
  const [banDetails, setBanDetails] = useState("");
  const [deletePosts, setDeletePosts] = useState(false);

  if (!member) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="w-full max-w-sm bg-dark-surface rounded-3xl overflow-hidden flex flex-col border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-white/5 flex items-center gap-3 text-red-500">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Ban size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Banir Membro</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{member.name}</p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Motivo do Banimento</label>
              <select
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
              >
                <option value="spam" className="bg-dark-bg">Spam ou Autopromoção</option>
                <option value="inappropriate" className="bg-dark-bg">Comportamento Inadequado</option>
                <option value="rules" className="bg-dark-bg">Violação das Regras</option>
                <option value="other" className="bg-dark-bg">Outro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Detalhes (Opcional)</label>
              <textarea
                value={banDetails}
                onChange={(e) => setBanDetails(e.target.value)}
                placeholder="Adicione notas sobre o banimento..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none h-20"
              />
            </div>

            <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={deletePosts}
                  onChange={(e) => setDeletePosts(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-brand-red focus:ring-brand-red bg-dark-bg"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-red-500">Excluir postagens recentes</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">Remove os posts dos últimos 7 dias</p>
              </div>
            </label>
          </div>

          <div className="p-6 pt-0 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-colors text-white/60"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(banReason, banDetails, deletePosts)}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              Confirmar Banimento
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
