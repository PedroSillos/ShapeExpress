import React from 'react';
import { Plus, ShoppingBag, Trash2, CheckCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreItem } from '../../domain/entities';
import { cn } from '../../utils/cn';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TrainersViewProps {
  myListings: StoreItem[];
  isLoading: boolean;
  onUnpublish: (itemId: string) => Promise<void>;
  onPublishNew: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-3">
      {children}
    </p>
  );
}

function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider',
        status === 'published'
          ? 'bg-green-500/15 text-green-400 border border-green-500/25'
          : 'bg-white/8 text-white/35 border border-white/10',
      )}
    >
      {status === 'published' ? (
        <>
          <CheckCircle size={8} />
          Publicado
        </>
      ) : (
        <>
          <FileText size={8} />
          Rascunho
        </>
      )}
    </span>
  );
}

interface ListingCardProps {
  item: StoreItem;
  onUnpublish: (id: string) => Promise<void>;
}

function ListingCard({ item, onUnpublish }: ListingCardProps) {
  const [removing, setRemoving] = React.useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onUnpublish(item.id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden"
    >
      {/* Accent stripe */}
      <div
        className="h-0.5 w-full"
        style={{ background: 'linear-gradient(90deg, #7C3AED, #5B21B6)' }}
      />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1.5">
            <h4 className="text-sm font-black text-white leading-snug truncate">{item.title}</h4>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-white/35 bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
                Treino
              </span>
              <StatusBadge status={item.status} />
            </div>

            <div className="flex items-center gap-3 pt-0.5">
              <span className="text-sm font-black text-white/80">{formatPrice(item.price)}</span>
              <span className="text-[10px] text-white/30 font-bold">
                {item.salesCount} {item.salesCount === 1 ? 'venda' : 'vendas'}
              </span>
            </div>
          </div>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="shrink-0 p-2 text-white/20 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/8 disabled:opacity-40"
            title="Remover anúncio"
          >
            {removing ? (
              <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-red-400 rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function TrainersHeader() {
  return (
    <div
      className="relative overflow-hidden -mx-6 mb-6"
      style={{
        background: 'linear-gradient(135deg, #1E0A3C 0%, #3B0764 50%, #4C1D95 100%)',
      }}
    >
      <div className="px-6 pt-10 pb-8 flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white leading-tight">Treinadores</h1>
          <p className="text-white/60 text-sm font-semibold">Gerencie seus alunos e anúncios</p>
        </div>
        <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
          <ShoppingBag size={36} className="text-white/80" />
        </div>
      </div>
      {/* Decorative circles */}
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/5 pointer-events-none" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TrainersView({
  myListings,
  isLoading,
  onUnpublish,
  onPublishNew,
}: TrainersViewProps) {
  return (
    <div className="pb-32">
      <TrainersHeader />

      {/* Listings section */}
      <div>
        <SectionLabel>Meus Anúncios</SectionLabel>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-dark-card border border-dark-border rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : myListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-14 space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <ShoppingBag size={32} className="text-white/15" />
            </div>
            <div>
              <p className="text-white/50 font-black text-base">Nenhum anúncio publicado</p>
              <p className="text-xs text-white/25 mt-1">
                Publique seus treinos e programas para começar a vender.
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="space-y-3">
              {myListings.map((item) => (
                <ListingCard key={item.id} item={item} onUnpublish={onUnpublish} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 22 }}
        onClick={onPublishNew}
        className="fixed bottom-24 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-brand-red text-black font-black text-sm shadow-xl shadow-brand-red/30 active:scale-95 transition-transform"
      >
        <Plus size={18} />
        Novo Anúncio
      </motion.button>
    </div>
  );
}
