import { useState, useMemo, useEffect } from 'react';
import { startOfWeek, parseISO } from 'date-fns';
import {
  UserStats,
  WorkoutSession,
  WorkoutTemplate,
  UserTrainingProfile,
  ExerciseUserStats,
  UserCalorieProfile,
  BodyAssessment,
  UserProfile,
  ProgressScore,
} from '../../domain/entities';
import {
  StatsWidget,
  CaloriesWidget,
  ProgressScoreWidget,
  AiCoachWidget,
  HireCoachWidget,
  MotivationWidget,
  CommunityWidget,
  PersonalRecordsWidget,
  WeeklyGoalWidget,
  LastAchievementWidget,
} from '../components/DashboardWidgets';
import { NextWorkoutWidget } from '../components/NextWorkoutWidget';

interface DashboardViewProps {
  userStats: UserStats;
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  onStartWorkout: () => void;
  onViewAchievements: () => void;
  userProfile: UserTrainingProfile;
  exerciseStats: ExerciseUserStats[];
  calorieProfile: UserCalorieProfile;
  assessments: BodyAssessment[];
  mainUserProfile: UserProfile;
  progressScore: ProgressScore | null;
  aiAdvice: string | null;
  isAiLoading: boolean;
  switchTab: (tab: string) => void;
  personalRecords: { weight: number; date: string; name: string }[];
  studentConnections?: any[];
  trainers?: UserProfile[];
}

const DEFAULT_WIDGETS = [
  { id: 'stats', visible: true },
  { id: 'next-workout', visible: true },
  { id: 'calories', visible: true },
  { id: 'progress-score', visible: true },
  { id: 'ai-coach', visible: true },
  { id: 'hire-coach', visible: true },
  { id: 'motivation', visible: true },
  { id: 'community', visible: true },
  { id: 'records', visible: true },
  { id: 'weekly-goal', visible: true },
  { id: 'last-achievement', visible: true },
];

function loadWidgets() {
  try {
    const saved = localStorage.getItem('app-dashboard-widgets');
    if (!saved) return DEFAULT_WIDGETS;
    const parsed = JSON.parse(saved);
    const merged = DEFAULT_WIDGETS.map(dw => {
      const found = parsed.find((pw: any) => pw.id === dw.id);
      return found ? { ...dw, visible: found.visible } : dw;
    });
    merged.sort((a, b) => {
      const ia = parsed.findIndex((pw: any) => pw.id === a.id);
      const ib = parsed.findIndex((pw: any) => pw.id === b.id);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return merged;
  } catch {
    return DEFAULT_WIDGETS;
  }
}

export function DashboardView({
  userStats,
  sessions,
  templates,
  onStartWorkout,
  onViewAchievements,
  userProfile,
  exerciseStats,
  calorieProfile,
  assessments,
  mainUserProfile,
  progressScore,
  aiAdvice,
  isAiLoading,
  switchTab,
  personalRecords,
  studentConnections = [],
  trainers = [],
}: DashboardViewProps) {
  const [widgets, setWidgets] = useState(loadWidgets);

  useEffect(() => {
    const handler = () => setWidgets(loadWidgets());
    window.addEventListener('dashboard-widgets-updated', handler);
    return () => window.removeEventListener('dashboard-widgets-updated', handler);
  }, []);

  const weeklyVolume = useMemo(
    () => sessions.slice(0, 5).reduce((acc, s) => acc + s.totalVolume, 0),
    [sessions],
  );

  const completedThisWeek = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return sessions.filter(s => parseISO(s.date) >= weekStart).length;
  }, [sessions]);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'stats':
        return <StatsWidget key="stats" userStats={userStats} weeklyVolume={weeklyVolume} />;
      case 'next-workout':
        return (
          <NextWorkoutWidget
            key="next-workout"
            templates={templates}
            sessions={sessions}
            onStartWorkout={onStartWorkout}
            userProfile={userProfile}
            exerciseStats={exerciseStats}
            calorieProfile={calorieProfile}
            assessments={assessments}
            mainUserProfile={mainUserProfile}
            trainers={trainers}
          />
        );
      case 'calories':
        return <CaloriesWidget key="calories" calorieProfile={calorieProfile} />;
      case 'progress-score':
        if (!progressScore || sessions.length === 0) return null;
        return <ProgressScoreWidget key="progress-score" progressScore={progressScore} />;
      case 'ai-coach':
        if (!aiAdvice && !isAiLoading) return null;
        return <AiCoachWidget key="ai-coach" aiAdvice={aiAdvice} isAiLoading={isAiLoading} />;
      case 'hire-coach':
        if (!(mainUserProfile?.userType === 'atleta' && studentConnections.length === 0)) return null;
        return <HireCoachWidget key="hire-coach" onPress={() => switchTab('trainers')} />;
      case 'motivation':
        return <MotivationWidget key="motivation" />;
      case 'community':
        return <CommunityWidget key="community" onPress={() => switchTab('leaderboard')} />;
      case 'records':
        return <PersonalRecordsWidget key="records" records={personalRecords} />;
      case 'weekly-goal':
        return <WeeklyGoalWidget key="weekly-goal" completed={completedThisWeek} goal={userStats.weeklyGoal} />;
      case 'last-achievement':
        return <LastAchievementWidget key="last-achievement" onPress={onViewAchievements} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {widgets.filter(w => w.visible).map(w => renderWidget(w.id))}
    </div>
  );
}
