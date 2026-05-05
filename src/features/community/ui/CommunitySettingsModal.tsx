import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { cn } from "../../../utils/cn";
import { Community } from "../../../domain/entities";
import { getFirebaseErrorMessage } from "../../../utils/firebaseErrors";
import { toast } from "sonner";
import { SettingsTabGeneral } from "./SettingsTabGeneral";
import { SettingsTabMembers } from "./SettingsTabMembers";
import { SettingsTabChallenges } from "./SettingsTabChallenges";

interface CommunitySettingsModalProps {
  community: Community;
  onClose: () => void;
  api: any;
  onUpdate: (c: Community) => void;
  onDelete: () => void;
  currentUserEmail: string;
}

type SettingsTab = "general" | "members" | "challenges";

export const CommunitySettingsModal: React.FC<CommunitySettingsModalProps> = ({
  community, onClose, api, onUpdate, onDelete, currentUserEmail,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [isPublic, setIsPublic] = useState(community.isPublic !== false);
  const [allowMemberPosts, setAllowMemberPosts] = useState(community.allowMemberPosts !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [currentUserRole, setCurrentUserRole] = useState<"creator" | "moderator" | "member">("member");

  useEffect(() => {
    api.getCommunityRole(community.id).then((role: string | null) => {
      if (role) setCurrentUserRole(role as "creator" | "moderator" | "member");
    }).catch(() => {});
  }, [community.id]);

  const isCreator = currentUserRole === "creator";
  const canManage = currentUserRole === "creator" || currentUserRole === "moderator";

  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      const updated: Community = { ...community, name, description, isPublic, allowMemberPosts };
      await api.updateCommunity(community.id, { name, description, isPublic, allowMemberPosts });
      onUpdate(updated);
      toast.success("Configurações atualizadas!");
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar: " + getFirebaseErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta comunidade? Esta ação não pode ser desfeita.")) return;
    setIsDeleting(true);
    try {
      await api.deleteCommunity(community.id);
      onDelete();
      toast.success("Comunidade excluída.");
      onClose();
    } catch (error) {
      toast.error("Erro ao excluir: " + getFirebaseErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const TABS: { id: SettingsTab; label: string }[] = [
    { id: "general", label: "Geral" },
    { id: "members", label: "Membros" },
    { id: "challenges", label: "Desafios" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="w-full max-w-md bg-dark-surface rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-dark-surface z-10">
          <h2 className="text-lg font-bold">Configurações da Comunidade</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-4 border-b border-white/5 flex gap-4 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2",
                activeTab === tab.id ? "text-brand-red border-brand-red" : "text-white/40 border-transparent hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6 overflow-y-auto no-scrollbar">
          {activeTab === "general" && (
            <SettingsTabGeneral
              name={name} setName={setName}
              description={description} setDescription={setDescription}
              isPublic={isPublic} setIsPublic={setIsPublic}
              allowMemberPosts={allowMemberPosts} setAllowMemberPosts={setAllowMemberPosts}
              canDelete={isCreator} isDeleting={isDeleting} onDelete={handleDelete}
            />
          )}
          {activeTab === "members" && (
            <SettingsTabMembers
              communityId={community.id}
              api={api}
              canManage={canManage}
              currentUserRole={currentUserRole}
              currentUserEmail={currentUserEmail}
            />
          )}
          {activeTab === "challenges" && (
            <SettingsTabChallenges
              communityId={community.id}
              api={api}
              canManage={canManage}
            />
          )}
        </div>

        {activeTab === "general" && (
          <div className="p-6 border-t border-white/5 bg-dark-surface sticky bottom-0">
            <button
              onClick={handleUpdate}
              disabled={!name.trim() || !description.trim() || isSubmitting}
              className="w-full py-4 bg-brand-red text-black font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Salvar Alterações"}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
