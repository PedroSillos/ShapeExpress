import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { cn } from '../../../utils/cn';
import iconMusculacao from '@/src/assets/icons/icon-musculacao.svg';
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconCorrida from '@/src/assets/icons/icon-corrida.svg';
import iconCiclismo from '@/src/assets/icons/icon-ciclismo.svg';
import iconNatacao from '@/src/assets/icons/icon-natacao.svg';
import iconCrossfit from '@/src/assets/icons/icon-crossfit.svg';
import iconTriatlo from '@/src/assets/icons/icon-triatlo.svg';
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

function MusculacaoIcon() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: '#b91c1c' }}>
      <img src={iconMusculacao} className="w-3/4 h-3/4 object-contain" />
    </div>
  );
}

function HalterofilismoIcon() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: '#a16207' }}>
      <img src={iconHalterofilismo} className="w-3/4 h-3/4 object-contain" />
    </div>
  );
}

function CorridaIcon() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: '#c2410c' }}>
      <img src={iconCorrida} className="w-3/4 h-3/4 object-contain" />
    </div>
  );
}

function CiclismoIcon() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1d4ed8' }}>
      <img src={iconCiclismo} className="w-3/4 h-3/4 object-contain" />
    </div>
  );
}

function NatacaoIcon() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: '#0e7490' }}>
      <img src={iconNatacao} className="w-3/4 h-3/4 object-contain" />
    </div>
  );
}

function CrossfitIcon() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: '#374151' }}>
      <img src={iconCrossfit} className="w-3/4 h-3/4 object-contain" />
    </div>
  );
}

function TriatloIcon() {
  return (
    <div className="w-full h-full rounded-xl flex items-center justify-center" style={{ backgroundColor: '#2d3f4f' }}>
      <img src={iconTriatlo} className="w-3/4 h-3/4 object-contain" />
    </div>
  );
}

const SPORTS = [
  { id: 'Musculação',    icon: <MusculacaoIcon />,     bg: '#b91c1c' },
  { id: 'Halterofilismo',icon: <HalterofilismoIcon />, bg: '#a16207' },
  { id: 'Corrida',       icon: <CorridaIcon />,        bg: '#c2410c' },
  { id: 'Ciclismo',      icon: <CiclismoIcon />,       bg: '#1d4ed8' },
  { id: 'Natação',       icon: <NatacaoIcon />,        bg: '#0e7490' },
  { id: 'Crossfit',      icon: <CrossfitIcon />,       bg: '#374151' },
  { id: 'Triatlo',       icon: <TriatloIcon />,        bg: '#2d3f4f' },
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

function InstagramIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#1877F2" />
      <path d="M13.5 8H15V6h-1.5C12.1 6 11 7.1 11 8.5V10H9.5v2H11v6h2v-6h1.5l.5-2H13V8.5c0-.28.22-.5.5-.5z" fill="white" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#010101" />
      <path d="M14.5 6h-1.8v8a1.7 1.7 0 11-1.7-1.7V10.5a3.5 3.5 0 103.5 3.5V9.3a5 5 0 002.5.7V8.3A2.8 2.8 0 0114.5 6z" fill="white" />
    </svg>
  );
}

function FriendIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#7C3AED" />
      <circle cx="9" cy="9.5" r="2" stroke="white" strokeWidth="1.2" />
      <circle cx="15" cy="9.5" r="2" stroke="white" strokeWidth="1.2" />
      <path d="M5 17c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M15 13.5c1.5 0 4 .8 4 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function GoogleColorIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="white" />
      <path fill="#4285F4" d="M12 11h5.2c.1.4.1.8.1 1.2 0 3.4-2.3 5.8-5.3 5.8A5.5 5.5 0 016.5 12 5.5 5.5 0 0112 6.5c1.5 0 2.7.5 3.6 1.4l-1.5 1.5C13.5 8.8 12.8 8.5 12 8.5A3.5 3.5 0 008.5 12 3.5 3.5 0 0012 15.5c1.8 0 3-1 3.3-2.5H12V11z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#FF0000" />
      <path d="M16 12l-6.5 3.5V8.5L16 12z" fill="white" />
    </svg>
  );
}

function OtherIcon() {
  return (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="6" fill="#374151" />
      <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white" fontFamily="sans-serif">?</text>
    </svg>
  );
}

const SOURCES = [
  { id: 'Instagram',        icon: <InstagramIcon /> },
  { id: 'Facebook',         icon: <FacebookIcon /> },
  { id: 'TikTok',           icon: <TikTokIcon /> },
  { id: 'Indicação de amigo', icon: <FriendIcon /> },
  { id: 'Google',           icon: <GoogleColorIcon /> },
  { id: 'YouTube',          icon: <YouTubeIcon /> },
  { id: 'Outro',            icon: <OtherIcon /> },
];

const EXPERIENCE_LEVELS = [
  { id: 'Nunca pratiquei',  label: 'Nunca pratiquei',              bars: 0 },
  { id: 'Iniciante',       label: 'Sou iniciante',                 bars: 1 },
  { id: 'Intermediário',   label: 'Já treino há algum tempo',      bars: 2 },
  { id: 'Avançado',        label: 'Treino há bastante tempo',      bars: 3 },
];

const WEEKLY_GOALS = [
  { value: 2, label: 'por semana', intensity: 'Tranquilo', emoji: 'Ⅱ' },
  { value: 3, label: 'por semana', intensity: 'Regular',   emoji: 'Ⅲ' },
  { value: 4, label: 'por semana', intensity: 'Intenso',   emoji: 'Ⅳ' },
  { value: 5, label: 'por semana', intensity: 'Puxado',    emoji: 'Ⅴ' },
  { value: 6, label: 'por semana', intensity: 'Pesado',    emoji: 'Ⅵ' },
  { value: 7, label: 'por semana', intensity: 'Extremo',   emoji: 'Ⅶ' },
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

function GoalCard({ selected, onClick, label, intensity, emoji }: { selected: boolean; onClick: () => void; label: string; intensity: string; emoji: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-5 rounded-2xl border-2 flex items-center justify-between transition-all text-left active:scale-95',
        selected ? 'border-brand-red bg-dark-card' : 'border-dark-border bg-dark-card'
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn('text-2xl leading-none flex items-center', selected ? 'text-brand-red' : 'text-white/70')}>{emoji}</span>
        <p className={cn('text-base font-bold', selected ? 'text-brand-red' : 'text-white/70')}>{label}</p>
      </div>
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
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/5 text-3xl">
        {icon}
      </div>
      <p className={cn('text-base font-bold flex-1', selected ? 'text-brand-red' : 'text-white/70')}>{label}</p>
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
          'w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0',
          selected ? 'bg-white/10' : 'bg-white/5'
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className={cn('text-base font-bold', selected ? 'text-brand-red' : 'text-white/70')}>{label}</p>
        {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
      </div>
    </button>
  );
}

// ─── SportCard ────────────────────────────────────────────────────────────────

function SportCard({ selected, onClick, icon, label }: { selected: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-4 py-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left active:scale-95',
        selected ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-dark-card'
      )}
    >
      <div className={cn('w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0', selected ? 'bg-white/10' : 'bg-white/5')}>
        {icon}
      </div>
      <p className={cn('text-base font-bold flex-1', selected ? 'text-brand-red' : 'text-white/70')}>{label}</p>
    </button>
  );
}

// ─── WorkoutDoneScreen ─────────────────────────────────────────────────────

export function WorkoutDoneScreen({ session, onContinue }: { session: WorkoutSession; onContinue: () => void }) {
  const durationSec = session.duration ?? 0;
  const mins = Math.floor(durationSec / 60);
  const secs = durationSec % 60;
  const durationLabel = `${String(mins).padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const allWeights = session.exercises.flatMap(ex =>
    ex.sets.filter(s => s.completed && s.weight > 0).map(s => s.weight)
  );
  const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : 0;

  return (
    <div className="h-screen flex flex-col items-center justify-between py-16 px-8 overflow-hidden bg-dark-surface">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <div className="w-36 h-36 rounded-full bg-dark-card flex items-center justify-center">
          <span className="text-7xl select-none">🏆</span>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold red-text-gradient">Treino concluído!</h1>
          <p className="text-white/40 text-base">Você superou seus limites hoje.</p>
        </div>
        <div className="flex gap-3 w-full mt-2">
          <div className="w-0 flex-1 bg-dark-card border border-dark-border rounded-2xl p-4 flex flex-col items-center gap-2">
            <p className="text-sm font-bold text-white/70 uppercase tracking-widest">XP</p>
            <span className="text-2xl leading-none">⚡</span>
            <p className="text-lg font-semibold text-white/70">{session.xpEarned}</p>
          </div>
          <div className="w-0 flex-1 bg-dark-card border border-dark-border rounded-2xl p-4 flex flex-col items-center gap-2">
            <p className="text-sm font-bold text-white/70 uppercase tracking-widest">Peso</p>
            <span className="text-2xl leading-none">💪</span>
            <p className="text-lg font-semibold text-white/70">{maxWeight} KG</p>
          </div>
          <div className="w-0 flex-1 bg-dark-card border border-dark-border rounded-2xl p-4 flex flex-col items-center gap-2">
            <p className="text-sm font-bold text-white/70 uppercase tracking-widest">Tempo</p>
            <span className="text-2xl leading-none">⏱️</span>
            <p className="text-lg font-semibold text-white/70">{durationLabel}</p>
          </div>
        </div>
      </div>
      <button
        onClick={onContinue}
        className="w-full py-4 red-gradient rounded-2xl text-black font-black text-sm uppercase tracking-widest shadow-[0_4px_0_0_rgba(150,10,10,0.6)] active:scale-95 transition-all"
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
        <img src="/shapinho.png" alt="Shapinho" className="w-32 h-32 object-contain" />
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
            <SportCard key={o.id} selected={(answers.sports ?? []).includes(o.id)} onClick={() => toggleSport(o.id)} icon={o.icon} label={o.id} />
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
            <OptionCard key={o.id} selected={answers.source === o.id} onClick={() => set('source', o.id)} icon={o.icon} label={o.id} />
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
            <GoalCard key={g.value} selected={answers.weeklyGoal === g.value} onClick={() => set('weeklyGoal', g.value)} label={g.label} intensity={g.intensity} emoji={g.emoji} />
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
      const maxDate = `${today.getFullYear() - 18}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const minDate = `${today.getFullYear() - 90}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const inputRef = { current: null as HTMLInputElement | null };

      return (
        <div className="flex flex-col items-center gap-3 w-full" onClick={() => (inputRef.current as any)?.showPicker?.()}>
          <input
            ref={inputRef}
            type="date"
            value={answers.birthDate || ''}
            min={minDate}
            max={maxDate}
            onKeyDown={e => e.preventDefault()}
            onChange={e => { set('birthDate', e.target.value || undefined); setBirthDateError(null); }}
            className={`w-full bg-dark-card border-2 border-dark-border rounded-2xl py-4 px-4 text-center font-bold outline-none focus:border-brand-red [color-scheme:dark] ${answers.birthDate ? 'text-white' : 'text-white/30'}`}
          />
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
              className="w-full py-4 text-base font-bold text-white/40 uppercase tracking-widest active:bg-white/5 transition-colors"
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
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <img src="/shapinho.png" alt="Shapinho" className="w-32 h-32 object-contain" />
          </div>
          {/* Bubble anchored above the icon */}
          <div className="absolute left-0 right-0" style={{ bottom: 'calc(50% + 56px + 32px)' }}>
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
          <div className="flex items-center gap-3 mb-5 shrink-0">
            <img src="/shapinho.png" alt="Shapinho" className="w-16 h-16 shrink-0 object-contain" />
            <div className="relative bg-dark-card border border-dark-border rounded-2xl px-4 py-3 flex-1">
              <p className="text-white text-base leading-snug">{question!.balloon(answers)}</p>
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
