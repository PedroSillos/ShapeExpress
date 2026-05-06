import { useState } from "react";
import { db } from "../../firebase";
import {
  doc, getDoc, setDoc, deleteDoc, updateDoc, addDoc,
  collection, query, where, getDocs,
} from "firebase/firestore";
import type {
  Post, Community, Challenge, UserChallenge,
  CommunityMessage, Ranking, CommunityMember, CommunityRole,
  UserProfile, UserStats,
} from "../../domain/entities";

export const useCommunityState = (currentUser: { email: string } | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [communityRanking, setCommunityRanking] = useState<Ranking[]>([]);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<Community[]>([]);

  const email = currentUser?.email;

  const getPosts = async (cid?: string): Promise<Post[]> => {
    if (!email) return [];
    try {
      const q = cid
        ? query(collection(db, "posts"), where("communityId", "==", cid))
        : query(collection(db, "posts"));
      const snap = await getDocs(q);
      const allPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Post));
      const userEmails = [...new Set(allPosts.map((p) => p.userId).filter(Boolean))];
      if (userEmails.length === 0) return [];
      const existingEmails = new Set<string>();
      await Promise.all(
        userEmails.map(async (ue) => {
          const uSnap = await getDocs(query(collection(db, "users"), where("email", "==", ue.toLowerCase())));
          if (!uSnap.empty) existingEmails.add(ue.toLowerCase());
        }),
      );
      const likedSnap = await getDocs(
        query(collection(db, "postLikes"), where("userEmail", "==", email.toLowerCase())),
      );
      const likedIds = new Set(likedSnap.docs.map((d) => d.data().postId as string));
      return allPosts
        .filter((p) => existingEmails.has((p.userId || "").toLowerCase()))
        .map((p) => ({ ...p, likedByMe: likedIds.has(p.id) }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      return [];
    }
  };

  const createPost = async (post: any): Promise<Post | null> => {
    if (!email) return null;
    try {
      const userSnap = await getDocs(query(collection(db, "users"), where("email", "==", email.toLowerCase())));
      if (userSnap.empty) return null;
      const userData = userSnap.docs[0].data() as UserProfile;
      const newPost = {
        ...post,
        userId: email.toLowerCase(),
        userName: userData.name || email.split("@")[0],
        userAvatar: userData.avatarUrl || "",
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
      };
      const ref = await addDoc(collection(db, "posts"), newPost);
      return { id: ref.id, ...newPost } as Post;
    } catch (e) {
      return null;
    }
  };

  const likePost = async (pid: string) => {
    if (!email) return;
    try {
      const likeId = `${pid}_${email.toLowerCase()}`;
      const likeRef = doc(db, "postLikes", likeId);
      const likeSnap = await getDoc(likeRef);
      const postRef = doc(db, "posts", pid);
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
  };

  const getPostComments = async (postId: string) => {
    try {
      const snap = await getDocs(query(collection(db, "postComments"), where("postId", "==", postId)));
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } catch (e) {
      return [];
    }
  };

  const addPostComment = async (postId: string, text: string) => {
    if (!email) return null;
    try {
      const userSnap = await getDocs(query(collection(db, "users"), where("email", "==", email.toLowerCase())));
      if (userSnap.empty) return null;
      const userData = userSnap.docs[0].data() as UserProfile;
      const comment = {
        postId, text,
        userId: email.toLowerCase(),
        userName: userData.name || email.split("@")[0],
        userAvatar: userData.avatarUrl || "",
        createdAt: new Date().toISOString(),
      };
      const ref = await addDoc(collection(db, "postComments"), comment);
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        await updateDoc(postRef, { commentsCount: (postSnap.data().commentsCount || 0) + 1 });
      }
      return { id: ref.id, ...comment };
    } catch (e) {
      return null;
    }
  };

  const getCommunities = async (): Promise<Community[]> => {
    try {
      const snap = await getDocs(collection(db, "communities"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Community));
    } catch (e) {
      return [];
    }
  };

  const getUserCommunities = async (): Promise<string[]> => {
    if (!email) return [];
    try {
      const snap = await getDocs(
        query(collection(db, "communityMembers"), where("userEmail", "==", email.toLowerCase())),
      );
      return snap.docs.map((d) => d.data().communityId as string);
    } catch (e) {
      return [];
    }
  };

  const createCommunity = async (n: string, d: string): Promise<Community | null> => {
    if (!email) return null;
    try {
      const newComm = {
        name: n, description: d, membersCount: 1, tags: [],
        createdBy: email, createdAt: new Date().toISOString(),
        isPublic: true, creatorId: email.toLowerCase(), allowMemberPosts: true,
      };
      const ref = await addDoc(collection(db, "communities"), newComm);
      await addDoc(collection(db, "communityMembers"), {
        communityId: ref.id, userEmail: email.toLowerCase(),
        role: "creator", status: "active", joinedAt: new Date().toISOString(),
      });
      return { id: ref.id, ...newComm };
    } catch (e) {
      return null;
    }
  };

  const joinCommunity = async (id: string) => {
    if (!email) return;
    try {
      const existing = await getDocs(
        query(collection(db, "communityMembers"), where("communityId", "==", id), where("userEmail", "==", email.toLowerCase())),
      );
      if (existing.empty) {
        const commRef = doc(db, "communities", id);
        const commSnap = await getDoc(commRef);
        const isPublic = commSnap.exists() ? commSnap.data().isPublic !== false : true;
        const status = isPublic ? "active" : "pending";
        await addDoc(collection(db, "communityMembers"), {
          communityId: id, userEmail: email.toLowerCase(),
          role: "member", status, joinedAt: new Date().toISOString(),
        });
        if (isPublic && commSnap.exists()) {
          await updateDoc(commRef, { membersCount: (commSnap.data().membersCount || 0) + 1 });
        }
      }
    } catch (e) {}
  };

  const getCommunityMembers = async (communityId: string): Promise<CommunityMember[]> => {
    try {
      const snap = await getDocs(
        query(collection(db, "communityMembers"), where("communityId", "==", communityId)),
      );
      const members = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          if ((data.status || "active") !== "active") return null;
          const userSnap = await getDocs(query(collection(db, "users"), where("email", "==", data.userEmail)));
          if (userSnap.empty) return null;
          const userData = userSnap.docs[0].data() as UserProfile;
          return {
            id: d.id, communityId, userEmail: data.userEmail,
            userName: userData.name || data.userEmail.split("@")[0],
            userAvatar: userData.avatarUrl || "",
            role: data.role || "member", status: "active" as const,
            joinedAt: data.joinedAt || "",
          } as CommunityMember;
        }),
      );
      return members.filter(Boolean) as CommunityMember[];
    } catch (e) {
      return [];
    }
  };

  const getPendingMembers = async (communityId: string): Promise<CommunityMember[]> => {
    try {
      const snap = await getDocs(
        query(collection(db, "communityMembers"), where("communityId", "==", communityId), where("status", "==", "pending")),
      );
      const members = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const userSnap = await getDocs(query(collection(db, "users"), where("email", "==", data.userEmail)));
          if (userSnap.empty) return null;
          const userData = userSnap.docs[0].data() as UserProfile;
          return {
            id: d.id, communityId, userEmail: data.userEmail,
            userName: userData.name || data.userEmail.split("@")[0],
            userAvatar: userData.avatarUrl || "",
            role: "member" as const, status: "pending" as const,
            joinedAt: data.joinedAt || "",
          } as CommunityMember;
        }),
      );
      return members.filter(Boolean) as CommunityMember[];
    } catch (e) {
      return [];
    }
  };

  const approveMember = async (communityId: string, memberDocId: string) => {
    try {
      await updateDoc(doc(db, "communityMembers", memberDocId), { status: "active" });
      const commRef = doc(db, "communities", communityId);
      const commSnap = await getDoc(commRef);
      if (commSnap.exists()) {
        await updateDoc(commRef, { membersCount: (commSnap.data().membersCount || 0) + 1 });
      }
    } catch (e) {}
  };

  const rejectMember = async (memberDocId: string) => {
    try { await deleteDoc(doc(db, "communityMembers", memberDocId)); } catch (e) {}
  };

  const updateMemberRole = async (memberDocId: string, newRole: CommunityRole) => {
    try { await updateDoc(doc(db, "communityMembers", memberDocId), { role: newRole }); } catch (e) {}
  };

  const banMember = async (communityId: string, memberDocId: string, reason: string) => {
    try {
      await updateDoc(doc(db, "communityMembers", memberDocId), { status: "banned", banReason: reason });
      const commRef = doc(db, "communities", communityId);
      const commSnap = await getDoc(commRef);
      if (commSnap.exists()) {
        await updateDoc(commRef, { membersCount: Math.max(0, (commSnap.data().membersCount || 1) - 1) });
      }
    } catch (e) {}
  };

  const unbanMember = async (memberDocId: string) => {
    try { await updateDoc(doc(db, "communityMembers", memberDocId), { status: "active", banReason: null }); } catch (e) {}
  };

  const getBannedMembers = async (communityId: string): Promise<CommunityMember[]> => {
    try {
      const snap = await getDocs(
        query(collection(db, "communityMembers"), where("communityId", "==", communityId), where("status", "==", "banned")),
      );
      const members = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const userSnap = await getDocs(query(collection(db, "users"), where("email", "==", data.userEmail)));
          if (userSnap.empty) return null;
          const userData = userSnap.docs[0].data() as UserProfile;
          return {
            id: d.id, communityId, userEmail: data.userEmail,
            userName: userData.name || data.userEmail.split("@")[0],
            userAvatar: userData.avatarUrl || "",
            role: data.role || "member", status: "banned" as const,
            joinedAt: data.joinedAt || "", banReason: data.banReason || "",
          } as CommunityMember;
        }),
      );
      return members.filter(Boolean) as CommunityMember[];
    } catch (e) {
      return [];
    }
  };

  const updateCommunity = async (communityId: string, data: Partial<Community>) => {
    try { await updateDoc(doc(db, "communities", communityId), data as any); } catch (e) {}
  };

  const deleteCommunity = async (communityId: string) => {
    try { await deleteDoc(doc(db, "communities", communityId)); } catch (e) {}
  };

  const getCommunityRole = async (communityId: string): Promise<CommunityRole | null> => {
    if (!email) return null;
    try {
      const snap = await getDocs(
        query(collection(db, "communityMembers"), where("communityId", "==", communityId), where("userEmail", "==", email.toLowerCase())),
      );
      if (snap.empty) return null;
      return (snap.docs[0].data().role || "member") as CommunityRole;
    } catch (e) {
      return null;
    }
  };

  const getChallengesByCommunity = async (communityId: string): Promise<Challenge[]> => {
    try {
      const snap = await getDocs(query(collection(db, "challenges"), where("communityId", "==", communityId)));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Challenge));
    } catch (e) {
      return [];
    }
  };

  const createChallenge = async (challenge: Omit<Challenge, "id">): Promise<Challenge | null> => {
    try {
      const ref = await addDoc(collection(db, "challenges"), challenge);
      return { id: ref.id, ...challenge };
    } catch (e) {
      return null;
    }
  };

  const deleteChallenge = async (challengeId: string) => {
    try { await deleteDoc(doc(db, "challenges", challengeId)); } catch (e) {}
  };

  const getChallenges = async (): Promise<Challenge[]> => {
    try {
      const snap = await getDocs(collection(db, "challenges"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Challenge));
    } catch (e) {
      return [];
    }
  };

  const getUserChallenges = async (): Promise<UserChallenge[]> => {
    if (!email) return [];
    try {
      const snap = await getDocs(query(collection(db, "userChallenges"), where("userId", "==", email.toLowerCase())));
      return snap.docs.map((d) => d.data() as UserChallenge);
    } catch (e) {
      return [];
    }
  };

  const updateChallengeProgress = async (id: string, p: number, collected?: boolean) => {
    if (!email) return;
    try {
      const docId = `${id}_${email.toLowerCase()}`;
      await setDoc(doc(db, "userChallenges", docId), {
        userId: email.toLowerCase(), challengeId: id,
        progress: p, completed: p > 0,
        ...(collected !== undefined ? { collected } : {}),
      }, { merge: true });
    } catch (e) {}
  };

  const cancelChallenge = async (id: string) => {
    if (!email) return;
    try {
      const docId = `${id}_${email.toLowerCase()}`;
      await setDoc(doc(db, "userChallenges", docId), {
        userId: email.toLowerCase(), challengeId: id,
        progress: 0, completed: false, cancelled: true,
      }, { merge: true });
    } catch (e) {}
  };

  const getCommunityRanking = async (communityId: string): Promise<Ranking[]> => {
    try {
      const membersSnap = await getDocs(
        query(collection(db, "communityMembers"), where("communityId", "==", communityId)),
      );
      const memberEmails = membersSnap.docs.map((d) => d.data().userEmail as string);
      if (memberEmails.length === 0) return [];
      const ranking: Ranking[] = [];
      await Promise.all(
        memberEmails.map(async (memberEmail) => {
          const [userSnap, statsSnap] = await Promise.all([
            getDocs(query(collection(db, "users"), where("email", "==", memberEmail.toLowerCase()))),
            getDoc(doc(db, "stats", memberEmail.toLowerCase())),
          ]);
          if (userSnap.empty) return;
          const userData = userSnap.docs[0].data() as UserProfile;
          const statsData = statsSnap.exists() ? (statsSnap.data() as UserStats) : null;
          ranking.push({
            userId: memberEmail.toLowerCase(),
            userName: userData.name || memberEmail.split("@")[0],
            userAvatar: userData.avatarUrl || "",
            communityId,
            xp: statsData?.xp || 0,
            streak: statsData?.streak || 0,
            lastActivityAt: new Date().toISOString(),
          });
        }),
      );
      return ranking.sort((a, b) => b.xp - a.xp);
    } catch (e) {
      return [];
    }
  };

  const searchUsers = async (q: string): Promise<UserProfile[]> => {
    try {
      const snap = await getDocs(collection(db, "users"));
      const lower = q.toLowerCase();
      return snap.docs
        .map((d) => d.data() as UserProfile)
        .filter((u) => u.name?.toLowerCase().includes(lower) || u.email?.toLowerCase().includes(lower));
    } catch (e) {
      return [];
    }
  };

  const searchCommunities = async (q: string): Promise<Community[]> => {
    try {
      const snap = await getDocs(collection(db, "communities"));
      const lower = q.toLowerCase();
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Community))
        .filter((c) => c.name.toLowerCase().includes(lower) || c.description?.toLowerCase().includes(lower));
    } catch (e) {
      return [];
    }
  };

  return {
    posts, setPosts,
    communities, setCommunities,
    activeCommunity, setActiveCommunity,
    challenges, setChallenges,
    userChallenges, setUserChallenges,
    communityRanking, setCommunityRanking,
    communityMessages, setCommunityMessages,
    recommendedCommunities, setRecommendedCommunities,
    getPosts, createPost, likePost, getPostComments, addPostComment,
    getCommunities, getUserCommunities, createCommunity, joinCommunity,
    getCommunityMembers, getPendingMembers, approveMember, rejectMember,
    updateMemberRole, banMember, unbanMember, getBannedMembers,
    updateCommunity, deleteCommunity, getCommunityRole,
    getChallengesByCommunity, createChallenge, deleteChallenge,
    getChallenges, getUserChallenges, updateChallengeProgress, cancelChallenge,
    getCommunityRanking, searchUsers, searchCommunities,
  };
};
