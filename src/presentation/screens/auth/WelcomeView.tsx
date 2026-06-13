import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Trophy, Home, Building2, Bell, BellOff, Ruler, Scale, Users, User, Lock } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { SportAvatarSelector } from '../../../features/register/ui/SportAvatarSelector';

// ─── Typewriter ───────────────────────────────────────────────────────────────

type Segment = { text: string; bold?: boolean };

const INTRO_STEPS: Segment[][] = [
  [{ text: 'Bem-vindo ao ' }, { text: 'Shape Express!', bold: true }],
  [{ text: 'Só ' }, { text: 'algumas perguntas rápidas', bold: true }, { text: ' e depois vamos para o seu primeiro treino!' }],
];

function useTypewriter(segments: Segment[], speed = 30) {
  const fullText = segments.reduce((acc, s) => acc + s.text, '');
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCount(0); setDone(false);
    ref.current = setInterval(() => {
      setCount(c => { if (c >= fullText.length) { clearInterval(ref.current!); setDone(true); return c; } return c + 1; });
    }, speed);
    return () => clearInterval(ref.current!);
  }, [fullText]);

  const skipToEnd = () => { clearInterval(ref.current!); setCount(fullText.length); setDone(true); };
  return { count, done, skipToEnd };
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SPORTS = [
  { id: 'Musculação', icon: '🏋️' },
  { id: 'Halterofilismo', icon: '🏅' },
  { id: 'Corrida', icon: '🏃' },
  { id: 'Ciclismo', icon: '🚴' },
  { id: 'Natação', icon: '🏊' },
  { id: 'Crossfit', icon: '⚡' },
  { id: 'Artes Marciais', icon: '🥋' },
  { id: 'Futebol', icon: '⚽' },
  { id: 'Basquete', icon: '🏀' },
  { id: 'Yoga', icon: '🧘' },
];

const OBJECTIVES = [
  { id: 'Ganhar massa muscular', icon: <Dumbbell className="text-brand-red" /> },
  { id: 'Emagrecer', icon: <Flame className="text-orange-500" /> },
  { id: 'Melhorar condicionamento', icon: <Zap className="text-yellow-400" /> },
  { id: 'Saúde e mobilidade', icon: <Heart className="text-emerald-400" /> },
  { id: 'Aumento de força', icon: <Trophy className="text-blue-400" /> },
];

const SOURCES = [
  { id: 'Instagram', icon: '📸' },
  { id: 'TikTok', icon: '🎵' },
  { id: 'Indicação de amigo', icon: '👥' },
  { id: 'Google', icon: '🔍' },
  { id: 'YouTube', icon: '▶️' },
  { id: 'Outro', icon: '💬' },
];

const EXPERIENCE_LEVELS = [
  { id: 'Nunca pratiquei', desc: 'sem experiência', color: 'bg-white/30' },
  { id: 'Iniciante', desc: '1 mês a 1 ano', color: 'bg-emerald-500' },
  { id: 'Intermediário', desc: '2–3 anos', color: 'bg-yellow-500' },
  { id: 'Avançado', desc: '4+ anos', color: 'bg-red-500' },
];

const WEEKLY_GOALS = [2, 3, 4, 5, 6, 7];

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = {
  sports?: string[];
  objective?: string;
  source?: string;
  experiences?: Record<string, string>; // sport -> level
  weeklyGoal?: number;
  hasPersonal?: boolean;
  personalCode?: string;
  location?: string;
  height?: string;
  weight?: string;
  birthDate?: string;
  avatarUrl?: string;
  notifications?: boolean;
};

// Questions are dynamic — experience has one entry per selected sport
type QuestionId =
  | 'sports' | 'objective' | 'source'
  | `experience:${string}`
  | 'weeklyGoal' | 'hasPersonal' | 'personalCode'
  | 'location' | 'height' | 'weight' | 'birthDate' | 'avatarUrl' | 'notifications';

interface DynQuestion {
  id: QuestionId;
  balloon: (answers: Answers) => React.ReactNode;
  type: 'sports-multi' | 'cards-icon' | 'cards-list' | 'experience' | 'weekly-goal' | 'personal' | 'personal-code' | 'location' | 'number-input' | 'date-input' | 'avatar' | 'notifications';
  sportKey?: string; // for experience questions
}

function buildQuestions(answers: Answers): DynQuestion[] {
  const selected = answers.sports ?? [];
  const experienceQuestions: DynQuestion[] = selected.map(sport => ({
    id: `experience:${sport}` as QuestionId,
    balloon: () => <>Qual a sua experiência com <strong style={{ textTransform: 'lowercase' }}>{sport}</strong>?</>,
    type: 'experience',
    sportKey: sport,
  }));

  return [
    { id: 'sports',        balloon: () => 'O que você gostaria de praticar?',                    type: 'sports-multi' },
    { id: 'objective',     balloon: () => 'Qual o seu objetivo principal?',                       type: 'cards-icon' },
    { id: 'source',        balloon: () => 'Como soube do Shape Express?',                         type: 'cards-list' },
    ...experienceQuestions,
    { id: 'weeklyGoal',    balloon: () => 'Qual vai ser a sua meta semanal?',                     type: 'weekly-goal' },
    { id: 'hasPersonal',   balloon: () => 'Você treina com um personal?',                         type: 'personal' },
    { id: 'personalCode',  balloon: () => 'Qual é o código do seu personal?',                     type: 'personal-code' },
    { id: 'location',      balloon: () => 'Onde você treina?',                                    type: 'location' },
    { id: 'height',        balloon: () => 'Qual a sua altura?',                                   type: 'number-input' },
    { id: 'weight',        balloon: () => 'Qual o seu peso?',                                     type: 'number-input' },
    { id: 'birthDate',     balloon: () => 'Qual a sua data de nascimento?',                       type: 'date-input' },
    { id: 'avatarUrl',     balloon: () => 'Escolha seu avatar!',                                  type: 'avatar' },
    { id: 'notifications', balloon: () => 'Permitir que o Shape Express envie notificações?',     type: 'notifications' },
  ].filter(q => {
    if (q.id === 'personalCode') return answers.hasPersonal === true;
    return true;
  }) as DynQuestion[];
}

function getAnswer(answers: Answers, q: DynQuestion): unknown {
  if (q.type === 'experience' && q.sportKey) return answers.experiences?.[q.sportKey];
  if (q.id === 'sports') return (answers.sports?.length ?? 0) > 0 ? true : undefined;
  return (answers as Record<string, unknown>)[q.id];
}

// ─── OptionCard ───────────────────────────────────────────────────────────────

function OptionCard({ selected, onClick, icon, label, desc, color }: { selected: boolean; onClick: () => void; icon?: React.ReactNode; label: string; desc?: string; color?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn('w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left active:scale-95', selected ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-white/5')}
    >
      {icon && <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">{icon}</div>}
      {color && <div className={cn('w-3 h-3 rounded-full shrink-0', color)} />}
      <div>
        <p className={cn('text-sm font-bold', selected ? 'text-white' : 'text-white/60')}>{label}</p>
        {desc && <p className="text-[10px] text-white/40">{desc}</p>}
      </div>
    </button>
  );
}

// ─── Ready screen ─────────────────────────────────────────────────────────────

function ReadyScreen({ onContinue, onNotReady, loading }: { onContinue: () => void; onNotReady: () => void; loading?: boolean }) {
  return (
    <div className="h-screen flex flex-col py-6 overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-2">
        <span className="text-8xl select-none">⚡</span>
        <p className="text-white text-xl font-bold text-center leading-snug">
          Certo! Vamos fazer a primeira sessão de treino?
        </p>
        {loading && <p className="text-white/40 text-sm">Gerando seu treino personalizado...</p>}
      </div>
      <div className="flex flex-col gap-3 shrink-0">
        <button
          onClick={onContinue}
          disabled={loading}
          className={cn('w-full py-4 rounded-2xl text-black font-bold text-sm uppercase tracking-widest active:scale-95 transition-all', loading ? 'bg-dark-card text-white/40 pointer-events-none' : 'red-gradient')}
        >
          {loading ? 'Aguarde...' : 'Continuar'}
        </button>
        <button onClick={onNotReady} disabled={loading} className="w-full py-4 bg-dark-card border border-dark-border rounded-2xl text-white/60 font-bold text-sm uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-40">
          Não estou no local de treino
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface WelcomeViewProps {
  onBack: () => void;
  onContinue: (answers: Answers) => void | Promise<void>;
}

export function WelcomeView({ onBack, onContinue }: WelcomeViewProps) {
  const [introStep, setIntroStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Answers>({});
  const [showReady, setShowReady] = useState(false);
  const [readyLoading, setReadyLoading] = useState(false);
  const { count, done, skipToEnd } = useTypewriter(INTRO_STEPS[introStep]);

  const questions = buildQuestions(answers);
  const inIntro = questionIndex === -1;
  const question = inIntro ? null : questions[questionIndex];
  const currentAnswer = question ? getAnswer(answers, question) : undefined;
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== '';

  const dateRef = useRef<HTMLInputElement>(null);

  const toggleSport = (id: string) => {
    setAnswers(prev => {
      const current = prev.sports ?? [];
      const next = current.includes(id) ? current.filter(s => s !== id) : [...current, id];
      // Remove experience entries for deselected sports
      const experiences = { ...prev.experiences };
      Object.keys(experiences).forEach(k => { if (!next.includes(k)) delete experiences[k]; });
      return { ...prev, sports: next, experiences };
    });
  };

  const setExperience = (sport: string, level: string) =>
    setAnswers(prev => ({ ...prev, experiences: { ...prev.experiences, [sport]: level } }));

  const set = (key: keyof Answers, value: Answers[keyof Answers]) =>
    setAnswers(prev => ({ ...prev, [key]: value }));

  const handleContinue = () => {
    if (inIntro) {
      if (!done) { skipToEnd(); return; }
      if (introStep < INTRO_STEPS.length - 1) { setIntroStep(introStep + 1); return; }
      setQuestionIndex(0); return;
    }
    if (!hasAnswer) return;
    // Rebuild questions with latest answers to handle personalCode skip
    const qs = buildQuestions(answers);
    if (questionIndex < qs.length - 1) { setQuestionIndex(questionIndex + 1); return; }
    setShowReady(true);
  };

  const handleBack = () => {
    if (showReady) { setShowReady(false); return; }
    if (inIntro) { if (introStep > 0) { setIntroStep(introStep - 1); return; } onBack(); return; }
    if (questionIndex > 0) { setQuestionIndex(questionIndex - 1); return; }
    setQuestionIndex(-1); setIntroStep(INTRO_STEPS.length - 1);
  };

  // Intro animated content
  let charIndex = 0;
  const introContent = INTRO_STEPS[introStep].map((seg, si) => {
    const chars = seg.text.split('').map((ch, ci) => {
      const visible = charIndex < count; charIndex++;
      return <span key={`${si}-${ci}`} className={visible ? undefined : 'opacity-0'}>{ch}</span>;
    });
    return seg.bold ? <strong key={si}>{chars}</strong> : <span key={si}>{chars}</span>;
  });

  if (showReady) {
    return <ReadyScreen
      loading={readyLoading}
      onContinue={async () => { setReadyLoading(true); await onContinue(answers); setReadyLoading(false); }}
      onNotReady={() => onContinue({ ...answers, skipWorkout: true } as any)}
    />;
  }

  const renderOptions = () => {
    if (!question) return null;
    const { type, sportKey } = question;

    if (type === 'sports-multi') {
      return (
        <div className="flex flex-col gap-3">
          {SPORTS.map(o => (
            <OptionCard key={o.id} selected={(answers.sports ?? []).includes(o.id)} onClick={() => toggleSport(o.id)} icon={<span className="text-2xl">{o.icon}</span>} label={o.id} />
          ))}
        </div>
      );
    }

    if (type === 'cards-icon') {
      return (
        <div className="flex flex-col gap-3">
          {OBJECTIVES.map(o => (
            <OptionCard key={o.id} selected={answers.objective === o.id} onClick={() => set('objective', o.id)} icon={o.icon} label={o.id} />
          ))}
        </div>
      );
    }

    if (type === 'cards-list') {
      return (
        <div className="flex flex-col gap-3">
          {SOURCES.map(o => (
            <OptionCard key={o.id} selected={answers.source === o.id} onClick={() => set('source', o.id)} icon={<span className="text-2xl">{o.icon}</span>} label={o.id} />
          ))}
        </div>
      );
    }

    if (type === 'experience' && sportKey) {
      return (
        <div className="flex flex-col gap-3">
          {EXPERIENCE_LEVELS.map(l => (
            <OptionCard key={l.id} selected={answers.experiences?.[sportKey] === l.id} onClick={() => setExperience(sportKey, l.id)} color={l.color} label={l.id} desc={l.desc} />
          ))}
        </div>
      );
    }

    if (type === 'weekly-goal') {
      return (
        <div className="flex flex-col gap-3">
          {WEEKLY_GOALS.map(n => (
            <OptionCard key={n} selected={answers.weeklyGoal === n} onClick={() => set('weeklyGoal', n)} label={`${n}x por semana`} />
          ))}
        </div>
      );
    }

    if (type === 'personal') {
      return (
        <div className="flex flex-col gap-3">
          <OptionCard selected={answers.hasPersonal === true} onClick={() => set('hasPersonal', true)} icon={<Users size={20} className="text-emerald-400" />} label="Sim, tenho um personal" desc="Conecte-se para receber treinos exclusivos." />
          <OptionCard selected={answers.hasPersonal === false} onClick={() => set('hasPersonal', false)} icon={<User size={20} className="text-white/40" />} label="Não, treino sozinho" desc="O app irá sugerir treinos para você." />
        </div>
      );
    }

    if (type === 'personal-code') {
      return (
        <div className="flex items-center gap-3 bg-dark-card border border-dark-border rounded-2xl px-6 py-4 w-full">
          <Lock size={20} className="text-white/40 shrink-0" />
          <input
            type="text"
            placeholder="Ex: ABC123"
            value={answers.personalCode ?? ''}
            onChange={e => set('personalCode', e.target.value)}
            className="flex-1 bg-transparent text-white text-lg font-bold outline-none placeholder:text-white/20 uppercase"
          />
        </div>
      );
    }

    if (type === 'location') {
      return (
        <div className="flex flex-col gap-3">
          <OptionCard selected={answers.location === 'Casa'} onClick={() => set('location', 'Casa')} icon={<Home size={20} className={answers.location === 'Casa' ? 'text-brand-red' : 'text-white/40'} />} label="Em casa" />
          <OptionCard selected={answers.location === 'Academia'} onClick={() => set('location', 'Academia')} icon={<Building2 size={20} className={answers.location === 'Academia' ? 'text-brand-red' : 'text-white/40'} />} label="Academia" />
        </div>
      );
    }

    if (type === 'number-input') {
      const isHeight = question.id === 'height';
      return (
        <div className="flex items-center gap-3 bg-dark-card border border-dark-border rounded-2xl px-6 py-4 w-full">
          {isHeight ? <Ruler size={20} className="text-white/40 shrink-0" /> : <Scale size={20} className="text-white/40 shrink-0" />}
          <input
            type="number"
            inputMode="numeric"
            placeholder={isHeight ? 'Ex: 175' : 'Ex: 70'}
            value={(answers[question.id as 'height' | 'weight'] as string) ?? ''}
            onChange={e => set(question.id as 'height' | 'weight', e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-white text-lg font-bold outline-none placeholder:text-white/20"
          />
          <span className="text-white/40 text-sm shrink-0">{isHeight ? 'cm' : 'kg'}</span>
        </div>
      );
    }

    if (type === 'date-input') {
      return (
        <div
          className="relative bg-dark-card border border-dark-border rounded-2xl px-6 py-4 w-full cursor-pointer"
          onClick={() => dateRef.current?.showPicker?.()}
        >
          {!answers.birthDate && (
            <span className="absolute inset-0 flex items-center px-6 text-white/20 text-lg font-light pointer-events-none select-none">
              dd/mm/aaaa
            </span>
          )}
          <input
            ref={dateRef}
            type="date"
            value={answers.birthDate ?? ''}
            onChange={e => set('birthDate', e.target.value)}
            className="w-full bg-transparent text-white text-lg font-bold outline-none [color-scheme:dark] opacity-0 absolute inset-0 cursor-pointer"
          />
          {answers.birthDate && (
            <span className="text-white text-lg font-bold">
              {new Date(answers.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      );
    }

    if (type === 'avatar') {
      return <SportAvatarSelector currentAvatarUrl={answers.avatarUrl ?? ''} onSelect={url => set('avatarUrl', url)} />;
    }

    if (type === 'notifications') {
      return (
        <div className="flex flex-col gap-3">
          <OptionCard selected={answers.notifications === true} onClick={() => set('notifications', true)} icon={<Bell size={20} className="text-brand-red" />} label="Sim, quero receber notificações" />
          <OptionCard selected={answers.notifications === false} onClick={() => set('notifications', false)} icon={<BellOff size={20} className="text-white/40" />} label="Agora não" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col py-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleBack} className="p-1 text-white/60 active:scale-95 transition-transform shrink-0">
          <ArrowLeft size={24} />
        </button>
        {!inIntro && (
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full red-gradient rounded-full transition-all duration-500" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
          </div>
        )}
      </div>

      {inIntro ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative" style={{ display: 'inline-grid' }}>
            <p className="text-lg leading-snug px-5 py-4 opacity-0 pointer-events-none select-none" style={{ gridArea: '1/1' }}>
              {INTRO_STEPS[introStep].map((seg, si) => seg.bold ? <strong key={si}>{seg.text}</strong> : <span key={si}>{seg.text}</span>)}
            </p>
            <div className="absolute inset-0 bg-dark-card border border-dark-border rounded-2xl" />
            <p className="text-white text-lg leading-snug px-5 py-4" style={{ gridArea: '1/1', position: 'relative' }}>{introContent}</p>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[10px] w-0 h-0" style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `10px solid var(--theme-card)` }} />
          </div>
          <div className="w-28 h-28 rounded-full bg-dark-card flex items-center justify-center mt-2">
            <span className="text-6xl select-none">⚡</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-start gap-3 mb-5 shrink-0">
            <div className="w-14 h-14 rounded-full bg-dark-card flex items-center justify-center shrink-0">
              <span className="text-3xl select-none">⚡</span>
            </div>
            <div className="relative bg-dark-card border border-dark-border rounded-2xl px-4 py-3">
              <p className="text-white text-base leading-snug">{question!.balloon(answers)}</p>
              <div className="absolute left-[-10px] top-4 w-0 h-0" style={{ borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: `10px solid var(--theme-card)` }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderOptions()}
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        className={cn(
          'w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest active:scale-95 transition-all mt-4 shrink-0',
          !inIntro && !hasAnswer ? 'bg-dark-card text-white/40 pointer-events-none' : 'red-gradient text-black'
        )}
      >
        Continuar
      </button>
    </div>
  );
}
