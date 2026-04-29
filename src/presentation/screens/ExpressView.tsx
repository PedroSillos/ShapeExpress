import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, UserPlus, X, RefreshCw, ChevronRight, 
  Sparkles, ChevronLeft, Trophy, ShieldCheck, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { UserProfile } from '../../domain/entities';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { MOCK_PROTOCOLS } from '../../constants';
import { TrainerCard } from '../components/TrainerCard';
import { ProtocolCard } from '../components/ProtocolCard';

export function ExpressView({ 
  userProfile, 
  trainers, 
  onMessage, 
  onConnect, 
  onDisconnect, 
  studentConnections, 
  onViewPurchased,
}: { 
  userProfile: UserProfile, 
  trainers: any[], 
  onMessage: (t: any) => void, 
  onConnect: (code: string) => Promise<void>, 
  onDisconnect: (trainerEmail: string) => Promise<void>, 
  studentConnections: any[], 
  onViewPurchased: () => void,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [showConnectPopup, setShowConnectPopup] = useState(false);
  const [connectCode, setConnectCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'treinadores' | 'loja'>('treinadores');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrainerForProfile, setSelectedTrainerForProfile] = useState<any>(null);
  
  const filters = ['Todos', 'Protocolos', 'Online', 'Presencial', 'Hipertrofia', 'Emagrecimento'];

  const connectedTrainers = trainers.filter(t => 
    studentConnections.some(c => c.trainerEmail === t.email && c.status === 'accepted')
  );

  const nearbyTrainers = trainers
    .filter(t => !connectedTrainers.some(ct => ct.email === t.email))
    .map(t => ({
      ...t,
      distance: t.distance || `${(Math.random() * 5 + 1).toFixed(1)}km`,
      isPresencial: t.serviceType === 'Presencial' || t.serviceType === 'Ambos' || true
    })).sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  const filteredTrainers = trainers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (t.specialty && t.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter logic
    let matchesFilter = true;
    if (selectedFilter !== 'Todos') {
      if (selectedFilter === 'Protocolos') {
        matchesFilter = false;
      } else if (selectedFilter === 'Online') {
        matchesFilter = t.serviceType === 'Online' || t.serviceType === 'Ambos';
      } else if (selectedFilter === 'Presencial') {
        matchesFilter = t.serviceType === 'Presencial' || t.serviceType === 'Ambos';
      } else {
        // Specialty or tag match
        matchesFilter = (t.specialty && t.specialty.toLowerCase().includes(selectedFilter.toLowerCase())) ||
                        (t.tags && t.tags.includes(selectedFilter));
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  // Mock purchased protocols
  const purchasedProtocols = MOCK_PROTOCOLS.slice(0, 1);
  const availableProtocols = MOCK_PROTOCOLS.filter(p => !purchasedProtocols.some(pp => pp.id === p.id));

  const filteredProtocols = MOCK_PROTOCOLS.filter(p => {
    const isPurchased = purchasedProtocols.some(pp => pp.id === p.id);
    if (isPurchased) return false;

    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter !== 'Todos') {
      if (selectedFilter === 'Protocolos') {
        matchesFilter = true;
      } else if (selectedFilter === 'Online') {
        matchesFilter = p.tags.includes('Online');
      } else if (selectedFilter === 'Presencial') {
        matchesFilter = p.tags.includes('Presencial');
      } else {
        matchesFilter = p.tags.includes(selectedFilter);
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  const showTrainers = selectedFilter === 'Todos' || selectedFilter === 'Treinadores' || filteredTrainers.length > 0;
  const showProtocols = selectedFilter === 'Todos' || selectedFilter === 'Protocolos' || filteredProtocols.length > 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Search */}
      <div className="space-y-4 sticky top-0 bg-dark-surface/80 backdrop-blur-xl pt-4 pb-2 z-30">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-display font-bold">Express</h2>
            <button 
              onClick={() => setShowConnectPopup(true)}
              className="p-1.5 bg-white/5 rounded-lg text-white/40 hover:text-brand-red transition-colors border border-white/10"
              title="Conectar por código"
            >
              <UserPlus size={16} />
            </button>
          </div>
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveSubTab('treinadores')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                activeSubTab === 'treinadores' 
                  ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              Treinadores
            </button>
            <button
              onClick={() => setActiveSubTab('loja')}
              className={cn(
                "px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                activeSubTab === 'loja' 
                  ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" 
                  : "text-white/40 hover:text-white/60"
              )}
            >
              Loja
            </button>
          </div>
        </div>

        {!searchTerm && activeSubTab === 'treinadores' && (
          <div className="space-y-6">
            {/* Pending Requests */}
            {studentConnections.some(c => c.status === 'pending') && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">Solicitação Pendente</h3>
                {studentConnections.filter(c => c.status === 'pending').map(pending => (
                  <div key={pending.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-4 items-center">
                    <img src={pending.trainerAvatar} alt={pending.trainerName} className="w-12 h-12 rounded-xl object-cover grayscale opacity-50" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{pending.trainerName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <RefreshCw size={10} className="text-amber-500 animate-spin-slow" />
                        <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest">Aguardando aprovação</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDisconnect(pending.trainerEmail)}
                      className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-brand-red transition-colors"
                      title="Cancelar solicitação"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* My Connected Trainers */}
            {connectedTrainers.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Meus Treinadores</h3>
                </div>
                <div className="grid gap-3">
                  {connectedTrainers.map(trainer => (
                    <div 
                      key={trainer.email}
                      className="p-4 rounded-2xl bg-brand-red/5 border border-brand-red/20 flex gap-4 items-center cursor-pointer hover:bg-brand-red/10 transition-all"
                      onClick={() => setSelectedTrainerForProfile(trainer)}
                    >
                      <img src={trainer.avatarUrl} alt={trainer.name} className="w-16 h-16 rounded-xl object-cover border border-brand-red/30" />
                      <div className="flex-1">
                        <h4 className="font-bold">{trainer.name}</h4>
                        <p className="text-xs text-white/40">{trainer.specialty}</p>
                        <div className="flex gap-2 mt-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onMessage({ ...trainer, id: trainer.email });
                            }}
                            className="px-3 py-1 bg-brand-red text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                          >
                            Chat
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDisconnectConfirm(trainer.email);
                            }}
                            className="px-3 py-1 bg-white/5 text-white/40 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:text-brand-red transition-colors"
                          >
                            Desconectar
                          </button>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeSubTab === 'treinadores' ? "Buscar treinadores..." : "Buscar protocolos..."}
              className="w-full bg-dark-card border border-dark-border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-gray-400 transition-all shadow-2xl"
            />
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3 rounded-2xl border transition-all flex items-center justify-center gap-2",
              showFilters || selectedFilter !== 'Todos'
                ? "bg-brand-red/10 border-brand-red/30 text-brand-red" 
                : "bg-dark-card border-dark-border text-white/40"
            )}
          >
            <SlidersHorizontal size={20} />
            {selectedFilter !== 'Todos' && !showFilters && (
              <span className="w-2 h-2 bg-brand-red rounded-full"></span>
            )}
          </button>

          <div className="flex items-center gap-1">
          </div>

        </div>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
                {filters.filter(f => {
                  if (activeSubTab === 'treinadores') return f !== 'Protocolos';
                  return true;
                }).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={cn(
                      "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                      selectedFilter === filter 
                        ? "bg-brand-red border-brand-red text-black shadow-lg shadow-brand-red/20" 
                        : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showFilters && selectedFilter !== 'Todos' && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setSelectedFilter('Todos')}
              className="px-3 py-1 bg-brand-red/10 border border-brand-red/20 rounded-full text-[10px] font-bold text-brand-red flex items-center gap-1"
            >
              {selectedFilter} <X size={10} />
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-8">
        {/* Search Results Grouped */}
        {searchTerm && (
          <div className="space-y-6">
            {activeSubTab === 'treinadores' && filteredTrainers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">Treinadores</h3>
                <div className="grid gap-3">
                  {filteredTrainers.map(trainer => (
                    <TrainerCard 
                      key={trainer.email} 
                      trainer={trainer} 
                      onConnect={onConnect} 
                      studentConnections={studentConnections} 
                      onViewProfile={setSelectedTrainerForProfile}
                    />
                  ))}
                </div>
              </div>
            )}
            {activeSubTab === 'loja' && filteredProtocols.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">Protocolos</h3>
                <div className="grid gap-3">
                  {filteredProtocols.map(protocol => (
                    <ProtocolCard key={protocol.id} protocol={protocol} />
                  ))}
                </div>
              </div>
            )}
            {((activeSubTab === 'treinadores' && filteredTrainers.length === 0) || (activeSubTab === 'loja' && filteredProtocols.length === 0)) && (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                  <Search size={32} />
                </div>
                <p className="text-sm text-white/40">Nenhum resultado para "{searchTerm}"</p>
              </div>
            )}
          </div>
        )}

        {/* Default View Sections */}
        {!searchTerm && activeSubTab === 'treinadores' && (
          <>
            {/* Nearby Trainers (Suggestions) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-brand-red" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Sugestões de Treinadores</h3>
                </div>
                <button className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Ver todos</button>
              </div>
              <div className="grid gap-3">
                {nearbyTrainers.slice(0, 5).map(trainer => (
                  <TrainerCard 
                    key={trainer.email} 
                    trainer={trainer} 
                    showDistance 
                    onConnect={onConnect} 
                    studentConnections={studentConnections} 
                    onViewProfile={setSelectedTrainerForProfile}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {!searchTerm && activeSubTab === 'loja' && (
          <>
            {/* My Protocols */}
            {purchasedProtocols.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Meus Protocolos</h3>
                  <button className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Ver todos</button>
                </div>
                <div className="grid gap-3">
                  {purchasedProtocols.map(protocol => (
                    <ProtocolCard key={protocol.id} protocol={protocol} purchased />
                  ))}
                </div>
              </div>
            )}

            {/* Featured Section */}
            {availableProtocols.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Destaques</h3>
                  <button className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Ver tudo</button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {availableProtocols.slice(0, 2).map(protocol => (
                    <div key={protocol.id} className="min-w-[280px]">
                      <ProtocolCard protocol={protocol} featured />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paid Protocols */}
            {availableProtocols.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Programas de Treino</h3>
                  <button className="text-[10px] font-bold text-brand-red uppercase tracking-widest">Ver todos</button>
                </div>
                <div className="grid gap-4">
                  {availableProtocols.map(protocol => (
                    <ProtocolCard key={protocol.id} protocol={protocol} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Disconnect Confirmation */}
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
                      await onDisconnect(showDisconnectConfirm);
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

      {/* Connect Popup */}
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
                  <p className="text-sm text-white/40">Insira o código fornecido pelo seu treinador para solicitar conexão.</p>
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
                      } catch (e) {
                        alert('Código inválido ou erro na conexão.');
                      } finally {
                        setIsConnecting(false);
                      }
                    }}
                    className="w-full py-4 bg-brand-red text-black rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
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

      {/* Trainer Profile Modal */}
      <AnimatePresence>
        {selectedTrainerForProfile && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTrainerForProfile(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-dark-surface border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
            >
              {/* Header Image */}
              <div className="relative h-48 w-full">
                <img 
                  src={selectedTrainerForProfile.avatarUrl} 
                  alt={selectedTrainerForProfile.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/20 to-transparent" />
                <button 
                  onClick={() => setSelectedTrainerForProfile(null)}
                  className="absolute top-6 left-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-colors z-20"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 -mt-12 relative z-10 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-display font-bold">{selectedTrainerForProfile.name}</h3>
                    <p className="text-brand-red font-bold uppercase tracking-widest text-xs">{selectedTrainerForProfile.specialty || 'Treinador Elite'}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <Trophy size={14} className="text-brand-red" />
                    <span className="font-bold">{selectedTrainerForProfile.rating || '5.0'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Alunos</p>
                    <p className="text-lg font-bold">{selectedTrainerForProfile.students || '45'}</p>
                  </div>
                  <div className="text-center space-y-1 border-x border-white/5">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Exp.</p>
                    <p className="text-lg font-bold">{selectedTrainerForProfile.experience || '8 anos'}</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Aulas</p>
                    <p className="text-lg font-bold">1.2k</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Sobre</h4>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {selectedTrainerForProfile.bio || `Especialista em ${selectedTrainerForProfile.specialty || 'treinamento de alta performance'}, focado em resultados consistentes e saúde integral. Com mais de 8 anos de experiência transformando vidas através do movimento.`}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Hipertrofia', 'Emagrecimento', 'Performance', 'Saúde'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/60">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  {(() => {
                    const connection = studentConnections.find(c => c.trainerEmail === selectedTrainerForProfile.email);
                    const isPending = connection?.status === 'pending';
                    const isConnected = connection?.status === 'accepted';

                    if (isConnected) {
                      return (
                        <div className="flex-1 py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <ShieldCheck size={18} />
                          Conectado
                        </div>
                      );
                    }

                    if (isPending) {
                      return (
                        <div className="flex-1 py-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <RefreshCw size={18} className="animate-spin-slow" />
                          Solicitado
                        </div>
                      );
                    }

                    return (
                      <button 
                        onClick={async () => {
                          try {
                            await onConnect(selectedTrainerForProfile.personalCode || selectedTrainerForProfile.email);
                            // The profile refresh in onConnect will update the state
                          } catch (e) {
                            alert('Erro ao solicitar conexão.');
                          }
                        }}
                        className="flex-1 py-4 bg-brand-red text-black rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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
