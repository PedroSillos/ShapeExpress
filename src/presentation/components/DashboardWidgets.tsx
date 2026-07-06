import { Flame, TrendingUp, Trophy, ChevronRight, Quote, Zap, Target, UserPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { cn } from '../../utils/cn';
import {
  UserStats,
  UserCalorieProfile,
  ProgressScore,
  UserProfile,
} from '../../domain/entities';

// --- StatsWidget ---
export function StatsWidget({ userStats, weeklyVolume }: { userStats: UserStats; weeklyVolume: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="flex flex-col gap-1 justify-between min-h-[100px]">
        <div className="flex items-center gap-2 text-[#E53E3E]">
          <Flame size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Streak</span>
        </div>
        <div className="space-y-0.5">
          <p className="text-3xl font-display font-bold">{userStats.streak}</p>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Dias seguidos</p>
        </div>
      </Card>
      <Card className="flex flex-col gap-1 justify-between min-h-[100px]">
        <div className="flex items-center gap-2 text-blue-400">
          <TrendingUp size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Volume Semana</span>
        </div>
        <div className="space-y-0.5">
          <p className="text-3xl font-display font-bold">{(weeklyVolume / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Toneladas (kg)</p>
        </div>
      </Card>
    </div>
  );
}

// --- CaloriesWidget ---
export function CaloriesWidget({ calorieProfile }: { calorieProfile: UserCalorieProfile }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-orange-400">
          <Flame size={18} />
          <h3 className="font-bold">Calorias Queimadas</h3>
        </div>
        <span className="text-xs font-bold text-orange-400">
          {Math.round(calorieProfile.total_calories_burned).toLocaleString()} kcal
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Média por Treino</p>
          <p className="text-xl font-display font-bold">
            {Math.round(calorieProfile.avg_workout_calories)}{' '}
            <span className="text-[10px] font-sans text-white/40">kcal</span>
          </p>
        </div>
        <div>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Total de Treinos</p>
          <p className="text-xl font-display font-bold">{calorieProfile.total_workouts}</p>
        </div>
      </div>
    </Card>
  );
}

// --- ProgressScoreWidget ---
export function ProgressScoreWidget({ progressScore }: { progressScore: ProgressScore }) {
  return (
    <Card className="relative overflow-hidden group">
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2',
          progressScore.classification === 'progresso'
            ? 'bg-brand-red/20'
            : progressScore.score >= 76
            ? 'bg-brand-red'
            : progressScore.score >= 51
            ? 'bg-blue-500'
            : progressScore.score >= 31
            ? 'bg-orange-500'
            : 'bg-red-500',
        )}
      />
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-brand-red" />
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Score de Progresso</span>
          </div>
          <h3 className="text-2xl font-display font-bold capitalize">{progressScore.classification}</h3>
          <p className="text-xs text-white/40 font-medium max-w-[200px]">{progressScore.message}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-display font-bold red-text-gradient">{progressScore.score}</div>
          <div
            className={cn(
              'text-[10px] font-bold uppercase tracking-widest flex items-center justify-end gap-1',
              progressScore.trend === 'subindo'
                ? 'text-brand-red'
                : progressScore.trend === 'descendo'
                ? 'text-red-400'
                : 'text-white/40',
            )}
          >
            {progressScore.trend === 'subindo' ? (
              <TrendingUp size={10} />
            ) : progressScore.trend === 'descendo' ? (
              <TrendingUp size={10} className="rotate-180" />
            ) : null}
            {progressScore.trend}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
        {[
          { label: 'Carga', value: progressScore.factors.loadProgression },
          { label: 'Reps', value: progressScore.factors.repsProgression },
          { label: 'Volume', value: progressScore.factors.trainingVolume },
          { label: 'Foco', value: progressScore.factors.consistency },
        ].map(f => (
          <div key={f.label} className="text-center">
            <p className="text-[8px] text-white/20 font-bold uppercase mb-1">{f.label}</p>
            <p className="text-xs font-bold">{f.value}%</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

// --- AiCoachWidget ---
export function AiCoachWidget({ aiAdvice, isAiLoading }: { aiAdvice: string | null; isAiLoading: boolean }) {
  return (
    <Card className="relative overflow-hidden border-brand-red/30 bg-brand-red/5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full red-gradient flex items-center justify-center">
          <Zap size={16} color="currentColor" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Coach IA</h3>
          <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Conselho Personalizado</p>
        </div>
      </div>
      {isAiLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-white/10 rounded w-full" />
          <div className="h-3 bg-white/10 rounded w-5/6" />
          <div className="h-3 bg-white/10 rounded w-4/6" />
        </div>
      ) : (
        <div className="text-xs text-white/80 leading-relaxed italic prose prose-invert prose-p:leading-relaxed">
          <ReactMarkdown>{aiAdvice || ''}</ReactMarkdown>
        </div>
      )}
    </Card>
  );
}

// --- HireCoachWidget ---
export function HireCoachWidget({ onPress }: { onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red group-hover:bg-brand-red/20 transition-colors">
          <UserPlus size={24} />
        </div>
        <div className="text-left">
          <h3 className="font-bold">Contrate um Treinador</h3>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Acelere seus resultados</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-white/20 group-hover:text-brand-red transition-colors" />
    </button>
  );
}

// --- MotivationWidget ---
export function MotivationWidget() {
  return (
    <Card className="bg-gradient-to-br from-brand-red/20 to-orange-500/10 border-brand-red/20 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-red/10 rounded-full blur-2xl group-hover:bg-brand-red/20 transition-colors" />
      <div className="relative z-10 flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-red/20 flex items-center justify-center text-brand-red shrink-0">
          <Quote size={24} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-brand-red font-bold uppercase tracking-widest">Motivação do Dia</p>
          <p className="text-sm font-medium italic leading-relaxed">
            "A disciplina é a ponte entre metas e realizações. Hoje é o dia de construir mais um degrau."
          </p>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">— Jim Rohn</p>
        </div>
      </div>
    </Card>
  );
}

// --- PersonalRecordsWidget ---
export function PersonalRecordsWidget({ records }: { records: { weight: number; date: string; name: string }[] }) {
  if (records.length === 0) return null;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Recordes Pessoais</h3>
        <button className="text-[10px] font-bold uppercase tracking-widest text-brand-red">Ver Todos</button>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {records.map((pr, idx) => (
          <Card key={idx} className="flex items-center justify-between p-4 bg-white/5 border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                <Trophy size={20} />
              </div>
              <div>
                <p className="text-xs font-bold">{pr.name}</p>
                <p className="text-[10px] text-white/40 font-bold uppercase">
                  {format(parseISO(pr.date), 'dd MMM', { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-display font-bold text-yellow-400">
                {pr.weight} <span className="text-[10px] font-sans text-white/40">kg</span>
              </p>
              <p className="text-[10px] text-white/40 font-bold uppercase">Carga Máxima</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// --- WeeklyGoalWidget ---
export function WeeklyGoalWidget({ completed, goal }: { completed: number; goal: number }) {
  return (
    <Card className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-brand-red" />
          <h3 className="font-bold">Meta Semanal</h3>
        </div>
        <span className="text-xs font-bold text-brand-red">
          {completed} / {goal} Fichas
        </span>
      </div>
      <ProgressBar progress={completed} max={goal} />
      <p className="text-xs text-white/40 font-medium">
        {completed >= goal ? 'Meta Concluída!' : `Faltam ${goal - completed} fichas para bater a meta.`}
      </p>
    </Card>
  );
}

