import { AnimatePresence, motion } from 'motion/react';
import { UserProfile } from '../../../domain/entities';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { RegisterStep1 } from './RegisterStep1';
import { TrainerStep2 } from './TrainerStep2';
import { TrainerStep3 } from './TrainerStep3';
import { TrainerStep4 } from './TrainerStep4';
import { TrainerSuccess } from './TrainerSuccess';
import { AthleteStep2 } from './AthleteStep2';
import { AthleteStep3 } from './AthleteStep3';
import { AthleteStep4 } from './AthleteStep4';
import { AthleteStep5 } from './AthleteStep5';
import { AthleteStep6 } from './AthleteStep6';
import { AthleteStep7 } from './AthleteStep7';
import { AthleteSuccess } from './AthleteSuccess';

interface RegisterViewProps {
  onRegister: (p: UserProfile) => void;
  onBack: () => void;
  api: any;
}

export function RegisterView({ onRegister, onBack, api }: RegisterViewProps) {
  const form = useRegisterForm(onRegister, onBack, api);

  const sharedStepProps = {
    formData: form.formData,
    setFormData: form.setFormData,
    fieldErrors: form.fieldErrors,
    clearFieldError: form.clearFieldError,
    onNext: form.nextStep,
    onBack: form.prevStep,
  };

  const renderStep = () => {
    const { step, userType } = form;

    if (step === 1) return (
      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <RegisterStep1
          {...sharedStepProps}
          password={form.password}
          setPassword={form.setPassword}
          confirmPassword={form.confirmPassword}
          setConfirmPassword={form.setConfirmPassword}
          showPassword={form.showPassword}
          setShowPassword={form.setShowPassword}
          userType={form.userType}
          setUserType={form.setUserType}
          error={form.error}
          showPasswordRules={form.showPasswordRules}
          hasMinLength={form.hasMinLength}
          hasNumber={form.hasNumber}
          hasUpperCase={form.hasUpperCase}
          hasLowerCase={form.hasLowerCase}
          isLoading={form.isLoading}
          api={api}
        />
      </motion.div>
    );

    if (step === 2 && userType === 'treinador') return (
      <motion.div key="step2-trainer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <TrainerStep2 {...sharedStepProps} />
      </motion.div>
    );

    if (step === 2 && userType === 'atleta') return (
      <motion.div key="step2-athlete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <AthleteStep2 {...sharedStepProps} error={form.error} />
      </motion.div>
    );

    if (step === 3 && userType === 'treinador') return (
      <motion.div key="step3-trainer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <TrainerStep3 {...sharedStepProps} />
      </motion.div>
    );

    if (step === 3 && userType === 'atleta') return (
      <motion.div key="step3-athlete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <AthleteStep3 formData={form.formData} setFormData={form.setFormData} onNext={form.nextStep} onBack={form.prevStep} />
      </motion.div>
    );

    if (step === 4 && userType === 'treinador') return (
      <motion.div key="step4-trainer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <TrainerStep4 formData={form.formData} setFormData={form.setFormData} isLoading={form.isLoading} onFinalize={form.handleFinalize} onBack={form.prevStep} api={api} />
      </motion.div>
    );

    if (step === 4 && userType === 'atleta') return (
      <motion.div key="step4-athlete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <AthleteStep4 formData={form.formData} setFormData={form.setFormData} onNext={form.nextStep} onBack={form.prevStep} />
      </motion.div>
    );

    if (step === 5 && userType === 'treinador') return (
      <TrainerSuccess key="trainer-success" onFinalize={form.handleFinalize} />
    );

    if (step === 5 && userType === 'atleta') return (
      <motion.div key="step5-athlete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <AthleteStep5 formData={form.formData} setFormData={form.setFormData} onNext={form.nextStep} onBack={form.prevStep} />
      </motion.div>
    );

    if (step === 6) return (
      <motion.div key="step6-athlete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <AthleteStep6
          formData={form.formData}
          setFormData={form.setFormData}
          fieldErrors={form.fieldErrors}
          setFieldErrors={form.setFieldErrors as any}
          clearFieldError={form.clearFieldError}
          onNext={form.nextStep}
          onBack={form.prevStep}
          api={api}
        />
      </motion.div>
    );

    if (step === 7) return (
      <motion.div key="step7-athlete" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <AthleteStep7 formData={form.formData} setFormData={form.setFormData} onNext={form.nextStep} onBack={form.prevStep} />
      </motion.div>
    );

    if (step === 8) return (
      <AthleteSuccess key="athlete-success" onFinalize={form.handleFinalize} />
    );

    return null;
  };

  return (
    <div className="min-h-screen py-8">
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </div>
  );
}
