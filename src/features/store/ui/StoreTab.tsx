import React, { useState, useCallback } from 'react';
import { Search, X, Dumbbell, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { StoreItem, StorePurchase } from '@/src/domain/entities';
import iconMedal from '@/src/assets/icons/icon-medal.svg';
import iconTrophy from '@/src/assets/icons/icon-trophy.svg';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StoreSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden animate-pulse">
          <div className="aspect-video bg-white/5" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-white/5 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-2/3" />
            <div className="flex justify-between items-center pt-1">
              <div className="h-5 bg-white/5 rounded w-20" />
              <div className="h-9 bg-white/5 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── StoreItemCard ────────────────────────────────────────────────────────────

interface StoreItemCardProps {
  item: StoreItem;
  isPurchased: boolean;
  onBuyItem: (item: StoreItem) => void;
  onGoToWorkouts: () => void;
}

function StoreItemCard({ item, isPurchased, onBuyItem, onGoToWorkouts }: StoreItemCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
      {/* Cover image or placeholder */}
      {item.coverImageUrl ? (
        <div className="aspect-video relative">
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {isPurchased && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full">
              Adquirido
            </span>
          )}
        </div>
      ) : (
        <div
          className="aspect-video flex items-center justify-center relative"
          style={{ background: 'linear-gradient(135deg,#2d1b1b,#4a1414)' }}
        >
          <Dumbbell size={40} className="text-brand-red/60" />
          {isPurchased && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full">
              Adquirido
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-bold text-sm leading-tight">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{item.description}</p>
          )}
          <p className="text-[11px] text-white/30 font-medium">por {item.creatorName}</p>
        </div>

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-white/40 uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {item.rating > 0 && (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={11} className="fill-yellow-400" />
            <span className="text-[11px] font-bold">{item.rating.toFixed(1)}</span>
            <span className="text-[11px] text-white/25">· {item.salesCount} vendas</span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-brand-red font-black text-base">{formatPrice(item.price)}</span>
          {isPurchased ? (
            <button
              onClick={onGoToWorkouts}
              className="px-4 py-2.5 bg-emerald-500 text-black rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform"
            >
              Acessar
            </button>
          ) : (
            <button
              onClick={() => onBuyItem(item)}
              className="px-4 py-2.5 bg-brand-red text-black rounded-xl text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-brand-red/20"
            >
              Comprar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── StoreTab ─────────────────────────────────────────────────────────────────

export interface StoreTabProps {
  storeItems: StoreItem[];
  myPurchases: StorePurchase[];
  isLoadingItems: boolean;
  onGoToWorkouts: () => void;
  createCheckoutSession: (itemId: string) => Promise<{ url: string }>;
  tabSwitcher?: React.ReactNode;
}

export function StoreTab({
  storeItems,
  myPurchases,
  isLoadingItems,
  onGoToWorkouts,
  createCheckoutSession,
  tabSwitcher,
}: StoreTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const purchasedItemIds = new Set(myPurchases.map((p) => p.itemId));
  const storeWorkouts = storeItems.filter((i) => i.type === 'workout');
  const myPurchasedItems = storeWorkouts.filter((i) => purchasedItemIds.has(i.id));
  const totalCount = storeWorkouts.length;

  const filteredWorkouts = searchTerm.trim()
    ? storeWorkouts.filter((i) => i.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : storeWorkouts;

  const handleBuyItem = useCallback(
    async (item: StoreItem) => {
      if (buyingId) return;
      setBuyingId(item.id);
      try {
        const { url } = await createCheckoutSession(item.id);
        window.location.href = url;
      } catch (err) {
        console.error('[StoreTab] checkout error:', err);
        toast.error('Erro ao iniciar pagamento. Tente novamente.');
      } finally {
        setBuyingId(null);
      }
    },
    [buyingId, createCheckoutSession],
  );

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div
        className="relative overflow-hidden -mx-6 mb-6"
        style={{ background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 60%, #4ADE80 100%)' }}
      >
        <div className="px-6 pt-10 pb-8 flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-white leading-tight">Loja</h1>
            <p className="text-white/70 text-sm font-semibold">Compre treinos de especialistas</p>
            {totalCount > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <img src={iconTrophy} alt="" className="w-4 h-4 brightness-0 invert opacity-80" />
                <span className="text-white/80 text-xs font-bold">
                  {totalCount} {totalCount === 1 ? 'treino disponível' : 'treinos disponíveis'}
                </span>
              </div>
            )}
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
            <img src={iconMedal} alt="" className="w-12 h-12 brightness-0 invert" />
          </div>
        </div>
        {tabSwitcher}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar treinos..."
          className="w-full bg-dark-card border border-dark-border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-gray-400 transition-all shadow-2xl"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isLoadingItems ? (
        <StoreSkeleton />
      ) : (
        <>
          {/* My Purchased Workouts */}
          {myPurchasedItems.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
                Meus Treinos
              </p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
                {myPurchasedItems.map((item) => (
                  <div
                    key={item.id}
                    className="min-w-[200px] bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3 flex-shrink-0"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold leading-tight line-clamp-2">{item.title}</p>
                      <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Treino</p>
                    </div>
                    <button
                      onClick={onGoToWorkouts}
                      className="w-full py-2 bg-emerald-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                    >
                      Acessar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workouts */}
          <div className="space-y-3">
            {filteredWorkouts.length > 0 ? (
              <div className="space-y-4">
                {filteredWorkouts.map((item) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <StoreItemCard
                      item={item}
                      isPurchased={purchasedItemIds.has(item.id)}
                      onBuyItem={handleBuyItem}
                      onGoToWorkouts={onGoToWorkouts}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Dumbbell size={24} className="text-white/15" />
                </div>
                <p className="text-sm text-white/30">
                  {searchTerm ? `Nenhum treino encontrado para "${searchTerm}"` : 'Nenhum treino disponível'}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
