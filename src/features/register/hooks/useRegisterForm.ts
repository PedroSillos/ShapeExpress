import { useState, useEffect } from 'react';
import { UserProfile } from '../../../domain/entities';
import { isValidEmail, isValidPhone, isValidDate } from '../../../utils/validation';
import { getRandomSportAvatar, generateAvatarUrl } from '../../../shared/lib/sportAvatars';

export function useRegisterForm(
  onRegister: (p: UserProfile) => void,
  onBack: () => void,
  api: any,
) {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'treinador' | 'atleta' | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    phone: '',
    avatarUrl: generateAvatarUrl(getRandomSportAvatar()),
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

  const scrollToField = (id: string) => {
    setTimeout(() => {
      document.getElementById(`field-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const nextStep = async () => {
    if (step === 1) {
      const errors: Record<string, string> = {};
      let first: string | null = null;
      const add = (f: string, m: string) => { errors[f] = m; if (!first) first = f; };

      if (!formData.name) add('name', 'Nome é obrigatório');
      else if (formData.name.trim().length < 4) add('name', 'Nome inválido');

      if (!formData.email) add('email', 'Email é obrigatório');
      else if (!isValidEmail(formData.email)) add('email', 'E-mail inválido');

      if (!password) add('password', 'Senha é obrigatória');
      else if (!isPasswordValid) add('password', 'A senha não atende aos requisitos');

      if (!confirmPassword) add('confirmPassword', 'Confirmação de senha é obrigatória');
      else if (password !== confirmPassword) add('confirmPassword', 'As senhas não coincidem');

      if (!formData.phone) add('phone', 'Telefone é obrigatório');
      else if (!isValidPhone(formData.phone || '')) add('phone', 'Telefone inválido');

      if (!userType) add('userType', 'Selecione se você é Treinador ou Atleta');

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Por favor, preencha os campos.');
        if (first) scrollToField(first);
        return;
      }

      setIsLoading(true);
      try {
        const exists = await api.checkEmailExists(formData.email);
        if (exists) {
          setFieldErrors({ email: 'Email já cadastrado' });
          setError('Email já cadastrado');
          scrollToField('email');
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error checking email:', e);
      }
      setIsLoading(false);
    }



    if (step === 2 && userType === 'atleta') {
      if (formData.hasPersonal === undefined) {
        setFieldErrors({ hasPersonal: 'Selecione uma opção' });
        setError('Por favor, selecione uma opção.');
        scrollToField('hasPersonal');
        return;
      }
      if (formData.hasPersonal && !formData.personalCodeConnected) {
        setFieldErrors({ personalCodeConnected: 'Código é obrigatório' });
        setError('Por favor, insira o código do personal.');
        scrollToField('personalCodeConnected');
        return;
      }
    }

    if (step === 3 && userType === 'treinador') {
      if (formData.worksInGym && !formData.gymName) {
        setFieldErrors({ gymName: 'Nome da academia é obrigatório' });
        setError('Por favor, insira o nome da academia.');
        scrollToField('gymName');
        return;
      }
    }

    if (step === 6 && userType === 'atleta') {
      if (!formData.birthDate || !isValidDate(formData.birthDate)) {
        setFieldErrors({ birthDate: 'Data de nascimento inválida' });
        setError('Por favor, insira uma data de nascimento válida (DD/MM/AAAA).');
        scrollToField('birthDate');
        return;
      }
    }

    setFieldErrors({});
    setError('');
    setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step === 1) onBack();
    else setStep(s => s - 1);
  };

  const handleFinalize = async () => {
    try {
      await onRegister({
        ...formData,
        userType: userType as 'treinador' | 'atleta',
        password,
      } as any);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
      setStep(1);
    }
  };

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
    setError('');
  };

  return {
    step, userType, setUserType,
    formData, setFormData,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    error, fieldErrors, setFieldErrors,
    showPasswordRules,
    isLoading,
    hasMinLength, hasNumber, hasUpperCase, hasLowerCase, isPasswordValid,
    nextStep, prevStep, handleFinalize, clearFieldError,
  };
}
