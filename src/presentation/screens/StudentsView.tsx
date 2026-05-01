import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, UserPlus, X, RefreshCw, ChevronRight, 
  MessageCircle, Trash2, ShieldCheck, AlertTriangle, TrendingUp, 
  TrendingDown, Minus, Trophy, Calendar, Target, Dumbbell, User, Sparkles,
  DollarSign, PieChart, AlertCircle, CalendarPlus, UserMinus, Percent, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { Student, UserProfile, AppNotification, TrainerConnection } from '../../domain/entities';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

export function StudentsView({ students, userProfile, onMessage, pendingRequests, onRespond, onDisconnect, onViewWorkouts, onViewEvolution }: { 
  students: Student[], 
  userProfile: UserProfile, 
  onMessage: (student: Student) => void,
  pendingRequests: AppNotification[],
  onRespond: (id: string, status: 'accepted' | 'rejected') => Promise<void>,
  onDisconnect: (studentEmail: string) => Promise<void>,
  onViewWorkouts: (student: Student) => void,
  onViewEvolution?: (student: Student) => void,
  [key: string]: any
}) {
  console.log('[StudentsView] render — students:', students.length, students.map(s => s.email));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'Evoluindo' | 'Estagnados' | 'Em Risco' | 'Novos'>('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState<Student | null>(null);
  const [isResponding, setIsResponding] = useState<string | null>(null);
  const [showFinancialDashboard, setShowFinancialDashboard] = useState(false);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (selectedFilter !== 'Todos') {
      if (selectedFilter === 'Evoluindo') matchesFilter = student.status === 'evolving';
      if (selectedFilter === 'Estagnados') matchesFilter = student.status === 'stagnated';
      if (selectedFilter === 'Em Risco') matchesFilter = student.status === 'at-risk';
      if (selectedFilter === 'Novos') matchesFilter = student.status === 'new';
    }
    
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: Student['status']) => {
    switch (status) {
      case 'evolving': return <TrendingUp size={14} className="text-emerald-500" />;
      case 'stagnated': return <Minus size={14} className="text-amber-500" />;
      case 'at-risk': return <TrendingDown size={14} className="text-brand-red" />;
      case 'new': return <Sparkles size={14} className="text-blue-500" />;
    }
  };

  const getStatusLabel = (status: Student['status']) => {
    switch (status) {
      case 'evolving': return 'Evoluindo';
      case 'stagnated': return 'Estagnado';
      case 'at-risk': return 'Em Risco';
      case 'new': return 'Novo Aluno';
    }
  };

  const getStatusColor = (status: Student['status']) => {
    switch (status) {
      case 'evolving': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'stagnated': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'at-risk': return 'text-brand-red bg-brand-red/10 border-brand-red/20';
      case 'new': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header & Search */}
      <div className="space-y-4 sticky top-0 bg-dark-surface/80 backdrop-blur-xl pt-4 pb-2 z-30">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-display font-bold">Alunos</h2>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <User size={12} className="text-brand-red" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{students.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-red/10 rounded-xl border border-brand-red/20 text-brand-red">
              <p className="text-[10px] font-bold uppercase tracking-widest">Código: {userProfile.personalCode}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowFinancialDashboard(true)}
          className="w-full p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 flex items-center justify-between hover:bg-emerald-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-sm">Gestão Financeira</h3>
              <p className="text-[10px] uppercase tracking-widest opacity-80">Ver painel de receitas e métricas</p>
            </div>
          </div>
          <ChevronRight size={20} className="opacity-50" />
        </button>

        {/* Pending Requests */}
        <AnimatePresence>
          {pendingRequests.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-2">Solicitações Pendentes</h3>
              {pendingRequests.map(request => (
                <div key={request.id} className="p-4 rounded-2xl bg-brand-red/5 border border-brand-red/20 flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">Novo Aluno</h4>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{((request as unknown) as TrainerConnection).studentEmail || request.data?.studentEmail}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      disabled={isResponding === request.id}
                      onClick={async () => {
                        setIsResponding(request.id);
                        await onRespond(request.id, 'rejected');
                        setIsResponding(null);
                      }}
                      className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-brand-red transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <button 
                      disabled={isResponding === request.id}
                      onClick={async () => {
                        setIsResponding(request.id);
                        await onRespond(request.id, 'accepted');
                        setIsResponding(null);
                      }}
                      className="p-2 bg-brand-red text-black rounded-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      <ShieldCheck size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar alunos..."
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
                {['Todos', 'Evoluindo', 'Estagnados', 'Em Risco', 'Novos'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter as any)}
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
      </div>

      {/* Results */}
      <div className="grid gap-4">
        {filteredStudents.map(student => (
          <Card 
            key={student.id} 
            className="p-4 hover:border-brand-red/30 transition-all group cursor-pointer"
            onClick={() => setSelectedStudentForProfile(student)}
          >
            <div className="flex gap-4">
              <div className="relative">
                <img src={student.avatarUrl} alt={student.name} className="w-16 h-16 rounded-2xl object-cover border border-white/10 group-hover:border-brand-red/50 transition-all" />
                <div className={cn(
                  "absolute -bottom-1 -right-1 p-1 rounded-lg border shadow-lg",
                  getStatusColor(student.status)
                )}>
                  {getStatusIcon(student.status)}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm">{student.name}</h4>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{student.objective || 'Hipertrofia'}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                    <Trophy size={10} className="text-brand-red" />
                    <span className="text-[10px] font-bold">{student.score}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/20 uppercase font-bold">Frequência</span>
                    <div className="flex gap-0.5 mt-0.5">
                      {student.weeklyWorkouts.map((w, i) => (
                        <div key={i} className={cn("w-2 h-2 rounded-full", w ? "bg-brand-red" : "bg-white/5")} />
                      ))}
                    </div>
                  </div>
                  <div className="w-px h-4 bg-white/5" />
                  <div className="flex flex-col">
                    <span className="text-[8px] text-white/20 uppercase font-bold">Último Treino</span>
                    <span className="text-[10px] font-bold">{student.lastWorkout}</span>
                  </div>
                  <ChevronRight size={18} className="ml-auto text-white/20 group-hover:text-brand-red transition-colors" />
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredStudents.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
              <User size={32} />
            </div>
            <div className="space-y-1">
              <p className="font-bold">Nenhum aluno encontrado</p>
              <p className="text-xs text-white/40">Compartilhe seu código para conectar novos alunos.</p>
            </div>
          </div>
        )}
      </div>

      {/* Student Profile Modal */}
      <AnimatePresence>
        {selectedStudentForProfile && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentForProfile(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-dark-surface border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="relative h-40 w-full">
                <img src={selectedStudentForProfile.avatarUrl} alt={selectedStudentForProfile.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/40 to-transparent" />
                <button 
                  onClick={() => setSelectedStudentForProfile(null)}
                  className="absolute top-6 right-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/80 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 -mt-12 relative z-10 space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-display font-bold">{selectedStudentForProfile.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className={cn("px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1", getStatusColor(selectedStudentForProfile.status))}>
                        {getStatusIcon(selectedStudentForProfile.status)}
                        {getStatusLabel(selectedStudentForProfile.status)}
                      </div>
                      <span className="text-xs text-white/40">{selectedStudentForProfile.email}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/5">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Score</p>
                    <p className="text-lg font-bold text-brand-red">{selectedStudentForProfile.score}</p>
                  </div>
                  <div className="text-center space-y-1 border-x border-white/5">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Streak</p>
                    <p className="text-lg font-bold">{selectedStudentForProfile.streak}d</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] text-white/20 uppercase font-bold tracking-widest">Progresso</p>
                    <p className="text-lg font-bold">+{selectedStudentForProfile.progress}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white/40">
                      <Target size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Objetivo</span>
                    </div>
                    <p className="text-sm font-bold">{selectedStudentForProfile.objective || 'Hipertrofia'}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2 text-white/40">
                      <Dumbbell size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Nível</span>
                    </div>
                    <p className="text-sm font-bold">{selectedStudentForProfile.experienceLevel || 'Intermediário'}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Frequência Semanal</h4>
                    <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest">
                      {selectedStudentForProfile.weeklyWorkouts.filter(w => w).length}/7 dias
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className={cn(
                          "w-full aspect-square rounded-xl border flex items-center justify-center transition-all",
                          selectedStudentForProfile.weeklyWorkouts[i] 
                            ? "bg-brand-red border-brand-red text-black shadow-lg shadow-brand-red/20" 
                            : "bg-white/5 border-white/10 text-white/20"
                        )}>
                          {selectedStudentForProfile.weeklyWorkouts[i] && <ShieldCheck size={16} />}
                        </div>
                        <span className="text-[10px] font-bold text-white/20">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      onViewWorkouts(selectedStudentForProfile);
                      setSelectedStudentForProfile(null);
                    }}
                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold uppercase tracking-widest active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <Dumbbell size={18} />
                    Ver Treinos
                  </button>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        onMessage(selectedStudentForProfile);
                        setSelectedStudentForProfile(null);
                      }}
                      className="flex-1 py-4 bg-brand-red text-black rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-brand-red/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      Enviar Mensagem
                    </button>
                    <button 
                      onClick={() => setShowDisconnectConfirm(selectedStudentForProfile)}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-brand-red transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disconnect Confirm Modal */}
      <AnimatePresence>
        {showDisconnectConfirm && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
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
                <h3 className="text-lg font-bold">Remover Aluno?</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Você perderá o acesso ao progresso de <strong>{showDisconnectConfirm.name}</strong> e ele não receberá mais seus treinos.
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
                    await onDisconnect(showDisconnectConfirm.email);
                    setShowDisconnectConfirm(null);
                    setSelectedStudentForProfile(null);
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

      {/* Financial Dashboard Modal */}
      <AnimatePresence>
        {showFinancialDashboard && (
          <FinancialDashboardModal 
            onClose={() => setShowFinancialDashboard(false)} 
            students={students} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FinancialDashboardModal({ onClose, students }: { onClose: () => void, students: Student[] }) {
  // Mock data for the dashboard
  const activeStudents = students.length;
  const monthlyRevenue = activeStudents * 150; // Assuming R$ 150 per student
  const latePayments = Math.floor(activeStudents * 0.1); // 10% late
  const newThisMonth = Math.floor(activeStudents * 0.2); // 20% new
  const cancellations = Math.floor(activeStudents * 0.05); // 5% cancellations
  const retentionRate = 100 - (cancellations / (activeStudents || 1)) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-dark-surface border border-white/10 rounded-3xl shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-dark-surface z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <PieChart size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Gestão Financeira</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Visão Geral do Mês</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <Users size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Alunos Ativos</span>
              </div>
              <p className="text-3xl font-display font-bold">{activeStudents}</p>
            </div>
            
            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-2 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 text-emerald-500">
                <DollarSign size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Receita Mensal</span>
              </div>
              <p className="text-3xl font-display font-bold text-emerald-500">
                R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertCircle size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Atrasados</span>
              </div>
              <p className="text-3xl font-display font-bold text-amber-500">{latePayments}</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <CalendarPlus size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Novos este mês</p>
                  <p className="text-lg font-bold">{newThisMonth}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                  <UserMinus size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Cancelamentos</p>
                  <p className="text-lg font-bold">{cancellations}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Percent size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Taxa de Retenção</p>
                  <p className="text-lg font-bold">{retentionRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Próximos Vencimentos</h3>
            <div className="space-y-3">
              {students.slice(0, 3).map((student, i) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-dark-bg rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{student.name}</p>
                      <p className="text-[10px] text-white/40">Vence em {i + 2} dias</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-500">R$ 150,00</p>
                    <button className="text-[10px] text-white/40 hover:text-white underline mt-1">Lembrar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
