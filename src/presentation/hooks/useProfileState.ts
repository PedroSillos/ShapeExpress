import { useState } from "react";
import { toast } from "sonner";
import { db } from "../../firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import type {
  UserProfile,
  UserStats,
  UserTrainingProfile,
  UserCalorieProfile,
  ExerciseUserStats,
  BodyAssessment,
} from "../../domain/entities";
import { STORAGE_KEYS } from "../../shared/lib/storageKeys";

export const DEFAULT_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  userType: "atleta",
  height: 180,
  initialWeight: 80,
  objective: "Manutenção",
  birthDate: "2000-01-01",
  personalCodeConnected: undefined,
  weeklyGoal: 3,
};

export const DEFAULT_STATS: UserStats = {
  level: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  completedThisWeek: 0,
  totalWorkouts: 0,
  totalVolume: 0,
  medalsCount: 0,
};

export const DEFAULT_TRAINING_PROFILE: UserTrainingProfile = {
  user_id: "1",
  avg_set_duration: 30,
  avg_rest_duration: 60,
  avg_transition_duration: 45,
  avg_workout_duration: 45 * 60,
};

export const DEFAULT_CALORIE_PROFILE: UserCalorieProfile = {
  user_id: "1",
  avg_calories_per_minute: 5,
  avg_workout_calories: 300,
  total_workouts: 0,
  total_calories_burned: 0,
};

function loadLocal<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}

function saveLocal<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const LOCAL_STATS_KEY = STORAGE_KEYS.LOCAL_STATS;
const LOCAL_TRAINING_PROFILE_KEY = STORAGE_KEYS.LOCAL_TRAINING_PROFILE;
const LOCAL_CALORIE_PROFILE_KEY = STORAGE_KEYS.LOCAL_CALORIE_PROFILE;
const LOCAL_EXERCISE_STATS_KEY = STORAGE_KEYS.LOCAL_EXERCISE_STATS;

function getGuestDefaultStats(): UserStats {
  return DEFAULT_STATS;
}

function getGuestDefaultProfile(): UserProfile {
  try {
    const wa = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null');
    if (wa?.weeklyGoal) return { ...DEFAULT_PROFILE, weeklyGoal: wa.weeklyGoal };
  } catch {}
  return DEFAULT_PROFILE;
}

export const useProfileState = (currentUser: { email: string } | null) => {
  const isGuest = !currentUser;

  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    isGuest ? loadLocal(STORAGE_KEYS.LOCAL_USER_PROFILE, getGuestDefaultProfile()) : DEFAULT_PROFILE
  );
  const [userStats, setUserStats] = useState<UserStats>(() =>
    isGuest ? loadLocal(LOCAL_STATS_KEY, getGuestDefaultStats()) : DEFAULT_STATS
  );
  const [userTrainingProfile, setUserTrainingProfile] = useState<UserTrainingProfile>(() =>
    isGuest ? loadLocal(LOCAL_TRAINING_PROFILE_KEY, DEFAULT_TRAINING_PROFILE) : DEFAULT_TRAINING_PROFILE
  );
  const [userCalorieProfile, setUserCalorieProfile] = useState<UserCalorieProfile>(() =>
    isGuest ? loadLocal(LOCAL_CALORIE_PROFILE_KEY, DEFAULT_CALORIE_PROFILE) : DEFAULT_CALORIE_PROFILE
  );
  const [exerciseUserStats, setExerciseUserStats] = useState<ExerciseUserStats[]>(() =>
    isGuest ? loadLocal(LOCAL_EXERCISE_STATS_KEY, []) : []
  );
  const [assessments, setAssessments] = useState<BodyAssessment[]>([]);

  const setUserStatsAndPersist = (s: UserStats) => {
    if (!currentUser) saveLocal(LOCAL_STATS_KEY, s);
    setUserStats(s);
  };

  const setUserTrainingProfileAndPersist = (p: UserTrainingProfile) => {
    if (!currentUser) saveLocal(LOCAL_TRAINING_PROFILE_KEY, p);
    setUserTrainingProfile(p);
  };

  const setUserCalorieProfileAndPersist = (p: UserCalorieProfile) => {
    if (!currentUser) saveLocal(LOCAL_CALORIE_PROFILE_KEY, p);
    setUserCalorieProfile(p);
  };

  const setExerciseUserStatsAndPersist = (s: ExerciseUserStats[]) => {
    if (!currentUser) saveLocal(LOCAL_EXERCISE_STATS_KEY, s);
    setExerciseUserStats(s);
  };

  const getProfile = async () => {
    const email = currentUser?.email;
    if (!email) return null;
    try {
      const emailLower = email.toLowerCase();
      let docSnap = await getDoc(doc(db, "users", email));
      if (!docSnap.exists()) docSnap = await getDoc(doc(db, "users", emailLower));
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
        return docSnap.data();
      }
      const q = query(collection(db, "users"), where("email", "==", emailLower));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data() as UserProfile;
        setUserProfile(data);
        return data;
      }
    } catch (e) {}
    return null;
  };

  const updateProfile = async (p: UserProfile) => {
    // Guest: persist to localStorage only
    if (!currentUser?.email) {
      saveLocal(STORAGE_KEYS.LOCAL_USER_PROFILE, p);
      setUserProfile(p);
      return;
    }
    // Logged-in: persist to Firestore
    try {
      await setDoc(doc(db, "users", currentUser.email), p, { merge: true });
      setUserProfile(p);
      toast.success("Perfil atualizado!");
    } catch (e: any) {
      toast.error("Erro ao atualizar perfil: " + e.message);
    }
  };

  const getStats = async () => {
    if (!currentUser?.email) return null;
    try {
      const docSnap = await getDoc(doc(db, "stats", currentUser.email));
      if (docSnap.exists()) {
        setUserStats(docSnap.data() as UserStats);
        return docSnap.data();
      }
    } catch (e) {}
    return null;
  };

  const updateStats = async (s: UserStats) => {
    if (!currentUser?.email) { setUserStatsAndPersist(s); return; }
    try {
      await setDoc(doc(db, "stats", currentUser.email), s, { merge: true });
      setUserStats(s);
    } catch (e) {}
  };

  const resetProfileStates = () => {
    localStorage.removeItem(LOCAL_STATS_KEY);
    localStorage.removeItem(LOCAL_TRAINING_PROFILE_KEY);
    localStorage.removeItem(LOCAL_CALORIE_PROFILE_KEY);
    localStorage.removeItem(LOCAL_EXERCISE_STATS_KEY);
    localStorage.removeItem(STORAGE_KEYS.LOCAL_USER_PROFILE);
    setUserProfile(DEFAULT_PROFILE);
    setUserStats(DEFAULT_STATS);
    setUserTrainingProfile(DEFAULT_TRAINING_PROFILE);
    setUserCalorieProfile(DEFAULT_CALORIE_PROFILE);
    setExerciseUserStats([]);
    setAssessments([]);
  };

  return {
    userProfile, setUserProfile,
    userStats,
    setUserStats: setUserStatsAndPersist,
    userTrainingProfile,
    setUserTrainingProfile: setUserTrainingProfileAndPersist,
    userCalorieProfile,
    setUserCalorieProfile: setUserCalorieProfileAndPersist,
    exerciseUserStats,
    setExerciseUserStats: setExerciseUserStatsAndPersist,
    assessments, setAssessments,
    getProfile, updateProfile,
    getStats, updateStats,
    resetProfileStates,
  };
};
