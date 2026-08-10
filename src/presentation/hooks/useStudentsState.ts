import { useState } from "react";
import { db } from "../../firebase";
import {
  doc, getDoc, setDoc, deleteDoc, updateDoc,
  collection, query, where, getDocs, addDoc,
} from "firebase/firestore";
import type { Student, UserProfile, TrainerConnection, WorkoutSession } from "../../domain/entities";
import { fullName } from "../../domain/entities";
import { STORAGE_KEYS } from "../../shared/lib/storageKeys";

export const useStudentsState = (
  currentUser: { email: string } | null,
  token: string | null,
) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<UserProfile[]>([]);
  const [trainerConnections, setTrainerConnections] = useState<TrainerConnection[]>([]);
  const [studentConnections, setStudentConnections] = useState<TrainerConnection[]>([]);
  const [selectedStudentForWorkouts, setSelectedStudentForWorkouts] = useState<Student | null>(null);
  const [selectedStudentForEvolution, setSelectedStudentForEvolution] = useState<Student | null>(null);

  console.log('🔄 [useStudentsState] Current trainers state:', trainers.length);

  const email = currentUser?.email || token || localStorage.getItem(STORAGE_KEYS.TOKEN);

  const buildStudentFromEmail = async (sEmail: string): Promise<Student> => {
    const emailL = sEmail.toLowerCase();
    let userData: UserProfile | null = null;
    try {
      const snap = await getDocs(query(collection(db, "users"), where("email", "==", emailL)));
      if (!snap.empty) {
        userData = snap.docs[0].data() as UserProfile;
      } else {
        const d = await getDoc(doc(db, "users", emailL));
        if (d.exists()) userData = d.data() as UserProfile;
      }
    } catch (e) {}

    let lastWorkout = "";
    const weeklyWorkouts = [0, 0, 0, 0, 0, 0, 0];
    try {
      const sessSnap = await getDocs(query(collection(db, "sessions"), where("userId", "==", emailL)));
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
      id: userData?.email || emailL,
      name: userData ? fullName(userData) : emailL.split("@")[0],
      email: userData?.email || emailL,
      objective: userData?.objective,
      experienceLevel: userData?.experienceLevel,
      lastWorkout,
      progress: 50,
      streak: 0,
      status: "new" as const,
      weeklyWorkouts,
      score: 0,
      connectionStatus: "accepted" as const,
    };
  };

  const getTrainers = async () => {
    try {
      const q = query(collection(db, "users"), where("userType", "==", "treinador"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => d.data() as UserProfile);
      setTrainers(data);
      return data;
    } catch (e) {
      return [];
    }
  };

  const getStudents = async () => {
    if (!email) return [];
    try {
      const emailLower = email.toLowerCase();
      const [snapLower, snapOriginal] = await Promise.all([
        getDocs(query(collection(db, "connections"), where("trainerEmail", "==", emailLower))),
        email !== emailLower
          ? getDocs(query(collection(db, "connections"), where("trainerEmail", "==", email)))
          : Promise.resolve(null),
      ]);

      let allDocs = [...snapLower.docs, ...(snapOriginal?.docs || [])];
      if (allDocs.length === 0) {
        const fallbackSnap = await getDocs(
          query(collection(db, "connections"), where("status", "==", "accepted")),
        );
        allDocs = fallbackSnap.docs.filter(
          (d) => (d.data().trainerEmail || "").toLowerCase() === emailLower,
        );
      }

      const seen = new Set<string>();
      const uniqueDocs = allDocs.filter((d) => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      });
      const acceptedConnections = uniqueDocs.map((d) => d.data()).filter((data) => data.status === "accepted");

      if (acceptedConnections.length === 0) { setStudents([]); return []; }

      const resolvedStudents = await Promise.all(
        acceptedConnections.map((data) => buildStudentFromEmail(data.studentEmail as string)),
      );
      setStudents(resolvedStudents);
      return resolvedStudents;
    } catch (e) {
      console.error("[getStudents] error:", e);
      return [];
    }
  };

  const requestConnection = async (trainerCode: string) => {
    if (!currentUser?.email) return;
    try {
      const qTr = query(collection(db, "users"), where("personalCode", "==", trainerCode));
      const trainerSnap = await getDocs(qTr);
      const trainer = trainerSnap.docs[0].data() as UserProfile;

      const checkQ = query(
        collection(db, "connections"),
        where("studentEmail", "==", currentUser.email.toLowerCase()),
        where("trainerEmail", "==", trainer.email.toLowerCase()),
      );
      const checkSnap = await getDocs(checkQ);

      const newConnection: TrainerConnection = {
        id: Date.now().toString(),
        studentEmail: currentUser.email.toLowerCase(),
        trainerEmail: trainer.email.toLowerCase(),
        status: "pending",
        createdAt: new Date().toISOString(),
        trainerName: fullName(trainer),
      };
      await setDoc(doc(db, "connections", newConnection.id), newConnection);
      setStudentConnections((prev) => [...prev, newConnection]);
    } catch (e: any) {
      console.error(e);
    }
  };

  const getTrainerConnections = async () => {
    if (!email) return [];
    try {
      const emailLower = email.toLowerCase();
      const [snapLower, snapOriginal] = await Promise.all([
        getDocs(query(collection(db, "connections"), where("trainerEmail", "==", emailLower))),
        email !== emailLower
          ? getDocs(query(collection(db, "connections"), where("trainerEmail", "==", email)))
          : Promise.resolve(null),
      ]);
      const allDocs = [...snapLower.docs, ...(snapOriginal?.docs || [])];
      const seen = new Set<string>();
      const data = allDocs
        .filter((d) => { if (seen.has(d.id)) return false; seen.add(d.id); return true; })
        .map((d) => d.data() as TrainerConnection);
      setTrainerConnections(data);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const getStudentConnections = async () => {
    if (!currentUser?.email) return [];
    try {
      const q = query(collection(db, "connections"), where("studentEmail", "==", currentUser.email.toLowerCase()));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => d.data() as TrainerConnection);
      setStudentConnections(data);
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const respondToConnection = async (id: string, status: "accepted" | "rejected") => {
    if (!currentUser?.email) return;
    try {
      const connRef = doc(db, "connections", id);
      if (status === "rejected") {
        await deleteDoc(connRef);
        setTrainerConnections((prev) => prev.filter((c) => c.id !== id));
      } else {
        const connectionDoc = await getDoc(connRef);
        if (connectionDoc.exists()) {
          const studentEmail = connectionDoc.data().studentEmail;
          await updateDoc(connRef, { status });
          setTrainerConnections((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
          const newStudent = await buildStudentFromEmail(studentEmail);
          setStudents((prev) => {
            if (prev.some((s) => (s.email || "").toLowerCase() === (newStudent.email || "").toLowerCase())) return prev;
            return [...prev, newStudent];
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const disconnectTrainer = async (trainerEmail: string) => {
    if (!currentUser?.email) return;
    try {
      const q = query(
        collection(db, "connections"),
        where("studentEmail", "==", currentUser.email.toLowerCase()),
        where("trainerEmail", "==", trainerEmail.toLowerCase()),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        for (const d of snap.docs) await deleteDoc(d.ref);
        setStudentConnections((prev) => prev.filter((c) => c.trainerEmail !== trainerEmail));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const disconnectStudent = async (studentEmail: string) => {
    if (!currentUser?.email) return;
    try {
      const q = query(
        collection(db, "connections"),
        where("trainerEmail", "==", currentUser.email.toLowerCase()),
        where("studentEmail", "==", studentEmail.toLowerCase()),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        for (const d of snap.docs) await deleteDoc(d.ref);
        setTrainerConnections((prev) => prev.filter((c) => c.studentEmail !== studentEmail));
        setStudents((prev) => prev.filter((s) => s.email !== studentEmail));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetStudentsStates = () => {
    setStudents([]);
    setTrainers([]);
    setTrainerConnections([]);
    setStudentConnections([]);
  };

  return {
    students, setStudents,
    trainers, setTrainers,
    trainerConnections, setTrainerConnections,
    studentConnections, setStudentConnections,
    selectedStudentForWorkouts, setSelectedStudentForWorkouts,
    selectedStudentForEvolution, setSelectedStudentForEvolution,
    getTrainers, getStudents,
    requestConnection, getTrainerConnections, getStudentConnections,
    respondToConnection, disconnectTrainer, disconnectStudent,
    resetStudentsStates,
  };
};
