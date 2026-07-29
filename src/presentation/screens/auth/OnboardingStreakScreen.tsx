import iconFlame from '@/src/assets/icons/icon-flame.svg';
import iconShare from '@/src/assets/icons/icon-share.svg';
import { cn } from '../../../utils/cn';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface OnboardingStreakScreenProps {
  streak: number;
  onContinue: () => void;
}

export function OnboardingStreakScreen({ streak, onContinue }: OnboardingStreakScreenProps) {
  const todayIndex = new Date().getDay();

  // Build 7 days starting from today, then mark the last `streak` days (backwards from today) as completed
  const orderedDays = [...Array(7)].map((_, i) => {
    const dayIndex = (todayIndex + i) % 7;
    // Days 0..streak-1 counted backwards from today: position 0 = today, 1 = yesterday, etc.
    // In the forward-ordered array, today is i=0. Streak days going backwards would be:
    // today (i=0), yesterday (i=6), two days ago (i=5), etc.
    // We need to mark today and the (streak-1) days immediately before today.
    // In the forward array those are: i=0 (today), i=7-(streak-1)..i=6 for yesterday onwards.
    const isStreakDay = i === 0 || (streak > 1 && i >= 7 - (streak - 1));
    return { label: DAYS[dayIndex], isToday: i === 0, isStreakDay };
  });

  const streakLabel = streak === 1
    ? '1 dia de ofensiva'
    : `${streak} dias de ofensiva`;

  return (
    <div className="h-screen flex flex-col items-center justify-between py-16 px-8 overflow-hidden bg-dark-surface">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <div className="w-36 h-36 rounded-full flex items-center justify-center p-5" style={{ background: '#E53E3E' }}>
          <img src={iconFlame} alt="Ofensiva" className="w-full h-full object-contain brightness-0 invert" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold red-text-gradient">{streakLabel}</h1>
          <p className="text-white/40 text-[17px]">Treine todos os dias pra criar o hábito.</p>
        </div>
        <div className="flex w-full justify-between mt-2">
          {orderedDays.map(({ label, isToday, isStreakDay }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <p className={cn('text-xs font-black', isToday ? 'text-brand-red' : 'text-white/30')}>{label}</p>
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                isStreakDay ? 'bg-brand-red' : 'bg-dark-card border border-dark-border',
              )}>
                {isStreakDay && <span className="text-white text-base font-black">✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex gap-3">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Shape Express', text: `${streakLabel} no Shape Express! 🔥 #ShapeExpress` }).catch(() => {});
            }
          }}
          className="w-14 h-14 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-white/60 active:scale-95 transition-transform shrink-0"
        >
          <img src={iconShare} width={20} height={20} className="brightness-0 invert opacity-80" />
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-4 red-gradient rounded-2xl text-black font-black text-sm uppercase tracking-widest shadow-[0_4px_0_0_rgba(150,10,10,0.6)] active:scale-95 transition-all"
        >
          Vou me dedicar
        </button>
      </div>
    </div>
  );
}
