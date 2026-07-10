import { ChevronLeft, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface SubscriptionViewProps {
  onBack: () => void;
}

interface PlanFeature {
  text: string;
}

interface Plan {
  id: string;
  name: string;
  features: PlanFeature[];
  ctaLabel: string;
  ctaColor: string;
  /** Emoji or illustration element rendered on the right side of the card */
  illustration: React.ReactNode;
  /** Optional promotional banner text shown above the card */
  promoBanner?: string;
}

/** Check-mark row used inside each plan card. */
function FeatureRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <Check size={16} className="text-sky-400 flex-shrink-0" strokeWidth={3} />
      <span className="text-white/80 text-[15px]">{text}</span>
    </div>
  );
}

/** Super plan illustration — infinity badge style */
function SuperIllustration() {
  return (
    <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
      <div className="relative w-18 h-18">
        {/* Outer glow ring */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
          {/* Inner badge */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-700 flex items-center justify-center">
            <span className="text-white text-2xl font-black">∞</span>
          </div>
        </div>
        {/* Lightning bolts */}
        <span className="absolute -top-1 -right-1 text-yellow-400 text-sm">⚡</span>
        <span className="absolute -bottom-1 -left-1 text-yellow-400 text-xs">⚡</span>
      </div>
    </div>
  );
}

/** Family plan illustration — avatar stack style */
function FamilyIllustration({ accent = '#6366f1' }: { accent?: string }) {
  return (
    <div className="w-20 h-20 flex-shrink-0 flex items-end justify-center gap-[-8px]">
      {/* Avatar 1 */}
      <div className="relative w-12 h-12 rounded-full border-2 border-dark-surface overflow-hidden z-10" style={{ background: '#f59e0b' }}>
        <div className="w-full h-full flex items-center justify-center text-lg">👩</div>
      </div>
      {/* Avatar 2 offset */}
      <div className="relative w-10 h-10 rounded-full border-2 border-dark-surface overflow-hidden -ml-3 mb-1" style={{ background: accent }}>
        <div className="w-full h-full flex items-center justify-center text-base">👤</div>
      </div>
      {/* +4 badge */}
      <div
        className="relative w-9 h-9 rounded-full border-2 border-dark-surface flex items-center justify-center -ml-2 mb-0.5 text-white text-xs font-bold"
        style={{ background: accent }}
      >
        +4
      </div>
    </div>
  );
}

/** Max plan illustration — video spark style */
function MaxIllustration() {
  return (
    <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center shadow-lg shadow-purple-700/40 relative">
        {/* Sparkle */}
        <span className="absolute top-1.5 left-2 text-white text-sm">✦</span>
        {/* Play icon */}
        <div className="flex items-center gap-1">
          <span className="text-white text-2xl">✦</span>
          <span className="text-purple-300 text-3xl ml-1">▶</span>
        </div>
      </div>
    </div>
  );
}

const PLANS: Plan[] = [
  {
    id: 'super',
    name: 'Super',
    features: [
      { text: 'Energia ilimitada' },
      { text: 'Sem anúncios' },
    ],
    ctaLabel: 'EXPERIMENTE 1 MÊS POR R$0',
    ctaColor: 'text-sky-400',
    illustration: <SuperIllustration />,
    promoBanner: 'OFERTA VÁLIDA ATÉ 16 JUL 2026',
  },
  {
    id: 'super-family',
    name: 'Super Família',
    features: [
      { text: 'Energia ilimitada' },
      { text: 'Sem anúncios' },
      { text: 'Até 6 membros' },
      { text: 'Economize até 76% em relação ao Super' },
    ],
    ctaLabel: 'OBTER SUPER FAMÍLIA',
    ctaColor: 'text-sky-400',
    illustration: <FamilyIllustration accent="#3b82f6" />,
  },
  {
    id: 'max',
    name: 'Max',
    features: [
      { text: 'Energia ilimitada' },
      { text: 'Sem anúncios' },
      { text: 'Coach por Videochamada' },
    ],
    ctaLabel: 'OBTER MAX',
    ctaColor: 'text-purple-400',
    illustration: <MaxIllustration />,
  },
  {
    id: 'max-family',
    name: 'Max Família',
    features: [
      { text: 'Energia ilimitada' },
      { text: 'Sem anúncios' },
      { text: 'Coach por Videochamada' },
      { text: 'Até 6 membros' },
      { text: 'Economize até 76% em relação ao Max' },
    ],
    ctaLabel: 'OBTER MAX FAMÍLIA',
    ctaColor: 'text-purple-400',
    illustration: <FamilyIllustration accent="#7c3aed" />,
  },
];

/** Single plan card matching the reference design. */
function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.07 }}
      className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden"
    >
      {/* Promo banner */}
      {plan.promoBanner && (
        <div
          className="px-4 py-2.5"
          style={{
            background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)',
          }}
        >
          <span className="text-white font-extrabold text-sm tracking-widest uppercase">
            {plan.promoBanner}
          </span>
        </div>
      )}

      {/* Card body */}
      <div className="px-4 pt-4 pb-4">
        {/* Plan name + illustration */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-white font-bold text-xl">{plan.name}</h2>
          {plan.illustration}
        </div>

        {/* Feature list */}
        <div className="flex flex-col gap-2 mb-5">
          {plan.features.map((f) => (
            <FeatureRow key={f.text} text={f.text} />
          ))}
        </div>

        {/* CTA button */}
        <button
          className="w-full py-3.5 border border-dark-border rounded-xl transition-colors hover:bg-white/5 active:bg-white/10"
          aria-label={plan.ctaLabel}
        >
          <span className={`font-extrabold text-sm tracking-widest ${plan.ctaColor}`}>
            {plan.ctaLabel}
          </span>
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Subscription plans screen.
 * Shows Super, Super Família, Max and Max Família plans.
 * Triggered from the "Escolher um plano" button in SettingsView.
 */
export function SubscriptionView({ onBack }: SubscriptionViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      className="h-full bg-dark-surface flex flex-col"
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
        <h1 className="text-white/60 text-base font-semibold tracking-wide">Escolher um plano</h1>
        <div className="w-10" /> {/* spacer */}
      </div>

      {/* ── Scrollable plan list ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-10">
        {PLANS.map((plan, idx) => (
          <PlanCard key={plan.id} plan={plan} index={idx} />
        ))}
      </div>
    </motion.div>
  );
}
