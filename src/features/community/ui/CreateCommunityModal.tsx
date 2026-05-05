import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { Community } from "../../../domain/entities";

interface CreateCommunityModalProps {
  onClose: () => void;
  api: any;
  onCommunityCreated: (c: Community) => void;
}

export const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ onClose, api, onCommunityCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      const newComm = await api.createCommunity(name, description);
      if (newComm) onCommunityCreated(newComm);
      onClose();
    } catch (error) {
      console.error("Failed to create community:", error);
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
        className="w-full max-w-md bg-dark-surface rounded-3xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-lg font-bold">Criar Comunidade</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Nome da Comunidade</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corredores de Elite"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sobre o que é esta comunidade?"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || !description.trim() || isSubmitting}
            className="w-full py-4 bg-brand-red text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Criar Comunidade"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
