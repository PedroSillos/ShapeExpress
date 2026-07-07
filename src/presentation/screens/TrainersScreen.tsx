import React, { useState } from 'react';
import {
  Search, UserPlus, X, RefreshCw,
  ChevronLeft, Trophy, ShieldCheck, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { UserProfile } from '@/src/domain/entities';
import { TrainerCard } from '../components/TrainerCard';
import iconZap from '@/src/assets/icons/icon-zap.svg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrainerConnection {
  trainerEmail: string;
  status: 'pending' | 'accepted' | 'rejected' | 'disconnected';
}

export interface TrainersScreenProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trainers: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessage: (t: any) => void;
  onConnect: (code: string) => Promise<void>;
  onDisconnect: (trainerEmail: string) => Promise<void>;
  studentConnections: TrainerConnection[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TrainersScreen({
  trainers,
  onMessage: _onMessage,
  onConnect,
  onDisconnect: _onDisconnect,
  studentConnections,
}: TrainersScreenProps) {
  const [showConnectPopup, setShowConnectPopup] = useState(false);
  const [connectCode, setConnectCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const connectedTrainers = trainers.filter((t) =>
    studentConnections.some((c) => c.trainerEmail === t.email && c.status === 'accepted'),
  );

  const filteredTrainers = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.specialties?.join(' ') ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ─── Tab switcher shared between both screens ──────────────────────────────

  return (
    <div className="pb-24">
      <div className="space-y-6">
        {/* ── Hero Header ─────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden -mx-6 mb-6"
          style={{ background: 'linear-gradient(135deg, #C0392B 0%, #E74C3C 60%, #E05C2A 100%)' }}
        >
          <div className="px-6 pt-10 pb-8 flex items-end justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-white leading-tight">Treinadores</h1>
              <p className="text-white/70 text-sm font-semibold">Conecte-se com especialistas</p>
              {connectedTrainers.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <ShieldCheck size={14} className="text-white/80" />
                  <span className="text-white/80 text-xs font-bold">
                    {connectedTrainers.length}{' '}
                    {connectedTrainers.length === 1 ? 'treinador conectado' : 'treinadores conectados'}
                  </span>
                </div>
              )}
            </div>
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
              <img src={iconZap} alt="" className="w-12 h-12 brightness-0 invert" />
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* ── Connect CTA ───────────────────────────────────────── */}
        <button
          onClick={() => setShowConnectPopup(true)}
          className="w-full py-3 bg-white/5 border border-white/10 text-white/60 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <UserPlus size={16} />
          Tem um código de treinador?
        </button>

        {/* ── Search ────────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar treinadores..."
            className="w-full bg-dark-card border border-dark-border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-gray-400 transition-all shadow-2xl"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Connected trainers ────────────────────────────────── */}
        {connectedTrainers.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
              Meus Treinadores
            </p>
            <div className="space-y-3">
              {connectedTrainers.map((trainer) => (
                <TrainerCard
                  key={trainer.email}
                  trainer={trainer}
                  studentConnections={studentConnections}
                  onConnect={onConnect}
                  onViewProfile={(t) => setSelectedTrainer(t as UserProfile)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── All trainers ──────────────────────────────────────── */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
            Treinadores Disponíveis
          </p>
          {filteredTrainers.length > 0 ? (
            <div className="space-y-3">
              {filteredTrainers.map((trainer) => (
                <TrainerCard
                  key={trainer.email}
                  trainer={trainer}
                  studentConnections={studentConnections}
                  onConnect={onConnect}
                  onViewProfile={(t) => setSelectedTrainer(t as UserProfile)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Search size={24} className="text-white/15" />
              </div>
              <p className="text-sm text-white/30">
                {searchTerm
                  ? `Nenhum treinador encontrado para "${searchTerm}"`
                  : 'Nenhum treinador disponível'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Disconnect Confirm Modal ───────────────────────────── */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xs bg-dark-card border border-dark-border rounded-3xl p-6 space-y-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertTriangle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Desconectar Treinador?</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Você perderá o acesso aos treinos personalizados enviados por este profissional.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDisconnectConfirm(null)}
                  className="py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60 active:scale-95 transition-transform"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    if (showDisconnectConfirm) {
                      await _onDisconnect(showDisconnectConfirm);
                      setShowDisconnectConfirm(null);
                    }
                  }}
                  className="py-3 bg-red-500 rounded-xl text-xs font-bold text-white active:scale-95 transition-transform"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Connect Popup ─────────────────────────────────────── */}
      <AnimatePresence>
        {showConnectPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConnectPopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-dark-surface border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center mx-auto text-brand-red">
                    <UserPlus size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Conectar por Código</h3>
                  <p className="text-sm text-white/40">
                    Insira o código fornecido pelo seu treinador para solicitar conexão.
                  </p>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={connectCode}
                    onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
                    placeholder="EX: TREINADOR123"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:border-gray-400 transition-all"
                  />
                  <button
                    disabled={!connectCode || isConnecting}
                    onClick={async () => {
                      setIsConnecting(true);
                      try {
                        await onConnect(connectCode);
                        setShowConnectPopup(false);
                        setConnectCode('');
                      } catch {
                        toast.error('Código inválido ou erro na conexão.');
                      } finally {
                        setIsConnecting(false);
                      }
                    }}
                    className="w-full py-4 bg-brand-red text-black rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isConnecting ? 'Conectando...' : 'Solicitar Conexão'}
                  </button>
                  <button
                    onClick={() => setShowConnectPopup(false)}
                    className="w-full py-4 text-white/40 font-bold uppercase tracking-widest text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Trainer Profile Modal ─────────────────────────────── */}
      <AnimatePresence>
        {selectedTrainer && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrainer(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-dark-surface border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="relative h-48 w-full">
                <img
                  src={selectedTrainer.avatarUrl}
                  alt={selectedTrainer.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/20 to-transparent" />
                <button
                  onClick={() => setSelectedTrainer(null)}
                  className="absolute top-6 left-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-colors z-20"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>
              <div className="p-8 -mt-12 relative z-10 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-bold">{selectedTrainer.name}</h3>
                    <p className="text-brand-red font-bold uppercase tracking-widest text-xs">
                      {selectedTrainer.specialties?.[0] ?? 'Treinador Elite'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <Trophy size={14} className="text-brand-red" />
                    <span className="font-bold">5.0</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Sobre</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {selectedTrainer.bio ??
                      `Especialista em ${selectedTrainer.specialties?.[0] ?? 'treinamento de alta performance'}.`}
                  </p>
                </div>
                <div className="pt-4">
                  {(() => {
                    const conn = studentConnections.find(
                      (c) => c.trainerEmail === selectedTrainer.email,
                    );
                    if (conn?.status === 'accepted') {
                      return (
                        <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <ShieldCheck size={18} />
                          Conectado
                        </div>
                      );
                    }
                    if (conn?.status === 'pending') {
                      return (
                        <div className="w-full py-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <RefreshCw size={18} />
                          Solicitado
                        </div>
                      );
                    }
                    return (
                      <button
                        onClick={async () => {
                          try {
                            await onConnect(
                              selectedTrainer.personalCode ?? selectedTrainer.email,
                            );
                            setSelectedTrainer(null);
                          } catch {
                            toast.error('Erro ao solicitar conexão.');
                          }
                        }}
                        className="w-full py-4 bg-brand-red text-black rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={18} />
                        Conectar Treinador
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
