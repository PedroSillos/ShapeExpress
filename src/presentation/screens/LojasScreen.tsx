import { StoreTab } from '@/src/features/store';
import { StoreItem, StorePurchase } from '@/src/domain/entities';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LojasScreenProps {
  storeItems: StoreItem[];
  myPurchases: StorePurchase[];
  isLoadingItems: boolean;
  onGoToWorkouts: () => void;
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
      createCheckoutSession={createCheckoutSession}
      userEmail={userEmail}
      userType={userType}
    />
  );
}
