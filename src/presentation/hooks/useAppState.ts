import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { EXERCISES, WORKOUT_TEMPLATES, DEFAULT_STATS, DEFAULT_TRAINING_PROFILE } from "../../constants";
import {
  UserProfile,
  WorkoutTemplate,
  WorkoutSession,
  UserStats,
  BodyAssessment,
  UserTrainingProfile,
  ExerciseUserStats,
  UserCalorieProfile,
  ProgressionAlert,
  StagnationReport,
  ProgressScore,
  Student,
  ChatMessage,
  AppNotification,
  TrainerConnection,
  Post,
  Community,
  Challenge,
  UserChallenge,
  CommunityMessage,
  Ranking,
  CommunityMember,
  CommunityRole,
} from "../../domain/entities";

import {
  db,
  auth,
  storage,
  handleFirestoreError,
  OperationType,
} from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseErrorMessage } from "../../utils/firebaseErrors";

// Global flag to prevent auth side effects during check
let isCheckingAuthFlag = false;
// Tracks which token has already been synced to prevent Strict Mode double-invoke
let syncedToken: string | null = null;

export const useAppState = () => {
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "calendar"
    | "workouts"
    | "stats"
    | "achievements"
    | "profile"
    | "edit-profile"
    | "evolution"
    | "trainers"
    | "new-assessment"
    | "edit-assessment"
    | "create-workout"
    | "edit-workout"
    | "login"
    | "settings-goal"
    | "settings-notifications"
    | "forgot-password"
    | "register"
    | "help"
    | "express"
    | "library"
    | "students"
    | "student-workouts"
    | "student-evolution"
    | "chat"
    | "notifications"
    | "community"
    | "purchased-products"
    | "leaderboard"
  >("login");
  const [selectedStudentForWorkouts, setSelectedStudentForWorkouts] =
    useState<Student | null>(null);
  const [selectedStudentForEvolution, setSelectedStudentForEvolution] =
    useState<Student | null>(null);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<WorkoutTemplate | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(
    null,
  );
  const [editingAssessment, setEditingAssessment] =
    useState<BodyAssessment | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null,
  );
  const [scrollToHistory, setScrollToHistory] = useState(false);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(
    null,
  );
  const [lastCompletedSession, setLastCompletedSession] =
    useState<WorkoutSession | null>(null);
  const [progressionAlerts, setProgressionAlerts] = useState<
    ProgressionAlert[]
  >([]);
  const [stagnationReports, setStagnationReports] = useState<
    StagnationReport[]
  >([]);
  const [progressScore, setProgressScore] = useState<ProgressScore | null>(
    null,
  );
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [selectingSheetTemplate, setSelectingSheetTemplate] =
    useState<WorkoutTemplate | null>(null);
  const [activeChatStudent, setActiveChatStudent] = useState<Student | null>(
    null,
  );
  const [chatMessages, setChatMessages] = useState<
    Record<string, ChatMessage[]>
  >({});

  const DEFAULT_STATS: UserStats = {
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

  const DEFAULT_PROFILE: UserProfile = {
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

  const DEFAULT_TRAINING_PROFILE: UserTrainingProfile = {
    user_id: "1",
    avg_set_duration: 30,
    avg_rest_duration: 60,
    avg_transition_duration: 45,
    avg_workout_duration: 45 * 60,
  };

  const DEFAULT_CALORIE_PROFILE: UserCalorieProfile = {
    user_id: "1",
    avg_calories_per_minute: 5,
    avg_workout_calories: 300,
    total_workouts: 0,
    total_calories_burned: 0,
  };

  const [userStats, setUserStats] = useState<UserStats>(DEFAULT_STATS);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [assessments, setAssessments] = useState<BodyAssessment[]>([]);
  const [userTrainingProfile, setUserTrainingProfile] =
    useState<UserTrainingProfile>(DEFAULT_TRAINING_PROFILE);
  const [exerciseUserStats, setExerciseUserStats] = useState<
    ExerciseUserStats[]
  >([]);
  const [userCalorieProfile, setUserCalorieProfile] =
    useState<UserCalorieProfile>(DEFAULT_CALORIE_PROFILE);

  const [token, setToken] = useState<string | null>(localStorage.getItem("shape_express_token"));
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);

  const fetchWithAuth = async (
    url: string,
    options: RequestInit = {},
    retries = 3,
  ): Promise<Response> => {
    const currentToken = token || localStorage.getItem("shape_express_token");
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: currentToken ? `Bearer ${currentToken}` : "",
          ...options.headers,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Erro HTTP ${res.status}`);
      }
      return res;
    } catch (error) {
      if (
        retries > 0 &&
        error instanceof TypeError &&
        error.message === "Failed to fetch"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchWithAuth(url, options, retries - 1);
      }
      throw error;
    }
  };

  const resetUserStates = () => {
    setUserStats(DEFAULT_STATS);
    setUserProfile(DEFAULT_PROFILE);
    setSessions([]);
    setTemplates([]);
    setAssessments([]);
    setUserTrainingProfile(DEFAULT_TRAINING_PROFILE);
    setExerciseUserStats([]);
    setUserCalorieProfile(DEFAULT_CALORIE_PROFILE);
    setProgressScore(null);
    setAiAdvice(null);
    setProgressionAlerts([]);
    setStagnationReports([]);
  };

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [trainerConnections, setTrainerConnections] = useState<
    TrainerConnection[]
  >([]);
  const [studentConnections, setStudentConnections] = useState<
    TrainerConnection[]
  >([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<UserProfile[]>([]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(
    null,
  );
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [communityRanking, setCommunityRanking] = useState<Ranking[]>([]);
  const [communityMessages, setCommunityMessages] = useState<
    CommunityMessage[]
  >([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<
    Community[]
  >([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const api = useMemo(() => {
    return {
      getProfile: async () => {
        const email = currentUser?.email || token || localStorage.getItem('shape_express_token');
        if (!email) return null;
        try {
          const emailLower = email.toLowerCase();
          let docSnap = await getDoc(doc(db, 'users', email));
          if (!docSnap.exists()) docSnap = await getDoc(doc(db, 'users', emailLower));
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
            return docSnap.data();
          }
          // Fallback: query by email field
          const q = query(collection(db, 'users'), where('email', '==', emailLower));
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data() as UserProfile;
            setUserProfile(data);
            return data;
          }
        } catch (e) {}
        return null;
      },
      updateProfile: async (p: UserProfile) => {
        if (!currentUser?.email) return;
        try {
          await setDoc(doc(db, 'users', currentUser.email), p, { merge: true });
          setUserProfile(p);
          toast.success("Perfil atualizado!");
        } catch (e: any) {
          toast.error("Erro ao atualizar perfil: " + e.message);
        }
      },
      getStats: async () => {
        if (!currentUser?.email) return null;
        try {
          const docRef = doc(db, 'stats', currentUser.email);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserStats(docSnap.data() as UserStats);
            return docSnap.data();
          }
        } catch (e) {}
        return null;
      },
      updateStats: async (s: UserStats) => {
        if (!currentUser?.email) return;
        try {
          await setDoc(doc(db, 'stats', currentUser.email), s, { merge: true });
          setUserStats(s);
        } catch (e) {}
      },
      getTemplates: async () => {
        const email = currentUser?.email || token || localStorage.getItem('shape_express_token');
        if (!email) return [];
        try {
          const q = query(collection(db, 'templates'), where('userId', '==', email));
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutTemplate));
          setTemplates(data);
          return data;
        } catch (e) {
          return [];
        }
      },
      createTemplate: async (t: WorkoutTemplate) => {
        try {
          await setDoc(doc(db, 'templates', t.id), t);
          setTemplates(prev => [...prev, t]);
          toast.success("Treino criado!");
        } catch (e: any) {
          toast.error("Erro ao criar treino: " + e.message);
        }
      },
      updateTemplate: async (t: WorkoutTemplate) => {
        try {
          await setDoc(doc(db, 'templates', t.id), t);
          setTemplates(prev => prev.map(old => old.id === t.id ? t : old));
          toast.success("Treino atualizado!");
        } catch (e: any) {
          toast.error("Erro ao atualizar treino: " + e.message);
        }
      },
      deleteTemplate: async (id: string) => {
        try {
          await deleteDoc(doc(db, 'templates', id));
          setTemplates(prev => prev.filter(t => t.id !== id));
          toast.success("Treino removido.");
        } catch (e: any) {
          toast.error("Erro ao remover treino: " + e.message);
        }
      },
      getSessions: async () => {
        const email = currentUser?.email || token || localStorage.getItem('shape_express_token');
        if (!email) return [];
        try {
          const q = query(collection(db, 'sessions'), where('userId', '==', email));
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutSession));
          setSessions(data);
          return data;
        } catch (e) {
          return [];
        }
      },
      createSession: async (s: WorkoutSession) => {
        try {
          await setDoc(doc(db, 'sessions', s.id), s);
          setSessions(prev => [s, ...prev]);
          toast.success("Treino finalizado!");
        } catch (e: any) {
          toast.error("Erro ao salvar sessão: " + e.message);
        }
      },
      updateSession: async (s: WorkoutSession) => {
        try {
          await setDoc(doc(db, 'sessions', s.id), s);
          setSessions(prev => prev.map(old => old.id === s.id ? s : old));
        } catch (e: any) {
          toast.error("Erro ao atualizar sessão: " + e.message);
        }
      },
      deleteSession: async (id: string) => {
        try {
          await deleteDoc(doc(db, 'sessions', id));
          setSessions(prev => prev.filter(s => s.id !== id));
          toast.success("Sessão removida.");
        } catch (e: any) {
          toast.error("Erro ao remover sessão: " + e.message);
        }
      },
      getAssessments: async () => [],
      createAssessment: async (a: BodyAssessment) => { toast.info("Avaliação (Mock)"); },
      updateAssessment: async (a: BodyAssessment) => {},
      deleteAssessment: async (id: string) => {},
      getTrainingProfile: async () => null,
      updateTrainingProfile: async (p: UserTrainingProfile) => {},
      getExerciseStats: async () => [],
      updateExerciseStats: async (s: ExerciseUserStats[]) => {},
      getLeaderboard: async (league: string) => [],
      getTrainers: async () => {
        try {
          const q = query(collection(db, 'users'), where('userType', '==', 'treinador'));
          const querySnapshot = await getDocs(q);
          let data = querySnapshot.docs.map(doc => doc.data() as UserProfile);
          
          if (data.length === 0) {
            data = [
              {
                name: 'Pedro (Personal)',
                email: 'mock1@example.com',
                userType: 'treinador',
                height: 180,
                initialWeight: 80,
                objective: 'Hipertrofia',
                birthDate: '1990-01-01',
                avatarUrl: 'https://picsum.photos/seed/t1/400',
                hasPersonal: false,
                personalCode: 'PEDRO123',
                specialty: 'Treinamento de Força',
                rating: 5.0,
                distance: '1.2km'
              } as UserProfile,
              {
                name: 'Amanda (Coach)',
                email: 'mock2@example.com',
                userType: 'treinador',
                height: 165,
                initialWeight: 60,
                objective: 'Emagrecimento',
                birthDate: '1992-05-05',
                avatarUrl: 'https://picsum.photos/seed/t2/400',
                hasPersonal: false,
                personalCode: 'AMANDA99',
                specialty: 'Emagrecimento',
                rating: 4.9,
                distance: '2.5km'
              } as UserProfile
            ];
          }
          
          setTrainers(data);
          return data;
        } catch (e) {
          return [];
        }
      },
      getStudents: async () => {
        const email = currentUser?.email || token || localStorage.getItem('shape_express_token');
        if (!email) return [];
        try {
          const emailLower = email.toLowerCase();

          const [snapLower, snapOriginal] = await Promise.all([
            getDocs(query(collection(db, 'connections'), where('trainerEmail', '==', emailLower))),
            email !== emailLower
              ? getDocs(query(collection(db, 'connections'), where('trainerEmail', '==', email)))
              : Promise.resolve(null)
          ]);

          let allDocs = [...snapLower.docs, ...(snapOriginal?.docs || [])];

          if (allDocs.length === 0) {
            const fallbackSnap = await getDocs(
              query(collection(db, 'connections'), where('status', '==', 'accepted'))
            );
            allDocs = fallbackSnap.docs.filter(d =>
              (d.data().trainerEmail || '').toLowerCase() === emailLower
            );
          }

          const seen = new Set<string>();
          const uniqueDocs = allDocs.filter(d => { if (seen.has(d.id)) return false; seen.add(d.id); return true; });
          const acceptedConnections = uniqueDocs.map(d => d.data()).filter(data => data.status === 'accepted');

          if (acceptedConnections.length === 0) {
            setStudents([]);
            return [];
          }

          const studentEmails = acceptedConnections.map(data => data.studentEmail as string);

          const studentPromises = studentEmails.map(async (sEmail) => {
            const emailL = sEmail.toLowerCase();
            let userData: UserProfile | null = null;
            try {
              const snapE = await getDocs(query(collection(db, 'users'), where('email', '==', emailL)));
              if (!snapE.empty) {
                userData = snapE.docs[0].data() as UserProfile;
              } else {
                const d = await getDoc(doc(db, 'users', emailL));
                if (d.exists()) userData = d.data() as UserProfile;
              }
            } catch (userErr) {
              console.error('[getStudents] error fetching user profile for', emailL, userErr);
            }
            let lastWorkout = '';
            const weeklyWorkouts = [0, 0, 0, 0, 0, 0, 0];
            try {
              const sessSnap = await getDocs(query(collection(db, 'sessions'), where('userId', '==', emailL)));
              if (!sessSnap.empty) {
                const sorted = sessSnap.docs
                  .map(d => d.data() as WorkoutSession)
                  .sort((a, b) => b.date.localeCompare(a.date));
                lastWorkout = sorted[0].date;
                const now = new Date();
                sessSnap.docs.forEach(d => {
                  const s = d.data() as WorkoutSession;
                  try {
                    const sessionDate = new Date(s.date);
                    const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / 86400000);
                    if (diffDays >= 0 && diffDays < 7) {
                        const jsDay = sessionDate.getDay();
                        const monBasedIndex = jsDay === 0 ? 6 : jsDay - 1;
                        weeklyWorkouts[monBasedIndex] = 1;
                      }
                  } catch (e) {}
                });
              }
            } catch (sessErr) {
              console.error('[getStudents] error fetching sessions for', emailL, sessErr);
            }
            return {
              id: userData?.email || emailL,
              name: userData?.name || emailL.split('@')[0],
              email: userData?.email || emailL,
              avatarUrl: userData?.avatarUrl || 'https://picsum.photos/400',
              objective: userData?.objective,
              experienceLevel: userData?.experienceLevel,
              lastWorkout,
              progress: 50,
              streak: 0,
              status: 'new' as const,
              weeklyWorkouts,
              score: 0,
              connectionStatus: 'accepted' as const
            } as Student;
          });

          const resolvedStudents = await Promise.all(studentPromises);
          setStudents(resolvedStudents);
          return resolvedStudents;
        } catch (e) {
          console.error('[getStudents] error:', e);
          return [];
        }
      },
      requestConnection: async (trainerCode: string) => {
        if (!currentUser?.email) return;
        try {
          // Find trainer by personal code
          const qTr = query(collection(db, 'users'), where('personalCode', '==', trainerCode));
          const trainerSnap = await getDocs(qTr);
          if (trainerSnap.empty) {
            toast.error("Treinador não encontrado com esse código.");
            return;
          }
          const trainer = trainerSnap.docs[0].data() as UserProfile;
          
          if (trainer.email === currentUser.email) {
            toast.error("Você não pode conectar consigo mesmo.");
            return;
          }

          // Check if already requested/connected
          const checkQ = query(collection(db, 'connections'), 
            where('studentEmail', '==', currentUser.email.toLowerCase()),
            where('trainerEmail', '==', trainer.email.toLowerCase())
          );
          const checkSnap = await getDocs(checkQ);
          if (!checkSnap.empty) {
             toast.error("Você já enviou uma solicitação para este treinador.");
             return;
          }

          const newConnection: TrainerConnection = {
            id: Date.now().toString(),
            studentEmail: currentUser.email.toLowerCase(),
            trainerEmail: trainer.email.toLowerCase(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            trainerName: trainer.name,
            trainerAvatar: trainer.avatarUrl
          };

          await setDoc(doc(db, 'connections', newConnection.id), newConnection);
          
          setStudentConnections(prev => [...prev, newConnection]);
          toast.success("Solicitação enviada! Aguarde o aceite.");
        } catch (e: any) {
          console.error(e);
          toast.error("Erro ao enviar solicitação.");
        }
      },
      getTrainerConnections: async () => {
        const email = currentUser?.email || token || localStorage.getItem('shape_express_token');
        if (!email) return [];
        try {
          const emailLower = email.toLowerCase();
          const [snapLower, snapOriginal] = await Promise.all([
            getDocs(query(collection(db, 'connections'), where('trainerEmail', '==', emailLower))),
            email !== emailLower
              ? getDocs(query(collection(db, 'connections'), where('trainerEmail', '==', email)))
              : Promise.resolve(null)
          ]);
          const allDocs = [...snapLower.docs, ...(snapOriginal?.docs || [])];
          const seen = new Set<string>();
          const data = allDocs
            .filter(d => { if (seen.has(d.id)) return false; seen.add(d.id); return true; })
            .map(d => d.data() as TrainerConnection);
          setTrainerConnections(data);
          return data;
        } catch (e) {
          console.error(e);
          return [];
        }
      },
      getStudentConnections: async () => {
        if (!currentUser?.email) return [];
        try {
          const q = query(collection(db, 'connections'), where('studentEmail', '==', currentUser.email.toLowerCase()));
          const snap = await getDocs(q);
          const data = snap.docs.map(d => d.data() as TrainerConnection);
          setStudentConnections(data);
          return data;
        } catch (e) {
          console.error(e);
          return [];
        }
      },
      respondToConnection: async (id: string, status: 'accepted' | 'rejected') => {
        if (!currentUser?.email) return;
        try {
          const ref = doc(db, 'connections', id);
          if (status === 'rejected') {
            await deleteDoc(ref);
            setTrainerConnections(prev => prev.filter(c => c.id !== id));
            toast.success("Solicitação recusada.");
          } else {
            // we need the studentEmail to add to students list
            const connectionDoc = await getDoc(ref);
            if (connectionDoc.exists()) {
              const studentEmail = connectionDoc.data().studentEmail;
              await updateDoc(ref, { status });
              setTrainerConnections(prev => prev.map(c => c.id === id ? { ...c, status } : c));
              
              let matchedUser: UserProfile | null = null;
              
              const studentQ = query(collection(db, 'users'), where('email', '==', studentEmail));
              const studentSnap = await getDocs(studentQ);
              if (!studentSnap.empty) {
                matchedUser = studentSnap.docs[0].data() as UserProfile;
              } else {
                const altDoc = await getDoc(doc(db, 'users', studentEmail));
                if (altDoc.exists()) {
                  matchedUser = altDoc.data() as UserProfile;
                }
              }
                
              if (matchedUser) {
                const u = matchedUser;
                const newStudent: Student = {
                  id: u.email || studentEmail,
                  name: u.name || studentEmail.split('@')[0],
                  email: u.email || studentEmail,
                  avatarUrl: u.avatarUrl || 'https://picsum.photos/400',
                  lastWorkout: '',
                  progress: 50,
                  streak: 0,
                  status: 'new' as const,
                  weeklyWorkouts: [],
                  score: 0,
                  connectionStatus: 'accepted' as const
                };
                setStudents(prev => {
                  if (prev.some(s => (s.email || '').toLowerCase() === (newStudent.email || '').toLowerCase())) return prev;
                  const next = [...prev, newStudent];
                  console.log('[students] respondToConnection setStudents:', next.map(s => s.email));
                  return next;
                });
              }
              toast.success("Aluno conectado com sucesso!");
            }
          }
        } catch(e) {
          console.error(e);
          toast.error("Erro ao responder solicitação.");
        }
      },
      sendNotification: async (toEmail: string, notification: Omit<AppNotification, 'id' | 'userEmail' | 'read'>) => {
        try {
          const notif: AppNotification = {
            ...notification,
            id: Date.now().toString(),
            userEmail: toEmail.toLowerCase(),
            read: false,
          };
          await setDoc(doc(db, 'notifications', notif.id), notif);
        } catch (e: any) {
          console.error('[sendNotification] error:', e);
          throw e;
        }
      },
      getNotifications: async () => {
        const email = currentUser?.email;
        if (!email) return [];
        try {
          const snap = await getDocs(
            query(collection(db, 'notifications'), where('userEmail', '==', email.toLowerCase()))
          );
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
          setNotifications(data);
          return data;
        } catch (e) { return []; }
      },
      markNotificationRead: async (id: string) => {
        try {
          await updateDoc(doc(db, 'notifications', id), { read: true });
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (e) {}
      },
      clearAllNotifications: async () => {
        const email = currentUser?.email;
        if (!email) return;
        try {
          const snap = await getDocs(
            query(collection(db, 'notifications'), where('userEmail', '==', email.toLowerCase()))
          );
          await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
          setNotifications([]);
        } catch (e) {}
      },
      getTrainerSettings: async () => ({}),
      updateTrainerSettings: async (settings: any) => {},
      disconnectTrainer: async (email: string) => {
        if (!currentUser?.email) return;
        try {
          const q = query(collection(db, 'connections'), 
            where('studentEmail', '==', currentUser.email.toLowerCase()),
            where('trainerEmail', '==', email.toLowerCase())
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            for (const d of snap.docs) {
              await deleteDoc(d.ref);
            }
            setStudentConnections(prev => prev.filter(c => c.trainerEmail !== email));
            toast.success("Treinador desconectado com sucesso.");
          }
        } catch(e) {
          console.error(e);
          toast.error("Erro ao desconectar treinador.");
        }
      },
      disconnectStudent: async (email: string) => {
        if (!currentUser?.email) return;
        try {
          const q = query(collection(db, 'connections'), 
            where('trainerEmail', '==', currentUser.email.toLowerCase()),
            where('studentEmail', '==', email.toLowerCase())
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            for (const d of snap.docs) {
              await deleteDoc(d.ref);
            }
            setTrainerConnections(prev => prev.filter(c => c.studentEmail !== email));
            setStudents(prev => prev.filter(s => s.email !== email));
            toast.success("Aluno desconectado com sucesso.");
          }
        } catch(e) {
          console.error(e);
          toast.error("Erro ao desconectar aluno.");
        }
      },
      getStudentTemplates: async (studentEmail: string) => {
        if (!currentUser?.email) return [];
        const trainerEmail = currentUser.email.toLowerCase();
        const studentEmailLower = studentEmail.toLowerCase();
        try {
          // Compound query — requires Firestore composite index on (userId, creatorEmail)
          const q = query(
            collection(db, 'templates'),
            where('userId', '==', studentEmailLower),
            where('creatorEmail', '==', trainerEmail)
          );
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutTemplate));
        } catch (e: any) {
          // Fallback: filter by userId only, then filter creatorEmail in memory
          // (used while composite index is being created)
          console.warn('[getStudentTemplates] compound query failed, using fallback:', e?.message);
          try {
            const q2 = query(collection(db, 'templates'), where('userId', '==', studentEmailLower));
            const snap2 = await getDocs(q2);
            return snap2.docs
              .map(d => ({ id: d.id, ...d.data() } as WorkoutTemplate))
              .filter(t => (t.creatorEmail || '').toLowerCase() === trainerEmail);
          } catch (e2) {
            return [];
          }
        }
      },
      queryDocs: async (collectionName: string, field: string, op: string, value: string) => {
        try {
          const q = query(collection(db, collectionName), where(field, op as any, value));
          const snap = await getDocs(q);
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (e) {
          return [];
        }
      },
      getMessages: async (otherEmail: string) => {
        const myEmail = currentUser?.email;
        if (!myEmail) return [];
        const roomId = [myEmail.toLowerCase(), otherEmail.toLowerCase()].sort().join('_');
        try {
          const snap = await getDocs(
            query(collection(db, 'messages', roomId, 'msgs'), where('roomId', '==', roomId))
          );
          return snap.docs
            .map(d => ({ id: d.id, ...d.data() } as ChatMessage))
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        } catch (e) {
          return [];
        }
      },
      sendMessage: async (otherEmail: string, text: string) => {
        const myEmail = currentUser?.email;
        if (!myEmail) throw new Error('Not authenticated');
        const roomId = [myEmail.toLowerCase(), otherEmail.toLowerCase()].sort().join('_');
        const msg: Omit<ChatMessage, 'id'> & { roomId: string } = {
          senderId: myEmail,
          receiverId: otherEmail.toLowerCase(),
          text,
          timestamp: new Date().toISOString(),
          roomId,
        };
        const ref = await addDoc(collection(db, 'messages', roomId, 'msgs'), msg);
        return { id: ref.id, ...msg };
      },
      getProtocols: async () => [],
      createProtocol: async (p: any) => {},
      getPurchasedProtocols: async () => [],
      createCheckoutSession: async (id: string) => {
        const currentToken = token || localStorage.getItem("shape_express_token");
        const res = await fetch("/api/checkout/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentToken}`,
            "x-user-email": currentUser?.email || ''
          },
          body: JSON.stringify({ protocolId: id }),
        });
        return res.json();
      },
      verifyCheckoutSession: async (sid: string, pid: string) => {
        const currentToken = token || localStorage.getItem("shape_express_token");
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentToken}`,
            "x-user-email": currentUser?.email || ''
          },
          body: JSON.stringify({ sessionId: sid, protocolId: pid }),
        });
        return res.json();
      },
      getPosts: async (cid?: string, filter?: string): Promise<Post[]> => {
        const email = currentUser?.email;
        if (!email) return [];
        try {
          const q = cid
            ? query(collection(db, 'posts'), where('communityId', '==', cid))
            : query(collection(db, 'posts'));
          const snap = await getDocs(q);
          const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post));
          // Only show posts from users that exist in the DB
          const userEmails = [...new Set(posts.map(p => p.userId).filter(Boolean))];
          if (userEmails.length === 0) return [];
          const existingEmails = new Set<string>();
          await Promise.all(userEmails.map(async (ue) => {
            const uSnap = await getDocs(query(collection(db, 'users'), where('email', '==', ue.toLowerCase())));
            if (!uSnap.empty) existingEmails.add(ue.toLowerCase());
          }));
          const likedSnap = await getDocs(query(collection(db, 'postLikes'), where('userEmail', '==', email.toLowerCase())));
          const likedIds = new Set(likedSnap.docs.map(d => d.data().postId as string));
          return posts
            .filter(p => existingEmails.has((p.userId || '').toLowerCase()))
            .map(p => ({ ...p, likedByMe: likedIds.has(p.id) }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (e) { return []; }
      },
      createPost: async (post: any): Promise<Post | null> => {
        const email = currentUser?.email;
        if (!email) return null;
        try {
          const userSnap = await getDocs(query(collection(db, 'users'), where('email', '==', email.toLowerCase())));
          if (userSnap.empty) return null;
          const userData = userSnap.docs[0].data() as UserProfile;
          const newPost = {
            ...post,
            userId: email.toLowerCase(),
            userName: userData.name || email.split('@')[0],
            userAvatar: userData.avatarUrl || '',
            likesCount: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
          };
          const ref = await addDoc(collection(db, 'posts'), newPost);
          return { id: ref.id, ...newPost } as Post;
        } catch (e) { return null; }
      },
      likePost: async (pid: string) => {
        const email = currentUser?.email;
        if (!email) return;
        try {
          const likeId = `${pid}_${email.toLowerCase()}`;
          const likeRef = doc(db, 'postLikes', likeId);
          const likeSnap = await getDoc(likeRef);
          const postRef = doc(db, 'posts', pid);
          const postSnap = await getDoc(postRef);
          if (!postSnap.exists()) return;
          const current = postSnap.data().likesCount || 0;
          if (likeSnap.exists()) {
            await deleteDoc(likeRef);
            await updateDoc(postRef, { likesCount: Math.max(0, current - 1) });
          } else {
            await setDoc(likeRef, { postId: pid, userEmail: email.toLowerCase() });
            await updateDoc(postRef, { likesCount: current + 1 });
          }
        } catch (e) {}
      },
      getCommunities: async (): Promise<Community[]> => {
        try {
          const snap = await getDocs(collection(db, 'communities'));
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Community));
        } catch (e) { return []; }
      },
      getUserCommunities: async (): Promise<string[]> => {
        const email = currentUser?.email;
        if (!email) return [];
        try {
          const snap = await getDocs(
            query(collection(db, 'communityMembers'), where('userEmail', '==', email.toLowerCase()))
          );
          return snap.docs.map(d => d.data().communityId as string);
        } catch (e) { return []; }
      },
      createCommunity: async (n: string, d: string): Promise<Community | null> => {
        const email = currentUser?.email;
        if (!email) return null;
        try {
          const newComm = { name: n, description: d, membersCount: 1, tags: [], createdBy: email, createdAt: new Date().toISOString(), isPublic: true, creatorId: email.toLowerCase(), allowMemberPosts: true };
          const ref = await addDoc(collection(db, 'communities'), newComm);
          await addDoc(collection(db, 'communityMembers'), {
            communityId: ref.id,
            userEmail: email.toLowerCase(),
            role: 'creator',
            status: 'active',
            joinedAt: new Date().toISOString(),
          });
          return { id: ref.id, ...newComm };
        } catch (e) { return null; }
      },
      joinCommunity: async (id: string) => {
        const email = currentUser?.email;
        if (!email) return;
        try {
          const existing = await getDocs(
            query(collection(db, 'communityMembers'), where('communityId', '==', id), where('userEmail', '==', email.toLowerCase()))
          );
          if (existing.empty) {
            const commRef = doc(db, 'communities', id);
            const commSnap = await getDoc(commRef);
            const isPublic = commSnap.exists() ? (commSnap.data().isPublic !== false) : true;
            const status = isPublic ? 'active' : 'pending';
            await addDoc(collection(db, 'communityMembers'), {
              communityId: id,
              userEmail: email.toLowerCase(),
              role: 'member',
              status,
              joinedAt: new Date().toISOString(),
            });
            if (isPublic && commSnap.exists()) {
              await updateDoc(commRef, { membersCount: (commSnap.data().membersCount || 0) + 1 });
            }
          }
        } catch (e) {}
      },
      getCommunityMembers: async (communityId: string) => {
        try {
          // Fetch all members of the community (no status filter — handle in memory for backwards compat)
          const snap = await getDocs(
            query(collection(db, 'communityMembers'), where('communityId', '==', communityId))
          );
          const members = await Promise.all(snap.docs.map(async (d) => {
            const data = d.data();
            // Treat missing status as 'active' (legacy docs before status field was added)
            const status = data.status || 'active';
            if (status !== 'active') return null;
            const userSnap = await getDocs(query(collection(db, 'users'), where('email', '==', data.userEmail)));
            if (userSnap.empty) return null;
            const userData = userSnap.docs[0].data() as UserProfile;
            return {
              id: d.id,
              communityId,
              userEmail: data.userEmail,
              userName: userData.name || data.userEmail.split('@')[0],
              userAvatar: userData.avatarUrl || '',
              role: data.role || 'member',
              status: 'active' as const,
              joinedAt: data.joinedAt || '',
            } as CommunityMember;
          }));
          return members.filter(Boolean) as CommunityMember[];
        } catch (e) { return []; }
      },
      getPendingMembers: async (communityId: string) => {
        try {
          const snap = await getDocs(
            query(collection(db, 'communityMembers'), where('communityId', '==', communityId), where('status', '==', 'pending'))
          );
          const members = await Promise.all(snap.docs.map(async (d) => {
            const data = d.data();
            const userSnap = await getDocs(query(collection(db, 'users'), where('email', '==', data.userEmail)));
            if (userSnap.empty) return null;
            const userData = userSnap.docs[0].data() as import('../../domain/entities').UserProfile;
            return {
              id: d.id,
              communityId,
              userEmail: data.userEmail,
              userName: userData.name || data.userEmail.split('@')[0],
              userAvatar: userData.avatarUrl || '',
              role: 'member' as const,
              status: 'pending' as const,
              joinedAt: data.joinedAt || '',
            } as CommunityMember;
          }));
          return members.filter(Boolean) as CommunityMember[];
        } catch (e) { return []; }
      },
      approveMember: async (communityId: string, memberDocId: string) => {
        try {
          await updateDoc(doc(db, 'communityMembers', memberDocId), { status: 'active' });
          const commRef = doc(db, 'communities', communityId);
          const commSnap = await getDoc(commRef);
          if (commSnap.exists()) {
            await updateDoc(commRef, { membersCount: (commSnap.data().membersCount || 0) + 1 });
          }
        } catch (e) {}
      },
      rejectMember: async (memberDocId: string) => {
        try {
          await deleteDoc(doc(db, 'communityMembers', memberDocId));
        } catch (e) {}
      },
      updateMemberRole: async (memberDocId: string, newRole: CommunityRole) => {
        try {
          await updateDoc(doc(db, 'communityMembers', memberDocId), { role: newRole });
        } catch (e) {}
      },
      banMember: async (communityId: string, memberDocId: string, reason: string) => {
        try {
          await updateDoc(doc(db, 'communityMembers', memberDocId), { status: 'banned', banReason: reason });
          const commRef = doc(db, 'communities', communityId);
          const commSnap = await getDoc(commRef);
          if (commSnap.exists()) {
            await updateDoc(commRef, { membersCount: Math.max(0, (commSnap.data().membersCount || 1) - 1) });
          }
        } catch (e) {}
      },
      unbanMember: async (memberDocId: string) => {
        try {
          await updateDoc(doc(db, 'communityMembers', memberDocId), { status: 'active', banReason: null });
        } catch (e) {}
      },
      getBannedMembers: async (communityId: string) => {
        try {
          const snap = await getDocs(
            query(collection(db, 'communityMembers'), where('communityId', '==', communityId), where('status', '==', 'banned'))
          );
          const members = await Promise.all(snap.docs.map(async (d) => {
            const data = d.data();
            const userSnap = await getDocs(query(collection(db, 'users'), where('email', '==', data.userEmail)));
            if (userSnap.empty) return null;
            const userData = userSnap.docs[0].data() as import('../../domain/entities').UserProfile;
            return {
              id: d.id,
              communityId,
              userEmail: data.userEmail,
              userName: userData.name || data.userEmail.split('@')[0],
              userAvatar: userData.avatarUrl || '',
              role: data.role || 'member',
              status: 'banned' as const,
              joinedAt: data.joinedAt || '',
              banReason: data.banReason || '',
            } as CommunityMember;
          }));
          return members.filter(Boolean) as CommunityMember[];
        } catch (e) { return []; }
      },
      updateCommunity: async (communityId: string, data: Partial<Community>) => {
        try {
          await updateDoc(doc(db, 'communities', communityId), data as any);
        } catch (e) {}
      },
      deleteCommunity: async (communityId: string) => {
        try {
          await deleteDoc(doc(db, 'communities', communityId));
        } catch (e) {}
      },
      getCommunityRole: async (communityId: string): Promise<CommunityRole | null> => {
        const email = currentUser?.email;
        if (!email) return null;
        try {
          const snap = await getDocs(
            query(collection(db, 'communityMembers'), where('communityId', '==', communityId), where('userEmail', '==', email.toLowerCase()))
          );
          if (snap.empty) return null;
          return (snap.docs[0].data().role || 'member') as CommunityRole;
        } catch (e) { return null; }
      },
      getChallengesByCommunity: async (communityId: string): Promise<Challenge[]> => {
        try {
          const snap = await getDocs(
            query(collection(db, 'challenges'), where('communityId', '==', communityId))
          );
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
        } catch (e) { return []; }
      },
      createChallenge: async (challenge: Omit<Challenge, 'id'>): Promise<Challenge | null> => {
        try {
          const ref = await addDoc(collection(db, 'challenges'), challenge);
          return { id: ref.id, ...challenge };
        } catch (e) { return null; }
      },
      deleteChallenge: async (challengeId: string) => {
        try {
          await deleteDoc(doc(db, 'challenges', challengeId));
        } catch (e) {}
      },
      getChallenges: async (): Promise<Challenge[]> => {
        try {
          const snap = await getDocs(collection(db, 'challenges'));
          return snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
        } catch (e) { return []; }
      },
      getUserChallenges: async (): Promise<UserChallenge[]> => {
        const email = currentUser?.email;
        if (!email) return [];
        try {
          const snap = await getDocs(
            query(collection(db, 'userChallenges'), where('userId', '==', email.toLowerCase()))
          );
          return snap.docs.map(d => d.data() as UserChallenge);
        } catch (e) { return []; }
      },
      updateChallengeProgress: async (id: string, p: number, collected?: boolean) => {
        const email = currentUser?.email;
        if (!email) return;
        try {
          const docId = `${id}_${email.toLowerCase()}`;
          await setDoc(doc(db, 'userChallenges', docId), {
            userId: email.toLowerCase(),
            challengeId: id,
            progress: p,
            completed: p > 0,
            ...(collected !== undefined ? { collected } : {}),
          }, { merge: true });
        } catch (e) {}
      },
      cancelChallenge: async (id: string) => {
        const email = currentUser?.email;
        if (!email) return;
        try {
          const docId = `${id}_${email.toLowerCase()}`;
          await setDoc(doc(db, 'userChallenges', docId), {
            userId: email.toLowerCase(),
            challengeId: id,
            progress: 0,
            completed: false,
            cancelled: true,
          }, { merge: true });
        } catch (e) {}
      },
      getCommunityRanking: async (communityId: string): Promise<Ranking[]> => {
        try {
          // Get members of this community
          const membersSnap = await getDocs(
            query(collection(db, 'communityMembers'), where('communityId', '==', communityId))
          );
          const memberEmails = membersSnap.docs.map(d => d.data().userEmail as string);
          if (memberEmails.length === 0) return [];
          // Only include members that exist in users collection
          const ranking: Ranking[] = [];
          await Promise.all(memberEmails.map(async (memberEmail) => {
            const [userSnap, statsSnap] = await Promise.all([
              getDocs(query(collection(db, 'users'), where('email', '==', memberEmail.toLowerCase()))),
              getDoc(doc(db, 'stats', memberEmail.toLowerCase())),
            ]);
            if (userSnap.empty) return; // skip users not in DB
            const userData = userSnap.docs[0].data() as UserProfile;
            const statsData = statsSnap.exists() ? statsSnap.data() as UserStats : null;
            ranking.push({
              userId: memberEmail.toLowerCase(),
              userName: userData.name || memberEmail.split('@')[0],
              userAvatar: userData.avatarUrl || '',
              communityId,
              xp: statsData?.xp || 0,
              streak: statsData?.streak || 0,
              lastActivityAt: new Date().toISOString(),
            });
          }));
          return ranking.sort((a, b) => b.xp - a.xp);
        } catch (e) { return []; }
      },
      getCommunityMessages: async (id: string) => [],
      sendCommunityMessage: async (id: string, c: string) => {},
      getRecommendedCommunities: async () => [],
      getPostComments: async (postId: string) => {
        try {
          const snap = await getDocs(
            query(collection(db, 'postComments'), where('postId', '==', postId))
          );
          return snap.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } catch (e) { return []; }
      },
      addPostComment: async (postId: string, text: string) => {
        const email = currentUser?.email;
        if (!email) return null;
        try {
          const userSnap = await getDocs(query(collection(db, 'users'), where('email', '==', email.toLowerCase())));
          if (userSnap.empty) return null;
          const userData = userSnap.docs[0].data() as UserProfile;
          const comment = {
            postId,
            text,
            userId: email.toLowerCase(),
            userName: userData.name || email.split('@')[0],
            userAvatar: userData.avatarUrl || '',
            createdAt: new Date().toISOString(),
          };
          const ref = await addDoc(collection(db, 'postComments'), comment);
          // Increment commentsCount on the post
          const postRef = doc(db, 'posts', postId);
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            await updateDoc(postRef, { commentsCount: (postSnap.data().commentsCount || 0) + 1 });
          }
          return { id: ref.id, ...comment };
        } catch (e) { return null; }
      },
      addXP: async (xp: number) => {},
      followUser: async (e: string) => {},
      unfollowUser: async (e: string) => {},
      searchUsers: async (q: string): Promise<UserProfile[]> => {
        try {
          const snap = await getDocs(collection(db, 'users'));
          const lower = q.toLowerCase();
          return snap.docs
            .map(d => d.data() as UserProfile)
            .filter(u => u.name?.toLowerCase().includes(lower) || u.email?.toLowerCase().includes(lower));
        } catch (e) { return []; }
      },
      searchCommunities: async (q: string): Promise<Community[]> => {
        try {
          const snap = await getDocs(collection(db, 'communities'));
          const lower = q.toLowerCase();
          return snap.docs
            .map(d => ({ id: d.id, ...d.data() } as Community))
            .filter(c => c.name.toLowerCase().includes(lower) || c.description?.toLowerCase().includes(lower));
        } catch (e) { return []; }
      },
      uploadImage: async (file: File) => ({ url: "" }),
      login: async (email: string, password: string) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const token = await userCredential.user.getIdToken();
          
          let userDoc = null;
          try {
            const snap = await getDoc(doc(db, "users", email));
            if (snap.exists()) userDoc = snap.data();
          } catch(e) {}
          
          toast.success("Bem-vindo de volta!");
          localStorage.setItem("shape_express_token", email);
          setToken(email);
          setCurrentUser({ email });
          setIsLoggedIn(true);
          return { token, user: userDoc || { email, name: email.split('@')[0] } };
        } catch (e: any) {
          if (e.code === "auth/operation-not-allowed") {
            toast.error('O login por Email/Senha não está habilitado no console do Firebase.');
          } else {
            toast.error(getFirebaseErrorMessage(e));
          }
          throw new Error(getFirebaseErrorMessage(e));
        }
      },
      loginWithGoogle: async () => {
        try {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          const token = await userCredential.user.getIdToken();
          const email = userCredential.user.email!;
          
          let userDoc = null;
          try {
            const snap = await getDoc(doc(db, "users", email));
            if (snap.exists()) {
              userDoc = snap.data() as UserProfile;
            } else {
              userDoc = {
                name: userCredential.user.displayName || "Usuário",
                email: email,
                userType: "atleta",
                height: 180,
                initialWeight: 80,
                objective: "Manutenção",
                birthDate: "2000-01-01",
                avatarUrl: userCredential.user.photoURL || "https://picsum.photos/seed/user/400",
                hasPersonal: false,
              };
              await setDoc(doc(db, "users", email), userDoc);
              await setDoc(doc(db, "stats", email), {
                level: 1, xp: 0, streak: 0, bestStreak: 0, weeklyGoal: 3, completedThisWeek: 0, totalWorkouts: 0, totalVolume: 0, medalsCount: 0, userEmail: email,
              });
            }
          } catch(e) {}

          toast.success("Bem-vindo!");
          localStorage.setItem("shape_express_token", email);
          setToken(email);
          setCurrentUser({ email });
          setIsLoggedIn(true);
          return { token, user: userDoc };
        } catch (e: any) {
          toast.error(getFirebaseErrorMessage(e));
          throw new Error(getFirebaseErrorMessage(e));
        }
      },
      register: async (data: any) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
          const token = await userCredential.user.getIdToken();
          const isTrainer = (data.userType || "atleta") === "treinador";
          const userProfile = {
            ...data,
            name: data.name,
            email: data.email,
            userType: data.userType || "atleta",
            height: data.height || 180,
            initialWeight: data.initialWeight || 80,
            objective: data.objective || "Manutenção",
            birthDate: data.birthDate || "2000-01-01",
            avatarUrl: data.avatarUrl || "https://picsum.photos/seed/user/400",
            hasPersonal: data.hasPersonal || false,
            ...(isTrainer ? { personalCode: Math.random().toString(36).substring(2, 8).toUpperCase() } : {})
          };
          delete userProfile.password;
          
          try {
            await setDoc(doc(db, "users", data.email), userProfile);
            await setDoc(doc(db, "stats", data.email), {
              level: 1, xp: 0, streak: 0, bestStreak: 0, weeklyGoal: 3, completedThisWeek: 0, totalWorkouts: 0, totalVolume: 0, medalsCount: 0, userEmail: data.email,
            });
          } catch(e) {}

          toast.success("Conta criada com sucesso!");
          localStorage.setItem("shape_express_token", data.email);
          setToken(data.email);
          setCurrentUser({ email: data.email });
          setIsLoggedIn(true);
          return { token, user: userProfile };
        } catch (e: any) {
          if (e.code === "auth/operation-not-allowed") {
            toast.error('O login por Email/Senha não está habilitado no console do Firebase.');
          } else {
            toast.error(getFirebaseErrorMessage(e));
          }
          throw new Error(getFirebaseErrorMessage(e));
        }
      },
      checkEmailExists: async (email: string) => {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          return methods.length > 0;
        } catch(e) {
          return false;
        }
      },
      forgotPassword: async (email: string) => {
        try {
          await sendPasswordResetEmail(auth, email);
          toast.success("Email de recuperação enviado!");
          return { message: "Email enviado" };
        } catch (e: any) {
          toast.error(getFirebaseErrorMessage(e));
          throw new Error(getFirebaseErrorMessage(e));
        }
      },
      logout: async () => {
        await signOut(auth);
        // Manually clear all Firebase auth keys to ensure session is fully destroyed
        Object.keys(localStorage)
          .filter(k => k.startsWith('firebase:'))
          .forEach(k => localStorage.removeItem(k));
        localStorage.removeItem("shape_express_token");
        syncedToken = null;
        setToken(null);
        setCurrentUser(null);
        setIsLoggedIn(false);
        resetUserStates();
        setActiveTab("login");
        toast.success("Até logo!");
      },
    };
  }, [currentUser]);

  // Use Firebase Auth as the single source of truth for session state
  useEffect(() => {
    // Fallback: if Firebase Auth doesn't resolve within 5s, unblock the UI
    const fallbackTimer = setTimeout(() => {
      setInitialLoading(false);
      setActiveTab('login');
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(fallbackTimer);
      if (firebaseUser?.email) {
        const email = firebaseUser.email;
        localStorage.setItem("shape_express_token", email);
        setToken(email);
        setCurrentUser({ email });
        setIsLoggedIn(true);
        const defaultTab = localStorage.getItem('app-default-tab') || 'dashboard';
        setActiveTab(defaultTab as any);
      } else {
        // No active Firebase session or user explicitly logged out
        localStorage.removeItem("shape_express_token");
        syncedToken = null;
        setToken(null);
        setCurrentUser(null);
        setIsLoggedIn(false);
        setActiveTab('login');
      }
      setInitialLoading(false);
    });

    return () => { unsubscribe(); clearTimeout(fallbackTimer); };
  }, []);

  const syncRan = useRef<string | null>(null);

  // Real-time synchronization & Data Fetching
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    if (syncedToken === token) return;
    syncedToken = token;

    const emailLower = token.toLowerCase();

    const syncAll = async () => {
      try {
        let profile: UserProfile | null = null;
        try {
          const docSnap = await getDoc(doc(db, 'users', emailLower));
          if (docSnap.exists()) {
            profile = docSnap.data() as UserProfile;
          } else {
            const snap = await getDocs(query(collection(db, 'users'), where('email', '==', emailLower)));
            if (!snap.empty) profile = snap.docs[0].data() as UserProfile;
          }
          if (profile) setUserProfile(profile);
        } catch (e) {}

        await Promise.all([
          getDoc(doc(db, 'stats', emailLower)).then(snap => {
            if (snap.exists()) setUserStats(snap.data() as UserStats);
          }).catch(() => {}),
          getDocs(query(collection(db, 'templates'), where('userId', '==', emailLower))).then(snap => {
            setTemplates(snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutTemplate)));
          }).catch(() => {}),
          getDocs(query(collection(db, 'sessions'), where('userId', '==', emailLower))).then(snap => {
            setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutSession)));
          }).catch(() => {}),
          getDocs(query(collection(db, 'users'), where('userType', '==', 'treinador'))).then(snap => {
            if (!snap.empty) setTrainers(snap.docs.map(d => d.data() as UserProfile));
          }).catch(() => {}),
        ]);

        if (profile?.userType === 'treinador') {
          const connSnap = await getDocs(
            query(collection(db, 'connections'), where('trainerEmail', '==', emailLower))
          );
          const allConns = connSnap.docs.map(d => d.data() as TrainerConnection);
          setTrainerConnections(allConns);

          const accepted = allConns.filter(c => c.status === 'accepted');
          if (accepted.length === 0) {
            setStudents([]);
          } else {
            const studentList = await Promise.all(accepted.map(async (conn) => {
              const sEmailL = conn.studentEmail.toLowerCase();
              let userData: UserProfile | null = null;
              try {
                const snap = await getDocs(query(collection(db, 'users'), where('email', '==', sEmailL)));
                if (!snap.empty) {
                  userData = snap.docs[0].data() as UserProfile;
                } else {
                  const d = await getDoc(doc(db, 'users', sEmailL));
                  if (d.exists()) userData = d.data() as UserProfile;
                }
              } catch (e) {}
              let lastWorkout = '';
              const weeklyWorkouts = [0, 0, 0, 0, 0, 0, 0];
              try {
                const sessSnap = await getDocs(query(collection(db, 'sessions'), where('userId', '==', sEmailL)));
                if (!sessSnap.empty) {
                  const sorted = sessSnap.docs
                    .map(d => d.data() as WorkoutSession)
                    .sort((a, b) => b.date.localeCompare(a.date));
                  lastWorkout = sorted[0].date;
                  const now = new Date();
                  sessSnap.docs.forEach(d => {
                    const s = d.data() as WorkoutSession;
                    try {
                      const sessionDate = new Date(s.date);
                      const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / 86400000);
                      if (diffDays >= 0 && diffDays < 7) {
                        // Map JS getDay() (0=Sun) to Mon-based index (Mon=0...Sun=6)
                        const jsDay = sessionDate.getDay();
                        const monBasedIndex = jsDay === 0 ? 6 : jsDay - 1;
                        weeklyWorkouts[monBasedIndex] = 1;
                      }
                    } catch (e) {}
                  });
                }
              } catch (e) {}
              return {
                id: userData?.email || sEmailL,
                name: userData?.name || sEmailL.split('@')[0],
                email: userData?.email || sEmailL,
                avatarUrl: userData?.avatarUrl || 'https://picsum.photos/400',
                objective: userData?.objective,
                experienceLevel: userData?.experienceLevel,
                lastWorkout,
                progress: 50,
                streak: 0,
                status: 'new' as const,
                weeklyWorkouts,
                score: 0,
                connectionStatus: 'accepted' as const
              } as Student;
            }));
            setStudents(studentList);
          }
        } else {
          try {
            const snap = await getDocs(
              query(collection(db, 'connections'), where('studentEmail', '==', emailLower))
            );
            setStudentConnections(snap.docs.map(d => d.data() as TrainerConnection));
          } catch (e) {}
        }
      } catch (e) {}
    };

    syncAll();

    // Real-time notifications listener
    const notifUnsub = onSnapshot(
      query(collection(db, 'notifications'), where('userEmail', '==', emailLower)),
      (snap) => {
        setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification)));
      },
      () => {}
    );

    return () => { syncRan.current = null; notifUnsub(); };
  }, [isLoggedIn, token]);

  const filteredTemplates = useMemo(() => {
    if (userProfile?.userType === 'treinador') {
      return templates;
    }
    return templates.filter(t => !t.userId || t.userId === userProfile?.email);
  }, [templates, userProfile]);

  const userSessions = useMemo(() => {
    return sessions.filter(s => s.userId === userProfile?.email);
  }, [sessions, userProfile?.email]);

  const filteredSessions = useMemo(() => {
    if (userProfile?.userType === 'treinador') {
      const studentIds = new Set(templates.filter(t => t.userId).map(t => t.userId));
      return sessions.filter(s => s.userId === userProfile?.email || (s.userId && studentIds.has(s.userId)));
    }
    return sessions.filter(s => s.userId === userProfile?.email);
  }, [sessions, userProfile, templates]);

  const calculatedStreak = useMemo(() => {
    if (userSessions.length === 0) return 0;
    
    let sessionDates = Array.from(new Set(
      userSessions.map(s => {
        try {
          return format(parseISO(s.date), 'yyyy-MM-dd');
        } catch (e) {
          return "";
        }
      })
    )).filter(d => d !== "").sort((a: string, b: string) => b.localeCompare(a));
    
    if (userStats.streakResetDate) {
      sessionDates = sessionDates.filter(d => d > userStats.streakResetDate!);
    }
    
    if (sessionDates.length === 0) return 0;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    
    if (sessionDates[0] !== today && sessionDates[0] !== yesterday) {
      return 0;
    }
    
    let streak = 1;
    let currentDate = parseISO(sessionDates[0]);
    
    for (let i = 1; i < sessionDates.length; i++) {
      const expectedPrevDate = new Date(currentDate.getTime() - 86400000);
      const expectedPrevDateStr = format(expectedPrevDate, 'yyyy-MM-dd');
      
      if (sessionDates[i] === expectedPrevDateStr) {
        streak++;
        currentDate = expectedPrevDate;
      } else {
        break;
      }
    }
    return streak;
  }, [userSessions, userStats.streakResetDate]);

  const personalRecords = useMemo(() => {
    const prs: { [key: string]: { weight: number, date: string, name: string } } = {};
    
    userSessions.forEach(session => {
      session.exercises.forEach(ex => {
        const exercise = EXERCISES.find(e => e.id === ex.exerciseId);
        if (!exercise) return;
        
        const maxWeight = Math.max(...ex.sets.map(s => s.completed ? s.weight : 0));
        if (maxWeight > 0) {
          if (!prs[ex.exerciseId] || maxWeight > prs[ex.exerciseId].weight) {
            prs[ex.exerciseId] = {
              weight: maxWeight,
              date: session.date,
              name: exercise.name
            };
          }
        }
      });
    });
    
    return Object.values(prs).sort((a, b) => b.weight - a.weight).slice(0, 3);
  }, [userSessions]);

  return {
    activeTab,
    setActiveTab,
    selectedStudentForWorkouts,
    setSelectedStudentForWorkouts,
    selectedStudentForEvolution,
    setSelectedStudentForEvolution,
    swipeDirection,
    setSwipeDirection,
    isLoggedIn,
    setIsLoggedIn,
    showLogoutConfirm,
    setShowLogoutConfirm,
    editingTemplate,
    setEditingTemplate,
    editingSession,
    setEditingSession,
    editingAssessment,
    setEditingAssessment,
    deletingTemplateId,
    setDeletingTemplateId,
    deletingSessionId,
    setDeletingSessionId,
    scrollToHistory,
    setScrollToHistory,
    sessions,
    setSessions,
    templates,
    setTemplates,
    activeWorkout,
    setActiveWorkout,
    lastCompletedSession,
    setLastCompletedSession,
    progressionAlerts,
    setProgressionAlerts,
    stagnationReports,
    setStagnationReports,
    progressScore,
    setProgressScore,
    aiAdvice,
    setAiAdvice,
    isAiLoading,
    setIsAiLoading,
    showWorkoutSelector,
    setShowWorkoutSelector,
    selectingSheetTemplate,
    setSelectingSheetTemplate,
    activeChatStudent,
    setActiveChatStudent,
    chatMessages,
    setChatMessages,
    userStats,
    setUserStats,
    userProfile,
    setUserProfile,
    assessments,
    setAssessments,
    userTrainingProfile,
    setUserTrainingProfile,
    exerciseUserStats,
    setExerciseUserStats,
    userCalorieProfile,
    setUserCalorieProfile,
    notifications,
    setNotifications,
    trainerConnections,
    setTrainerConnections,
    studentConnections,
    setStudentConnections,
    students,
    setStudents,
    trainers,
    setTrainers,
    posts,
    setPosts,
    communities,
    setCommunities,
    activeCommunity,
    setActiveCommunity,
    challenges,
    setChallenges,
    userChallenges,
    setUserChallenges,
    communityRanking,
    setCommunityRanking,
    communityMessages,
    setCommunityMessages,
    recommendedCommunities,
    setRecommendedCommunities,
    filteredTemplates,
    userSessions,
    filteredSessions,
    calculatedStreak,
    personalRecords,
    initialLoading,
    api,
    fetchWithAuth,
    resetUserStates,
  };
};
