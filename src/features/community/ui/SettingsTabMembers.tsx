import React, { useState, useEffect } from "react";
import { Search, Check, X } from "lucide-react";
import { cn } from "../../../utils/cn";
import { CommunityMember, CommunityRole } from "../../../domain/entities";
import { BanMemberModal } from "./BanMemberModal";
import { toast } from "sonner";

interface SettingsTabMembersProps {
  communityId: string;
  api: any;
  canManage: boolean;
  currentUserRole: CommunityRole;
  currentUserEmail: string;
}

type MemberTab = "active" | "pending" | "banned";

const ROLE_BADGE: Record<CommunityRole, { label: string; className: string }> = {
  creator: { label: "Criador", className: "bg-yellow-500/20 text-yellow-400" },
  moderator: { label: "Moderador", className: "bg-blue-500/20 text-blue-400" },
  member: { label: "Membro", className: "bg-white/10 text-white/40" },
};

export const SettingsTabMembers: React.FC<SettingsTabMembersProps> = ({
  communityId, api, canManage, currentUserRole, currentUserEmail,
}) => {
  const [activeTab, setActiveTab] = useState<MemberTab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<CommunityMember[]>([]);
  const [bannedMembers, setBannedMembers] = useState<CommunityMember[]>([]);
  const [memberToBan, setMemberToBan] = useState<CommunityMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isCreator = currentUserRole === "creator";

  useEffect(() => { loadMembers(); }, [communityId]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const [active, pending, banned] = await Promise.all([
        api.getCommunityMembers(communityId),
        api.getPendingMembers(communityId),
        api.getBannedMembers(communityId),
      ]);
      setMembers(active);
      setPendingMembers(pending);
      setBannedMembers(banned);
    } catch (e) {
      console.error("Failed to load members", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (member: CommunityMember, newRole: CommunityRole) => {
    if (!member.id) return;
    await api.updateMemberRole(member.id, newRole);
    setMembers((prev) => prev.map((m) => m.id === member.id ? { ...m, role: newRole } : m));
    toast.success("Cargo atualizado com sucesso.");
  };

  const handleApprove = async (member: CommunityMember) => {
    if (!member.id) return;
    await api.approveMember(communityId, member.id);
    setPendingMembers((prev) => prev.filter((m) => m.id !== member.id));
    setMembers((prev) => [...prev, { ...member, status: "active" }]);
    toast.success(`${member.userName} foi aprovado.`);
  };

  const handleReject = async (member: CommunityMember) => {
    if (!member.id) return;
    await api.rejectMember(member.id);
    setPendingMembers((prev) => prev.filter((m) => m.id !== member.id));
    toast.success(`Solicitação de ${member.userName} recusada.`);
  };

  const handleConfirmBan = async (reason: string, _details: string, _deletePosts: boolean) => {
    if (!memberToBan?.id) return;
    await api.banMember(communityId, memberToBan.id, reason);
    setMembers((prev) => prev.filter((m) => m.id !== memberToBan.id));
    setBannedMembers((prev) => [...prev, { ...memberToBan, status: "banned", banReason: reason }]);
    toast.success(`${memberToBan.userName} foi removido da comunidade.`);
    setMemberToBan(null);
  };

  const handleUnban = async (member: CommunityMember) => {
    if (!member.id) return;
    if (!confirm("Deseja realmente desbanir este membro?")) return;
    await api.unbanMember(member.id);
    setBannedMembers((prev) => prev.filter((m) => m.id !== member.id));
    setMembers((prev) => [...prev, { ...member, status: "active", banReason: undefined }]);
    toast.success(`${member.userName} foi desbanido e retornou como membro comum.`);
  };

  const currentList = activeTab === "active" ? members : activeTab === "pending" ? pendingMembers : bannedMembers;
  const filtered = currentList.filter((m) =>
    (m.userName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TABS: { id: MemberTab; label: string; count?: number }[] = [
    { id: "active", label: "Ativos", count: members.length },
    { id: "pending", label: "Pendentes", count: pendingMembers.length },
    { id: "banned", label: "Banidos" },
  ];

  if (isLoading) return (
    <div className="flex justify-center py-8">
      <div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red">Gestão de Membros</h3>

      <div className="flex bg-white/5 rounded-lg p-1 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1",
              activeTab === tab.id ? "bg-brand-red text-black" : "text-white/40 hover:text-white"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={cn("text-[9px] px-1 rounded-full font-black", activeTab === tab.id ? "bg-black/20" : "bg-white/10")}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
        <input
          type="text"
          placeholder="Pesquisar membro..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-colors"
        />
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar">
        {filtered.length === 0 && (
          <p className="text-center text-xs text-white/40 py-4">Nenhum membro encontrado.</p>
        )}

        {activeTab === "active" && filtered.map((member) => {
          const isMe = member.userEmail === currentUserEmail;
          const isMemberCreator = member.role === "creator";
          const badge = ROLE_BADGE[member.role];
          return (
            <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <img src={member.userAvatar} alt={member.userName} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                <div>
                  <p className="font-bold text-sm">{member.userName}{isMe ? " (Você)" : ""}</p>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest", badge.className)}>
                    {badge.label}
                  </span>
                </div>
              </div>
              {canManage && !isMe && !isMemberCreator && (
                <div className="flex items-center gap-2">
                  {isCreator && (
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member, e.target.value as CommunityRole)}
                      className="bg-white/5 border border-white/10 rounded-lg text-xs font-bold px-2 py-1.5 focus:outline-none focus:border-gray-400 transition-colors"
                    >
                      <option value="moderator" className="bg-dark-bg">Moderador</option>
                      <option value="member" className="bg-dark-bg">Membro</option>
                    </select>
                  )}
                  <button
                    onClick={() => setMemberToBan(member)}
                    className="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {activeTab === "pending" && filtered.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <img src={member.userAvatar} alt={member.userName} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div>
                <p className="font-bold text-sm">{member.userName}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Aguardando aprovação</p>
              </div>
            </div>
            {canManage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(member)}
                  className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                  title="Aprovar"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => handleReject(member)}
                  className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Rejeitar"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        ))}

        {activeTab === "banned" && filtered.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <img src={member.userAvatar} alt={member.userName} className="w-10 h-10 rounded-full object-cover opacity-50 grayscale" referrerPolicy="no-referrer" />
              <div>
                <p className="font-bold text-sm text-white/60 line-through">{member.userName}</p>
                <p className="text-[10px] text-red-500 uppercase tracking-widest font-bold">{member.banReason}</p>
              </div>
            </div>
            {canManage && (
              <button
                onClick={() => handleUnban(member)}
                className="px-3 py-1.5 bg-white/10 text-white hover:bg-white/20 rounded-lg text-xs font-bold transition-colors"
              >
                Desbanir
              </button>
            )}
          </div>
        ))}
      </div>

      <BanMemberModal
        member={memberToBan ? { id: memberToBan.id!, name: memberToBan.userName!, avatar: memberToBan.userAvatar! } : null}
        onClose={() => setMemberToBan(null)}
        onConfirm={handleConfirmBan}
      />
    </div>
  );
};
