import { WorkoutSession, WorkoutTemplate, UserProfile } from '../../domain/entities';
import { StatsView } from './StatsView';

interface StatsContainerProps {
  sessions: WorkoutSession[];
  templates: WorkoutTemplate[];
  mainUserProfile?: UserProfile;
  onGoToWorkouts?: () => void;
  readOnly?: boolean;
  /** Currently active sport (from global nav state). Used to filter stats. */
  activeSport?: string;
}

export function StatsContainer({
  sessions,
  templates,
  mainUserProfile,
  onGoToWorkouts,
  readOnly = false,
  activeSport,
}: StatsContainerProps) {
  return (
    <StatsView
      sessions={sessions}
      templates={templates}
      mainUserProfile={mainUserProfile}
      onGoToWorkouts={onGoToWorkouts}
      readOnly={readOnly}
      activeSport={activeSport}
    />
  );
}
