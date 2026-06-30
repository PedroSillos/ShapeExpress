import iconFlame from '@/src/assets/icons/icon-flame.svg';
import iconShare from '@/src/assets/icons/icon-share.svg';
import { cn } from '../../../utils/cn';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function OnboardingStreakScreen({ onContinue }: { onContinue: () => void }) {
  const today = new Date().getDay();

  const orderedDays = [...Array(7)].map((_, i) => {
    const idx = (today + i) % 7;
    return { label: DAYS[idx], isToday: i === 0 };
  });

  return (
    <div className="h-screen flex flex-col items-center justify-between py-16 px-8 overflow-hidden bg-dark-surface">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        <div className="w-36 h-36 rounded-full flex items-center justify-center p-5" style={{ background: '#E53E3E' }}>
          <img src={iconFlame} alt="Ofensiva" className="w-full h-full object-contain brightness-0 invert" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold red-text-gradient">1 dia de ofensiva</h1>
          <p className="text-white/40 text-[17px]">Treine todos os dias pra criar o hábito.</p>
        </div>
        <div className="flex w-full justify-between mt-2">
          {orderedDays.map(({ label, isToday }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <p className={cn('text-xs font-black', isToday ? 'text-brand-red' : 'text-white/30')}>{label}</p>
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', isToday ? 'bg-brand-red' : 'bg-dark-card border border-dark-border')}>
                {isToday && <span className="text-white text-base font-black">✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full flex gap-3">
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'Shape Express', text: 'Comecei minha ofensiva no Shape Express! 🔥 #ShapeExpress' }).catch(() => {});
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
