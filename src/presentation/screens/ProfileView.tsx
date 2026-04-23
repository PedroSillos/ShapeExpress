import React from 'react';
import { User, Mail, Smartphone, GraduationCap, Dumbbell, Briefcase, Lock, QrCode, Building2, Instagram, ChevronRight, Camera, LogOut, Settings, Bell, Target, HelpCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { UserProfile, UserTrainingProfile } from '../../domain/entities';

interface ProfileViewProps {
  user: UserProfile;
  trainingProfile: UserTrainingProfile;
  onLogout: () => void;
  onEdit: () => void;
  onSettingsGoal: () => void;
  onSettingsNotifications: () => void;
  onHelp: () => void;
}

export function ProfileView({ user, trainingProfile, onLogout, onEdit, onSettingsGoal, onSettingsNotifications, onHelp }: ProfileViewProps) {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Meu Perfil</h2>
        <button onClick={onLogout} className="p-2 text-white/40 hover:text-brand-red transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      <Card className="p-8 text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-red opacity-20" />
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full bg-brand-red/10 border-2 border-brand-red/20 flex items-center justify-center text-brand-red mx-auto overflow-hidden">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={48} />
            )}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-brand-red text-black rounded-full shadow-lg shadow-brand-red/20 active:scale-95 transition-transform">
            <Camera size={14} />
          </button>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold">{user.name}</h3>
          <p className="text-xs text-white/40">{user.email}</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-[10px] border-brand-red/20 text-brand-red">
            {user.userType === 'treinador' ? 'Treinador' : 'Atleta'}
          </Badge>
          <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">Nível {user.experienceLevel || 'Iniciante'}</Badge>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Configurações</h3>
        <Card className="divide-y divide-dark-border">
          <button onClick={onSettingsGoal} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-red transition-colors">
                <Target size={18} />
              </div>
              <span className="text-sm font-bold">Objetivo Principal</span>
            </div>
            <ChevronRight size={18} className="text-white/20" />
          </button>
          <button onClick={onSettingsNotifications} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-red transition-colors">
                <Bell size={18} />
              </div>
              <span className="text-sm font-bold">Notificações</span>
            </div>
            <ChevronRight size={18} className="text-white/20" />
          </button>
          <button onClick={onHelp} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 group-hover:text-brand-red transition-colors">
                <HelpCircle size={18} />
              </div>
              <span className="text-sm font-bold">Ajuda e Suporte</span>
            </div>
            <ChevronRight size={18} className="text-white/20" />
          </button>
        </Card>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Informações Pessoais</h3>
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Smartphone size={18} className="text-white/20" />
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Telefone</p>
              <p className="text-sm font-medium">{user.phone || 'Não informado'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Mail size={18} className="text-white/20" />
            <div>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">E-mail</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
