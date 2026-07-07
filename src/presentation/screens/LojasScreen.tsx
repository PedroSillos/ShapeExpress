import React from 'react';
import { cn } from '@/src/utils/cn';
import { StoreTab } from '@/src/features/store';
import { StoreItem, StorePurchase } from '@/src/domain/entities';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LojasScreenProps {
  storeItems: StoreItem[];
  myPurchases: StorePurchase[];
  isLoadingItems: boolean;
  onGoToWorkouts: () => void;
  createCheckoutSession: (itemId: string) => Promise<{ url: string }>;
  onGoToTrainers: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LojasScreen({
  storeItems,
  myPurchases,
  isLoadingItems,
  onGoToWorkouts,
  createCheckoutSession,
  onGoToTrainers,
}: LojasScreenProps) {
  const tabSwitcher = (
    <div className="flex gap-2 px-6 pb-5 pt-3">
      {(['treinadores', 'loja'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => { if (tab === 'treinadores') onGoToTrainers(); }}
          className={cn(
            'flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border',
            tab === 'loja'
              ? 'bg-brand-red border-brand-red text-black shadow-lg shadow-brand-red/20'
              : 'bg-white/10 border-white/10 text-white/60',
          )}
        >
          {tab === 'treinadores' ? 'Treinadores' : 'Loja'}
        </button>
      ))}
    </div>
  );

  return (
    <StoreTab
      storeItems={storeItems}
      myPurchases={myPurchases}
      isLoadingItems={isLoadingItems}
      onGoToWorkouts={onGoToWorkouts}
      createCheckoutSession={createCheckoutSession}
      tabSwitcher={tabSwitcher}
    />
  );
}
