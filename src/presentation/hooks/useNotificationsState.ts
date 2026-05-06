import { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  doc, setDoc, updateDoc, deleteDoc,
  collection, query, where, getDocs, onSnapshot,
} from "firebase/firestore";
import type { AppNotification } from "../../domain/entities";

export const useNotificationsState = (
  currentUser: { email: string } | null,
  isLoggedIn: boolean,
  token: string | null,
) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Real-time notifications listener
  useEffect(() => {
    if (!isLoggedIn || !token) return;
    const emailLower = token.toLowerCase();
    const unsub = onSnapshot(
      query(collection(db, "notifications"), where("userEmail", "==", emailLower)),
      (snap) => {
        setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification)));
      },
      () => {},
    );
    return () => unsub();
  }, [isLoggedIn, token]);

  const sendNotification = async (
    toEmail: string,
    notification: Omit<AppNotification, "id" | "userEmail" | "read">,
  ) => {
    try {
      const notif: AppNotification = {
        ...notification,
        id: Date.now().toString(),
        userEmail: toEmail.toLowerCase(),
        read: false,
      };
      await setDoc(doc(db, "notifications", notif.id), notif);
    } catch (e: any) {
      console.error("[sendNotification] error:", e);
      throw e;
    }
  };

  const getNotifications = async () => {
    const email = currentUser?.email;
    if (!email) return [];
    try {
      const snap = await getDocs(
        query(collection(db, "notifications"), where("userEmail", "==", email.toLowerCase())),
      );
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification));
      setNotifications(data);
      return data;
    } catch (e) {
      return [];
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {}
  };

  const clearAllNotifications = async () => {
    const email = currentUser?.email;
    if (!email) return;
    try {
      const snap = await getDocs(
        query(collection(db, "notifications"), where("userEmail", "==", email.toLowerCase())),
      );
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      setNotifications([]);
    } catch (e) {}
  };

  return {
    notifications, setNotifications,
    sendNotification, getNotifications,
    markNotificationRead, clearAllNotifications,
  };
};
