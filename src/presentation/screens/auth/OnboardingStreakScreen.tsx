import { cn } from '../../../utils/cn';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function OnboardingStreakScreen({ onContinue }: { onContinue: () => void }) {
  const today = new Date().getDay(); // 0=Sun … 6=Sat

  // Reorder so today is first
  const orderedDays = [...Array(7)].map((_, i) => {
    const idx = (today + i) % 7;
    return { label: DAYS[idx], isToday: i === 0 };
  });

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Speech bubble */}
      <div className="relative bg-[#1c2630] border border-white/10 rounded-2xl px-5 py-4 mb-0">
        <p className="text-white text-lg leading-snug">
          Sua ofensiva começou! Treine todos os dias pra criar o hábito.
        </p>
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-[10px] w-0 h-0"
          style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '10px solid #1c2630' }}
        />
      </div>

      {/* Mascot + flame */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        <div className="relative flex items-end justify-center mb-2">
          {/* Flame shape */}
          <div className="text-[120px] leading-none select-none">🔥</div>
          {/* Mascot overlay */}
          <div className="absolute bottom-2 text-[56px] select-none">⚡</div>
        </div>

        {/* Streak number */}
        <p className="text-[96px] font-black leading-none text-orange-400 select-none">1</p>
        <p className="text-2xl font-black text-orange-400">dia de ofensiva</p>

        {/* Week strip */}
        <div className="flex gap-3 mt-6 items-start">
          {orderedDays.map(({ label, isToday }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <p className={cn('text-xs font-black', isToday ? 'text-orange-400' : 'text-white/30')}>
                {label}
              </p>
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                isToday ? 'bg-orange-400' : 'bg-white/10'
              )}>
                {isToday && <span className="text-white text-base font-black">✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 shrink-0">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Shape Express', text: 'Comecei minha ofensiva no Shape Express! 🔥 #ShapeExpress' }).catch(() => {});
            }
          }}
          className="w-14 h-14 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center text-white/60 active:scale-95 transition-transform shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
          </svg>
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest red-gradient text-black shadow-[0_4px_0_0_rgba(150,10,10,0.6)] active:scale-95 transition-all"
        >
          Vou me dedicar
        </button>
      </div>
    </div>
  );
}
