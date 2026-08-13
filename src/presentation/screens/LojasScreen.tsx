import { StoreTab } from '@/src/features/store';
import { StoreItem, StorePurchase } from '@/src/domain/entities';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LojasScreenProps {
  storeItems: StoreItem[];
  myPurchases: StorePurchase[];
  isLoadingItems: boolean;
  onGoToWorkouts: () => void;
  claimFreeItem: (itemId: string) => Promise<{ success: boolean; purchaseId: string }>;
  createCheckoutSession: (itemId: string) => Promise<{ url: string }>;
  userEmail?: string;
  userType?: 'athlete' | 'trainer';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LojasScreen({
  storeItems,
  myPurchases,
  isLoadingItems,
  onGoToWorkouts,
  claimFreeItem,
  createCheckoutSession,
  userEmail,
  userType,
}: LojasScreenProps) {
  return (
    <StoreTab
      storeItems={storeItems}
      myPurchases={myPurchases}
      isLoadingItems={isLoadingItems}
      onGoToWorkouts={onGoToWorkouts}
      claimFreeItem={claimFreeItem}
      createCheckoutSession={createCheckoutSession}
      userEmail={userEmail}
      userType={userType}
    />
  );
}
