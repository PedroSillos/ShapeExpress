import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';

type Segment = { text: string; bold?: boolean };

const STEPS: Segment[][] = [
  [{ text: 'Bem-vindo ao ' }, { text: 'Shape Express!', bold: true }],
  [{ text: 'Só ' }, { text: '8 perguntas rápidas', bold: true }, { text: ' e depois vamos para o seu primeiro treino!' }],
];

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
        if (c >= fullText.length) {
          clearInterval(ref.current!);
          setDone(true);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => clearInterval(ref.current!);
  }, [fullText]);

  const skipToEnd = () => {
    clearInterval(ref.current!);
    setCount(fullText.length);
    setDone(true);
  };

  return { count, done, skipToEnd };
}

interface WelcomeViewProps {
  onBack: () => void;
  onContinue: () => void;
}

export function WelcomeView({ onBack, onContinue }: WelcomeViewProps) {
  const [step, setStep] = useState(0);
  const { count, done, skipToEnd } = useTypewriter(STEPS[step]);

  const handleContinue = () => {
    if (!done) { skipToEnd(); return; }
    if (step < STEPS.length - 1) setStep(step + 1);
    else onContinue();
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else onBack();
  };

  // Render each char as a span — visible or invisible — to keep layout stable
  let charIndex = 0;
  const content = STEPS[step].map((seg, si) => {
    const chars = seg.text.split('').map((ch, ci) => {
      const visible = charIndex < count;
      charIndex++;
      return (
        <span key={`${si}-${ci}`} className={visible ? undefined : 'opacity-0'}>
          {ch}
        </span>
      );
    });
    return seg.bold
      ? <strong key={si}>{chars}</strong>
      : <span key={si}>{chars}</span>;
  });

  return (
    <div className="min-h-screen flex flex-col px-6 py-6">
      <button onClick={handleBack} className="self-start p-1 text-white/60 active:scale-95 transition-transform">
        <ArrowLeft size={24} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative inline-block bg-dark-card border border-dark-border rounded-2xl px-5 py-4 mb-3 max-w-xs">
          <p className="text-white text-lg leading-snug">
            {content}
          </p>
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-[10px] w-0 h-0"
            style={{
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #2a2a2a',
            }}
          />
        </div>

        <span className="text-7xl select-none mt-2">⚡</span>
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-4 red-gradient rounded-2xl text-black font-bold text-sm uppercase tracking-widest active:scale-95 transition-transform"
      >
        Continuar
      </button>
    </div>
  );
}
