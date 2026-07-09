import { useState } from 'react';
import { ChevronLeft, Download, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/src/firebase';
import type { UserProfile } from '@/src/domain/entities';
import { fullName } from '@/src/domain/entities';

interface EditProfileViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (p: UserProfile) => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onBack: () => void;
}

/** Sport-color derived from first char of name — same heuristic as ProfileUserView. */
const AVATAR_COLOR = '#dc2626';

/**
 * Profile edit screen.
 * Fields: Name · Username (firstName) · Password (reset via email) · Email (read-only).
 * Actions: Export my data · Delete account.
 */
export function EditProfileView({
  userProfile,
  onUpdateProfile,
  onDeleteAccount,
  onBack,
}: EditProfileViewProps) {
  const [firstName, setFirstName] = useState(userProfile.firstName ?? '');
  const [lastName, setLastName] = useState(userProfile.lastName ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const displayName = fullName({ firstName, lastName }).trim() || userProfile.email.split('@')[0];
  const avatarLetter = displayName.charAt(0).toUpperCase();

  // ── Save name ─────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!firstName.trim()) {
      toast.error('O nome não pode ficar em branco.');
      return;
    }
    setIsSaving(true);
    try {
      await onUpdateProfile({ ...userProfile, firstName: firstName.trim(), lastName: lastName.trim() || undefined });
    } finally {
      setIsSaving(false);
    }
  }

  // ── Password reset ─────────────────────────────────────────────────────────
  async function handlePasswordReset() {
    if (!userProfile.email) return;
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, userProfile.email);
      toast.success('Email de redefinição de senha enviado!');
    } catch {
      toast.error('Não foi possível enviar o email de redefinição.');
    } finally {
      setIsSendingReset(false);
    }
  }

  // ── Export data ────────────────────────────────────────────────────────────
  function handleExport() {
    const data = JSON.stringify(userProfile, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shape-express-perfil-${userProfile.email}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados!');
  }

  // ── Delete account ─────────────────────────────────────────────────────────
  async function handleDeleteAccount() {
    setIsDeletingAccount(true);
    try {
      await onDeleteAccount();
    } catch {
      toast.error('Não foi possível excluir a conta. Tente novamente.');
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      className="h-full bg-dark-surface flex flex-col"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-dark-border">
        <button
          aria-label="Voltar"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft size={22} className="text-sky-400" />
        </button>
        <h1 className="text-white/60 text-base font-semibold tracking-wide">Perfil</h1>
        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="text-sky-400 font-bold text-sm hover:opacity-70 transition-opacity disabled:opacity-40"
        >
          {isSaving ? 'Salvando…' : 'Salvar'}
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">

        {/* ── Avatar ── */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white"
            style={{ backgroundColor: AVATAR_COLOR, boxShadow: `0 0 0 3px ${AVATAR_COLOR}55` }}
          >
            {avatarLetter}
          </div>
          <button className="text-sky-400 font-bold text-xs tracking-widest uppercase hover:opacity-70 transition-opacity">
            Alterar avatar
          </button>
        </div>

        {/* ── Name ── */}
        <div>
          <label htmlFor="firstName" className="block text-white font-bold text-[15px] mb-2">
            Nome
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Seu nome"
            className="w-full bg-dark-card border border-dark-border rounded-2xl px-4 py-4 text-white text-[15px] placeholder:text-white/30 focus:outline-none focus:border-sky-400/60 transition-colors"
          />
        </div>

        {/* ── Username (lastName used as display username) ── */}
        <div>
          <label htmlFor="lastName" className="block text-white font-bold text-[15px] mb-2">
            Username
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Seu sobrenome / username"
            className="w-full bg-dark-card border border-dark-border rounded-2xl px-4 py-4 text-white text-[15px] placeholder:text-white/30 focus:outline-none focus:border-sky-400/60 transition-colors"
          />
        </div>

        {/* ── Password ── */}
        <div>
          <label className="block text-white font-bold text-[15px] mb-2">Senha</label>
          <button
            onClick={handlePasswordReset}
            disabled={isSendingReset}
            className="w-full bg-dark-card border border-dark-border rounded-2xl px-4 py-4 text-left flex items-center justify-between hover:bg-white/5 active:bg-white/10 transition-colors disabled:opacity-50"
          >
            <span className="text-white/40 text-[15px] tracking-widest select-none">
              ••••••••
            </span>
            <span className="text-sky-400 text-xs font-bold uppercase tracking-wider">
              {isSendingReset ? 'Enviando…' : 'Redefinir'}
            </span>
          </button>
        </div>

        {/* ── Email (read-only) ── */}
        <div>
          <label htmlFor="email" className="block text-white font-bold text-[15px] mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={userProfile.email}
            readOnly
            className="w-full bg-dark-card border border-dark-border rounded-2xl px-4 py-4 text-white/50 text-[15px] cursor-not-allowed select-none focus:outline-none"
          />
        </div>

        {/* ── Export my data ── */}
        <button
          onClick={handleExport}
          className="w-full bg-dark-card border border-dark-border rounded-2xl px-4 py-4 flex items-center justify-center gap-2 hover:bg-white/5 active:bg-white/10 transition-colors"
        >
          <Download size={16} className="text-sky-400" />
          <span className="text-sky-400 font-bold text-sm tracking-widest uppercase">
            Exportar meus dados
          </span>
        </button>

        {/* ── Delete account ── */}
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-dark-card border border-dark-border rounded-2xl px-4 py-4 flex items-center justify-center gap-2 hover:bg-white/5 active:bg-white/10 transition-colors mb-8"
          >
            <Trash2 size={16} className="text-red-400" />
            <span className="text-red-400 font-bold text-sm tracking-widest uppercase">
              Excluir conta
            </span>
          </button>
        ) : (
          <div className="bg-dark-card border border-red-500/30 rounded-2xl p-4 flex flex-col gap-3 mb-8">
            <p className="text-white font-semibold text-sm text-center">
              Tem certeza? Esta ação é{' '}
              <span className="text-red-400 font-bold">irreversível</span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 border border-dark-border rounded-xl text-white/60 font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 py-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {isDeletingAccount ? 'Excluindo…' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
