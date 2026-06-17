import { useState, useMemo } from "react";
import { toast } from "sonner";
import { db } from "../../firebase";
import { doc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import type { WorkoutTemplate, WorkoutSession, UserProfile } from "../../domain/entities";

const LOCAL_SESSIONS_KEY = "local_sessions";
const LOCAL_TEMPLATES_KEY = "pending-templates";

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
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => loadLocalTemplates());
  const [activeWorkout, setActiveWorkout] = useState<WorkoutSession | null>(null);
  const [lastCompletedSession, setLastCompletedSession] = useState<WorkoutSession | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [selectingSheetTemplate, setSelectingSheetTemplate] = useState<WorkoutTemplate | null>(null);
  const [scrollToHistory, setScrollToHistory] = useState(false);

  const email = currentUser?.email || token || localStorage.getItem("shape_express_token");

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

  const createTemplate = async (t: WorkoutTemplate) => {
    if (!currentUser) {
      setTemplates((prev) => { const next = [...prev, t]; saveLocalTemplates(next); return next; });
      toast.success("Treino criado!");
      return;
    }
    try {
      await setDoc(doc(db, "templates", t.id), sanitize(t));
      setTemplates((prev) => [...prev, t]);
      toast.success("Treino criado!");
    } catch (e: any) {
      toast.error("Erro ao criar treino: " + e.message);
    }
  };

  const updateTemplate = async (t: WorkoutTemplate) => {
    if (!currentUser) {
      setTemplates((prev) => { const next = prev.map((old) => (old.id === t.id ? t : old)); saveLocalTemplates(next); return next; });
      toast.success("Treino atualizado!");
      return;
    }
    try {
      await setDoc(doc(db, "templates", t.id), sanitize(t));
      setTemplates((prev) => prev.map((old) => (old.id === t.id ? t : old)));
      toast.success("Treino atualizado!");
    } catch (e: any) {
      toast.error("Erro ao atualizar treino: " + e.message);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!currentUser) {
      setTemplates((prev) => { const next = prev.filter((t) => t.id !== id); saveLocalTemplates(next); return next; });
      toast.success("Treino removido.");
      return;
    }
    try {
      await deleteDoc(doc(db, "templates", id));
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Treino removido.");
    } catch (e: any) {
      toast.error("Erro ao remover treino: " + e.message);
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
    if (!currentUser) {
      setSessions((prev) => { const next = [s, ...prev]; saveLocalSessions(next); return next; });
      toast.success("Treino finalizado!");
      return;
    }
    try {
      await setDoc(doc(db, "sessions", s.id), sanitize(s));
      setSessions((prev) => [s, ...prev]);
      toast.success("Treino finalizado!");
    } catch (e: any) {
      toast.error("Erro ao salvar sessão: " + e.message);
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
      toast.error("Erro ao atualizar sessão: " + e.message);
    }
  };

  const deleteSession = async (id: string) => {
    if (!currentUser) {
      setSessions((prev) => { const next = prev.filter((s) => s.id !== id); saveLocalSessions(next); return next; });
      toast.success("Sessão removida.");
      return;
    }
    try {
      await deleteDoc(doc(db, "sessions", id));
      setSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success("Sessão removida.");
    } catch (e: any) {
      toast.error("Erro ao remover sessão: " + e.message);
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
    return templates.filter((t) => !t.userId || t.userId === userProfile.email);
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
    editingTemplate, setEditingTemplate,
    editingSession, setEditingSession,
    deletingTemplateId, setDeletingTemplateId,
    deletingSessionId, setDeletingSessionId,
    showWorkoutSelector, setShowWorkoutSelector,
    selectingSheetTemplate, setSelectingSheetTemplate,
    scrollToHistory, setScrollToHistory,
    filteredTemplates, userSessions, filteredSessions,
    getTemplates, createTemplate, updateTemplate, deleteTemplate,
    getSessions, createSession, updateSession, deleteSession,
    getStudentTemplates,
    resetWorkoutStates,
  };
};
