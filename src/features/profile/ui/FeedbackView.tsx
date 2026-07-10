import { useState } from 'react';
import { ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/utils/cn';
import type { UserProfile } from '@/src/domain/entities';

interface FeedbackViewProps {
  onBack: () => void;
  userProfile: UserProfile;
}

type FeedbackTopic = {
  id: string;
  label: string;
  description: string;
  color: string;
  emoji: string;
};

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

const FEEDBACK_TOPICS: FeedbackTopic[] = [
  {
    id: 'bug',
    label: 'Encontrei um erro',
    description: 'Algo não está funcionando como esperado',
    color: '#f87171', // red-400
    emoji: '🐛',
  },
  {
    id: 'suggestion',
    label: 'Tenho uma sugestão',
    description: 'Ideia para melhorar o app',
    color: '#34d399', // emerald-400
    emoji: '💡',
  },
  {
    id: 'content',
    label: 'Problema com conteúdo',
    description: 'Exercício, treino ou dado incorreto',
    color: '#fb923c', // orange-400
    emoji: '📋',
  },
  {
    id: 'account',
    label: 'Problema na conta',
    description: 'Login, assinatura ou dados pessoais',
    color: '#a78bfa', // violet-400
    emoji: '👤',
  },
  {
    id: 'performance',
    label: 'App está lento',
    description: 'Travamentos, lentidão ou falhas',
    color: '#facc15', // yellow-400
    emoji: '⚡',
  },
  {
    id: 'other',
    label: 'Outro assunto',
    description: 'Qualquer outro tipo de feedback',
    color: '#38bdf8', // sky-400
    emoji: '💬',
  },
];

const MAX_CHARS = 500;

/**
 * Feedback screen — Duolingo-inspired.
 * Step 1: choose a topic.
 * Step 2: fill in description + pre-filled email → submit.
 */
export function FeedbackView({ onBack, userProfile }: FeedbackViewProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTopic, setSelectedTopic] = useState<FeedbackTopic | null>(null);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(userProfile.email ?? '');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  const charsLeft = MAX_CHARS - description.length;
  const canSubmit =
    description.trim().length >= 10 &&
    email.trim().length > 3 &&
    submitState !== 'loading';

  function handleTopicSelect(topic: FeedbackTopic) {
    setSelectedTopic(topic);
    setStep(2);
  }

  async function handleSubmit() {
    if (!canSubmit || !selectedTopic) return;

    setSubmitState('loading');

    // Send via mailto as a reliable, no-backend-required fallback.
    // In the future this can be wired to a POST /api/feedback endpoint.
    try {
      const subject = encodeURIComponent(`[Shape Express] Feedback: ${selectedTopic.label}`);
      const body = encodeURIComponent(
        `Categoria: ${selectedTopic.label}\nE-mail: ${email}\n\n${description}`,
      );
      window.open(`mailto:suporte@shapeexpress.com.br?subject=${subject}&body=${body}`, '_blank');
      setSubmitState('success');
    } catch {
      setSubmitState('error');
    }
  }

  function handleBackOrReset() {
    if (step === 2) {
      setStep(1);
      setSelectedTopic(null);
    } else {
      onBack();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      className="h-screen bg-dark-surface flex flex-col"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-dark-border">
        <button
          aria-label="Voltar"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
          onClick={handleBackOrReset}
        >
          <ChevronLeft size={22} className="text-sky-400" />
        </button>
        <h1 className="text-white/60 text-base font-semibold tracking-wide">Feedback</h1>
        <div className="w-10" />
      </div>

      {/* ── Steps indicator ── */}
      <div className="flex items-center gap-2 px-5 pt-4">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-300',
              s <= step ? 'bg-sky-400' : 'bg-white/10',
            )}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Topic selection ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div>
                <p className="text-white font-bold text-xl">O que você quer nos dizer?</p>
                <p className="text-white/50 text-sm mt-1">
                  Escolha o assunto que melhor descreve seu feedback.
                </p>
              </div>

              <div className="space-y-2.5">
                {FEEDBACK_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicSelect(topic)}
                    className="w-full flex items-center gap-4 px-4 py-4 bg-dark-card border border-dark-border rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors text-left"
                  >
                    {/* Emoji icon with colored bg */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: topic.color + '22' }}
                    >
                      {topic.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-[15px] leading-snug">
                        {topic.label}
                      </p>
                      <p className="text-white/40 text-xs mt-0.5 leading-snug">
                        {topic.description}
                      </p>
                    </div>

                    <ChevronLeft
                      size={18}
                      className="text-white/25 flex-shrink-0 rotate-180"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Description form ── */}
          {step === 2 && selectedTopic && submitState !== 'success' && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              className="space-y-5"
            >
              {/* Selected topic badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: selectedTopic.color + '22',
                  color: selectedTopic.color,
                }}
              >
                <span>{selectedTopic.emoji}</span>
                <span>{selectedTopic.label}</span>
              </div>

              <div>
                <p className="text-white font-bold text-xl">Descreva o problema</p>
                <p className="text-white/50 text-sm mt-1">
                  Quanto mais detalhes, mais rápido conseguimos ajudar.
                </p>
              </div>

              {/* Description textarea */}
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Descreva com detalhes o que aconteceu ou a sua ideia..."
                  rows={6}
                  className={cn(
                    'w-full bg-dark-card border rounded-2xl px-4 py-3.5',
                    'text-white text-sm placeholder:text-white/30',
                    'focus:outline-none transition-colors resize-none',
                    description.trim().length < 10 && description.length > 0
                      ? 'border-red-400/50 focus:border-red-400'
                      : 'border-dark-border focus:border-sky-400/50',
                  )}
                />
                <span
                  className={cn(
                    'absolute bottom-3 right-3 text-xs',
                    charsLeft < 50 ? 'text-orange-400' : 'text-white/25',
                  )}
                >
                  {charsLeft}
                </span>
              </div>

              {description.trim().length > 0 && description.trim().length < 10 && (
                <p className="text-red-400 text-xs -mt-3 px-1">
                  Por favor, escreva pelo menos 10 caracteres.
                </p>
              )}

              {/* Email field */}
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 block">
                  E-mail para resposta
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-dark-card border border-dark-border rounded-2xl px-4 py-3.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-sky-400/50 transition-colors"
                />
              </div>

              {/* Error state */}
              {submitState === 'error' && (
                <div className="flex items-center gap-3 px-4 py-3.5 bg-red-400/10 border border-red-400/30 rounded-2xl">
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">
                    Algo deu errado. Tente novamente ou nos envie um e-mail diretamente.
                  </p>
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  'w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all',
                  canSubmit
                    ? 'bg-sky-400 text-white hover:bg-sky-300 active:bg-sky-500'
                    : 'bg-white/10 text-white/30 cursor-not-allowed',
                )}
              >
                {submitState === 'loading' ? 'Enviando…' : 'Enviar feedback'}
              </button>

              <p className="text-white/30 text-xs text-center leading-snug pb-8">
                Seu feedback é enviado para a equipe do Shape Express.{' '}
                Respondemos em até 2 dias úteis.
              </p>
            </motion.div>
          )}

          {/* ── Success state ── */}
          {submitState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center justify-center gap-5 py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-400/15 flex items-center justify-center">
                <CheckCircle size={44} className="text-emerald-400" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-bold text-2xl">Obrigado!</p>
                <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                  Seu feedback foi registrado. Nossa equipe vai analisá-lo em breve.
                </p>
              </div>
              <button
                onClick={onBack}
                className="mt-4 px-8 py-3.5 rounded-2xl bg-sky-400 text-white font-bold text-sm tracking-wide hover:bg-sky-300 active:bg-sky-500 transition-colors"
              >
                Voltar às configurações
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
