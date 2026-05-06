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

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  email: "",
  userType: "atleta",
  height: 180,
  initialWeight: 80,
  objective: "Manutenção",
  birthDate: "2000-01-01",
  avatarUrl: "https://picsum.photos/seed/user/400",
  hasPersonal: false,
  personalCodeConnected: undefined,
};

export const DEFAULT_STATS: UserStats = {
  level: 1,
  xp: 0,
  streak: 0,
  bestStreak: 0,
  weeklyGoal: 3,
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

export const useProfileState = (currentUser: { email: string } | null) => {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [userTrainingProfile, setUserTrainingProfile] = useState<UserTrainingProfile>(DEFAULT_TRAINING_PROFILE);
  const [userCalorieProfile, setUserCalorieProfile] = useState<UserCalorieProfile>(DEFAULT_CALORIE_PROFILE);
  const [exerciseUserStats, setExerciseUserStats] = useState<ExerciseUserStats[]>([]);
  const [assessments, setAssessments] = useState<BodyAssessment[]>([]);

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
    if (!currentUser?.email) return;
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
    if (!currentUser?.email) return;
    try {
      await setDoc(doc(db, "stats", currentUser.email), s, { merge: true });
      setUserStats(s);
    } catch (e) {}
  };

  const resetProfileStates = () => {
    setUserProfile(DEFAULT_PROFILE);
    setUserStats(DEFAULT_STATS);
    setUserTrainingProfile(DEFAULT_TRAINING_PROFILE);
    setUserCalorieProfile(DEFAULT_CALORIE_PROFILE);
    setExerciseUserStats([]);
    setAssessments([]);
  };

  return {
    userProfile, setUserProfile,
    userStats, setUserStats,
    userTrainingProfile, setUserTrainingProfile,
    userCalorieProfile, setUserCalorieProfile,
    exerciseUserStats, setExerciseUserStats,
    assessments, setAssessments,
    getProfile, updateProfile,
    getStats, updateStats,
    resetProfileStates,
  };
};
