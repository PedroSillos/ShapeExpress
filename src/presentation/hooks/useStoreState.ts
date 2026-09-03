import { useState, useEffect, useCallback } from "react";
import {
  collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, addDoc,
  Timestamp, increment,
} from "firebase/firestore";
import { db } from "../../firebase";
import { StoreItem, StoreWorkout, StorePurchase } from "../../domain/entities";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a Firestore Timestamp or ISO string to milliseconds. */
const toMs = (v: unknown): number =>
  v instanceof Timestamp ? v.toMillis() : new Date(v as string).getTime();

/** Comparator for descending date sort (newest first). */
const sortByDateDesc = (a: unknown, b: unknown) => toMs(b) - toMs(a);

/**
 * Calculates startDate and endDate for a purchased template.
 * Mirrors the same logic that was in server.ts calculateTemplateDates.
 */
function calculateTemplateDates(
  purchaseDate: string,
  duration: number,
  durationUnit: "weeks" | "months",
): { startDate: string; endDate: string } {
  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const start = new Date(purchaseDate);
  const end = new Date(start);

  if (durationUnit === "weeks") {
    end.setDate(end.getDate() + duration * 7 - 1);
  } else {
    end.setMonth(end.getMonth() + duration);
    end.setDate(end.getDate() - 1);
  }

  return { startDate: formatDate(start), endDate: formatDate(end) };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PublishWorkoutPayload {
  type: 'workout';
  templateId: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  price: number;
  duration: number;
  durationUnit: 'weeks' | 'months';
  tags: string[];
}

export type PublishPayload = PublishWorkoutPayload;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useStoreState = (
  currentUser: { email: string } | null,
  onTemplatesChanged?: () => void,
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

    // Inherit sport from the source template
    let sport: string | undefined;
    if (payload.type === 'workout') {
      try {
        const tSnap = await getDoc(doc(db, "templates", payload.templateId));
        if (tSnap.exists()) {
          sport = (tSnap.data() as { sport?: string }).sport;
        }
      } catch (e) {
        console.error('[publishItem] Failed to fetch template sport:', e);
      }
    }

    const base = {
      creatorEmail: email,
      creatorName: [creatorProfile.firstName, creatorProfile.lastName].filter(Boolean).join(' '),
      creatorAvatar: "",
      title: payload.title,
      description: payload.description ?? "",
      coverImageUrl: payload.coverImageUrl ?? "",
      price: payload.price,
      duration: payload.duration,
      durationUnit: payload.durationUnit,
      tags: payload.tags,
      rating: 0,
      salesCount: 0,
      createdAt: new Date().toISOString(),
      status: "published" as const,
      ...(sport !== undefined ? { sport } : {}),
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

  // ── Republish a draft item ───────────────────────────────────────────────
  const republishItem = useCallback(async (itemId: string) => {
    await updateDoc(doc(db, "store_items", itemId), { status: "published" });
    setMyListings((prev) => {
      const updated = prev.map((i) =>
        i.id === itemId ? { ...i, status: "published" as const } : i,
      );
      // Add back to public store list if not already there
      const item = updated.find((i) => i.id === itemId);
      if (item) {
        setStoreItems((s) =>
          s.some((i) => i.id === itemId)
            ? s.map((i) => (i.id === itemId ? item : i))
            : [item, ...s],
        );
      }
      return updated;
    });
  }, []);

  // ── Update a store item ───────────────────────────────────────────────────
  const updateStoreItem = useCallback(async (item: StoreItem) => {
    const { id, ...data } = item;
    await updateDoc(doc(db, "store_items", id), data);
    setMyListings((prev) =>
      prev.map((i) => (i.id === id ? item : i)),
    );
    setStoreItems((prev) =>
      prev.map((i) => (i.id === id ? item : i)),
    );
  }, []);

  // ── Free item claiming (client-side Firestore) ───────────────────────────
  const claimFreeItem = useCallback(async (itemId: string): Promise<{ success: boolean; purchaseId: string }> => {
    if (!currentUser?.email) throw new Error("Usuário não autenticado.");

    const buyerEmail = currentUser.email.toLowerCase();

    // Fetch the store item
    const itemSnap = await getDoc(doc(db, "store_items", itemId));
    if (!itemSnap.exists()) throw new Error("Item não encontrado.");
    const item = itemSnap.data() as Record<string, any>;

    if (item["status"] !== "published") throw new Error("Item não está disponível.");
    if (item["price"] !== 0) throw new Error("Este item não é gratuito.");
    if (item["creatorEmail"] === buyerEmail) throw new Error("Você não pode reivindicar seu próprio item.");

    // Prevent duplicate claim
    const dupSnap = await getDocs(
      query(
        collection(db, "store_purchases"),
        where("buyerEmail", "==", buyerEmail),
        where("itemId", "==", itemId),
      ),
    );
    if (!dupSnap.empty) throw new Error("Você já possui este item.");

    // Record purchase
    const purchaseDate = new Date().toISOString();
    const purchaseRef = await addDoc(collection(db, "store_purchases"), {
      buyerEmail,
      itemId,
      itemType: item["type"],
      purchasedAt: purchaseDate,
    });

    // Copy template(s) to buyer's templates collection
    const templateIds: string[] = item["type"] === "workout"
      ? [item["templateId"]]
      : (item["templateIds"] ?? []);

    const { startDate, endDate } = calculateTemplateDates(
      purchaseDate,
      item["duration"] as number,
      item["durationUnit"] as "weeks" | "months",
    );

    await Promise.all(
      templateIds.map(async (tId: string) => {
        const tSnap = await getDoc(doc(db, "templates", tId));
        if (!tSnap.exists()) return;
        const tData = tSnap.data();
        const newId = `purchased_${tId}_${buyerEmail.replace(/[@.]/g, "_")}`;
        await setDoc(doc(db, "templates", newId), {
          ...tData,
          id: newId,
          userId: buyerEmail,
          startDate,
          endDate,
          purchasedFrom: item["creatorEmail"],
          purchasedItemId: itemId,
          purchasedAt: purchaseDate,
        });
      }),
    );

    // Increment salesCount on item
    await updateDoc(doc(db, "store_items", itemId), {
      salesCount: increment(1),
    });

    // Refresh local purchases list
    await loadMyPurchases();

    // Notify parent that templates need to be reloaded
    onTemplatesChanged?.();

    return { success: true, purchaseId: purchaseRef.id };
  }, [currentUser?.email, loadMyPurchases, onTemplatesChanged]);

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
    republishItem,
    updateStoreItem,
    claimFreeItem,
    // Legacy
    getProtocols,
    createProtocol,
    getPurchasedProtocols,
  };
};
