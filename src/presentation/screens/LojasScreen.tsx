import { StoreTab } from '@/src/features/store';
import { StoreItem, StorePurchase } from '@/src/domain/entities';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LojasScreenProps {
  storeItems: StoreItem[];
  myPurchases: StorePurchase[];
  isLoadingItems: boolean;
  onGoToWorkouts: () => void;
  createCheckoutSession: (itemId: string) => Promise<{ url: string }>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LojasScreen({
  storeItems,
  myPurchases,
  isLoadingItems,
  onGoToWorkouts,
  createCheckoutSession,
}: LojasScreenProps) {
  return (
    <StoreTab
      storeItems={storeItems}
      myPurchases={myPurchases}
      isLoadingItems={isLoadingItems}
      onGoToWorkouts={onGoToWorkouts}
      createCheckoutSession={createCheckoutSession}
    />
  );
}
