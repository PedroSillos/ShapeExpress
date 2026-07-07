import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { tokenStore } from "../../data/services/tokenStore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { getFirebaseErrorMessage } from "../../utils/firebaseErrors";
import type { UserProfile, WorkoutTemplate, WorkoutSession } from "../../domain/entities";
import { getRandomSportAvatar, generateAvatarUrl } from "../../shared/lib/sportAvatars";

function sanitize<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/**
 * Removes all guest-session data from localStorage.
 * Called after a successful login so the authenticated user loads
 * only their Firestore data instead of leftover guest data.
 */
export function clearLocalGuestData() {
  const keys = [
    "pending-templates",
    "local_sessions",
    "local_stats",
    "local_user_profile",
    "local_training_profile",
    "local_calorie_profile",
    "local_exercise_stats",
    "active-workout",
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}

/**
 * Uploads all local guest data to Firestore under the given user email,
 * then wipes the local copies. Called after a successful registration so
 * data collected during onboarding is persisted to the user's account.
 */
async function uploadLocalDataToFirestore(email: string) {
  const templates: WorkoutTemplate[] = (() => { try { return JSON.parse(localStorage.getItem("pending-templates") ?? "[]"); } catch { return []; } })();
  const sessions: WorkoutSession[] = (() => { try { return JSON.parse(localStorage.getItem("local_sessions") ?? "[]"); } catch { return []; } })();
  const localStats = (() => { try { return JSON.parse(localStorage.getItem("local_stats") ?? "null"); } catch { return null; } })();

  // Use allSettled so a single failed write does not abort the others.
  const results = await Promise.allSettled([
    ...templates.map((t) => setDoc(doc(db, "templates", t.id), sanitize({ ...t, userId: email }))),
    // Sessions also need the real userId — guests store them with '' or 'guest'.
    ...sessions.map((s) => setDoc(doc(db, "sessions", s.id), sanitize({ ...s, userId: email }))),
    ...(localStats ? [setDoc(doc(db, "stats", email), { ...localStats, userEmail: email }, { merge: true })] : []),
  ]);

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.warn(`[uploadLocalDataToFirestore] ${failed.length} write(s) failed:`, failed);
  }

  // Clear local copies regardless of individual failures — on next login
  // useSyncState will load the authoritative data from Firestore.
  clearLocalGuestData();
  localStorage.removeItem("welcome-answers");
}

// Tracks which token has already been synced to prevent Strict Mode double-invoke
// Using an object so the reference is stable and mutable across modules
export const syncState = { syncedToken: null as string | null };
export const resetSyncedToken = () => { syncState.syncedToken = null; };

export const useAuthState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("shape_express_token"));
  const [idToken, setIdToken] = useState<string | null>(null);

  const fetchWithAuth = useCallback(async (
    url: string,
    options: RequestInit = {},
    retries = 3,
  ): Promise<Response> => {
    const currentToken = idToken;
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
      if (retries > 0 && error instanceof TypeError && error.message === "Failed to fetch") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchWithAuth(url, options, retries - 1);
      }
      throw error;
    }
  }, [idToken]);

  // Tab to restore after auth resolves — read by useAppState to redirect
  const [restoredTab, setRestoredTab] = useState<string | null>(null);

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setRestoredTab(localStorage.getItem("welcome-done") ? "dashboard" : "landing");
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(fallbackTimer);
      if (firebaseUser?.email) {
        const email = firebaseUser.email;
        const freshIdToken = await firebaseUser.getIdToken();
        tokenStore.idToken = freshIdToken;
        setIdToken(freshIdToken);
        localStorage.setItem("shape_express_token", email);
        setToken(email);
        setCurrentUser({ email });
        setIsLoggedIn(true);
        setRestoredTab(localStorage.getItem("app-default-tab") || "dashboard");
      } else {
        tokenStore.idToken = null;
        setIdToken(null);
        localStorage.removeItem("shape_express_token");
        syncState.syncedToken = null;
        setToken(null);
        setCurrentUser(null);
        setIsLoggedIn(false);
        setRestoredTab(localStorage.getItem("welcome-done") ? "dashboard" : "landing");
      }
    });

    return () => { unsubscribe(); clearTimeout(fallbackTimer); };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const freshIdToken = await userCredential.user.getIdToken();
      tokenStore.idToken = freshIdToken;
      setIdToken(freshIdToken);
      let userDoc = null;
      try {
        const snap = await getDoc(doc(db, "users", email));
        if (snap.exists()) userDoc = snap.data();
      } catch (e) {}
      toast.success("Bem-vindo de volta!");
      localStorage.setItem("shape_express_token", email);
      setToken(email);
      setCurrentUser({ email });
      setIsLoggedIn(true);
      // Login: discard any local guest data so only Firestore data is shown.
      // useSyncState will load the user's real data as soon as isLoggedIn flips.
      clearLocalGuestData();
      return { token: freshIdToken, user: userDoc || { email, name: email.split("@")[0] } };
    } catch (e: any) {
      if (e.code === "auth/operation-not-allowed") {
        toast.error("O login por Email/Senha não está habilitado no console do Firebase.");
      } else {
        toast.error(getFirebaseErrorMessage(e));
      }
      throw new Error(getFirebaseErrorMessage(e));
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const freshIdToken = await userCredential.user.getIdToken();
      tokenStore.idToken = freshIdToken;
      setIdToken(freshIdToken);
      const email = userCredential.user.email!;
      let userDoc: UserProfile | null = null;
      let isNewAccount = false;
      try {
        const snap = await getDoc(doc(db, "users", email));
        if (snap.exists()) {
          // Existing account: Firestore is the source of truth — discard local guest data.
          userDoc = snap.data() as UserProfile;
          clearLocalGuestData();
        } else {
          // New account via Google: treat like a registration and upload any onboarding data.
          isNewAccount = true;
          userDoc = {
            name: userCredential.user.displayName || "Usuário",
            email,
            userType: "atleta",
            height: 180,
            initialWeight: 80,
            objective: "Manutenção",
            birthDate: "2000-01-01",
            avatarUrl: userCredential.user.photoURL || generateAvatarUrl(getRandomSportAvatar()),
            hasPersonal: false,
          };
          await setDoc(doc(db, "users", email), userDoc);
          await setDoc(doc(db, "stats", email), {
            level: 1, xp: 0, streak: 0, bestStreak: 0, weeklyGoal: 3,
            completedThisWeek: 0, totalWorkouts: 0, totalVolume: 0, medalsCount: 0, userEmail: email,
          });
        }
      } catch (e) {}
      toast.success("Bem-vindo!");
      localStorage.setItem("shape_express_token", email);
      setToken(email);
      setCurrentUser({ email });
      setIsLoggedIn(true);
      if (isNewAccount) await uploadLocalDataToFirestore(email);
      return { token: freshIdToken, user: userDoc };
    } catch (e: any) {
      toast.error(getFirebaseErrorMessage(e));
      throw new Error(getFirebaseErrorMessage(e));
    }
  };

  const register = async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const freshIdToken = await userCredential.user.getIdToken();
      tokenStore.idToken = freshIdToken;
      setIdToken(freshIdToken);
      const isTrainer = (data.userType || "atleta") === "treinador";
      const userProfile = {
        ...data,
        userType: data.userType || "atleta",
        height: data.height || 180,
        initialWeight: data.initialWeight || 80,
        objective: data.objective || "Manutenção",
        birthDate: data.birthDate || "2000-01-01",
        avatarUrl: data.avatarUrl || generateAvatarUrl(getRandomSportAvatar()),
        hasPersonal: data.hasPersonal || false,
        ...(isTrainer ? { personalCode: Math.random().toString(36).substring(2, 8).toUpperCase() } : {}),
      };
      delete userProfile.password;
      try {
        await setDoc(doc(db, "users", data.email), userProfile);
        await setDoc(doc(db, "stats", data.email), {
          level: 1, xp: 0, streak: 0, bestStreak: 0, weeklyGoal: 3,
          completedThisWeek: 0, totalWorkouts: 0, totalVolume: 0, medalsCount: 0, userEmail: data.email,
        });
      } catch (e) {}
      toast.success("Conta criada com sucesso!");
      localStorage.setItem("shape_express_token", data.email);
      setToken(data.email);
      setCurrentUser({ email: data.email });
      setIsLoggedIn(true);
      await uploadLocalDataToFirestore(data.email);
      return { token: freshIdToken, user: userProfile };
    } catch (e: any) {
      if (e.code === "auth/operation-not-allowed") {
        toast.error("O login por Email/Senha não está habilitado no console do Firebase.");
      } else if (e.code !== "auth/email-already-in-use") {
        toast.error(getFirebaseErrorMessage(e));
      }
      throw e;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Email de recuperação enviado!");
      return { message: "Email enviado" };
    } catch (e: any) {
      toast.error(getFirebaseErrorMessage(e));
      throw new Error(getFirebaseErrorMessage(e));
    }
  };

  const deleteAccount = async (onLogout?: () => void) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser?.email) return;
    const email = firebaseUser.email;
    try {
      await deleteDoc(doc(db, "users", email));
      await deleteDoc(doc(db, "stats", email));
      await deleteUser(firebaseUser);
    } catch (e: any) {
      toast.error("Erro ao deletar conta: " + e.message);
      throw e;
    }
    Object.keys(localStorage)
      .filter((k) => k.startsWith("firebase:"))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("shape_express_token");
    tokenStore.idToken = null;
    syncState.syncedToken = null;
    setIdToken(null);
    setToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    onLogout?.();
    toast.success("Conta deletada com sucesso.");
  };

  const logout = async (onLogout?: () => void) => {
    await signOut(auth);
    Object.keys(localStorage)
      .filter((k) => k.startsWith("firebase:"))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem("shape_express_token");
    tokenStore.idToken = null;
    syncState.syncedToken = null;
    setIdToken(null);
    setToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    onLogout?.();
    toast.success("Até logo!");
  };

  const loginWithPhone = async (phoneNumber: string, recaptchaContainer: HTMLElement): Promise<ConfirmationResult> => {
    try {
      const verifier = new RecaptchaVerifier(auth, recaptchaContainer, { size: 'invisible' });
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      verifier.clear();
      return result;
    } catch (e: any) {
      toast.error(getFirebaseErrorMessage(e));
      throw new Error(getFirebaseErrorMessage(e));
    }
  };

  const confirmPhoneLogin = async (confirmationResult: ConfirmationResult, otp: string) => {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const freshIdToken = await userCredential.user.getIdToken();
      tokenStore.idToken = freshIdToken;
      setIdToken(freshIdToken);
      const phone = userCredential.user.phoneNumber!;
      const uid = userCredential.user.uid;
      const docId = uid;
      let userDoc: UserProfile | null = null;
      let isNewAccount = false;
      try {
        const snap = await getDoc(doc(db, "users", docId));
        if (snap.exists()) {
          // Existing account: Firestore is the source of truth — discard local guest data.
          userDoc = snap.data() as UserProfile;
          clearLocalGuestData();
        } else {
          // New account via phone: treat like a registration and upload any onboarding data.
          isNewAccount = true;
          userDoc = {
            name: phone,
            email: docId,
            userType: "atleta",
            phone,
            height: 180,
            initialWeight: 80,
            objective: "Manutenção",
            birthDate: "2000-01-01",
            avatarUrl: generateAvatarUrl(getRandomSportAvatar()),
            hasPersonal: false,
          } as any;
          await setDoc(doc(db, "users", docId), userDoc);
          await setDoc(doc(db, "stats", docId), {
            level: 1, xp: 0, streak: 0, bestStreak: 0, weeklyGoal: 3,
            completedThisWeek: 0, totalWorkouts: 0, totalVolume: 0, medalsCount: 0, userEmail: docId,
          });
        }
      } catch (e) {}
      toast.success("Bem-vindo!");
      localStorage.setItem("shape_express_token", docId);
      setToken(docId);
      setCurrentUser({ email: docId });
      setIsLoggedIn(true);
      if (isNewAccount) await uploadLocalDataToFirestore(docId);
      return { token: freshIdToken, user: userDoc };
    } catch (e: any) {
      toast.error(getFirebaseErrorMessage(e));
      throw new Error(getFirebaseErrorMessage(e));
    }
  };


  return {
    isLoggedIn, setIsLoggedIn,
    currentUser,
    token, setToken,
    idToken,
    restoredTab,
    fetchWithAuth,
    login, loginWithGoogle, loginWithPhone, confirmPhoneLogin, register,
    forgotPassword, logout, deleteAccount,
  };
};
