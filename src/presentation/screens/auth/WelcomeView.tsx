import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Dumbbell, Flame, Zap, Heart, Trophy } from 'lucide-react';
import { cn } from '../../../utils/cn';

type Segment = { text: string; bold?: boolean };

const INTRO_STEPS: Segment[][] = [
  [{ text: 'Bem-vindo ao ' }, { text: 'Shape Express!', bold: true }],
  [{ text: 'Só ' }, { text: '8 perguntas rápidas', bold: true }, { text: ' e depois vamos para o seu primeiro treino!' }],
];

const OBJECTIVES = [
  { id: 'Ganhar massa muscular', icon: <Dumbbell className="text-brand-red" /> },
  { id: 'Emagrecer', icon: <Flame className="text-orange-500" /> },
  { id: 'Melhorar condicionamento', icon: <Zap className="text-yellow-400" /> },
  { id: 'Saúde e mobilidade', icon: <Heart className="text-emerald-400" /> },
  { id: 'Aumento de força', icon: <Trophy className="text-blue-400" /> },
];

const TOTAL_QUESTIONS = 8;

function useTypewriter(segments: Segment[], speed = 30) {
  const fullText = segments.reduce((acc, s) => acc + s.text, '');
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCount(0);
    setDone(false);
    ref.current = setInterval(() => {
      setCount(c => {
        if (c >= fullText.length) { clearInterval(ref.current!); setDone(true); return c; }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(ref.current!);
  }, [fullText]);

  const skipToEnd = () => { clearInterval(ref.current!); setCount(fullText.length); setDone(true); };
  return { count, done, skipToEnd };
}

interface WelcomeViewProps {
  onBack: () => void;
  onContinue: () => void;
}

export function WelcomeView({ onBack, onContinue }: WelcomeViewProps) {
  const [introStep, setIntroStep] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(-1); // -1 = still in intro
  const [objective, setObjective] = useState<string | null>(null);
  const { count, done, skipToEnd } = useTypewriter(INTRO_STEPS[introStep]);

  const inIntro = questionIndex === -1;

  const handleContinue = () => {
    if (inIntro) {
      if (!done) { skipToEnd(); return; }
      if (introStep < INTRO_STEPS.length - 1) { setIntroStep(introStep + 1); return; }
      setQuestionIndex(0);
      return;
    }
    // question phase — for now only question 0 (objective)
    if (questionIndex === 0 && objective) onContinue();
  };

  const handleBack = () => onBack();

  // Intro animated content
  let charIndex = 0;
  const introContent = INTRO_STEPS[introStep].map((seg, si) => {
    const chars = seg.text.split('').map((ch, ci) => {
      const visible = charIndex < count;
      charIndex++;
      return <span key={`${si}-${ci}`} className={visible ? undefined : 'opacity-0'}>{ch}</span>;
    });
    return seg.bold ? <strong key={si}>{chars}</strong> : <span key={si}>{chars}</span>;
  });

  return (
    <div className="h-screen flex flex-col py-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleBack} className="p-1 text-white/60 active:scale-95 transition-transform shrink-0">
          <ArrowLeft size={24} />
        </button>
        {!inIntro && (
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-red rounded-full transition-all duration-500"
              style={{ width: `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
        )}
      </div>

      {inIntro ? (
        /* Intro phase */
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative mb-3" style={{ display: 'inline-grid' }}>
            <p className="text-lg leading-snug px-5 py-4 opacity-0 pointer-events-none select-none" style={{ gridArea: '1/1' }}>
              {INTRO_STEPS[introStep].map((seg, si) =>
                seg.bold ? <strong key={si}>{seg.text}</strong> : <span key={si}>{seg.text}</span>
              )}
            </p>
            <div className="absolute inset-0 bg-dark-card border border-dark-border rounded-2xl" />
            <p className="text-white text-lg leading-snug px-5 py-4" style={{ gridArea: '1/1', position: 'relative' }}>
              {introContent}
            </p>
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-[10px] w-0 h-0"
              style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '10px solid #2a2a2a' }}
            />
          </div>
          <span className="text-7xl select-none mt-2">⚡</span>
        </div>
      ) : (
        /* Question phase */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mascot + balloon */}
          <div className="flex items-start gap-3 mb-6">
            <span className="text-5xl select-none shrink-0">⚡</span>
            <div className="relative bg-dark-card border border-dark-border rounded-2xl px-4 py-3">
              <p className="text-white text-base leading-snug">Qual o seu objetivo principal?</p>
              <div
                className="absolute left-[-10px] top-4 w-0 h-0"
                style={{ borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderRight: '10px solid #2a2a2a' }}
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
            {OBJECTIVES.map(obj => (
              <button
                key={obj.id}
                onClick={() => setObjective(obj.id)}
                className={cn(
                  'w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left',
                  objective === obj.id ? 'border-brand-red bg-brand-red/10' : 'border-dark-border bg-white/5'
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">{obj.icon}</div>
                <span className={cn('text-sm font-bold', objective === obj.id ? 'text-white' : 'text-white/60')}>{obj.id}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!inIntro && !objective}
        className={cn(
          'w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest active:scale-95 transition-all mt-4',
          !inIntro && !objective
            ? 'bg-dark-card text-white/40 pointer-events-none'
            : 'red-gradient text-black'
        )}
      >
        Continuar
      </button>
    </div>
  );
}
