import { useEffect, useRef } from "react";
import { db } from "../../firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { syncState } from "./useAuthState";
import { DEFAULT_PROFILE, DEFAULT_STATS } from "./useProfileState";
import type {
  UserProfile, UserStats, WorkoutTemplate,
  WorkoutSession, TrainerConnection, Student,
} from "../../domain/entities";

interface SyncSetters {
  setUserProfile: (p: UserProfile) => void;
  setUserStats: (s: UserStats) => void;
  setTemplates: (t: WorkoutTemplate[]) => void;
  setSessions: (s: WorkoutSession[]) => void;
  setTrainers: (t: UserProfile[]) => void;
  setTrainerConnections: (c: TrainerConnection[]) => void;
  setStudentConnections: (c: TrainerConnection[]) => void;
  setStudents: (s: Student[]) => void;
}

const buildStudentFromConnections = async (
  accepted: TrainerConnection[],
): Promise<Student[]> => {
  return Promise.all(
    accepted.map(async (conn) => {
      const sEmailL = conn.studentEmail.toLowerCase();
      let userData: UserProfile | null = null;
      try {
        const snap = await getDocs(query(collection(db, "users"), where("email", "==", sEmailL)));
        if (!snap.empty) {
          userData = snap.docs[0].data() as UserProfile;
        } else {
          const d = await getDoc(doc(db, "users", sEmailL));
          if (d.exists()) userData = d.data() as UserProfile;
        }
      } catch (e) {}

      let lastWorkout = "";
      const weeklyWorkouts = [0, 0, 0, 0, 0, 0, 0];
      try {
        const sessSnap = await getDocs(query(collection(db, "sessions"), where("userId", "==", sEmailL)));
        if (!sessSnap.empty) {
          const sorted = sessSnap.docs
            .map((d) => d.data() as WorkoutSession)
            .sort((a, b) => b.date.localeCompare(a.date));
          lastWorkout = sorted[0].date;
          const now = new Date();
          sessSnap.docs.forEach((d) => {
            const s = d.data() as WorkoutSession;
            try {
              const sessionDate = new Date(s.date);
              const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / 86400000);
              if (diffDays >= 0 && diffDays < 7) {
                const jsDay = sessionDate.getDay();
                weeklyWorkouts[jsDay === 0 ? 6 : jsDay - 1] = 1;
              }
            } catch (e) {}
          });
        }
      } catch (e) {}

      return {
        id: userData?.email || sEmailL,
        name: userData?.name || sEmailL.split("@")[0],
        email: userData?.email || sEmailL,
        avatarUrl: userData?.avatarUrl || "https://picsum.photos/400",
        objective: userData?.objective,
        experienceLevel: userData?.experienceLevel,
        lastWorkout,
        progress: 50,
        streak: 0,
        status: "new" as const,
        weeklyWorkouts,
        score: 0,
        connectionStatus: "accepted" as const,
      } as Student;
    }),
  );
};

export const useSyncState = (
  isLoggedIn: boolean,
  token: string | null,
  setters: SyncSetters,
) => {
  const syncRan = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    // Prevent double-invoke in React Strict Mode
    if (syncState.syncedToken === token) return;
    syncState.syncedToken = token;

    const emailLower = token.toLowerCase();
    const {
      setUserProfile, setUserStats, setTemplates, setSessions,
      setTrainers, setTrainerConnections, setStudentConnections, setStudents,
    } = setters;

    const syncAll = async () => {
      // Reset all user-owned React state before populating from Firestore.
      // This prevents guest data from flashing in the UI while the async
      // Firestore reads are still in flight.
      setUserProfile(DEFAULT_PROFILE);
      setUserStats(DEFAULT_STATS);
      setTemplates([]);
      setSessions([]);
      setTrainers([]);
      setTrainerConnections([]);
      setStudentConnections([]);
      setStudents([]);

      try {
        let profile: UserProfile | null = null;
        try {
          const docSnap = await getDoc(doc(db, "users", emailLower));
          if (docSnap.exists()) {
            profile = docSnap.data() as UserProfile;
          } else {
            const snap = await getDocs(query(collection(db, "users"), where("email", "==", emailLower)));
            if (!snap.empty) profile = snap.docs[0].data() as UserProfile;
          }
          if (profile) setUserProfile(profile);
        } catch (e) {}

        await Promise.all([
          getDoc(doc(db, "stats", emailLower)).then((snap) => {
            if (snap.exists()) setUserStats(snap.data() as UserStats);
          }).catch(() => {}),
          getDocs(query(collection(db, "templates"), where("userId", "==", emailLower))).then((snap) => {
            setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate)));
          }).catch(() => {}),
          getDocs(query(collection(db, "sessions"), where("userId", "==", emailLower))).then((snap) => {
            const remoteSessions = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutSession));
            const localSessions: WorkoutSession[] = (() => { try { return JSON.parse(localStorage.getItem("local_sessions") ?? "[]"); } catch { return []; } })();
            const remoteIds = new Set(remoteSessions.map((s) => s.id));
            const onlyLocal = localSessions.filter((s) => !remoteIds.has(s.id));
            setSessions([...remoteSessions, ...onlyLocal]);
            if (onlyLocal.length === 0) localStorage.removeItem("local_sessions");
          }).catch(() => {}),
          getDocs(query(collection(db, "users"), where("userType", "==", "treinador"))).then((snap) => {
            if (!snap.empty) setTrainers(snap.docs.map((d) => d.data() as UserProfile));
          }).catch(() => {}),
        ]);

        if (profile?.userType === "treinador") {
          const connSnap = await getDocs(
            query(collection(db, "connections"), where("trainerEmail", "==", emailLower)),
          );
          const allConns = connSnap.docs.map((d) => d.data() as TrainerConnection);
          setTrainerConnections(allConns);
          const accepted = allConns.filter((c) => c.status === "accepted");
          if (accepted.length === 0) {
            setStudents([]);
          } else {
            setStudents(await buildStudentFromConnections(accepted));
          }
        } else {
          try {
            const snap = await getDocs(
              query(collection(db, "connections"), where("studentEmail", "==", emailLower)),
            );
            setStudentConnections(snap.docs.map((d) => d.data() as TrainerConnection));
          } catch (e) {}
        }
      } catch (e) {}
    };

    syncAll();

    return () => { syncRan.current = null; };
  }, [isLoggedIn, token]);

};
