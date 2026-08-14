import { useState, useMemo, useEffect } from "react";
import { db } from "../../firebase";
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import type { WorkoutTemplate, WorkoutSession, UserProfile } from "../../domain/entities";
import { STORAGE_KEYS } from "../../shared/lib/storageKeys";

const LOCAL_SESSIONS_KEY = STORAGE_KEYS.LOCAL_SESSIONS;
const LOCAL_TEMPLATES_KEY = STORAGE_KEYS.PENDING_TEMPLATES;

function loadLocalSessions(): WorkoutSession[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_SESSIONS_KEY) ?? "[]"); } catch { return []; }
}

function saveLocalSessions(sessions: WorkoutSession[]) {
  localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(sessions));
}

function loadLocalTemplates(): WorkoutTemplate[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_TEMPLATES_KEY) ?? "[]"); } catch { return []; }
}

function saveLocalTemplates(templates: WorkoutTemplate[]) {
  localStorage.setItem(LOCAL_TEMPLATES_KEY, JSON.stringify(templates));
}

function sanitize<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

export const useWorkoutState = (
  currentUser: { email: string } | null,
  token: string | null,
  userProfile: UserProfile | null,
) => {
  const [sessions, setSessions] = useState<WorkoutSession[]>(() =>
    currentUser ? [] : loadLocalSessions()
  );
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() =>
    currentUser ? [] : loadLocalTemplates()
  );
  const [activeWorkout, setActiveWorkoutRaw] = useState<WorkoutSession | null>(() => {
    try { 
      const s = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKOUT); 
      if (!s) return null;
      const session = JSON.parse(s);
      
      // Migration: ensure userEmail exists (for sessions created before this field was added)
      if (session && !session.userEmail && currentUser?.email) {
        console.log('🔄 [useWorkoutState] Migrando activeWorkout: adicionando userEmail');
        session.userEmail = currentUser.email;
        localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(session));
      }
      
      return session;
    } catch { return null; }
  });
  const setActiveWorkout = (s: WorkoutSession | null) => {
    setActiveWorkoutRaw(s);
    try { s ? localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKOUT, JSON.stringify(s)) : localStorage.removeItem(STORAGE_KEYS.ACTIVE_WORKOUT); } catch {}
  };
  const [lastCompletedSession, setLastCompletedSession] = useState<WorkoutSession | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [selectingSheetTemplate, setSelectingSheetTemplate] = useState<WorkoutTemplate | null>(null);
  const [scrollToHistory, setScrollToHistory] = useState(false);
  const [highlightSessionId, setHighlightSessionId] = useState<string | null>(null);

  // Migration: ensure activeWorkout has userEmail
  useEffect(() => {
    if (activeWorkout && !activeWorkout.userEmail && currentUser?.email) {
      console.log('🔄 [useWorkoutState] useEffect: adicionando userEmail ao activeWorkout');
      setActiveWorkout({ ...activeWorkout, userEmail: currentUser.email });
    }
  }, [activeWorkout, currentUser?.email]);

  const email = currentUser?.email || token || localStorage.getItem(STORAGE_KEYS.TOKEN);

  const getTemplates = async () => {
    if (!email) return [];
    try {
      const q = query(collection(db, "templates"), where("userId", "==", email));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate));
      setTemplates(data);
      return data;
    } catch (e) {
      return [];
    }
  };

  const createTemplate = async (t: WorkoutTemplate, silent = false) => {
    // Always stamp userId so Firestore queries and Security Rules work correctly.
    // If the template already has a userId (e.g. trainer creating for a student), keep it.
    const templateToSave: WorkoutTemplate = {
      ...t,
      userId: t.userId ?? currentUser?.email ?? 'guest',
    };

    if (!currentUser) {
      setTemplates((prev) => { const next = [...prev, templateToSave]; saveLocalTemplates(next); return next; });
      return;
    }
    try {
      await setDoc(doc(db, "templates", templateToSave.id), sanitize(templateToSave));
      setTemplates((prev) => [...prev, templateToSave]);
    } catch (e: any) {
    }
  };

  const updateTemplate = async (t: WorkoutTemplate) => {
    const templateToSave: WorkoutTemplate = {
      ...t,
      userId: t.userId ?? currentUser?.email ?? 'guest',
    };

    if (!currentUser) {
      setTemplates((prev) => { const next = prev.map((old) => (old.id === t.id ? templateToSave : old)); saveLocalTemplates(next); return next; });
      return;
    }
    try {
      await setDoc(doc(db, "templates", templateToSave.id), sanitize(templateToSave));
      setTemplates((prev) => prev.map((old) => (old.id === t.id ? templateToSave : old)));
    } catch (e: any) {
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!currentUser) {
      setTemplates((prev) => { const next = prev.filter((t) => t.id !== id); saveLocalTemplates(next); return next; });
      return;
    }
    try {
      await deleteDoc(doc(db, "templates", id));
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (e: any) {
      console.error('[deleteTemplate] Error deleting template:', e.message);
      throw e;
    }
  };

  const getSessions = async () => {
    if (!email) return [];
    try {
      const q = query(collection(db, "sessions"), where("userId", "==", email));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutSession));
      setSessions(data);
      return data;
    } catch (e) {
      return [];
    }
  };

  const createSession = async (s: WorkoutSession) => {
    console.log('📝 [createSession] Iniciando criação de sessão');
    console.log('👤 [createSession] currentUser:', currentUser);
    console.log('📋 [createSession] Dados da sessão:', s);
    
    if (!currentUser) {
      console.log('💾 [createSession] Salvando em localStorage (usuário guest)');
      setSessions((prev) => { const next = [s, ...prev]; saveLocalSessions(next); return next; });
      return;
    }
    
    console.log('🔥 [createSession] Salvando no Firestore (usuário logado)');
    try {
      console.log('🔑 [createSession] ID da sessão:', s.id);
      console.log('👤 [createSession] userId:', s.userId);
      console.log('📧 [createSession] userEmail:', s.userEmail);
      console.log('📄 [createSession] Dados sanitizados:', sanitize(s));
      console.log('📋 [createSession] Todos os campos da sessão:', Object.keys(s));
      
      await setDoc(doc(db, "sessions", s.id), sanitize(s));
      console.log('✅ [createSession] Sessão salva no Firestore com sucesso');
      
      setSessions((prev) => [s, ...prev]);
      console.log('✅ [createSession] Estado local atualizado');
    } catch (e: any) {
      console.error('❌ [createSession] Erro ao salvar no Firestore:', e);
      console.error('❌ [createSession] Mensagem de erro:', e.message);
      console.error('❌ [createSession] Stack trace:', e.stack);
      console.error('❌ [createSession] Código de erro:', e.code);
    }
  };

  const updateSession = async (s: WorkoutSession) => {
    if (!currentUser) {
      setSessions((prev) => { const next = prev.map((old) => (old.id === s.id ? s : old)); saveLocalSessions(next); return next; });
      return;
    }
    try {
      await setDoc(doc(db, "sessions", s.id), sanitize(s));
      setSessions((prev) => prev.map((old) => (old.id === s.id ? s : old)));
    } catch (e: any) {
    }
  };

  const deleteSession = async (id: string) => {
    if (!currentUser) {
      setSessions((prev) => { const next = prev.filter((s) => s.id !== id); saveLocalSessions(next); return next; });
      return;
    }
    try {
      await deleteDoc(doc(db, "sessions", id));
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
    }
  };

  const getStudentTemplates = async (studentEmail: string) => {
    if (!currentUser?.email) return [];
    const trainerEmail = currentUser.email.toLowerCase();
    const studentEmailLower = studentEmail.toLowerCase();
    try {
      const q = query(
        collection(db, "templates"),
        where("userId", "==", studentEmailLower),
        where("creatorEmail", "==", trainerEmail),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate));
    } catch (e: any) {
      console.warn("[getStudentTemplates] compound query failed, using fallback:", e?.message);
      try {
        const q2 = query(collection(db, "templates"), where("userId", "==", studentEmailLower));
        const snap2 = await getDocs(q2);
        return snap2.docs
          .map((d) => ({ id: d.id, ...d.data() } as WorkoutTemplate))
          .filter((t) => (t.creatorEmail || "").toLowerCase() === trainerEmail);
      } catch (e2) {
        return [];
      }
    }
  };

  const filteredTemplates = useMemo(() => {
    if (userProfile?.userType === "treinador") return templates;
    if (!userProfile) return templates.filter((t) => !t.userId || t.userId === 'guest');
    return templates.filter((t) => !t.userId || t.userId === 'guest' || t.userId === userProfile.email);
  }, [templates, userProfile]);

  const userSessions = useMemo(
    () => !userProfile ? sessions : sessions.filter((s) => s.userId === userProfile.email || s.userId === '' || s.userId === 'guest'),
    [sessions, userProfile?.email],
  );

  const filteredSessions = useMemo(() => {
    if (!userProfile) return sessions;
    if (userProfile.userType === "treinador") {
      const studentIds = new Set(templates.filter((t) => t.userId).map((t) => t.userId));
      return sessions.filter(
        (s) => s.userId === userProfile.email || (s.userId && studentIds.has(s.userId)),
      );
    }
    return sessions.filter((s) => s.userId === userProfile.email || s.userId === '' || s.userId === 'guest');
  }, [sessions, userProfile, templates]);

  const resetWorkoutStates = () => {
    localStorage.removeItem(LOCAL_SESSIONS_KEY);
    localStorage.removeItem(LOCAL_TEMPLATES_KEY);
    setSessions([]);
    setTemplates([]);
    setActiveWorkout(null);
    setLastCompletedSession(null);
  };

  return {
    sessions, setSessions,
    templates, setTemplates,
    activeWorkout, setActiveWorkout,
    lastCompletedSession, setLastCompletedSession,
    editingSession, setEditingSession,
    deletingTemplateId, setDeletingTemplateId,
    deletingSessionId, setDeletingSessionId,
    showWorkoutSelector, setShowWorkoutSelector,
    selectingSheetTemplate, setSelectingSheetTemplate,
    scrollToHistory, setScrollToHistory,
    highlightSessionId, setHighlightSessionId,
    filteredTemplates, userSessions, filteredSessions,
    getTemplates, createTemplate, updateTemplate, deleteTemplate,
    getSessions, createSession, updateSession, deleteSession,
    getStudentTemplates,
    resetWorkoutStates,
  };
};
