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
  onRenameStoreItem?: (itemId: string, newTitle: string) => void;
  onUpdateStoreItem?: (item: StoreItem) => void;
  onUpdateTemplate?: (template: WorkoutTemplate) => void;
  onDeleteStoreItem?: (itemId: string) => Promise<void>;
  userEmail?: string;
  userType?: 'athlete' | 'trainer';
  activeSport?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LojasScreen({
  storeItems,
  myPurchases,
  templates,
  isLoadingItems,
  onGoToWorkouts,
  claimFreeItem,
  onRenameStoreItem,
  onUpdateStoreItem,
  onUpdateTemplate,
  onDeleteStoreItem,
  userEmail,
  userType,
  activeSport,
}: LojasScreenProps) {
  return (
    <StoreTab
      storeItems={storeItems}
      myPurchases={myPurchases}
      templates={templates}
      isLoadingItems={isLoadingItems}
      onGoToWorkouts={onGoToWorkouts}
      claimFreeItem={claimFreeItem}
      onRenameStoreItem={onRenameStoreItem}
      onUpdateStoreItem={onUpdateStoreItem}
      onUpdateTemplate={onUpdateTemplate}
      onDeleteStoreItem={onDeleteStoreItem}
      userEmail={userEmail}
      userType={userType}
      activeSport={activeSport}
    />
  );
}
