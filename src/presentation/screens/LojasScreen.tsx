import { StoreTab } from '@/src/features/store';
import { StoreItem, StorePurchase, WorkoutTemplate } from '@/src/domain/entities';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LojasScreenProps {
  storeItems: StoreItem[];
  myPurchases: StorePurchase[];
  templates: WorkoutTemplate[];
  isLoadingItems: boolean;
  onGoToWorkouts: () => void;
  claimFreeItem: (itemId: string) => Promise<{ success: boolean; purchaseId: string }>;
  createCheckoutSession: (itemId: string) => Promise<{ url: string }>;
  onRenameStoreItem?: (itemId: string, newTitle: string) => void;
  onUpdateStoreItem?: (item: StoreItem) => void;
  onUpdateTemplate?: (template: WorkoutTemplate) => void;
  userEmail?: string;
  userType?: 'athlete' | 'trainer';
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LojasScreen({
  storeItems,
  myPurchases,
  templates,
  isLoadingItems,
  onGoToWorkouts,
  claimFreeItem,
  createCheckoutSession,
  onRenameStoreItem,
  onUpdateStoreItem,
  onUpdateTemplate,
  userEmail,
  userType,
}: LojasScreenProps) {
  return (
    <StoreTab
      storeItems={storeItems}
      myPurchases={myPurchases}
      templates={templates}
      isLoadingItems={isLoadingItems}
      onGoToWorkouts={onGoToWorkouts}
      claimFreeItem={claimFreeItem}
      createCheckoutSession={createCheckoutSession}
      onRenameStoreItem={onRenameStoreItem}
      onUpdateStoreItem={onUpdateStoreItem}
      onUpdateTemplate={onUpdateTemplate}
      userEmail={userEmail}
      userType={userType}
    />
  );
}
