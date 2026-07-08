import { useState, useEffect, useCallback } from "react";
import {
  collection, query, where, getDocs, doc, setDoc, updateDoc, addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { StoreItem, StoreWorkout, StorePurchase } from "../../domain/entities";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a Firestore Timestamp or ISO string to milliseconds. */
const toMs = (v: unknown): number =>
  v instanceof Timestamp ? v.toMillis() : new Date(v as string).getTime();

/** Comparator for descending date sort (newest first). */
const sortByDateDesc = (a: unknown, b: unknown) => toMs(b) - toMs(a);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublishWorkoutPayload {
  type: 'workout';
  templateId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  price: number;
  tags: string[];
}

export type PublishPayload = PublishWorkoutPayload;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useStoreState = (
  currentUser: { email: string } | null,
  idToken: string | null,
) => {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [myPurchases, setMyPurchases] = useState<StorePurchase[]>([]);
  const [myListings, setMyListings] = useState<StoreItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

  // ── Fetch all published store items ──────────────────────────────────────
  const loadStoreItems = useCallback(async () => {
    setIsLoadingItems(true);
    try {
      const q = query(
        collection(db, "store_items"),
        where("status", "==", "published"),
      );
      const snap = await getDocs(q);
      setStoreItems(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as StoreItem))
          .sort((a, b) => sortByDateDesc(a.createdAt, b.createdAt)),
      );
    } catch (e) {
      console.error("[useStoreState] loadStoreItems:", e);
    } finally {
      setIsLoadingItems(false);
    }
  }, []);

  // ── Fetch purchases of the current user ──────────────────────────────────
  const loadMyPurchases = useCallback(async () => {
    if (!currentUser?.email) return;
    setIsLoadingPurchases(true);
    try {
      const q = query(
        collection(db, "store_purchases"),
        where("buyerEmail", "==", currentUser.email.toLowerCase()),
      );
      const snap = await getDocs(q);
      setMyPurchases(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as StorePurchase))
          .sort((a, b) => sortByDateDesc(a.purchasedAt, b.purchasedAt)),
      );
    } catch (e) {
      console.error("[useStoreState] loadMyPurchases:", e);
    } finally {
      setIsLoadingPurchases(false);
    }
  }, [currentUser?.email]);

  // ── Fetch trainer's own listings ─────────────────────────────────────────
  const loadMyListings = useCallback(async () => {
    if (!currentUser?.email) return;
    try {
      const q = query(
        collection(db, "store_items"),
        where("creatorEmail", "==", currentUser.email.toLowerCase()),
      );
      const snap = await getDocs(q);
      setMyListings(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as StoreItem))
          .sort((a, b) => sortByDateDesc(a.createdAt, b.createdAt)),
      );
    } catch (e) {
      console.error("[useStoreState] loadMyListings:", e);
    }
  }, [currentUser?.email]);

  // ── Publish a new item ───────────────────────────────────────────────────
  const publishItem = useCallback(async (payload: PublishPayload, creatorProfile: { email: string; firstName: string; lastName?: string }): Promise<StoreItem> => {
    const email = creatorProfile.email.toLowerCase();
    const base = {
      creatorEmail: email,
      creatorName: [creatorProfile.firstName, creatorProfile.lastName].filter(Boolean).join(' '),
      creatorAvatar: "",
      title: payload.title,
      description: payload.description ?? "",
      coverImageUrl: payload.coverImageUrl ?? "",
      price: payload.price,
      tags: payload.tags,
      rating: 0,
      salesCount: 0,
      createdAt: new Date().toISOString(),
      status: "published" as const,
    };

    let data: Omit<StoreWorkout, 'id'>;
    data = { ...base, type: 'workout' as const, templateId: payload.templateId };

    const ref = await addDoc(collection(db, "store_items"), data);
    const newItem = { id: ref.id, ...data } as StoreItem;
    setMyListings((prev) => [newItem, ...prev]);
    return newItem;
  }, []);

  // ── Unpublish an item ────────────────────────────────────────────────────
  const unpublishItem = useCallback(async (itemId: string) => {
    await updateDoc(doc(db, "store_items", itemId), { status: "draft" });
    setMyListings((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: "draft" as const } : i)),
    );
    setStoreItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  // ── Stripe checkout ──────────────────────────────────────────────────────
  const createCheckoutSession = useCallback(async (itemId: string): Promise<{ url: string }> => {
    const res = await fetch("/api/checkout/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken || ""}`,
      },
      body: JSON.stringify({ itemId }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }, [idToken]);

  const verifyCheckoutSession = useCallback(async (sessionId: string, itemId: string): Promise<{ success: boolean; verified: boolean }> => {
    const res = await fetch("/api/checkout/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken || ""}`,
      },
      body: JSON.stringify({ sessionId, itemId }),
    });
    if (!res.ok) throw new Error(await res.text());
    const result = await res.json();
    if (result.verified) await loadMyPurchases();
    return result;
  }, [idToken, loadMyPurchases]);

  // ── Load on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    loadStoreItems();
  }, [loadStoreItems]);

  useEffect(() => {
    if (currentUser?.email) {
      loadMyPurchases();
      loadMyListings();
    }
  }, [currentUser?.email, loadMyPurchases, loadMyListings]);

  // Legacy stubs kept for backward compatibility with useAppState api object
  const getProtocols = async () => storeItems;
  const createProtocol = async (_p: any) => {};
  const getPurchasedProtocols = async () => myPurchases;

  return {
    // New API
    storeItems,
    myPurchases,
    myListings,
    isLoadingItems,
    isLoadingPurchases,
    loadStoreItems,
    loadMyPurchases,
    loadMyListings,
    publishItem,
    unpublishItem,
    createCheckoutSession,
    verifyCheckoutSession,
    // Legacy
    getProtocols,
    createProtocol,
    getPurchasedProtocols,
  };
};
