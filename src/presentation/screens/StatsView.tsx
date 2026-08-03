import { useMemo, useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { STORAGE_KEYS } from '../../shared/lib/storageKeys';
import { WorkoutSession, WorkoutTemplate, UserProfile } from '../../domain/entities';
import { EXERCISES } from '@/src/domain/entities/exercises';
import { BarChart3 } from 'lucide-react';
import iconMusculacao    from '@/src/assets/icons/icon-musculacao.svg';
import iconHalterofilismo from '@/src/assets/icons/icon-halterofilismo.svg';
import iconCorrida       from '@/src/assets/icons/icon-corrida.svg';
import iconCiclismo      from '@/src/assets/icons/icon-ciclismo.svg';
import iconNatacao       from '@/src/assets/icons/icon-natacao.svg';
import iconCrossfit      from '@/src/assets/icons/icon-crossfit.svg';
import iconTriatlo       from '@/src/assets/icons/icon-triatlo.svg';
import iconYoga          from '@/src/assets/icons/icon-yoga.svg';

const SPORT_ICONS: Record<string, string> = {
  'Musculação':     iconMusculacao,
  'Halterofilismo': iconHalterofilismo,
  'Corrida':        iconCorrida,
  'Ciclismo':       iconCiclismo,
  'Natação':        iconNatacao,
  'Crossfit':       iconCrossfit,
  'Triatlo':        iconTriatlo,
  'Yoga':           iconYoga,
};

const SPORT_COLORS: Record<string, string> = {
  'Musculação':     '#dc2626',
  'Crossfit':       '#ea580c',
  'Corrida':        '#ca8a04',
  'Yoga':           '#16a34a',
  'Natação':        '#2563eb',
  'Ciclismo':       '#0891b2',
  'Halterofilismo': '#7c3aed',
  'Triatlo':        '#db2777',
};

// ─── Native SVG Line Chart ─────────────────────────────────────────────────────

interface LineChartPoint {
  /** ISO date string (yyyy-MM-dd) */
  isoDate: string;
  value: number;
}

interface MiniLineChartProps {
  data: LineChartPoint[];
  color: string;
  unit?: string;
  label?: string;
  activeIdx: number | null;
  onActiveChange: (idx: number | null) => void;
}

/**
 * Renders a line chart whose X axis shows only the distinct days
 * that have recorded sessions, in chronological order.
 * Up to 7 most-recent sessions are passed in from the parent.
 */
function MiniLineChart({ data, color, unit = '', label = 'Valor', activeIdx, onActiveChange }: MiniLineChartProps) {
  const W = 320;
  const H = 170;
  const PAD_LEFT   = 36;  // space for Y-axis labels
  const PAD_RIGHT  = 12;  // right border
  const PAD_TOP    = 10;
  const PAD_BOTTOM = 34;
  const POINT_PAD  = 24;  // extra inset so first/last points aren't flush with the edges

  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  // Deduplicate by isoDate, keep chronological order
  const seen = new Set<string>();
  const slots = data.filter(d => {
    if (seen.has(d.isoDate)) return false;
    seen.add(d.isoDate);
    return true;
  });

  const n = slots.length;

  // Value range
  const values = slots.map(s => s.value);
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 1;
  const mean   = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 1;

  const TICKS = 4;
  const rawSpan   = rawMax - rawMin;
  const minSpan   = Math.max(mean * 0.4, 10);
  const span      = Math.max(rawSpan, minSpan);
  const roughStep = span / (TICKS - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const niceStep  = Math.ceil(roughStep / magnitude) * magnitude;
  const mid       = (rawMin + rawMax) / 2;
  const anchor    = Math.round(mid / niceStep) * niceStep;
  const halfSpread = niceStep * Math.ceil((TICKS - 1) / 2);
  const tickStart = anchor - halfSpread;

  const yTicks = Array.from({ length: TICKS }, (_, i) => tickStart + i * niceStep);
  const yMin   = yTicks[0];
  const yMax   = yTicks[TICKS - 1];

  /** Slot index → SVG X (points inset by POINT_PAD from chart edges) */
  const toX = (i: number) => {
    const plotLeft  = PAD_LEFT + POINT_PAD;
    const plotRight = W - PAD_RIGHT - POINT_PAD;
    if (n < 2) return (plotLeft + plotRight) / 2;
    return plotLeft + (i / (n - 1)) * (plotRight - plotLeft);
  };

  /** Data value → SVG Y */
  const toY = (v: number) =>
    PAD_TOP + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const polylinePoints = slots.map((s, i) => `${toX(i)},${toY(s.value)}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      aria-label={label}
      role="img"
    >
      {/* Horizontal grid lines */}
      {yTicks.map((tick, i) => (
        <line
          key={i}
          x1={PAD_LEFT}
          y1={toY(tick)}
          x2={W - PAD_RIGHT}
          y2={toY(tick)}
          stroke="rgba(255,255,255,0.08)"
          strokeDasharray="3 3"
        />
      ))}

      {/* Y-axis labels */}
      {yTicks.map((tick, i) => (
        <text
          key={i}
          x={PAD_LEFT - 6}
          y={toY(tick) + 4}
          textAnchor="end"
          fontSize={14}
          fill="rgba(255,255,255,0.4)"
          fontFamily="inherit"
        >
          {tick}
        </text>
      ))}

      {/* X-axis labels — one per training day */}
      {slots.map((slot, i) => (
        <text
          key={slot.isoDate}
          x={toX(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize={14}
          fill="rgba(255,255,255,0.5)"
          fontFamily="inherit"
        >
          {format(parseISO(slot.isoDate), 'dd/MM')}
        </text>
      ))}

      {/* Line connecting data points */}
      {slots.length > 1 && (
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* Data point circles */}
      {slots.map((s, i) => {
        const cx = toX(i);
        const cy = toY(s.value);
        const isActive = activeIdx === i;
        return (
          <g
            key={s.isoDate}
            onClick={(e) => { e.stopPropagation(); onActiveChange(activeIdx === i ? null : i); }}
            style={{ cursor: 'pointer' }}
          >
            {/* Invisible larger hit area */}
            <circle cx={cx} cy={cy} r={16} fill="transparent" />
            <circle
              cx={cx}
              cy={cy}
              r={isActive ? 8 : 6}
              fill={color}
              stroke={isActive ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)'}
              strokeWidth={isActive ? 2 : 1}
            />
          </g>
        );
      })}

      {/* Tooltip bubble for active point */}
      {activeIdx !== null && slots[activeIdx] && (() => {
        const s  = slots[activeIdx];
        const cx = toX(activeIdx);
        const cy = toY(s.value);

        const dateLabel  = format(parseISO(s.isoDate), 'dd/MM');
        const valueLabel = `${s.value}${unit}`;
        const lineOne    = dateLabel;
        const lineTwo    = valueLabel;

        // Bubble dimensions
        const bW = 72;
        const bH = 38;
        const bR = 8;  // border radius

        // Position: above the point by default, flip below if too close to top
        const spaceAbove = cy - PAD_TOP;
        const showBelow  = spaceAbove < bH + 18;
        const rawBx = cx - bW / 2;
        const bx = Math.min(Math.max(rawBx, PAD_LEFT), W - PAD_RIGHT - bW);
        const by = showBelow ? cy + 14 : cy - bH - 14;

        // Arrow tip points to the circle centre
        const arrowX = Math.min(Math.max(cx, bx + bR + 4), bx + bW - bR - 4);

        return (
          <g style={{ pointerEvents: 'none' }}>
            {/* Drop shadow via blur filter */}
            <defs>
              <filter id="tip-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
              </filter>
            </defs>

            {/* Bubble background */}
            <rect
              x={bx}
              y={by}
              width={bW}
              height={bH}
              rx={bR}
              ry={bR}
              fill="#1e1e2e"
              stroke={color}
              strokeWidth={1.5}
              filter="url(#tip-shadow)"
            />

            {/* Arrow — points toward the circle */}
            {showBelow ? (
              // Arrow on top of bubble (pointing up)
              <g>
                <polygon
                  points={`${arrowX - 5},${by} ${arrowX + 5},${by} ${arrowX},${by - 7}`}
                  fill="#1e1e2e"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                <line
                  x1={arrowX - 4}
                  y1={by}
                  x2={arrowX + 4}
                  y2={by}
                  stroke="#1e1e2e"
                  strokeWidth={2}
                />
              </g>
            ) : (
              // Arrow on bottom of bubble (pointing down)
              <g>
                <polygon
                  points={`${arrowX - 5},${by + bH} ${arrowX + 5},${by + bH} ${arrowX},${by + bH + 7}`}
                  fill="#1e1e2e"
                  stroke={color}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                />
                <line
                  x1={arrowX - 4}
                  y1={by + bH}
                  x2={arrowX + 4}
                  y2={by + bH}
                  stroke="#1e1e2e"
                  strokeWidth={2}
                />
              </g>
            )}

            {/* Date line */}
            <text
              x={bx + bW / 2}
              y={by + 14}
              textAnchor="middle"
              fontSize={11}
              fill="rgba(255,255,255,0.5)"
              fontFamily="inherit"
            >
              {lineOne}
            </text>

            {/* Value line */}
            <text
              x={bx + bW / 2}
              y={by + 28}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fill="rgba(255,255,255,0.95)"
              fontFamily="inherit"
            >
              {lineTwo}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function StatsHeader({ sport }: { sport: string }) {
  const color = SPORT_COLORS[sport] ?? '#7c3aed';
  const icon  = SPORT_ICONS[sport];

  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 60);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 60);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 60);
  const darker = `rgb(${r},${g},${b})`;

  return (
    <div
      className="relative overflow-hidden -mx-6 mb-6"
      style={{ background: `linear-gradient(135deg, ${darker} 0%, ${color} 60%, ${color}cc 100%)` }}
    >
      <div className="px-6 pt-10 pb-8 flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white leading-tight">Estatísticas</h1>
          <p className="text-white/70 text-sm font-semibold">{sport}</p>
        </div>
        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
          {icon
            ? <img src={icon} alt={sport} className="w-9 h-9 brightness-0 invert" />
            : <BarChart3 size={36} className="text-white" />}
        </div>
      </div>
      {/* decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-black uppercase tracking-[0.15em] text-white/60 mb-3">
      {children}
    </p>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StatsViewProps {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  mainUserProfile?: UserProfile;
  onGoToWorkouts?: () => void;
  hideHeader?: boolean;
  readOnly?: boolean;
  /** Currently active sport (from global nav state). Used to filter sessions for stats. */
  activeSport?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the sport name for a session by looking up the template. */
function getSportForSession(session: WorkoutSession, templates: WorkoutTemplate[]): string {
  const t = templates.find(t => t.id === session.workoutId);
  if (!t) return session.workoutName?.toLowerCase().includes('corrida') ? 'Corrida' : 'Musculação';
  if (t.sport) return t.sport;
  const known = ['Musculação', 'Crossfit', 'Corrida', 'Yoga', 'Natação', 'Ciclismo', 'Halterofilismo', 'Triatlo'];
  return known.find(s => t.name.toLowerCase().includes(s.toLowerCase())) ?? 'Musculação';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function StatsView({
  sessions,
  templates,
  mainUserProfile,
  onGoToWorkouts,
  hideHeader,
  readOnly,
  activeSport: activeSportProp,
}: StatsViewProps) {
  // Shared tooltip state — only one point across both charts can be active at a time
  const [avgActiveIdx,  setAvgActiveIdx]  = useState<number | null>(null);
  const [volActiveIdx,  setVolActiveIdx]  = useState<number | null>(null);

  const handleAvgActive  = (idx: number | null) => { setAvgActiveIdx(idx); if (idx !== null) setVolActiveIdx(null); };
  const handleVolActive  = (idx: number | null) => { setVolActiveIdx(idx); if (idx !== null) setAvgActiveIdx(null); };

  // Dismiss any open tooltip when clicking anywhere on the page
  useEffect(() => {
    const dismiss = () => { setAvgActiveIdx(null); setVolActiveIdx(null); };
    document.addEventListener('click', dismiss);
    return () => document.removeEventListener('click', dismiss);
  }, []);

  // Resolve sport: prefer global activeSport, then profile specialties, then guest answers.
  const sport = useMemo(() => {
    if (activeSportProp) return activeSportProp;
    if (mainUserProfile?.specialties?.length) return mainUserProfile.specialties[0];
    try {
      const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null');
      if (wa?.sports?.length) return wa.sports[0] as string;
    } catch {}
    return 'Musculação';
  }, [activeSportProp, mainUserProfile]);

  // Filter sessions to only the active sport for all stat calculations.
  const filteredSessions = useMemo(
    () => sessions.filter(s => getSportForSession(s, templates) === sport),
    [sessions, templates, sport],
  );

  const chartData = useMemo(
    () =>
      [...filteredSessions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)
        .reverse()
        .map(s => ({ isoDate: format(parseISO(s.date), 'yyyy-MM-dd'), value: s.totalVolume })),
    [filteredSessions],
  );

  const avgWeightData = useMemo(
    () =>
      [...filteredSessions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7)
        .reverse()
        .map(s => {
          const sets = s.exercises.flatMap(ex => ex.sets.filter(set => set.completed && set.weight > 0));
          const avg = sets.length > 0
            ? Math.round(sets.reduce((acc, set) => acc + set.weight, 0) / sets.length)
            : 0;
          return { isoDate: format(parseISO(s.date), 'yyyy-MM-dd'), value: avg };
        }),
    [filteredSessions],
  );

  const muscleData = useMemo(() => {
    const counts: Record<string, number> = {
      Peito: 0, Costas: 0, Pernas: 0, Ombros: 0, Braços: 0, Core: 0, 'Full Body': 0,
    };
    let total = 0;
    filteredSessions.forEach(s => {
      s.exercises.forEach(ex => {
        const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
        if (exercise) { counts[exercise.muscleGroup]++; total++; }
      });
    });
    if (total === 0) return Object.entries(counts).map(([name]) => ({ name, value: 0 }));
    return Object.entries(counts)
      .map(([name, count]) => ({ name, value: Math.round((count / total) * 100) }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [filteredSessions]);

  const totalVolume = useMemo(
    () => filteredSessions.reduce((acc, s) => acc + (s.totalVolume ?? 0), 0),
    [filteredSessions],
  );

  const avgDuration = useMemo(() => {
    const withDuration = filteredSessions.filter(s => s.duration && s.duration > 0);
    if (withDuration.length === 0) return 0;
    return Math.round(withDuration.reduce((acc, s) => acc + (s.duration ?? 0), 0) / withDuration.length);
  }, [filteredSessions]);

  // Keep these in scope to avoid unused-variable warnings — they may be used in future stat cards.
  void totalVolume;
  void avgDuration;

  // ── Empty state ────────────────────────────────────────────────────────────

  if (filteredSessions.length === 0) {
    return (
      <div className="pb-24">
        {!hideHeader && <StatsHeader sport={sport} />}

        <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${SPORT_COLORS[sport] ?? '#E53E3E'}cc, ${SPORT_COLORS[sport] ?? '#E05C2A'})` }} />
          <div className="px-6 py-12 flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <img src={iconHalterofilismo} alt="" className="w-10 h-10 brightness-0 invert opacity-20" />
            </div>
            <div className="space-y-2">
              <p className="text-white/50 font-black text-base">Sem dados para exibir</p>
              <p className="text-sm text-white/30 font-semibold">
                Complete seu primeiro treino para ver as suas estatísticas
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const accentColor = SPORT_COLORS[sport] ?? '#ea580c';
  const accentGradient = `linear-gradient(90deg, ${accentColor}cc, ${accentColor})`;

  // ── With data ──────────────────────────────────────────────────────────────

  return (
    <div className="pb-24">
      {!hideHeader && <StatsHeader sport={sport} />}

      <div className="space-y-6">
        {/* Avg weight chart */}
        <div>
          <SectionLabel>Média de Peso por Sessão (kg)</SectionLabel>
          <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: accentGradient }} />
            <div className="p-4 h-56">
              <MiniLineChart
                data={avgWeightData}
                color={accentColor}
                unit=" kg"
                label="Média de Peso por Sessão"
                activeIdx={avgActiveIdx}
                onActiveChange={handleAvgActive}
              />
            </div>
          </div>
        </div>

        {/* Volume chart */}
        <div>
          <SectionLabel>Volume por Sessão (kg)</SectionLabel>
          <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: accentGradient }} />
            <div className="p-4 h-56">
              <MiniLineChart
                data={chartData}
                color={accentColor}
                unit=" kg"
                label="Volume por Sessão"
                activeIdx={volActiveIdx}
                onActiveChange={handleVolActive}
              />
            </div>
          </div>
        </div>

        {/* Muscle frequency */}
        <div>
          <SectionLabel>Frequência Muscular</SectionLabel>
          <div className="bg-dark-card border border-dark-border rounded-3xl overflow-hidden">
            <div className="h-1 w-full" style={{ background: accentGradient }} />
            <div className="p-4 space-y-4">
              {muscleData.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-white/70">{item.name}</span>
                    <span className="text-[10px] font-bold text-white/30">{item.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-dark-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.value}%`,
                        background: accentGradient,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
