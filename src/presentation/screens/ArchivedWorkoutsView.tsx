import { Archive, ChevronLeft, RotateCcw, Trash2, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { WorkoutTemplate } from '../../domain/entities';
import { cn } from '../../utils/cn';

const SPORT_COLORS: Record<string, string> = {
  'Musculação':     '#dc2626',
  'Crossfit':       '#ea580c',
  'Corrida':        '#ca8a04',
  'Yoga':           '#16a34a',
  'Natação':        '#2563eb',
  'Ciclismo':       '#0891b2',
  'Halterofilismo': '#7c3aed',
  'Triatlo':        '#db2777',
};

// ─── PermanentDeleteModal ─────────────────────────────────────────────────────

function PermanentDeleteModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full bg-dark-card border border-dark-border rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold">Excluir Permanentemente?</h2>
              <p className="text-sm text-white/40">
                Esta ação <span className="text-white/70 font-semibold">não pode ser desfeita</span>. O treino será removido para sempre.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-4 bg-red-500 rounded-2xl text-white font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── PurchasedBlockModal ──────────────────────────────────────────────────────

function PurchasedBlockModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full bg-dark-card border border-dark-border rounded-3xl p-6 shadow-2xl space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-emerald-400/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <Archive size={32} />
              </div>
              <h2 className="text-xl font-bold">Treino Comprado</h2>
              <p className="text-sm text-white/40">
                Você pagou por este treino e ele estará sempre disponível para restaurar. Treinos comprados não podem ser excluídos permanentemente.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors"
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── ArchivedTemplateCard ─────────────────────────────────────────────────────

function ArchivedTemplateCard({
  template,
  onRestore,
  onPermanentDelete,
}: {
  template: WorkoutTemplate;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string, isPurchased: boolean) => void;
}) {
  const sport = template.sport ?? 'Musculação';
  const color = SPORT_COLORS[sport] ?? '#dc2626';
  const isPurchased = !!template.purchasedItemId;

  const exerciseCount = (() => {
    if (template.sheets?.length) {
      return template.sheets.reduce((acc, s) => acc + (s.exercises?.length ?? 0), 0);
    }
    if (template.exercises?.length) return template.exercises.length;
    return 0;
  })();

  let dateLabel = '';
  try {
    dateLabel = format(parseISO(template.startDate), "dd 'de' MMM 'de' yyyy", { locale: ptBR });
  } catch {}

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(145deg, color-mix(in srgb, ${color} 8%, #1a1a1a) 0%, #151515 60%)`,
        border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
      }}
    >
      {/* Top accent stripe */}
      <div className="h-0.5 w-full opacity-50" style={{ background: color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-white/70 leading-snug truncate">{template.name}</h3>
            <p className="text-[10px] text-white/25 font-bold uppercase tracking-wide mt-0.5">{sport}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isPurchased && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                Comprado
              </span>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4 text-[10px] text-white/25 font-bold">
          <span className="flex items-center gap-1">
            <Dumbbell size={10} className="shrink-0" />
            {exerciseCount} exercícios
          </span>
          {dateLabel && (
            <>
              <span className="w-px h-3 bg-white/10" />
              <span>{dateLabel}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onRestore(template.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all"
            style={{ backgroundColor: color }}
          >
            <RotateCcw size={13} />
            Restaurar
          </button>
          <button
            onClick={() => onPermanentDelete(template.id, isPurchased)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all"
          >
            <Trash2 size={13} />
            Excluir
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ArchivedWorkoutsView ─────────────────────────────────────────────────────

interface ArchivedWorkoutsViewProps {
  templates: WorkoutTemplate[];
  onRestore: (id: string) => Promise<void>;
  onPermanentDelete: (id: string) => Promise<void>;
  onBack: () => void;
}

export function ArchivedWorkoutsView({
  templates,
  onRestore,
  onPermanentDelete,
  onBack,
}: ArchivedWorkoutsViewProps) {
  const archived = templates.filter(t => t.archived);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showPurchasedBlock, setShowPurchasedBlock] = useState(false);

  const handleDeleteRequest = (id: string, isPurchased: boolean) => {
    if (isPurchased) {
      setShowPurchasedBlock(true);
    } else {
      setPendingDeleteId(id);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return;
    await onPermanentDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 pt-10 pb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/40 hover:text-white transition-colors active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-black text-white">Treinos Arquivados</h1>
          <p className="text-xs text-white/30 font-semibold mt-0.5">
            {archived.length === 0
              ? 'Nenhum treino arquivado'
              : `${archived.length} treino${archived.length !== 1 ? 's' : ''} arquivado${archived.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          <Archive size={18} className="text-white/30" />
        </div>
      </div>

      {/* Info banner */}
      <div className="mb-6 px-4 py-3 rounded-2xl bg-white/3 border border-white/8">
        <p className="text-xs text-white/40 leading-relaxed">
          Treinos arquivados ficam ocultos da sua lista principal. Restaure qualquer treino para usá-lo novamente.
        </p>
      </div>

      {/* List */}
      {archived.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
            <Archive size={36} className="text-white/15" />
          </div>
          <div className="text-center">
            <p className="text-white/40 font-black text-base">Nenhum treino arquivado</p>
            <p className="text-xs text-white/20 mt-1">
              Quando você arquivar um treino, ele aparecerá aqui.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {archived.map(template => (
            <ArchivedTemplateCard
              key={template.id}
              template={template}
              onRestore={onRestore}
              onPermanentDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {/* Permanent delete confirmation modal */}
      <PermanentDeleteModal
        open={!!pendingDeleteId}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Purchased block modal */}
      <PurchasedBlockModal
        open={showPurchasedBlock}
        onClose={() => setShowPurchasedBlock(false)}
      />
    </div>
  );
}
