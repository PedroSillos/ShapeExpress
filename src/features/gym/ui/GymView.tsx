import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import shapinho from '/shapinho.png';
import { motion } from 'motion/react';

interface GymViewProps {
  onBack: () => void;
}

const CODE_LENGTH = 6;
const EMPTY_CODE = Array(CODE_LENGTH).fill('');

/**
 * "Shape Express para academias" screen.
 * Users enter a 6-character code (alphanumeric) shared by the gym manager or
 * personal trainer. Inspired by the Duolingo for Schools "Join a Classroom" flow.
 */
export function GymView({ onBack }: GymViewProps) {
  const [code, setCode] = useState<string[]>(EMPTY_CODE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(CODE_LENGTH).fill(null));

  const isFilled = code.every((c) => c !== '');

  /** Normalise to uppercase alphanumeric; return empty string for anything else. */
  function sanitise(char: string): string {
    const upper = char.toUpperCase();
    return /^[A-Z0-9]$/.test(upper) ? upper : '';
  }

  function handleChange(index: number, value: string) {
    const char = sanitise(value.slice(-1)); // take only the last character typed
    if (char === '' && value !== '') return; // invalid character — ignore

    const next = [...code];
    next[index] = char;
    setCode(next);
    setError(null);

    if (char !== '' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (code[index] !== '') {
        // Clear current slot
        const next = [...code];
        next[index] = '';
        setCode(next);
      } else if (index > 0) {
        // Move to previous slot and clear it
        const next = [...code];
        next[index - 1] = '';
        setCode(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  /** Support pasting a full code at once. */
  function handlePaste(index: number, e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const chars = pasted
      .split('')
      .map(sanitise)
      .filter((c) => c !== '')
      .slice(0, CODE_LENGTH - index);

    if (chars.length === 0) return;

    const next = [...code];
    chars.forEach((c, i) => {
      next[index + i] = c;
    });
    setCode(next);
    setError(null);

    const nextFocus = Math.min(index + chars.length, CODE_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();
  }

  async function handleSubmit() {
    if (!isFilled || loading) return;
    setLoading(true);
    setError(null);

    try {
      // TODO: integrate with backend endpoint to validate the gym code
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const gymCode = code.join('');
      // Placeholder validation — backend will return 404 for unknown codes
      if (gymCode === 'DEMO01') {
        setSuccess(true);
      } else {
        setError('Código inválido ou expirado. Verifique com o responsável da academia.');
      }
    } catch {
      setError('Não foi possível verificar o código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.2 }}
        className="min-h-screen bg-dark-surface flex flex-col"
      >
        <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-dark-border">
          <button
            aria-label="Voltar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
            onClick={onBack}
          >
            <ChevronLeft size={22} className="text-sky-400" />
          </button>
          <h1 className="text-white/60 text-base font-semibold tracking-wide">
            Shape Express para academias
          </h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
          <div className="w-24 h-24 rounded-full bg-sky-400/20 flex items-center justify-center overflow-hidden">
            <img src={shapinho} alt="Shapinho" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-white font-black text-2xl text-center">Academia vinculada!</h2>
          <p className="text-white/50 text-base text-center leading-relaxed">
            Você entrou na academia com sucesso. Seu personal poderá acompanhar seu progresso e
            enviar treinos personalizados.
          </p>
          <button
            onClick={onBack}
            className="w-full py-4 bg-sky-400 rounded-2xl text-dark-surface font-black text-sm tracking-widest uppercase hover:opacity-90 active:opacity-80 transition-opacity"
          >
            Continuar
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Main join screen ───────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-dark-surface flex flex-col"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-dark-border">
        <button
          aria-label="Voltar"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft size={22} className="text-sky-400" />
        </button>
        <h1 className="text-white/60 text-base font-semibold tracking-wide">
          Shape Express para academias
        </h1>
        <div className="w-10" />
      </div>

      {/* ── Hero banner ── */}
      <div className="w-full h-52 bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center flex-shrink-0">
        <img
          src={shapinho}
          alt="Shapinho"
          className="h-32 object-contain drop-shadow-lg brightness-0 invert"
        />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-6 pt-7 pb-10 flex flex-col gap-6">
        {/* Title + description */}
        <div className="flex flex-col gap-3">
          <h2 className="text-white font-black text-2xl leading-tight">
            Entrar em uma academia
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Insira o código compartilhado pelo seu personal ou gerente! Isso permite que a academia
            acompanhe seu progresso e envie treinos personalizados.
          </p>
        </div>

        {/* ── 6-digit code input ── */}
        <div className="flex gap-2 justify-between" role="group" aria-label="Código da academia">
          {code.map((char, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="text"
              maxLength={2}
              value={char}
              aria-label={`Dígito ${index + 1} de ${CODE_LENGTH}`}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => handlePaste(index, e)}
              onFocus={(e) => e.target.select()}
              className={[
                'w-11 h-12 rounded-xl text-center text-white font-black text-lg',
                'bg-dark-card border-2 transition-colors outline-none',
                'focus:border-sky-400',
                char !== '' ? 'border-sky-400/60' : 'border-dark-border',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm text-center leading-relaxed"
          >
            {error}
          </motion.p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!isFilled || loading}
          className={[
            'w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase transition-all',
            isFilled && !loading
              ? 'bg-sky-400 text-dark-surface hover:opacity-90 active:opacity-80'
              : 'bg-sky-400/30 text-sky-400/40 cursor-not-allowed',
          ].join(' ')}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              Verificando...
            </span>
          ) : (
            'Entrar'
          )}
        </button>

        {/* Helper note */}
        <p className="text-white/30 text-xs text-center leading-relaxed">
          Não tem um código? Peça ao responsável da sua academia.
        </p>
      </div>
    </motion.div>
  );
}
