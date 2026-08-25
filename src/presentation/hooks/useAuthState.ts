import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { tokenStore } from "../../data/services/tokenStore";
import { STORAGE_KEYS } from "../../shared/lib/storageKeys";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  deleteUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { getFirebaseErrorMessage } from "../../utils/firebaseErrors";
import type { UserProfile, WorkoutTemplate, WorkoutSession } from "../../domain/entities";

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
    STORAGE_KEYS.PENDING_TEMPLATES,
    STORAGE_KEYS.LOCAL_SESSIONS,
    STORAGE_KEYS.LOCAL_STATS,
    STORAGE_KEYS.LOCAL_USER_PROFILE,
    STORAGE_KEYS.LOCAL_TRAINING_PROFILE,
    STORAGE_KEYS.LOCAL_CALORIE_PROFILE,
    STORAGE_KEYS.LOCAL_EXERCISE_STATS,
    STORAGE_KEYS.ACTIVE_WORKOUT,
    STORAGE_KEYS.WELCOME_ANSWERS,
  ];
  keys.forEach((k) => localStorage.removeItem(k));
}

/**
 * Uploads all local guest data to Firestore under the given user email,
 * then wipes the local copies. Called after a successful registration so
 * data collected during onboarding is persisted to the user's account.
 */
async function uploadLocalDataToFirestore(email: string) {
  const templates: WorkoutTemplate[] = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_TEMPLATES) ?? "[]"); } catch { return []; } })();
  const sessions: WorkoutSession[] = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_SESSIONS) ?? "[]"); } catch { return []; } })();
  const localStats = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOCAL_STATS) ?? "null"); } catch { return null; } })();

  // Use allSettled so a single failed write does not abort the others.
  const results = await Promise.allSettled([
    ...templates.map((t) => {
      // Ensure creatorEmail is always defined (required by Firestore rules)
      // Preserve "AICoach" for AI-generated workouts, otherwise use user email
      const creatorEmail = (t.creatorEmail && t.creatorEmail !== 'guest') ? t.creatorEmail : email;
      
      const templateData = {
        ...t,
        userId: email,
        creatorEmail,
      };
      
      return setDoc(doc(db, "templates", t.id), sanitize(templateData));
    }),
    // Sessions also need the real userId — guests store them with '' or 'guest'.
    ...sessions.map((s) => setDoc(doc(db, "sessions", s.id), sanitize({ ...s, userId: email, userEmail: email }))),
    ...(localStats ? [setDoc(doc(db, "stats", email), { ...localStats, userEmail: email }, { merge: true })] : []),
  ]);

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(`[uploadLocalDataToFirestore] ${failed.length} write(s) failed:`, failed);
  }

  // Clear local copies regardless of individual failures — on next login
  // useSyncState will load the authoritative data from Firestore.
  clearLocalGuestData();
}

// Tracks which token has already been synced to prevent Strict Mode double-invoke
// Using an object so the reference is stable and mutable across modules
export const syncState = { syncedToken: null as string | null };
export const resetSyncedToken = () => { syncState.syncedToken = null; };

export const useAuthState = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // authReady: false until onAuthStateChanged fires for the first time.
  // Used to block rendering before Firebase has resolved the session.
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(STORAGE_KEYS.TOKEN));
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

  /**
   * Shared post-authentication handler for Google sign-in.
   * Called both from the popup path (web) and from getRedirectResult (native boot).
   * Defined before useEffect so the closure is available when getRedirectResult resolves.
   */
  const handleGoogleCredential = async (userCredential: Awaited<ReturnType<typeof signInWithPopup>>) => {
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
        const wa = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null'); } catch { return null; } })();
        const resolvedUserType: "atleta" | "treinador" = wa?.userType === "treinador" ? "treinador" : "atleta";
        const firstName = (userCredential.user.displayName || 'Usuário').split(' ')[0];
        const lastName = (userCredential.user.displayName || '').split(' ').slice(1).join(' ') || undefined;
        userDoc = {
          firstName,
          lastName,
          email,
          userType: resolvedUserType,
          height: 180,
          initialWeight: 80,
          objective: "Manutenção",
          birthDate: "2000-01-01",
          weeklyGoal: 3,
        } as UserProfile;
        // 'name' is required by Firestore Security Rules but not part of the TypeScript type
        (userDoc as any).name = lastName ? `${firstName} ${lastName}` : firstName;
        await setDoc(doc(db, "users", email), userDoc as any);
        await setDoc(doc(db, "stats", email), {
          level: 1, xp: 0, streak: 0, bestStreak: 0,
          completedThisWeek: 0, totalWorkouts: 0, totalVolume: 0, medalsCount: 0, userEmail: email,
        });
      }
    } catch (e) {}
    // Upload local guest data BEFORE setting isLoggedIn=true (for new accounts only)
    if (isNewAccount) await uploadLocalDataToFirestore(email);
    localStorage.setItem(STORAGE_KEYS.TOKEN, email);
    setToken(email);
    setCurrentUser({ email });
    setIsLoggedIn(true);
    return { token: freshIdToken, user: userDoc };
  };

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setRestoredTab(localStorage.getItem(STORAGE_KEYS.WELCOME_DONE) ? "dashboard" : "landing");
      // Ensure splash never stays forever if Firebase times out
      setAuthReady(true);
    }, 5000);

    // On native Capacitor, signInWithRedirect returns the credential here when
    // the app resumes from the Chrome Custom Tab. Must be called before
    // onAuthStateChanged so the session is established before the listener fires.
    if (Capacitor.isNativePlatform()) {
      getRedirectResult(auth).then((result) => {
        if (result) {
          handleGoogleCredential(result).catch(() => {});
        }
      }).catch(() => {});
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(fallbackTimer);
      if (firebaseUser?.email) {
        const email = firebaseUser.email;
        const freshIdToken = await firebaseUser.getIdToken();
        tokenStore.idToken = freshIdToken;
        setIdToken(freshIdToken);
        localStorage.setItem(STORAGE_KEYS.TOKEN, email);
        setToken(email);
        setCurrentUser({ email });
        setIsLoggedIn(true);
        setRestoredTab(localStorage.getItem(STORAGE_KEYS.DEFAULT_TAB) || "dashboard");
        setAuthReady(true);
      } else {
        tokenStore.idToken = null;
        setIdToken(null);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        syncState.syncedToken = null;
        setToken(null);
        setCurrentUser(null);
        setIsLoggedIn(false);
        setRestoredTab(localStorage.getItem(STORAGE_KEYS.WELCOME_DONE) ? "dashboard" : "landing");
        setAuthReady(true);
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
      localStorage.setItem(STORAGE_KEYS.TOKEN, email);
      setToken(email);
      setCurrentUser({ email });
      setIsLoggedIn(true);
      // Login: discard any local guest data so only Firestore data is shown.
      // useSyncState will load the user's real data as soon as isLoggedIn flips.
      clearLocalGuestData();
      return { token: freshIdToken, user: userDoc || { email, name: email.split("@")[0] } };
    } catch (e: any) {
      if (e.code === "auth/operation-not-allowed") {
      } else {
      }
      throw new Error(getFirebaseErrorMessage(e));
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    // On native Capacitor the WebView cannot receive the popup result back —
    // use redirect instead. The result is picked up by getRedirectResult() in
    // the boot useEffect when the app resumes from the Custom Tab.
    if (Capacitor.isNativePlatform()) {
      await signInWithRedirect(auth, provider);
      // signInWithRedirect navigates away; execution does not continue here.
      return;
    }

    // Web: use popup as before.
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleGoogleCredential(userCredential);
    } catch (e: any) {
      throw new Error(getFirebaseErrorMessage(e));
    }
  };

  const register = async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const freshIdToken = await userCredential.user.getIdToken();
      tokenStore.idToken = freshIdToken;
      setIdToken(freshIdToken);
      const resolvedUserType: "atleta" | "treinador" = data.userType === "treinador" ? "treinador" : "atleta";
      const isTrainer = resolvedUserType === "treinador";
      const userProfile = {
        ...data,
        // Add 'name' field required by Firestore rules (combines firstName + lastName)
        name: data.lastName ? `${data.firstName} ${data.lastName}` : data.firstName,
        userType: resolvedUserType,
        height: data.height || 180,
        initialWeight: data.initialWeight || 80,
        objective: data.objective || "Manutenção",
        birthDate: data.birthDate || "2000-01-01",
        weeklyGoal: data.weeklyGoal ?? 3,
        ...(isTrainer ? { personalCode: Math.random().toString(36).substring(2, 8).toUpperCase() } : {}),
      };
      delete userProfile.password;

      try {
        await setDoc(doc(db, "users", data.email), userProfile);
        await setDoc(doc(db, "stats", data.email), {
          level: 1, xp: 0, streak: 0, bestStreak: 0,
          completedThisWeek: 0, totalWorkouts: 0, totalVolume: 0, medalsCount: 0, userEmail: data.email,
        });
      } catch (e) {}
      // Upload local guest data BEFORE setting isLoggedIn=true
      // so useSyncState fetches already-uploaded data
      await uploadLocalDataToFirestore(data.email);
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.email);
      setToken(data.email);
      setCurrentUser({ email: data.email });
      setIsLoggedIn(true);
      return { token: freshIdToken, user: userProfile };
    } catch (e: any) {
      if (e.code === "auth/operation-not-allowed") {
      } else if (e.code !== "auth/email-already-in-use") {
      }
      throw e;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { message: "Email enviado" };
    } catch (e: any) {
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
      throw e;
    }
    Object.keys(localStorage)
      .filter((k) => k.startsWith("firebase:"))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    tokenStore.idToken = null;
    syncState.syncedToken = null;
    setIdToken(null);
    setToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    onLogout?.();
  };

  const logout = async (onLogout?: () => void) => {
    await signOut(auth);
    Object.keys(localStorage)
      .filter((k) => k.startsWith("firebase:"))
      .forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    tokenStore.idToken = null;
    syncState.syncedToken = null;
    setIdToken(null);
    setToken(null);
    setCurrentUser(null);
    setIsLoggedIn(false);
    onLogout?.();
  };

  const loginWithPhone = async (phoneNumber: string, recaptchaContainer: HTMLElement): Promise<ConfirmationResult> => {
    try {
      const verifier = new RecaptchaVerifier(auth, recaptchaContainer, { size: 'invisible' });
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      verifier.clear();
      return result;
    } catch (e: any) {
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
          const wa = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null'); } catch { return null; } })();
          const resolvedUserType: "atleta" | "treinador" = wa?.userType === "treinador" ? "treinador" : "atleta";
          userDoc = {
            firstName: phone,
            // Add 'name' field required by Firestore rules
            name: phone,
            email: docId,
            userType: resolvedUserType,
            phone,
            height: 180,
            initialWeight: 80,
            objective: "Manutenção",
            birthDate: "2000-01-01",
            weeklyGoal: 3,
          } as any;
          await setDoc(doc(db, "users", docId), userDoc);

          await setDoc(doc(db, "stats", docId), {
            level: 1, xp: 0, streak: 0, bestStreak: 0,
            completedThisWeek: 0, totalWorkouts: 0, totalVolume: 0, medalsCount: 0, userEmail: docId,
          });
        }
      } catch (e) {}
      // Upload local guest data BEFORE setting isLoggedIn=true (for new accounts only)
      if (isNewAccount) await uploadLocalDataToFirestore(docId);
      localStorage.setItem(STORAGE_KEYS.TOKEN, docId);
      setToken(docId);
      setCurrentUser({ email: docId });
      setIsLoggedIn(true);
      return { token: freshIdToken, user: userDoc };
    } catch (e: any) {
      throw new Error(getFirebaseErrorMessage(e));
    }
  };


  return {
    isLoggedIn, setIsLoggedIn,
    authReady,
    currentUser,
    token, setToken,
    idToken,
    restoredTab,
    fetchWithAuth,
    login, loginWithGoogle, loginWithPhone, confirmPhoneLogin, register,
    forgotPassword, logout, deleteAccount,
  };
};
