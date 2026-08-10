import { useEffect, useRef, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { syncState } from "./useAuthState";
import { DEFAULT_PROFILE, DEFAULT_STATS } from "./useProfileState";
import { STORAGE_KEYS } from "../../shared/lib/storageKeys";
import type {
  UserProfile, UserStats, WorkoutTemplate,
  WorkoutSession, TrainerConnection, Student,
} from "../../domain/entities";
import { fullName } from "../../domain/entities";

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
        name: userData ? fullName(userData) : sEmailL.split("@")[0],
        email: userData?.email || sEmailL,
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
): { dataReady: boolean } => {
  const syncRan = useRef<string | null>(null);
  // dataReady starts false and is set to true once we know the user's data
  // is ready to display. We cannot initialise it from isLoggedIn here because
  // isLoggedIn is always false on the very first render (Firebase Auth hasn't
  // resolved yet). The useEffect below handles both the guest and logged-in cases.
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      // Not logged in yet — do not set dataReady here. authReady (from
      // useAuthState) is still false at this point, so the splash guard in
      // App.tsx (!authReady) keeps the splash visible regardless of dataReady.
      // When the user IS confirmed as a guest (authReady=true, isLoggedIn=false)
      // the App.tsx guard condition `isLoggedIn && !dataReady` is false anyway,
      // so dataReady doesn't matter for guests.
      return;
    }
    // Prevent double-invoke in React Strict Mode
    if (syncState.syncedToken === token) return;
    syncState.syncedToken = token;

    const emailLower = token.toLowerCase();
    const {
      setUserProfile, setUserStats, setTemplates, setSessions,
      setTrainers, setTrainerConnections, setStudentConnections, setStudents,
    } = setters;

    const syncAll = async () => {
      try {
        // ── 1. Fetch everything from Firestore without touching React state ──
        let profile: UserProfile | null = null;
        let stats: UserStats | null = null;
        let templates: WorkoutTemplate[] = [];
        let sessions: WorkoutSession[] = [];
        let trainers: UserProfile[] = [];
        let trainerConnections: TrainerConnection[] = [];
        let studentConnections: TrainerConnection[] = [];
        let students: Student[] = [];

        // Profile
        try {
          const docSnap = await getDoc(doc(db, "users", emailLower));
          if (docSnap.exists()) {
            profile = docSnap.data() as UserProfile;
          } else {
            const snap = await getDocs(query(collection(db, "users"), where("email", "==", emailLower)));
            if (!snap.empty) profile = snap.docs[0].data() as UserProfile;
          }
        } catch (e) {}

        // Stats, templates, sessions, trainers — all in parallel
        await Promise.all([
          getDoc(doc(db, "stats", emailLower)).then((snap) => {
            if (snap.exists()) stats = snap.data() as UserStats;
          }).catch(() => {}),
          getDocs(query(collection(db, "templates"), where("userId", "==", emailLower))).then((snap) => {
            templates = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate));
          }).catch(() => {}),
          getDocs(query(collection(db, "sessions"), where("userId", "==", emailLower))).then((snap) => {
            const remoteSessions = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutSession));
            const localSessions: WorkoutSession[] = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_SESSIONS) ?? "[]"); } catch { return []; } })();
            const remoteIds = new Set(remoteSessions.map((s) => s.id));
            const onlyLocal = localSessions.filter((s) => !remoteIds.has(s.id));
            sessions = [...remoteSessions, ...onlyLocal];
            if (onlyLocal.length === 0) localStorage.removeItem(STORAGE_KEYS.LOCAL_SESSIONS);
          }).catch(() => {}),
          getDocs(query(collection(db, "users"), where("userType", "==", "treinador"))).then((snap) => {
            if (!snap.empty) {
              trainers = snap.docs.map((d) => d.data() as UserProfile);
            }
          }).catch((e) => {
            console.error('❌ [useSyncState] Error loading trainers:', e);
          }),
        ]);

        // Connections (depends on profile type)
        if (profile?.userType === "treinador") {
          try {
            const connSnap = await getDocs(
              query(collection(db, "connections"), where("trainerEmail", "==", emailLower)),
            );
            trainerConnections = connSnap.docs.map((d) => d.data() as TrainerConnection);
            const accepted = trainerConnections.filter((c) => c.status === "accepted");
            if (accepted.length > 0) {
              students = await buildStudentFromConnections(accepted);
            }
          } catch (e) {}
        } else {
          try {
            const snap = await getDocs(
              query(collection(db, "connections"), where("studentEmail", "==", emailLower)),
            );
            studentConnections = snap.docs.map((d) => d.data() as TrainerConnection);
          } catch (e) {}
        }

        // ── 2. Apply ALL state updates synchronously in one block ──
        // React 18 automatic batching guarantees these all land in a single
        // re-render, so the UI goes from splash directly to a fully-populated
        // screen with no blank-data intermediate frame.
        setUserProfile(profile ?? DEFAULT_PROFILE);
        setUserStats(stats ?? DEFAULT_STATS);
        setTemplates(templates);
        setSessions(sessions);
        setTrainers(trainers);
        setTrainerConnections(trainerConnections);
        setStudentConnections(studentConnections);
        setStudents(students);
        setDataReady(true);
      } catch (e) {
        // On unexpected error, unblock UI so user isn't stuck on splash.
        setDataReady(true);
      }
    };

    syncAll();

    return () => {
      syncRan.current = null;
      // Reset so StrictMode's unmount→remount cycle doesn't skip the sync
      // on the second mount. In production this cleanup never runs for the
      // initial mount so there is no performance cost.
      syncState.syncedToken = null;
    };
  }, [isLoggedIn, token]);

  return { dataReady };
};
