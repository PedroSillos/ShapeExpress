import { useState } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import type { ChatMessage, Student } from "../../domain/entities";

export const useChatState = (currentUser: { email: string } | null) => {
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [activeChatStudent, setActiveChatStudent] = useState<Student | null>(null);

  const getMessages = async (otherEmail: string) => {
    const myEmail = currentUser?.email;
    if (!myEmail) return [];
    const roomId = [myEmail.toLowerCase(), otherEmail.toLowerCase()].sort().join("_");
    try {
      const snap = await getDocs(
        query(collection(db, "messages", roomId, "msgs"), where("roomId", "==", roomId)),
      );
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as ChatMessage))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (e) {
      return [];
    }
  };

  const sendMessage = async (otherEmail: string, text: string) => {
    const myEmail = currentUser?.email;
    if (!myEmail) throw new Error("Not authenticated");
    const roomId = [myEmail.toLowerCase(), otherEmail.toLowerCase()].sort().join("_");
    const msg: Omit<ChatMessage, "id"> & { roomId: string } = {
      senderId: myEmail,
      receiverId: otherEmail.toLowerCase(),
      text,
      timestamp: new Date().toISOString(),
      roomId,
    };
    const ref = await addDoc(collection(db, "messages", roomId, "msgs"), msg);
    return { id: ref.id, ...msg };
  };

  return {
    chatMessages, setChatMessages,
    activeChatStudent, setActiveChatStudent,
    getMessages, sendMessage,
  };
};
