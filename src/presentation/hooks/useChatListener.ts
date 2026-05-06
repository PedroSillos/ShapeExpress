import { useEffect, useRef } from 'react';
import { Student, UserProfile, ChatMessage } from '../../domain/entities';

interface UseChatListenerParams {
  activeChatStudent: Student | null;
  userProfile: UserProfile;
  setChatMessages: (fn: (prev: Record<string, ChatMessage[]>) => Record<string, ChatMessage[]>) => void;
}

export function useChatListener({ activeChatStudent, userProfile, setChatMessages }: UseChatListenerParams) {
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    unsubRef.current?.();
    unsubRef.current = null;
    if (!activeChatStudent || !userProfile?.email) return;

    const myEmail = userProfile.email.toLowerCase();
    const otherEmail = activeChatStudent.email.toLowerCase();
    const roomId = [myEmail, otherEmail].sort().join('_');

    Promise.all([import('firebase/firestore'), import('../../firebase')]).then(
      ([{ collection, query, onSnapshot }, { db }]) => {
        const unsub = onSnapshot(
          query(collection(db, 'messages', roomId, 'msgs')),
          (snapshot) => {
            const msgs = snapshot.docs
              .map(d => ({ id: d.id, ...d.data() } as any))
              .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            setChatMessages(prev => ({ ...prev, [activeChatStudent.id]: msgs }));
          },
        );
        unsubRef.current = unsub;
      },
    );

    return () => { unsubRef.current?.(); unsubRef.current = null; };
  }, [activeChatStudent?.id, userProfile?.email]);
}
