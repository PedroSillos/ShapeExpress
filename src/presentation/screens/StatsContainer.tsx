import { WorkoutSession, WorkoutTemplate, UserProfile } from '../../domain/entities';
import { StatsView } from './StatsView';

interface StatsContainerProps {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  mainUserProfile?: UserProfile;
  onGoToWorkouts?: () => void;
  readOnly?: boolean;
}

export function StatsContainer({
  sessions,
  templates,
  mainUserProfile,
  onGoToWorkouts,
  readOnly = false,
}: StatsContainerProps) {
  return (
    <StatsView
      sessions={sessions}
      templates={templates}
      mainUserProfile={mainUserProfile}
      onGoToWorkouts={onGoToWorkouts}
      readOnly={readOnly}
    />
  );
}
