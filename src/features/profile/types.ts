export interface ProfileStats {
  streak: number;
  totalWorkouts: number;
  xp: number;
  level: number;
}

export interface ProfileAchievement {
  id: string;
  label: string;
  count: number;
  color: string;
}
