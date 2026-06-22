import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { WorkoutSession } from '../../../domain/entities';

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
  { id: 'Musculação',    icon: '🏋️', bg: '#b91c1c' },
  { id: 'Halterofilismo',icon: '🏅', bg: '#a16207' },
  { id: 'Corrida',       icon: '🏃', bg: '#c2410c' },
  { id: 'Ciclismo',      icon: '🚴', bg: '#1d4ed8' },
  { id: 'Natação',       icon: '🏊', bg: '#0e7490' },
  { id: 'Crossfit',      icon: '⚡', bg: '#374151' },
  { id: 'Artes Marciais',icon: '🥋', bg: '#7c3aed' },
  { id: 'Futebol',       icon: '⚽', bg: '#374151' },
  { id: 'Basquete',      icon: '🏀', bg: '#9a3412' },
  { id: 'Yoga',          icon: '🧘', bg: '#0f766e' },
];

const OBJECTIVES = [
  { id: 'Ganhar massa muscular',      icon: '💪' },
  { id: 'Emagrecer',                   icon: '🔥' },
  { id: 'Melhorar condicionamento',    icon: '⚡' },
  { id: 'Saúde e mobilidade',           icon: '❤️' },
  { id: 'Aumento de força',            icon: '🏆' },
  { id: 'Reduzir estresse',            icon: '🧠' },
];

// Maps objective -> 2 specific benefits shown on the preview screen
const OBJECTIVE_BENEFITS: Record<string, [{ icon: string; bg: string; title: string; desc: string }, { icon: string; bg: string; title: string; desc: string }]> = {
  'Ganhar massa muscular': [
    { icon: '💪', bg: '#b91c1c', title: 'Aumentar o volume muscular', desc: 'Treinos progressivos focados em hipertrofia' },
    { icon: '🔥', bg: '#c2410c', title: 'Ganhar força real', desc: 'Exercícios compostos que transformam o corpo' },
  ],
  'Emagrecer': [
    { icon: '⚖️', bg: '#0e7490', title: 'Queimar gordura', desc: 'Treinos de alta intensidade que aceleram o metabolismo' },
    { icon: '🏃', bg: '#c2410c', title: 'Melhorar o condicionamento', desc: 'Mais disposição no dia a dia' },
  ],
  'Melhorar condicionamento': [
    { icon: '⚡', bg: '#374151', title: 'Mais fôlego', desc: 'Treinos cardía que aumentam sua resistência' },
    { icon: '🏅', bg: '#a16207', title: 'Evoluir semana a semana', desc: 'Progresso visível em poucas semanas' },
  ],
  'Saúde e mobilidade': [
    { icon: '❤️', bg: '#0f766e', title: 'Corpo mais saudável', desc: 'Exercícios que melhoram postura e flexibilidade' },
    { icon: '🧘', bg: '#7c3aed', title: 'Menos dores e tensão', desc: 'Movimentos que aliviam o estresse físico' },
  ],
  'Aumento de força': [
    { icon: '🏆', bg: '#1d4ed8', title: 'Ficar mais forte', desc: 'Progressão de carga para força máxima' },
    { icon: '💪', bg: '#b91c1c', title: 'Superar seus limites', desc: 'Bata recordes pessoais toda semana' },
  ],
  'Reduzir estresse': [
    { icon: '🧠', bg: '#7c3aed', title: 'Aliviar a mente', desc: 'Exercícios que liberam endorfina e bem-estar' },
    { icon: '🏃', bg: '#0e7490', title: 'Dormir melhor', desc: 'Atividade física regular melhora o sono' },
  ],
};

const DEFAULT_BENEFITS = OBJECTIVE_BENEFITS['Ganhar massa muscular'];

const SOURCES = [
  { id: 'Instagram', icon: '📸' },
  { id: 'Facebook', icon: '👍' },
  { id: 'TikTok', icon: '🎵' },
  { id: 'Indicação de amigo', icon: '👥' },
  { id: 'Google', icon: '🔍' },
  { id: 'YouTube', icon: '▶️' },
  { id: 'Outro', icon: '💬' },
];

const EXPERIENCE_LEVELS = [
  { id: 'Nunca pratiquei',  label: 'Nunca pratiquei',              bars: 0 },
  { id: 'Iniciante',       label: 'Sou iniciante',                 bars: 1 },
  { id: 'Intermediário',   label: 'Já treino há algum tempo',      bars: 2 },
  { id: 'Avançado',        label: 'Treino há bastante tempo',      bars: 3 },
];

const WEEKLY_GOALS = [
  { value: 2, label: '2x por semana', intensity: 'Tranquilo' },
  { value: 3, label: '3x por semana', intensity: 'Regular' },
  { value: 4, label: '4x por semana', intensity: 'Intenso' },
  { value: 5, label: '5x por semana', intensity: 'Puxado' },
  { value: 6, label: '6x por semana', intensity: 'Pesado' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = {
  sports?: string[];
  objective?: string;
  source?: string;
  experiences?: Record<string, string>;
  weeklyGoal?: number;
  height?: number;
  weight?: number;
  birthDate?: string;
  notifications?: boolean;
};

// Questions are dynamic — experience has one entry per selected sport
type QuestionId =
  | 'sports' | 'objective' | 'source'
  | `experience:${string}`
  | 'weeklyGoal' | 'height' | 'weight' | 'birthDate' | 'notifications' | 'preview';

interface DynQuestion {
  id: QuestionId;
  balloon: (answers: Answers) => React.ReactNode;
  type: 'sports-multi' | 'cards-icon' | 'cards-list' | 'experience' | 'weekly-goal' | 'height' | 'weight' | 'birthDate' | 'notifications' | 'preview';
  sportKey?: string;
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
    { id: 'source',        balloon: () => 'Como soube do Shape Express?',                         type: 'cards-list' },
    ...experienceQuestions,
    { id: 'objective',     balloon: (a: Answers) => <>Você quer praticar <strong style={{ textTransform: 'lowercase' }}>{(a.sports ?? [])[0] ?? 'isso'}</strong> para...</>,  type: 'cards-icon' },
    { id: 'weeklyGoal',    balloon: () => 'Qual vai ser a sua meta semanal?',                     type: 'weekly-goal' },
    { id: 'height',        balloon: () => 'Qual a sua altura?',                                   type: 'height' },
    { id: 'weight',        balloon: () => 'Qual o seu peso?',                                     type: 'weight' },
    { id: 'birthDate',     balloon: () => 'Qual a sua data de nascimento?',                        type: 'birthDate' },
    { id: 'notifications', balloon: () => 'Eu vou lembrar você de treinar até virar um hábito!',        type: 'notifications' },
    { id: 'preview',       balloon: () => 'Veja o que você vai conseguir fazer em 3 meses!',             type: 'preview' },
  ] as DynQuestion[];
}

function getAnswer(answers: Answers, q: DynQuestion): unknown {
  if (q.type === 'experience' && q.sportKey) return answers.experiences?.[q.sportKey];
  if (q.id === 'sports') return (answers.sports?.length ?? 0) > 0 ? true : undefined;
  if (q.type === 'preview') return true;
  return (answers as Record<string, unknown>)[q.id];
}

// ─── GoalCard ───────────────────────────────────────────────────────────────

function GoalCard({ selected, onClick, label, intensity }: { selected: boolean; onClick: () => void; label: string; intensity: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-5 py-5 rounded-2xl border-2 flex items-center justify-between transition-all text-left active:scale-95',
        selected ? 'border-brand-red bg-dark-card' : 'border-dark-border bg-dark-card'
      )}
    >
      <p className={cn('text-lg font-black', selected ? 'text-brand-red' : 'text-white')}>{label}</p>
      <p className={cn('text-sm font-semibold', selected ? 'text-brand-red/70' : 'text-white/40')}>{intensity}</p>
    </button>
  );
}

// ─── CheckboxCard ───────────────────────────────────────────────────────────

function CheckboxCard({ selected, onClick, icon, label }: { selected: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left active:scale-95',
        selected ? 'border-brand-red bg-dark-card' : 'border-dark-border bg-dark-card'
      )}
    >
      <span className="text-3xl shrink-0 w-10 text-center">{icon}</span>
      <p className={cn('text-base font-bold flex-1', selected ? 'text-brand-red' : 'text-white')}>{label}</p>
    </button>
  );
}

// ─── SignalBars ──────────────────────────────────────────────────────────────

function SignalBars({ filled, selected }: { filled: number; selected: boolean }) {
  const activeColor = selected ? '#ef4444' : '#60a5fa';
  const heights = [8, 12, 16, 20];
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 7}
          y={22 - h}
          width="5"
          height={h}
          rx="1.5"
          fill={i < filled ? activeColor : 'rgba(255,255,255,0.15)'}
        />
      ))}
    </svg>
  );
}

// ─── OptionCard ───────────────────────────────────────────────────────────────

function OptionCard({ selected, onClick, icon, label, desc }: { selected: boolean; onClick: () => void; icon?: React.ReactNode; label: string; desc?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left active:scale-95',
        selected ? 'border-brand-red bg-dark-card' : 'border-dark-border bg-dark-card'
      )}
    >
      {icon && (
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
          selected ? 'bg-white/10' : 'bg-white/5'
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className={cn('text-base font-bold', selected ? 'text-brand-red' : 'text-white')}>{label}</p>
        {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

// ─── SportCard ────────────────────────────────────────────────────────────────

function SportCard({ selected, onClick, icon, bg, label }: { selected: boolean; onClick: () => void; icon: string; bg: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left active:scale-95',
        selected ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-dark-card'
      )}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl" style={{ backgroundColor: bg }}>
        {icon}
      </div>
      <p className={cn('text-base font-bold flex-1', selected ? 'text-white' : 'text-white/70')}>{label}</p>
    </button>
  );
}

// ─── WorkoutDoneScreen ─────────────────────────────────────────────────────

export function WorkoutDoneScreen({ session, onContinue }: { session: WorkoutSession; onContinue: () => void }) {
  const durationSec = session.duration ?? 0;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const durationLabel = `${mins}:${secs.toString().padStart(2, '0')}`;

  const allWeights = session.exercises.flatMap(ex =>
    ex.sets.filter(s => s.completed && s.weight > 0).map(s => s.weight)
  );
  const avgWeight = allWeights.length > 0
    ? Math.round(allWeights.reduce((a, b) => a + b, 0) / allWeights.length)
    : 0;

  return (
    <div className="h-screen overflow-hidden flex flex-col items-center justify-between py-10 px-4">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div className="w-44 h-44 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
          <span className="text-8xl select-none">🎉</span>
        </div>
        <p className="text-3xl font-black text-yellow-400 text-center">Treino concluído!</p>
        <div className="flex gap-3 w-full">
          <div className="flex-1 rounded-2xl border-2 border-yellow-500 bg-dark-card p-3 flex flex-col items-center gap-1">
            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">XP Total</p>
            <p className="text-2xl font-black text-white">⚡ {session.xpEarned}</p>
          </div>
          <div className="flex-1 rounded-2xl border-2 border-brand-red bg-dark-card p-3 flex flex-col items-center gap-1">
            <p className="text-[10px] font-black text-brand-red uppercase tracking-widest">Média Peso</p>
            <p className="text-2xl font-black text-white">💪 {avgWeight}kg</p>
          </div>
          <div className="flex-1 rounded-2xl border-2 border-blue-400 bg-dark-card p-3 flex flex-col items-center gap-1">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Tempo</p>
            <p className="text-2xl font-black text-white">⏱️ {durationLabel}</p>
          </div>
        </div>
      </div>
      <button
        onClick={onContinue}
        className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest red-gradient text-black shadow-[0_4px_0_0_rgba(150,10,10,0.6)] active:scale-95 transition-all"
      >
        Continuar
      </button>
    </div>
  );
}

// ─── Ready screen ─────────────────────────────────────────────────────────────

function ReadyScreen({ onContinue, onNotReady, onBack, loading, skipLoading }: { onContinue: () => void; onNotReady: () => void; onBack: () => void; loading?: boolean; skipLoading?: boolean }) {
  return (
    <div className="h-screen overflow-hidden flex flex-col pt-6 pb-12 px-8">
      {/* Header — back arrow only, no progress bar */}
      <div className="shrink-0 mb-4">
        <button onClick={onBack} className="p-1 text-white/60 active:scale-95 transition-transform">
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-2">
        {/* Speech bubble above mascot */}
        <div className="relative bg-dark-card border border-dark-border rounded-2xl px-5 py-4 w-full">
          <p className="text-white text-lg leading-snug text-center">
            Certo! Vamos para o seu{' '}
            <span className="text-brand-red font-black">primeiro treino</span>?
          </p>
          {/* Downward triangle pointing to mascot */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-[10px] w-0 h-0"
            style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '10px solid var(--theme-card)' }} />
        </div>

        {/* Mascot */}
        <div className="w-36 h-36 rounded-full bg-dark-card border border-dark-border flex items-center justify-center">
          <span className="text-7xl select-none">⚡</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 shrink-0">
        <button
          onClick={onContinue}
          disabled={loading || skipLoading}
          className={cn(
            'w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all',
            loading ? 'bg-dark-card text-white/40 border-2 border-dark-border' : 'red-gradient text-black shadow-[0_4px_0_0_rgba(150,10,10,0.6)] active:scale-95',
            skipLoading && 'opacity-0 pointer-events-none'
          )}
        >
          {loading
            ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin inline-block" />Gerando treino...</span>
            : 'Continuar'}
        </button>
        <button
          onClick={onNotReady}
          disabled={loading || skipLoading}
          className={cn(
            'w-full py-4 bg-transparent border-2 border-dark-border rounded-2xl text-white/50 font-bold text-xs uppercase tracking-widest transition-all',
            skipLoading ? 'text-white/70' : 'active:scale-95',
            loading && 'opacity-0 pointer-events-none'
          )}
        >
          {skipLoading
            ? <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin inline-block" />Gerando treino...</span>
            : 'Não estou no local de treino'}
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
  const [offlineError, setOfflineError] = useState(false);
  const [birthDateError, setBirthDateError] = useState<string | null>(null);
  const [showReady, setShowReady] = useState(false);
  const [readyLoading, setReadyLoading] = useState(false);
  const { count, done, skipToEnd } = useTypewriter(INTRO_STEPS[introStep]);

  const questions = buildQuestions(answers);
  const inIntro = questionIndex === -1;
  const question = inIntro ? null : questions[questionIndex];
  const currentAnswer = question ? getAnswer(answers, question) : undefined;
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== '';

const toggleSport = (id: string) => {
    setAnswers(prev => {
      // Single-select: replace previous sport selection
      const experiences: Record<string, string> = {};
      if (prev.experiences?.[id]) experiences[id] = prev.experiences[id];
      return { ...prev, sports: [id], experiences };
    });
  };

  const setExperience = (sport: string, level: string) =>
    setAnswers(prev => ({ ...prev, experiences: { ...prev.experiences, [sport]: level } }));

  const set = (key: keyof Answers, value: Answers[keyof Answers]) =>
    setAnswers(prev => ({ ...prev, [key]: value }));

  const handleContinueWith = (key: keyof Answers, value: Answers[keyof Answers]) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    const qs = buildQuestions(updated);
    if (questionIndex < qs.length - 1) { setQuestionIndex(questionIndex + 1); return; }
    setShowReady(true);
  };

  const handleContinue = () => {
    if (inIntro) {
      if (!done) { skipToEnd(); return; }
      if (introStep < INTRO_STEPS.length - 1) { setIntroStep(introStep + 1); return; }
      setQuestionIndex(0); return;
    }
    if (!hasAnswer) return;
    if (question?.id === 'sports' && !navigator.onLine) { setOfflineError(true); return; }
    setOfflineError(false);
    if (question?.id === 'birthDate' && answers.birthDate) {
      const birth = new Date(answers.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
      if (age < 18) { setBirthDateError('Você precisa ter pelo menos 18 anos para usar o Shape Express.'); return; }
      if (age > 90) { setBirthDateError('Data de nascimento inválida.'); return; }
      setBirthDateError(null);
    }
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

  const [skipLoading, setSkipLoading] = useState(false);

  if (showReady) {
    return <ReadyScreen
      loading={readyLoading}
      skipLoading={skipLoading}
      onBack={() => setShowReady(false)}
      onContinue={async () => { setReadyLoading(true); await onContinue(answers); setReadyLoading(false); }}
      onNotReady={async () => { setSkipLoading(true); await onContinue({ ...answers, skipWorkout: true } as any); setSkipLoading(false); }}
    />;
  }

  const renderOptions = () => {
    if (!question) return null;
    const { type, sportKey } = question;

    if (type === 'sports-multi') {
      return (
        <div className="flex flex-col gap-3">
          {SPORTS.map(o => (
            <SportCard key={o.id} selected={(answers.sports ?? []).includes(o.id)} onClick={() => toggleSport(o.id)} icon={o.icon} bg={o.bg} label={o.id} />
          ))}
        </div>
      );
    }

    if (type === 'cards-icon') {
      return (
        <div className="flex flex-col gap-3">
          {OBJECTIVES.map(o => (
            <CheckboxCard key={o.id} selected={answers.objective === o.id} onClick={() => set('objective', o.id)} icon={o.icon} label={o.id} />
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
          {EXPERIENCE_LEVELS.map(l => {
            const sel = answers.experiences?.[sportKey] === l.id;
            return (
              <OptionCard
                key={l.id}
                selected={sel}
                onClick={() => setExperience(sportKey, l.id)}
                icon={<SignalBars filled={l.bars} selected={sel} />}
                label={l.label}
              />
            );
          })}
        </div>
      );
    }

    if (type === 'weekly-goal') {
      return (
        <div className="flex flex-col gap-3">
          {WEEKLY_GOALS.map(g => (
            <GoalCard key={g.value} selected={answers.weeklyGoal === g.value} onClick={() => set('weeklyGoal', g.value)} label={g.label} intensity={g.intensity} />
          ))}
        </div>
      );
    }

    if (type === 'height') {
      return (
        <div className="flex items-center justify-center gap-3">
          <input
            type="number"
            min={100}
            max={250}
            placeholder="170"
            value={answers.height ?? ''}
            onChange={e => set('height', e.target.value ? Number(e.target.value) : undefined)}
            className="w-36 text-center text-4xl font-black bg-dark-card border-2 border-dark-border rounded-2xl py-5 text-white focus:border-brand-red outline-none"
          />
          <span className="text-2xl font-bold text-white/50">cm</span>
        </div>
      );
    }

    if (type === 'weight') {
      return (
        <div className="flex items-center justify-center gap-3">
          <input
            type="number"
            min={30}
            max={300}
            placeholder="70"
            value={answers.weight ?? ''}
            onChange={e => set('weight', e.target.value ? Number(e.target.value) : undefined)}
            className="w-36 text-center text-4xl font-black bg-dark-card border-2 border-dark-border rounded-2xl py-5 text-white focus:border-brand-red outline-none"
          />
          <span className="text-2xl font-bold text-white/50">kg</span>
        </div>
      );
    }

    if (type === 'birthDate') {
      const today = new Date();
      const maxYear = today.getFullYear() - 18;
      const minYear = today.getFullYear() - 90;
      const parts = answers.birthDate?.split('-');
      const selYear = parts?.[0] ?? '';
      const selMonth = parts?.[1] ? String(Number(parts[1])) : '';
      const selDay = parts?.[2] ? String(Number(parts[2])) : '';
      const daysInMonth = selYear && selMonth ? new Date(Number(selYear), Number(selMonth), 0).getDate() : 31;

      const updateDate = (y: string, m: string, d: string) => {
        if (!y || !m || !d) { set('birthDate', undefined); setBirthDateError(null); return; }
        const val = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        set('birthDate', val);
        setBirthDateError(null);
      };

      return (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex gap-2 w-full">
            <select
              value={selDay}
              onChange={e => updateDate(selYear, selMonth, e.target.value)}
              className="flex-1 bg-dark-card border-2 border-dark-border rounded-2xl py-4 text-white text-center font-bold outline-none focus:border-brand-red"
            >
              <option value="">Dia</option>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                <option key={d} value={String(d)}>{d}</option>
              ))}
            </select>
            <select
              value={selMonth}
              onChange={e => updateDate(selYear, e.target.value, selDay)}
              className="flex-1 bg-dark-card border-2 border-dark-border rounded-2xl py-4 text-white text-center font-bold outline-none focus:border-brand-red"
            >
              <option value="">Mês</option>
              {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                <option key={i} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            <select
              value={selYear}
              onChange={e => updateDate(e.target.value, selMonth, selDay)}
              className="flex-[1.5] bg-dark-card border-2 border-dark-border rounded-2xl py-4 text-white text-center font-bold outline-none focus:border-brand-red"
            >
              <option value="">Ano</option>
              {Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i).map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
          {birthDateError && <p className="text-sm text-red-400 text-center">{birthDateError}</p>}
        </div>
      );
    }

    if (type === 'preview') {
      const benefits = OBJECTIVE_BENEFITS[answers.objective ?? ''] ?? DEFAULT_BENEFITS;
      const items = [
        ...benefits,
        { icon: '⏰', bg: '#d97706', title: 'Criar o hábito de se exercitar', desc: 'Lembretes inteligentes, desafios e muito mais' },
      ];
      return (
        <div className="flex flex-col gap-6 pt-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl" style={{ backgroundColor: item.bg }}>
                {item.icon}
              </div>
              <div className="flex-1 pt-1">
                <p className="text-white font-bold text-base leading-snug">{item.title}</p>
                <p className="text-white/50 text-sm mt-1 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (type === 'notifications') {
      return (
        <div className="bg-dark-card border border-dark-border rounded-3xl p-6 flex flex-col items-center gap-5">
          <Bell size={40} className="text-white/40" />
          <p className="text-white text-lg font-bold text-center leading-snug">
            Permitir que o <strong>Shape Express</strong> envie notificações?
          </p>
          <div className="w-full flex flex-col divide-y divide-dark-border rounded-2xl overflow-hidden border border-dark-border">
            <button
              onClick={() => handleContinueWith('notifications', true)}
              className="w-full py-4 text-base font-black text-brand-red uppercase tracking-widest active:bg-white/5 transition-colors"
            >
              Permitir
            </button>
            <button
              onClick={() => handleContinueWith('notifications', false)}
              className="w-full py-4 text-base font-semibold text-white/40 uppercase tracking-widest active:bg-white/5 transition-colors"
            >
              Não permitir
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-screen flex flex-col pt-6 pb-12 px-8 overflow-hidden">
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
        <div className="flex-1 relative">
          {/* Icon fixed at vertical center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-dark-card flex items-center justify-center">
            <span className="text-6xl select-none">⚡</span>
          </div>
          {/* Bubble anchored above the icon */}
          <div className="absolute left-0 right-0" style={{ bottom: 'calc(50% + 56px + 16px)' }}>
            <div className="relative w-full" style={{ display: 'inline-grid' }}>
              <p className="text-lg leading-snug px-5 py-4 opacity-0 pointer-events-none select-none text-center" style={{ gridArea: '1/1' }}>
                {INTRO_STEPS[introStep].map((seg, si) => seg.bold ? <strong key={si}>{seg.text}</strong> : <span key={si}>{seg.text}</span>)}
              </p>
              <div className="absolute inset-0 bg-dark-card border border-dark-border rounded-2xl" />
              <p className="text-white text-lg leading-snug px-5 py-4 text-center" style={{ gridArea: '1/1', position: 'relative' }}>{introContent}</p>
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-[10px] w-0 h-0" style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `10px solid var(--theme-card)` }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-start gap-3 mb-5 shrink-0">
            <div className="w-16 h-16 rounded-full bg-dark-card border border-dark-border flex items-center justify-center shrink-0">
              <span className="text-4xl select-none">⚡</span>
            </div>
            <div className="relative bg-dark-card border border-dark-border rounded-2xl px-4 py-3 flex-1">
              <p className="text-white text-base font-medium leading-snug">{question!.balloon(answers)}</p>
              <div className="absolute left-[-10px] top-4 w-0 h-0" style={{ borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: `10px solid var(--theme-card)` }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pb-2">
            {renderOptions()}
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        className={cn(
          'w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all mt-4 shrink-0',
          question?.type === 'notifications'
            ? 'hidden'
            : !inIntro && !hasAnswer
              ? 'bg-dark-card text-white/30 pointer-events-none border-2 border-dark-border'
              : 'red-gradient text-black shadow-[0_4px_0_0_rgba(150,10,10,0.6)]'
        )}
      >
        {question?.id === 'weeklyGoal' ? 'Vou cumprir a meta' : 'Continuar'}
      </button>
      {offlineError && (
        <p className="text-center text-sm text-red-400 mt-2 shrink-0">
          Parece que você está offline. Tente de novo mais tarde.
        </p>
      )}
      {birthDateError && (
        <p className="text-center text-sm text-red-400 mt-2 shrink-0">
          {birthDateError}
        </p>
      )}
    </div>
  );
}
