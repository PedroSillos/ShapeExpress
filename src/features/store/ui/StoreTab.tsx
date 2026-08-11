import React, { useState, useCallback } from 'react';
import { Search, X, Dumbbell, Star, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreItem, StorePurchase } from '@/src/domain/entities';

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

// ─── StoreTab ─────────────────────────────────────────────────────────────────

export interface StoreTabProps {
  storeItems: StoreItem[];
  myPurchases: StorePurchase[];
  isLoadingItems: boolean;
  onGoToWorkouts: () => void;
  createCheckoutSession: (itemId: string) => Promise<{ url: string }>;
  tabSwitcher?: React.ReactNode;
  userEmail?: string;
  userType?: 'athlete' | 'trainer';
}

export function StoreTab({
  storeItems,
  myPurchases,
  isLoadingItems,
  onGoToWorkouts,
  createCheckoutSession,
  tabSwitcher,
  userEmail,
  userType,
}: StoreTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const purchasedItemIds = new Set(myPurchases.map((p) => p.itemId));
  const storeWorkouts = storeItems.filter((i) => i.type === 'workout');
  const myPurchasedItems = storeWorkouts.filter((i) => purchasedItemIds.has(i.id));
  const myAnnouncements = userEmail && userType === 'trainer'
    ? storeWorkouts.filter((i) => i.creatorEmail.toLowerCase() === userEmail.toLowerCase())
    : [];
  const myAnnouncementIds = new Set(myAnnouncements.map((a) => a.id));
  const totalCount = storeWorkouts.length;

  const filteredWorkouts = searchTerm.trim()
    ? storeWorkouts.filter((i) => 
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) && !myAnnouncementIds.has(i.id)
      )
    : storeWorkouts.filter((i) => !myAnnouncementIds.has(i.id));

  const handleBuyItem = useCallback(
    async (item: StoreItem) => {
      if (buyingId) return;
      setBuyingId(item.id);
      try {
        const { url } = await createCheckoutSession(item.id);
        window.location.href = url;
      } catch (err) {
        console.error('[StoreTab] checkout error:', err);
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
          </div>
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShoppingBag size={36} className="text-white" />
          </div>
        </div>
        {tabSwitcher}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Search Button */}
      <button
        onClick={() => setShowSearchModal(true)}
        className="w-full py-3 bg-white/5 border border-emerald-500/50 text-white/60 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      >
        <Search size={16} />
        Buscar treinos
      </button>

      {/* My Purchases - Only for athletes */}
      {userType === 'athlete' && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
            Minhas Compras
          </p>
          
          {myPurchasedItems.length > 0 ? (
            <div className="space-y-3">
              {myPurchasedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all"
                >
                  {/* Cover image or placeholder */}
                  {item.coverImageUrl ? (
                    <div className="aspect-video relative">
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        Adquirido
                      </span>
                    </div>
                  ) : (
                    <div
                      className="aspect-video flex items-center justify-center relative"
                      style={{ background: 'linear-gradient(135deg,#2d1b1b,#4a1414)' }}
                    >
                      <Dumbbell size={40} className="text-brand-red/60" />
                      <span className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        Adquirido
                      </span>
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

                    {/* CTA */}
                    <button
                      onClick={onGoToWorkouts}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Acessar Treino
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag size={24} className="text-white/15" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white/60">Nenhuma compra realizada</p>
                <p className="text-xs text-white/30 leading-relaxed">
                  Explore treinos de especialistas e impulsione seus resultados
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Storefront - Only for trainers */}
      {userType === 'trainer' && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">
            Minha Vitrine
          </p>
          
          {myAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {myAnnouncements.map((item) => (
                <div
                  key={item.id}
                  className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold leading-tight flex-1">{item.title}</p>
                      {item.status === 'draft' && (
                        <span className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded text-[9px] font-black text-yellow-400 uppercase tracking-wider flex-shrink-0">
                          Rascunho
                        </span>
                      )}
                      {item.status === 'published' && (
                        <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-[9px] font-black text-emerald-400 uppercase tracking-wider flex-shrink-0">
                          Publicado
                        </span>
                      )}
                    </div>
                    <p className="text-brand-red font-black text-base">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <div className="flex items-center gap-1.5">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">{item.rating > 0 ? item.rating.toFixed(1) : '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag size={12} />
                      <span className="font-bold">{item.salesCount} vendas</span>
                    </div>
                  </div>
                  <button
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Gerenciar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 text-center space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white/60">Nenhum treino à venda</p>
                <p className="text-xs text-white/30 leading-relaxed">
                  Comece a vender seus treinos e alcance mais alunos
                </p>
              </div>
              <button
                onClick={onGoToWorkouts}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                Publicar Treino
              </button>
            </div>
          )}
        </div>
      )}

      {isLoadingItems && <StoreSkeleton />}

      {/* Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSearchModal(false);
                setSearchTerm('');
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-[80vh] bg-dark-surface border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Buscar Treinos</h3>
                  <button
                    onClick={() => {
                      setShowSearchModal(false);
                      setSearchTerm('');
                    }}
                    className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar treinos..."
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-gray-400 transition-all"
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
              </div>
              
              {/* Workouts List */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredWorkouts.length > 0 ? (
                  <div className="space-y-3">
                    {filteredWorkouts.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="bg-dark-card border border-dark-border rounded-2xl p-4 space-y-3 hover:border-brand-red/30 transition-all">
                          {/* Header with title and purchased badge */}
                          <div className="space-y-0.5">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold leading-tight flex-1">{item.title}</h3>
                              {purchasedItemIds.has(item.id) && (
                                <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded text-[9px] font-black text-emerald-400 uppercase tracking-wider flex-shrink-0">
                                  Adquirido
                                </span>
                              )}
                            </div>
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

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-white/40">
                            <div className="flex items-center gap-1.5">
                              <Star size={12} className="fill-yellow-400 text-yellow-400" />
                              <span className="font-bold">{item.rating > 0 ? item.rating.toFixed(1) : '—'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <ShoppingBag size={12} />
                              <span className="font-bold">{item.salesCount} vendas</span>
                            </div>
                          </div>

                          {/* Price + CTA */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-brand-red font-black text-base">{formatPrice(item.price)}</span>
                            {purchasedItemIds.has(item.id) ? (
                              <button
                                onClick={onGoToWorkouts}
                                className="px-4 py-2.5 bg-emerald-500 text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
                              >
                                Acessar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleBuyItem(item)}
                                className="px-4 py-2.5 bg-brand-red text-black rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-brand-red/20"
                              >
                                Comprar
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Search size={24} className="text-white/15" />
                    </div>
                    <p className="text-sm text-white/30">
                      {searchTerm
                        ? `Nenhum treino encontrado para "${searchTerm}"`
                        : 'Digite para buscar treinos'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
