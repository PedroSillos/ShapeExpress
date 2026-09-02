import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { tokenStore } from "../../data/services/tokenStore";
import { STORAGE_KEYS } from "../../shared/lib/storageKeys";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  deleteUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
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

// profileReady: set to true by handleGoogleCredential / confirmPhoneLogin after Firestore
// docs are confirmed written. useSyncState checks this before starting a sync so it never
// reads Firestore before the new user's docs exist.
export const profileReadyState = { ready: true };

// While a Google login is in progress, onAuthStateChanged must not set isLoggedIn=true
// on its own — handleGoogleCredential will do it after writing Firestore docs (or reject).
export const authFlowState = { googleInProgress: false };

/**
 * Single source of truth for new user profile creation.
 * Reads all onboarding answers from WELCOME_ANSWERS, merges them with the
 * provided identifiers, and writes three Firestore documents atomically:
 *   - users/{docId}              → public fields
 *   - users/{docId}/private/data → private fields
 *   - stats/{docId}              → zeroed stats
 *
 * Called by all three registration flows (email, Google, phone) so the
 * data written is always identical regardless of the auth method used.
 *
 * @param docId   Firestore document key (email lowercase for email/Google, uid for phone)
 * @param params  Identifiers that cannot come from WELCOME_ANSWERS
 */
async function createFirestoreProfile(
  docId: string,
  params: {
    firstName: string;
    lastName?: string;
    /** email address for email/Google users; phone number for phone users */
    email: string;
    phone?: string;
  },
): Promise<Record<string, unknown>> {
  const { firstName, lastName, email, phone } = params;

  const wa: {
    userType?: 'atleta' | 'treinador';
    sports?: string[];
    objective?: string;
    source?: string;
    experiences?: Record<string, string>;
    weeklyGoal?: number;
    height?: number;
    weight?: number;
    birthDate?: string;
    notifications?: boolean;
  } | null = (() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WELCOME_ANSWERS) ?? 'null'); } catch { return null; }
  })();

  const resolvedUserType: 'atleta' | 'treinador' = wa?.userType === 'treinador' ? 'treinador' : 'atleta';
  const isTrainer = resolvedUserType === 'treinador';

  // experienceLevel: derived from the first selected sport's experience entry
  const firstSport = wa?.sports?.[0];
  const experienceLevel = (firstSport && wa?.experiences?.[firstSport]) ? wa.experiences[firstSport] : undefined;

  // Public fields — stored in users/{docId}
  const pubFields = sanitize({
    firstName,
    ...(lastName ? { lastName } : {}),
    name: lastName ? `${firstName} ${lastName}` : firstName,
    email,
    userType: resolvedUserType,
    ...(wa?.weeklyGoal !== undefined ? { weeklyGoal: wa.weeklyGoal } : {}),
    ...(wa?.sports?.length ? { specialties: wa.sports } : {}),
    ...(wa?.source ? { source: wa.source } : {}),
    // personalCode for trainers (SEC-007: cryptographically secure PRNG)
    ...(isTrainer ? {
      personalCode: Array.from(crypto.getRandomValues(new Uint8Array(5)))
        .map((b) => b.toString(36).padStart(2, '0'))
        .join('')
        .toUpperCase()
        .substring(0, 6),
    } : {}),
  } as Record<string, unknown>);

  // Private fields — stored in users/{docId}/private/data
  const privFields = sanitize({
    ...(wa?.height !== undefined ? { height: Number(wa.height) } : {}),
    ...(wa?.weight !== undefined ? { initialWeight: Number(wa.weight) } : {}),
    ...(wa?.objective ? { objective: wa.objective } : {}),
    ...(wa?.birthDate ? { birthDate: wa.birthDate } : {}),
    ...(experienceLevel ? { experienceLevel } : {}),
    ...(phone ? { phone } : {}),
  } as Record<string, unknown>);

  // statsEmail: for phone users the email field holds the phone number
  const statsEmail = email;

  await Promise.all([
    setDoc(doc(db, "users", docId), pubFields),
    setDoc(doc(db, "users", docId, "private", "data"), privFields),
    setDoc(doc(db, "stats", docId), {
      level: 1, xp: 0, streak: 0, bestStreak: 0,
      completedThisWeek: 0, totalWorkouts: 0, totalVolume: 0,
      medalsCount: 0, userEmail: statsEmail,
    }),
  ]);

  return { ...pubFields, ...privFields };
}

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
  const handleGoogleCredential = async (
    userCredential: Awaited<ReturnType<typeof signInWithPopup>>,
    mode: 'login' | 'register' = 'register',
  ) => {
    const freshIdToken = await userCredential.user.getIdToken();
    tokenStore.idToken = freshIdToken;
    setIdToken(freshIdToken);
    const email = userCredential.user.email!;
    const emailLower = email.toLowerCase();
    let userDoc: UserProfile | null = null;
    let isNewAccount = false;
    try {
      const snap = await getDoc(doc(db, "users", emailLower));
      if (snap.exists()) {
        // Existing account: Firestore is the source of truth — discard local guest data.
        userDoc = snap.data() as UserProfile;
        clearLocalGuestData();
      } else {
        // If the user clicked "Login with Google" but has no account, reject instead of
        // silently creating one. Only the register flow is allowed to create new accounts.
        if (mode === 'login') {
          // Delete the Firebase Auth user that was just created by signInWithPopup,
          // then sign out — leaving no trace in Authentication.
          try { await deleteUser(userCredential.user); } catch (_) {}
          await signOut(auth);
          throw new Error("Conta não encontrada. Crie uma conta primeiro.");
        }
        // New account via Google: use createFirestoreProfile() — same as all other flows.
        isNewAccount = true;
        profileReadyState.ready = false;
        const firstName = (userCredential.user.displayName || 'Usuário').split(' ')[0];
        const lastName = (userCredential.user.displayName || '').split(' ').slice(1).join(' ') || undefined;
        try {
          const builtDoc = await createFirestoreProfile(emailLower, { firstName, lastName, email: emailLower });
          userDoc = builtDoc as unknown as UserProfile;
        } catch (writeErr: any) {
          console.error('[auth:google] ❌ erro ao criar docs:', writeErr?.code, writeErr?.message);
        } finally {
          profileReadyState.ready = true;
        }
      }
    } catch (e: any) {
      profileReadyState.ready = true;
      console.error('[auth:google] ❌ erro no getDoc:', e?.code, e?.message);
      throw e;
    }
    // Upload local guest data BEFORE setting isLoggedIn=true (for new accounts only)
    if (isNewAccount) await uploadLocalDataToFirestore(emailLower);
    localStorage.setItem(STORAGE_KEYS.TOKEN, emailLower);
    setToken(emailLower);
    setCurrentUser({ email: emailLower });
    setIsLoggedIn(true);
    return { token: freshIdToken, user: userDoc };
  };

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setRestoredTab(localStorage.getItem(STORAGE_KEYS.WELCOME_DONE) ? "dashboard" : "landing");
      // Ensure splash never stays forever if Firebase times out
      setAuthReady(true);
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(fallbackTimer);
      if (firebaseUser?.email) {
        // If loginWithGoogle is in progress, let handleGoogleCredential take over
        // after it finishes writing Firestore docs (or deletes the user on error).
        // Without this guard, onAuthStateChanged races with handleGoogleCredential
        // and triggers useSyncState before the new user's docs exist.
        if (authFlowState.googleInProgress) {
          setAuthReady(true);
          return;
        }
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
        if (snap.exists()) {
          userDoc = snap.data();
        }
      } catch (e: any) {
        console.error('[auth:login] ❌ erro no getDoc:', e?.code, e?.message);
      }
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

  const loginWithGoogle = async (mode: 'login' | 'register' = 'register') => {
    authFlowState.googleInProgress = true;
    if (Capacitor.isNativePlatform()) {
      try {
        const result = await FirebaseAuthentication.signInWithGoogle();
        const idToken = result.credential?.idToken;
        if (!idToken) throw new Error("Google Sign-In não retornou um token.");
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        await handleGoogleCredential(userCredential, mode);
      } catch (e: any) {
        authFlowState.googleInProgress = false;
        throw new Error(getFirebaseErrorMessage(e));
      }
      authFlowState.googleInProgress = false;
      return;
    }

    // Web: use popup as before.
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      await handleGoogleCredential(userCredential, mode);
    } catch (e: any) {
      authFlowState.googleInProgress = false;
      if (e.message === "Conta não encontrada. Crie uma conta primeiro.") throw e;
      throw new Error(getFirebaseErrorMessage(e));
    }
    authFlowState.googleInProgress = false;
  };

  const register = async (data: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const freshIdToken = await userCredential.user.getIdToken();
      tokenStore.idToken = freshIdToken;
      setIdToken(freshIdToken);

      // SEC-018: send email verification so the user confirms ownership of the address.
      // Non-blocking: failure is tolerated — the account is still created.
      try {
        await sendEmailVerification(userCredential.user);
      } catch (_verifyErr) {
        if (import.meta.env.DEV) {
          console.warn('[register] sendEmailVerification failed:', _verifyErr);
        }
      }

      const emailLower = data.email.toLowerCase();
      let userProfile: Record<string, unknown> = {};
      try {
        userProfile = await createFirestoreProfile(emailLower, {
          firstName: data.firstName,
          lastName: data.lastName,
          email: emailLower,
          phone: data.phone,
        });
      } catch (e: any) {
        console.error('[auth:register] ❌ erro ao criar docs:', e?.code, e?.message);
      }

      await uploadLocalDataToFirestore(emailLower);
      localStorage.setItem(STORAGE_KEYS.TOKEN, emailLower);
      setToken(emailLower);
      setCurrentUser({ email: emailLower });
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
    localStorage.clear();
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
          // New account via phone: use createFirestoreProfile() — same as all other flows.
          // Phone number is stored in the email field (SEC-019) so it acts as identifier
          // in features that rely on userProfile.email. Document key remains the uid.
          isNewAccount = true;
          try {
            const builtDoc = await createFirestoreProfile(docId, {
              firstName: phone,
              email: phone,
              phone,
            });
            userDoc = builtDoc as unknown as UserProfile;
          } catch (writeErr: any) {
            console.error('[auth:phone] ❌ erro ao criar docs:', writeErr?.code, writeErr?.message);
          }
        }
      } catch (e: any) {
        console.error('[auth:phone] ❌ erro no getDoc:', e?.code, e?.message);
      }
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
