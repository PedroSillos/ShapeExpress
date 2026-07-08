/**
 * Central registry of every localStorage key used in the application.
 *
 * Keeping all keys in one place prevents typo-induced silent bugs (wrong key
 * → null instead of an error) and makes it easy to audit what data is
 * persisted locally and clean it up safely on logout.
 */
export const STORAGE_KEYS = {
  /** Firebase-derived auth token / user email used as a session indicator. */
  TOKEN: 'shape_express_token',

  /** Set to '1' once the onboarding workout flow has been completed. */
  WELCOME_DONE: 'welcome-done',

  /** JSON blob of answers collected during the WelcomeView onboarding flow. */
  WELCOME_ANSWERS: 'welcome-answers',

  /** Set to '1' while the app is waiting for the onboarding workout to finish. */
  ONBOARDING_PENDING: 'onboarding-workout-pending',

  /** JSON array of WorkoutTemplate objects created before the user registers. */
  PENDING_TEMPLATES: 'pending-templates',

  /** JSON array of WorkoutSession objects completed before the user registers. */
  LOCAL_SESSIONS: 'local_sessions',

  /** JSON UserStats object persisted locally for guest users. */
  LOCAL_STATS: 'local_stats',

  /** JSON UserProfile object persisted locally for guest users. */
  LOCAL_USER_PROFILE: 'local_user_profile',

  /** JSON UserTrainingProfile object persisted locally for guest users. */
  LOCAL_TRAINING_PROFILE: 'local_training_profile',

  /** JSON UserCalorieProfile object persisted locally for guest users. */
  LOCAL_CALORIE_PROFILE: 'local_calorie_profile',

  /** JSON array of ExerciseUserStats persisted locally for guest users. */
  LOCAL_EXERCISE_STATS: 'local_exercise_stats',

  /** JSON WorkoutSession representing the in-progress workout (survives page reload). */
  ACTIVE_WORKOUT: 'active-workout',

  /** The tab the user was on before navigating to an auth screen (used for back navigation). */
  PREVIOUS_TAB: 'previous-tab',

  /** Default tab to redirect to after login (trainer-configurable). */
  DEFAULT_TAB: 'app-default-tab',

  /** JSON WorkoutTemplate draft saved while editing in CreateWorkoutView. */
  WORKOUT_DRAFT: 'workout_draft',

  /** ISO timestamp of the last time the weekly goal check was run. */
  LAST_GOAL_CHECK: 'shapeexpress_last_goal_check',
} as const;

/** Union type of all valid storage key values. */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
