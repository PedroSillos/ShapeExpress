import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Smartphone, 
  GraduationCap, 
  Dumbbell, 
  ChevronLeft, 
  Building2, 
  Flame, 
  Zap, 
  Heart, 
  Trophy, 
  Camera, 
  Instagram, 
  CheckCircle2, 
  Link as LinkIcon, 
  QrCode, 
  Check, 
  Calendar as CalendarIcon, 
  Ruler, 
  Scale, 
  Home,
  Briefcase,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/Card';
import { InputGroup } from '../../components/InputGroup';
import { UserProfile } from '../../../domain/entities';
import { cn } from '../../../utils/cn';
import { isValidEmail, isValidPhone, isValidDate } from '../../../utils/validation';
import { ImageUpload } from '../../components/ImageUpload';

interface RegisterViewProps {
  onRegister: (p: UserProfile) => void;
  onBack: () => void;
  api: any;
}

export function RegisterView({ onRegister, onBack, api }: RegisterViewProps) {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'treinador' | 'atleta' | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    phone: '',
    avatarUrl: `https://picsum.photos/seed/${Math.random()}/400`,
    specialties: [],
    experienceLevel: 'Iniciante',
    trainingFrequency: 3,
    objective: 'Ganhar massa muscular',
    trainingLocation: 'Academia',
    experienceYears: '0–1 ano',
    serviceType: 'Ambos',
    studentsCount: '1–10',
    worksInGym: false,
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasUpperCase && hasLowerCase;

  useEffect(() => {
    if (fieldErrors.password === 'A senha não atende aos requisitos') {
      setShowPasswordRules(true);
    }
  }, [fieldErrors.password]);

  const nextStep = async () => {
    if (step === 1) {
      const errors: Record<string, string> = {};
      let firstErrorFieldId: string | null = null;

      const addError = (field: string, message: string) => {
        errors[field] = message;
        if (!firstErrorFieldId) firstErrorFieldId = field;
      };

      if (!formData.name) {
        addError('name', 'Nome é obrigatório');
      } else if (formData.name.trim().length < 4) {
        addError('name', 'Nome inválido');
      }
      if (!formData.email) {
        addError('email', 'Email é obrigatório');
      } else if (!isValidEmail(formData.email)) {
        addError('email', 'E-mail inválido');
      }
      
      if (!password) {
        addError('password', 'Senha é obrigatória');
      } else if (!isPasswordValid) {
        addError('password', 'A senha não atende aos requisitos');
      }
      
      if (!confirmPassword) {
        addError('confirmPassword', 'Confirmação de senha é obrigatória');
      } else if (password !== confirmPassword) {
        addError('confirmPassword', 'As senhas não coincidem');
      }

      if (!formData.phone) {
        addError('phone', 'Telefone é obrigatório');
      } else if (!isValidPhone(formData.phone || '')) {
        addError('phone', 'Telefone inválido');
      }

      if (!userType) {
        addError('userType', 'Selecione se você é Treinador ou Atleta');
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Por favor, preencha os campos.');
        
        setTimeout(() => {
          if (firstErrorFieldId) {
            const element = document.getElementById(`field-${firstErrorFieldId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }, 100);
        return;
      }

      // Check if email already exists
      setIsLoading(true);
      try {
        const exists = await api.checkEmailExists(formData.email);
        if (exists) {
          setFieldErrors({ email: 'Email já cadastrado' });
          setError('Email já cadastrado');
          setTimeout(() => {
            document.getElementById('field-email')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error("Error checking email:", e);
      }
      setIsLoading(false);
    }
    if (step === 2 && userType === 'treinador') {
      if (!formData.cref) {
        setFieldErrors({ cref: 'CREF é obrigatório' });
        setError('Por favor, insira seu CREF.');
        setTimeout(() => {
          document.getElementById('field-cref')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
    }
    if (step === 2 && userType === 'atleta') {
      if (formData.hasPersonal === undefined) {
        setFieldErrors({ hasPersonal: 'Selecione uma opção' });
        setError('Por favor, selecione uma opção.');
        setTimeout(() => {
          document.getElementById('field-hasPersonal')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
      if (formData.hasPersonal && !formData.personalCodeConnected) {
        setFieldErrors({ personalCodeConnected: 'Código é obrigatório' });
        setError('Por favor, insira o código do personal.');
        setTimeout(() => {
          document.getElementById('field-personalCodeConnected')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
    }

    if (step === 3 && userType === 'treinador') {
      if (formData.worksInGym && !formData.gymName) {
        setFieldErrors({ gymName: 'Nome da academia é obrigatório' });
        setError('Por favor, insira o nome da academia.');
        setTimeout(() => {
          document.getElementById('field-gymName')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
    }

    if (step === 6 && userType === 'atleta') {
      if (!formData.birthDate || !isValidDate(formData.birthDate)) {
        setFieldErrors({ birthDate: 'Data de nascimento inválida' });
        setError('Por favor, insira uma data de nascimento válida (DD/MM/AAAA).');
        setTimeout(() => {
          document.getElementById('field-birthDate')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
        return;
      }
    }

    setFieldErrors({});
    setError('');
    setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step === 1) {
      onBack();
    } else {
      setStep(s => s - 1);
    }
  };

  const handleFinalize = async () => {
    try {
      await onRegister({
        ...formData,
        userType: userType as 'treinador' | 'atleta',
        password // Pass password to register
      } as any);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
      setStep(1); // Go back to first step to show error
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Identificação básica</h2>
              <p className="text-sm text-white/40">Crie sua conta rapidamente para começar.</p>
            </div>

            <Card className="space-y-4 p-6">
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-xs text-center font-bold">{error}</div>}
              
              <InputGroup id="field-name" error={fieldErrors.name} label="Nome completo" value={formData.name || ''} onChange={(v) => { setFormData({...formData, name: v}); if (fieldErrors.name) setFieldErrors(prev => ({...prev, name: ''})); if (error) setError(''); }} icon={<User size={18} />} />
              <InputGroup id="field-email" error={fieldErrors.email} label="Email" value={formData.email || ''} onChange={(v) => { setFormData({...formData, email: v}); if (fieldErrors.email) setFieldErrors(prev => ({...prev, email: ''})); if (error) setError(''); }} icon={<Mail size={18} />} type="email" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5" id="field-password">
                  <label className={cn("text-[10px] font-bold uppercase tracking-widest px-2", fieldErrors.password ? "text-red-500" : "text-white/40")}>Senha</label>
                  <div className="relative">
                    <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2", fieldErrors.password ? "text-red-500/50" : "text-white/20")} size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors(prev => ({ ...prev, password: '' }));
                        }
                        if (error) setError('');
                      }}
                      placeholder="••••••••"
                      className={cn(
                        "w-full bg-dark-surface border rounded-xl py-3 pl-10 pr-10 text-xs font-medium focus:outline-none transition-colors",
                        fieldErrors.password ? "border-red-500 focus:border-gray-400" : "border-dark-border focus:border-gray-400"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-xs text-red-500 px-2 mt-1">{fieldErrors.password}</p>}
                </div>
                <div className="space-y-1.5" id="field-confirmPassword">
                  <label className={cn("text-[10px] font-bold uppercase tracking-widest px-2", fieldErrors.confirmPassword ? "text-red-500" : "text-white/40")}>Confirmar</label>
                  <div className="relative">
                    <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2", fieldErrors.confirmPassword ? "text-red-500/50" : "text-white/20")} size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }
                        if (error) setError('');
                      }}
                      placeholder="••••••••"
                      className={cn(
                        "w-full bg-dark-surface border rounded-xl py-3 pl-10 pr-10 text-xs font-medium focus:outline-none transition-colors",
                        fieldErrors.confirmPassword ? "border-red-500 focus:border-gray-400" : "border-dark-border focus:border-gray-400"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p className="text-xs text-red-500 px-2 mt-1">{fieldErrors.confirmPassword}</p>}
                </div>
              </div>

              {showPasswordRules && (
                <div className="px-2 text-[10px] space-y-1 -mt-2">
                  <p className={hasMinLength ? "text-emerald-500" : "text-red-500"}>
                    {hasMinLength ? <Check size={10} className="inline mr-1" /> : <X size={10} className="inline mr-1" />}
                    Mínimo de 8 caracteres
                  </p>
                  <p className={hasUpperCase ? "text-emerald-500" : "text-red-500"}>
                    {hasUpperCase ? <Check size={10} className="inline mr-1" /> : <X size={10} className="inline mr-1" />}
                    1 letra maiúscula
                  </p>
                  <p className={hasLowerCase ? "text-emerald-500" : "text-red-500"}>
                    {hasLowerCase ? <Check size={10} className="inline mr-1" /> : <X size={10} className="inline mr-1" />}
                    1 letra minúscula
                  </p>
                  <p className={hasNumber ? "text-emerald-500" : "text-red-500"}>
                    {hasNumber ? <Check size={10} className="inline mr-1" /> : <X size={10} className="inline mr-1" />}
                    1 número
                  </p>
                </div>
              )}

              <InputGroup id="field-phone" error={fieldErrors.phone} label="Telefone / WhatsApp" value={formData.phone || ''} onChange={(v) => { const onlyNums = v.replace(/\D/g, ''); setFormData({...formData, phone: onlyNums}); if (fieldErrors.phone) setFieldErrors(prev => ({...prev, phone: ''})); if (error) setError(''); }} icon={<Smartphone size={18} />} placeholder="(00) 00000-0000" type="tel" />

              <div className="pt-2">
                <button 
                  onClick={async () => {
                    try {
                      await api.loginWithGoogle();
                    } catch (e) {
                      // error handled in hook
                    }
                  }}
                  className="w-full py-3 bg-white text-black rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                  Entrar com Google
                </button>
              </div>

              <div className="space-y-2 pt-2" id="field-userType">
                <label className={cn("text-[10px] font-bold uppercase tracking-widest px-2 block text-center", fieldErrors.userType ? "text-red-500" : "text-white/40")}>Eu sou:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      setUserType('treinador');
                      if (fieldErrors.userType) setFieldErrors(prev => ({...prev, userType: ''}));
                      if (error) setError('');
                    }}
                    className={cn(
                      "py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                      userType === 'treinador' ? "border-brand-red bg-brand-red/10" : "border-dark-border bg-white/5",
                      fieldErrors.userType && !userType ? "border-red-500" : ""
                    )}
                  >
                    <GraduationCap size={24} className={userType === 'treinador' ? "text-brand-red" : "text-white/40"} />
                    <span className={cn("text-xs font-bold", userType === 'treinador' ? "text-white" : "text-white/40")}>Treinador</span>
                  </button>
                  <button 
                    onClick={() => {
                      setUserType('atleta');
                      if (fieldErrors.userType) setFieldErrors(prev => ({...prev, userType: ''}));
                      if (error) setError('');
                    }}
                    className={cn(
                      "py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                      userType === 'atleta' ? "border-brand-red bg-brand-red/10" : "border-dark-border bg-white/5",
                      fieldErrors.userType && !userType ? "border-red-500" : ""
                    )}
                  >
                    <Dumbbell size={24} className={userType === 'atleta' ? "text-brand-red" : "text-white/40"} />
                    <span className={cn("text-xs font-bold", userType === 'atleta' ? "text-white" : "text-white/40")}>Atleta</span>
                  </button>
                </div>
                {fieldErrors.userType && <p className="text-xs text-red-500 text-center mt-1">{fieldErrors.userType}</p>}
              </div>

              <button 
                onClick={nextStep} 
                disabled={isLoading}
                className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  'Avançar'
                )}
              </button>

              <p className="text-center text-xs text-white/40">
                Já tem conta? <button onClick={onBack} className="text-brand-red font-bold">Entrar</button>
              </p>
            </Card>
          </motion.div>
        );

      case 2:
        if (userType === 'treinador') return (
          <motion.div 
            key="step2-trainer"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">Informações profissionais</h2>
            </div>
            <Card className="space-y-6 p-6">
              <InputGroup id="field-cref" error={fieldErrors.cref} label="CREF (Registro Profissional)" value={formData.cref || ''} onChange={(v) => { setFormData({...formData, cref: v}); if (fieldErrors.cref) setFieldErrors(prev => ({...prev, cref: ''})); if (error) setError(''); }} icon={<Briefcase size={18} />} />
              
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Tempo de experiência</label>
                <div className="grid grid-cols-2 gap-2">
                  {['0–1 ano', '1–3 anos', '3–5 anos', '5+ anos'].map(exp => (
                    <button 
                      key={exp}
                      onClick={() => setFormData({...formData, experienceYears: exp})}
                      className={cn("py-2.5 rounded-xl text-[10px] font-bold border transition-all", formData.experienceYears === exp ? "border-brand-red bg-brand-red/10 text-brand-red" : "border-dark-border bg-white/5 text-white/40")}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Especialidades</label>
                <div className="flex flex-wrap gap-2">
                  {['Hipertrofia', 'Emagrecimento', 'Reabilitação', 'Treino funcional', 'Treino feminino', 'Treino para atletas', 'Treino em casa'].map(spec => (
                    <button 
                      key={spec}
                      onClick={() => {
                        const specs = formData.specialties || [];
                        if (specs.includes(spec)) {
                          setFormData({...formData, specialties: specs.filter(s => s !== spec)});
                        } else {
                          setFormData({...formData, specialties: [...specs, spec]});
                        }
                      }}
                      className={cn(
                        "px-3 py-2 rounded-full text-[10px] font-bold border transition-all",
                        formData.specialties?.includes(spec) ? "border-brand-red bg-brand-red/10 text-brand-red" : "border-dark-border bg-white/5 text-white/40"
                      )}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Tipo de atendimento</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Presencial', 'Online', 'Ambos'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setFormData({...formData, serviceType: type as any})}
                      className={cn("py-2.5 rounded-xl text-[10px] font-bold border transition-all", formData.serviceType === type ? "border-brand-red bg-brand-red/10 text-brand-red" : "border-dark-border bg-white/5 text-white/40")}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={nextStep} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
                Avançar
              </button>
            </Card>
          </motion.div>
        );
        return (
          <motion.div 
            key="step2-athlete"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">Conectar com o personal</h2>
            </div>
            <Card className="space-y-6 p-6">
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-xs text-center font-bold">{error}</div>}
              <div className="space-y-4" id="field-hasPersonal">
                <p className={cn("text-sm text-center", fieldErrors.hasPersonal ? "text-red-500 font-bold" : "text-white/60")}>Você treina com um personal?</p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setFormData({...formData, hasPersonal: true})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                      formData.hasPersonal ? "border-emerald-500 bg-emerald-500/10" : "border-dark-border bg-white/5",
                      fieldErrors.hasPersonal ? "border-red-500" : ""
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", formData.hasPersonal ? "border-emerald-500" : "border-white/20")}>
                      {formData.hasPersonal && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sim, tenho um personal</p>
                      <p className="text-[10px] text-white/40">Conecte-se para receber treinos exclusivos.</p>
                    </div>
                  </button>

                  {formData.hasPersonal && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 pl-8">
                      <InputGroup id="field-personalCodeConnected" error={fieldErrors.personalCodeConnected} label="Código do personal" value={formData.personalCodeConnected || ''} onChange={(v) => { setFormData({...formData, personalCodeConnected: v}); if (fieldErrors.personalCodeConnected) setFieldErrors(prev => ({...prev, personalCodeConnected: ''})); if (error) setError(''); }} icon={<Lock size={18} />} placeholder="Ex: ABC123" />
                      <button className="w-full py-3 bg-white/5 border border-dark-border rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                        <QrCode size={18} />
                        Escanear QR Code
                      </button>
                    </motion.div>
                  )}

                  <button 
                    onClick={() => setFormData({...formData, hasPersonal: false})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                      formData.hasPersonal === false ? "border-white/40 bg-white/5" : "border-dark-border bg-white/5",
                      fieldErrors.hasPersonal ? "border-red-500" : ""
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", formData.hasPersonal === false ? "border-white/40" : "border-white/20")}>
                      {formData.hasPersonal === false && <div className="w-2 h-2 rounded-full bg-white/40" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">Não, treino sozinho</p>
                      <p className="text-[10px] text-white/40">O app irá sugerir treinos para você.</p>
                    </div>
                  </button>
                </div>
              </div>
              <button onClick={nextStep} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
                Avançar
              </button>
            </Card>
          </motion.div>
        );

      case 3:
        if (userType === 'treinador') return (
          <motion.div 
            key="step3-trainer"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">Estrutura de trabalho</h2>
            </div>
            <Card className="space-y-6 p-6">
              <div className="space-y-3">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Você trabalha em academia?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setFormData({...formData, worksInGym: true})}
                    className={cn("py-3 rounded-xl border transition-all font-bold text-xs", formData.worksInGym ? "border-brand-red bg-brand-red/10 text-brand-red" : "border-dark-border bg-white/5 text-white/40")}
                  >
                    Sim
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, worksInGym: false})}
                    className={cn("py-3 rounded-xl border transition-all font-bold text-xs", formData.worksInGym === false ? "border-brand-red bg-brand-red/10 text-brand-red" : "border-dark-border bg-white/5 text-white/40")}
                  >
                    Não
                  </button>
                </div>
              </div>

              {formData.worksInGym && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <InputGroup id="field-gymName" error={fieldErrors.gymName} label="Nome da academia" value={formData.gymName || ''} onChange={(v) => { setFormData({...formData, gymName: v}); if (fieldErrors.gymName) setFieldErrors(prev => ({...prev, gymName: ''})); if (error) setError(''); }} icon={<Building2 size={18} />} />
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Quantos alunos você atende hoje?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['1–10', '10–30', '30–60', '60+'].map(count => (
                    <button 
                      key={count}
                      onClick={() => setFormData({...formData, studentsCount: count})}
                      className={cn("py-2.5 rounded-xl text-[10px] font-bold border transition-all", formData.studentsCount === count ? "border-brand-red bg-brand-red/10 text-brand-red" : "border-dark-border bg-white/5 text-white/40")}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={nextStep} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
                Avançar
              </button>
            </Card>
          </motion.div>
        );
        return (
          <motion.div 
            key="step3-athlete"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">Objetivo de treino</h2>
            </div>
            <Card className="space-y-4 p-6">
              <p className="text-sm text-white/60 text-center mb-2">Qual é seu objetivo principal?</p>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'Ganhar massa muscular', label: 'Ganhar massa muscular', icon: <Dumbbell className="text-brand-red" /> },
                  { id: 'Emagrecer', label: 'Emagrecer', icon: <Flame className="text-orange-500" /> },
                  { id: 'Melhorar condicionamento', label: 'Melhorar condicionamento', icon: <Zap className="text-yellow-400" /> },
                  { id: 'Saúde e mobilidade', label: 'Saúde e mobilidade', icon: <Heart className="text-emerald-400" /> },
                  { id: 'Força', label: 'Força', icon: <Trophy className="text-blue-400" /> },
                ].map(obj => (
                  <button 
                    key={obj.id}
                    onClick={() => setFormData({...formData, objective: obj.id})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                      formData.objective === obj.id ? "border-brand-red bg-brand-red/10" : "border-dark-border bg-white/5"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      {obj.icon}
                    </div>
                    <span className={cn("text-sm font-bold", formData.objective === obj.id ? "text-white" : "text-white/60")}>{obj.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={nextStep} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
                Avançar
              </button>
            </Card>
          </motion.div>
        );

      case 4:
        if (userType === 'treinador') return (
          <motion.div 
            key="step4-trainer"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">Perfil profissional</h2>
            </div>
            <Card className="space-y-6 p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-brand-red p-1 overflow-hidden">
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <ImageUpload 
                      onUploadComplete={(url) => setFormData({...formData, avatarUrl: url})}
                      uploadImage={api.uploadImage}
                      variant="button"
                      className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-black border-2 border-dark-card cursor-pointer"
                      label={<Camera size={16} />}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Foto de perfil</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Mini bio</label>
                <textarea 
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Ex: Personal trainer focado em hipertrofia e emagrecimento"
                  className="w-full bg-dark-surface border border-dark-border rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:border-gray-400 transition-colors h-24 resize-none"
                />
              </div>

              <InputGroup label="Instagram (opcional)" value={formData.instagram || ''} onChange={(v) => setFormData({...formData, instagram: v})} icon={<Instagram size={18} />} placeholder="@seuusuario" />
              
              <button 
                onClick={handleFinalize} 
                disabled={isLoading}
                className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />}
                Criar Conta
              </button>
            </Card>
          </motion.div>
        );
        return (
          <motion.div 
            key="step4-athlete"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">Experiência de treino</h2>
            </div>
            <Card className="space-y-6 p-6">
              <p className="text-sm text-white/60 text-center">Qual seu nível de experiência?</p>
              <div className="space-y-3">
                {[
                  { id: 'Iniciante', label: 'Iniciante', desc: 'começando agora', color: 'bg-emerald-500' },
                  { id: 'Intermediário', label: 'Intermediário', desc: '1–2 anos treinando', color: 'bg-yellow-500' },
                  { id: 'Avançado', label: 'Avançado', desc: '3+ anos', color: 'bg-red-500' },
                ].map(level => (
                  <button 
                    key={level.id}
                    onClick={() => setFormData({...formData, experienceLevel: level.id as any})}
                    className={cn(
                      "w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left",
                      formData.experienceLevel === level.id ? "border-brand-red bg-brand-red/10" : "border-dark-border bg-white/5"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full", level.color)} />
                    <div>
                      <p className="text-sm font-bold">{level.label}</p>
                      <p className="text-[10px] text-white/40">({level.desc})</p>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={nextStep} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
                Avançar
              </button>
            </Card>
          </motion.div>
        );

      case 5:
        if (userType === 'treinador') return (
          <motion.div 
            key="step5-trainer-success"
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="min-h-[70vh] flex flex-col justify-center space-y-8 py-12"
          >
            <Card className="p-8 text-center space-y-8">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-emerald-500" size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Conta criada com sucesso!</h2>
                <p className="text-sm text-white/40">Convide seus primeiros alunos para começar a gerenciar seus treinos.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button className="w-full py-4 bg-white/5 border border-dark-border rounded-2xl flex items-center justify-center gap-3 font-bold text-sm active:scale-95 transition-transform">
                  <LinkIcon size={18} className="text-brand-red" />
                  Enviar link
                </button>
                <button className="w-full py-4 bg-white/5 border border-dark-border rounded-2xl flex items-center justify-center gap-3 font-bold text-sm active:scale-95 transition-transform">
                  <Smartphone size={18} className="text-emerald-500" />
                  Compartilhar no WhatsApp
                </button>
                <button className="w-full py-4 bg-white/5 border border-dark-border rounded-2xl flex items-center justify-center gap-3 font-bold text-sm active:scale-95 transition-transform">
                  <QrCode size={18} className="text-blue-400" />
                  QR Code
                </button>
              </div>

              <button onClick={handleFinalize} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform">
                Ir para o Dashboard
              </button>
            </Card>
          </motion.div>
        );
        return (
          <motion.div 
            key="step5-athlete"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">Frequência de treino</h2>
            </div>
            <Card className="space-y-6 p-6">
              <p className="text-sm text-white/60 text-center">Quantas vezes por semana você pretende treinar?</p>
              <div className="grid grid-cols-2 gap-3">
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(days => (
                  <button 
                    key={days}
                    onClick={() => setFormData({...formData, trainingFrequency: days})}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all",
                      formData.trainingFrequency === days ? "border-brand-red bg-brand-red/10" : "border-dark-border bg-white/5"
                    )}
                  >
                    <span className={cn("text-sm font-bold", formData.trainingFrequency === days ? "text-white" : "text-white/60")}>{days} vezes por semana</span>
                    {formData.trainingFrequency === days && <Check size={18} className="text-brand-red" />}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-white/40 text-center">Isso ajuda o app a sugerir a melhor divisão de treino (ABC, ABCD, etc).</p>
              <button onClick={nextStep} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
                Avançar
              </button>
            </Card>
          </motion.div>
        );

      case 6:
        return (
          <motion.div 
            key="step6-athlete"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">Dados físicos (opcional)</h2>
            </div>
            <Card className="space-y-6 p-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-brand-red p-1 overflow-hidden">
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <ImageUpload 
                      onUploadComplete={(url) => setFormData({...formData, avatarUrl: url})}
                      uploadImage={api.uploadImage}
                      variant="button"
                      className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-black border-2 border-dark-card cursor-pointer"
                      label={<Camera size={16} />}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Foto de perfil</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Altura (cm)" value={formData.height?.toString() || ''} onChange={(v) => setFormData({...formData, height: Number(v)})} icon={<Ruler size={18} />} type="number" />
                <InputGroup label="Peso (kg)" value={formData.initialWeight?.toString() || ''} onChange={(v) => setFormData({...formData, initialWeight: Number(v)})} icon={<Scale size={18} />} type="number" />
              </div>
              <InputGroup 
                id="field-birthDate" 
                error={fieldErrors.birthDate} 
                label="Data de nascimento" 
                value={formData.birthDate || ''} 
                onChange={(v) => { 
                  setFormData({...formData, birthDate: v}); 
                  if (fieldErrors.birthDate) setFieldErrors(prev => ({...prev, birthDate: ''})); 
                  if (error) setError(''); 
                }} 
                onBlur={() => {
                  if (formData.birthDate && !isValidDate(formData.birthDate)) {
                    setFieldErrors(prev => ({...prev, birthDate: 'Data de nascimento inválida'}));
                    setFormData(prev => ({...prev, birthDate: ''}));
                  }
                }}
                icon={<CalendarIcon size={18} />} 
                type="date" 
              />
              
              <p className="text-[10px] text-white/40 text-center">Isso ajuda a estimar calorias e progresso.</p>
              
              <button onClick={nextStep} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
                Avançar
              </button>
            </Card>
          </motion.div>
        );

      case 7:
        return (
          <motion.div 
            key="step7-athlete"
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }} 
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <button onClick={prevStep} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">Tipo de Treino</h2>
            </div>
            <Card className="space-y-6 p-6">
              <p className="text-sm text-white/60 text-center">Onde você treina?</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, trainingLocation: 'Casa'})}
                  className={cn(
                    "py-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                    formData.trainingLocation === 'Casa' ? "border-brand-red bg-brand-red/10" : "border-dark-border bg-white/5"
                  )}
                >
                  <Home size={32} className={formData.trainingLocation === 'Casa' ? "text-brand-red" : "text-white/20"} />
                  <span className={cn("text-xs font-bold", formData.trainingLocation === 'Casa' ? "text-white" : "text-white/40")}>Em casa</span>
                </button>
                <button 
                  onClick={() => setFormData({...formData, trainingLocation: 'Academia'})}
                  className={cn(
                    "py-8 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
                    formData.trainingLocation === 'Academia' ? "border-brand-red bg-brand-red/10" : "border-dark-border bg-white/5"
                  )}
                >
                  <Building2 size={32} className={formData.trainingLocation === 'Academia' ? "text-brand-red" : "text-white/20"} />
                  <span className={cn("text-xs font-bold", formData.trainingLocation === 'Academia' ? "text-white" : "text-white/40")}>Academia</span>
                </button>
              </div>
              <button onClick={nextStep} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform mt-4">
                Avançar
              </button>
            </Card>
          </motion.div>
        );

      case 8:
        return (
          <motion.div 
            key="step8-athlete-success"
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="min-h-[70vh] flex flex-col justify-center space-y-8 py-12"
          >
            <Card className="p-8 text-center space-y-8">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto"
              >
                <Trophy className="text-brand-red" size={40} />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">🎉 Tudo pronto!</h2>
                <p className="text-sm text-white/40">Seu treino está esperando.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button onClick={handleFinalize} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform">
                  Ver meu treino
                </button>
                <button onClick={handleFinalize} className="w-full py-4 bg-white/5 border border-dark-border rounded-2xl text-white font-bold active:scale-95 transition-transform">
                  Explorar Loja
                </button>
              </div>
            </Card>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
