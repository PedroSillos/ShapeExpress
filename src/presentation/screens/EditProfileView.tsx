import React, { useState } from 'react';
import { Mail, Smartphone, ShieldCheck, Clock, Instagram, RefreshCw, TrendingUp, Scale, Target, Camera, ChevronLeft, User } from 'lucide-react';
import iconCalendar from '@/src/assets/icons/icon-calendar.svg';
import { Card } from '../components/Card';
import { UserProfile } from '../../domain/entities';
import { isValidEmail, isValidPhone, isValidDate } from '../../utils/validation';
import { ImageUpload } from '../components/ImageUpload';

interface InputGroupProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
}

function InputGroup({ label, value, onChange, onBlur, icon, type = 'text', placeholder }: InputGroupProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'date') {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 8) v = v.slice(0, 8);
      
      let formatted = v;
      if (v.length >= 5) {
        formatted = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
      } else if (v.length >= 3) {
        formatted = `${v.slice(0, 2)}/${v.slice(2)}`;
      }
      
      if (v.length === 8) {
        const day = v.slice(0, 2);
        const month = v.slice(2, 4);
        const year = v.slice(4, 8);
        onChange(`${year}-${month}-${day}`);
      } else {
        onChange(formatted);
      }
    } else {
      onChange(e.target.value);
    }
  };

  let displayValue = value;
  if (type === 'date' && value) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-');
      displayValue = `${d}/${m}/${y}`;
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
          {icon}
        </div>
        <input 
          type={type === 'date' ? 'text' : type}
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={type === 'date' ? 'DD/MM/AAAA' : placeholder}
          maxLength={type === 'date' ? 10 : undefined}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-gray-400 focus:ring-1 focus:ring-brand-red/50 outline-none transition-all"
        />
      </div>
    </div>
  );
}

interface EditProfileViewProps {
  userProfile: UserProfile;
  onSave: (p: UserProfile) => void;
  onCancel: () => void;
  api: any;
}

export function EditProfileView({ userProfile, onSave, onCancel, api }: EditProfileViewProps) {
  const [formData, setFormData] = useState<UserProfile>(userProfile);
  const [error, setError] = useState('');
  const isTrainer = userProfile?.userType === 'treinador';

  const handleSave = () => {
    if (!isValidEmail(formData.email)) {
      setError('Por favor, insira um email válido.');
      return;
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      setError('Por favor, insira um telefone válido.');
      return;
    }
    if (!formData.birthDate || !isValidDate(formData.birthDate)) {
      setError('Por favor, insira uma data de nascimento válida (DD/MM/AAAA).');
      return;
    }
    setError('');
    onSave(formData);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Dados Cadastrais</h2>
      </div>

      <div className="flex flex-col items-center py-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-brand-red p-1">
            <img src={formData.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute bottom-0 right-0">
            <ImageUpload 
              onUploadComplete={(url) => setFormData({...formData, avatarUrl: url})}
              uploadImage={api.uploadImage}
              variant="button"
              className="w-8 h-8 rounded-full red-gradient flex items-center justify-center border-4 border-dark-surface cursor-pointer"
              label={<Camera size={14} color="black" />}
            />
          </div>
        </div>
        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2">Toque para alterar foto</p>
      </div>

      <Card className="space-y-6 p-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm text-center font-bold">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <InputGroup label="Nome" value={formData.name || ''} onChange={(v) => setFormData({...formData, name: v})} icon={<User size={18} />} />
          <InputGroup label="Email" value={formData.email || ''} onChange={(v) => {
            setFormData({...formData, email: v});
            if (error) setError('');
          }} icon={<Mail size={18} />} type="email" />
          <InputGroup label="Telefone" value={formData.phone || ''} onChange={(v) => {
            setFormData({...formData, phone: v});
            if (error) setError('');
          }} icon={<Smartphone size={18} />} placeholder="(00) 00000-0000" />
          
          {formData.userType === 'treinador' ? (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-4 bg-brand-red rounded-full" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-white/60">Sobre o Profissional</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">Biografia / Slogan</label>
                <textarea 
                  value={formData.bio || ''} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Ex: Especialista em transformar vidas através do treinamento de alta performance."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-gray-400 focus:ring-1 focus:ring-brand-red/50 outline-none transition-all min-h-[100px] resize-none"
                />
              </div>

              <InputGroup label="CREF" value={formData.cref || ''} onChange={(v) => setFormData({...formData, cref: v})} icon={<ShieldCheck size={18} />} />
              
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Anos de Experiência" value={formData.experienceYears || ''} onChange={(v) => setFormData({...formData, experienceYears: v})} icon={<Clock size={18} />} />
                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">Atendimento</label>
                  <select 
                    value={formData.serviceType || 'Ambos'} 
                    onChange={(e) => setFormData({...formData, serviceType: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-gray-400 outline-none appearance-none"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Online">Online</option>
                    <option value="Ambos">Híbrido (Ambos)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">Especialidades (separadas por vírgula)</label>
                <input 
                  type="text"
                  value={formData.specialties?.join(', ') || ''} 
                  onChange={(e) => setFormData({...formData, specialties: e.target.value.split(',').map(s => s.trim())})}
                  placeholder="Ex: Hipertrofia, Emagrecimento, Performance"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-gray-400 outline-none"
                />
              </div>

              <InputGroup label="Instagram (usuário)" value={formData.instagram || ''} onChange={(v) => setFormData({...formData, instagram: v})} icon={<Instagram size={18} />} />

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest ml-2">Código de Convite</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={formData.personalCode || ''} 
                    readOnly
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white/40 outline-none font-display font-bold tracking-widest cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Altura (cm)" value={formData.height?.toString() || ''} onChange={(v) => setFormData({...formData, height: Number(v)})} icon={<TrendingUp size={18} />} type="number" />
              <InputGroup label="Peso Inicial (kg)" value={formData.initialWeight?.toString() || ''} onChange={(v) => setFormData({...formData, initialWeight: Number(v)})} icon={<Scale size={18} />} type="number" />
            </div>
          )}

          {!isTrainer && <InputGroup label="Objetivo" value={formData.objective || ''} onChange={(v) => setFormData({...formData, objective: v})} icon={<Target size={18} />} />}
          <InputGroup 
            label="Data de Nascimento" 
            value={formData.birthDate || ''} 
            onChange={(v) => {
              setFormData({...formData, birthDate: v});
              if (error) setError('');
            }} 
            onBlur={() => {
              if (formData.birthDate && !isValidDate(formData.birthDate)) {
                setError('Por favor, insira uma data de nascimento válida (DD/MM/AAAA).');
                setFormData(prev => ({...prev, birthDate: ''}));
              }
            }}
            icon={<img src={iconCalendar} width={18} height={18} className="opacity-20" />} 
            type="date" 
          />
        </div>

        <div className="pt-6">
          <button 
            onClick={handleSave}
            className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
          >
            Salvar Alterações
          </button>
        </div>
      </Card>
    </div>
  );
}

