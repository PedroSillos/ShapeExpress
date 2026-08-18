import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Store, Tag, DollarSign, FileText, Image } from 'lucide-react';
import { WorkoutTemplate, UserProfile } from '../../domain/entities';
import type { PublishPayload } from '../hooks/useStoreState';
import { cn } from '../../utils/cn';

interface PublishToStoreModalProps {
  initialTemplate: WorkoutTemplate;
  templates: WorkoutTemplate[];
  userProfile: UserProfile;
  onPublish: (payload: PublishPayload) => Promise<any>;
  onClose: () => void;
}

const SUGGESTED_TAGS = ['Hipertrofia', 'Emagrecimento', 'Funcional', 'Força', 'Resistência', 'Iniciante', 'Avançado', 'HIIT', 'Mobilidade'];

export function PublishToStoreModal({ initialTemplate, templates, userProfile, onPublish, onClose }: PublishToStoreModalProps) {
  const [title, setTitle] = useState(initialTemplate.name);
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('4');
  const [durationUnit, setDurationUnit] = useState<'weeks' | 'months'>('weeks');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setCustomTag('');
  };

  const handlePublish = async () => {
    if (!title.trim()) { setError('Informe um título para o treino.'); return; }
    const parsedPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice < 0) { setError('Informe um preço válido (use 0 para gratuito).'); return; }
    const parsedDuration = parseInt(duration);
    if (isNaN(parsedDuration) || parsedDuration < 1) { setError('Informe uma duração válida.'); return; }

    setError('');
    setIsPublishing(true);
    try {
      const payload: PublishPayload = {
        type: 'workout',
        templateId: initialTemplate.id,
        title: title.trim(),
        description: description.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        price: parsedPrice,
        duration: parsedDuration,
        durationUnit,
        tags,
      };
      await onPublish(payload);
      onClose();
    } catch (e) {
      console.error('[PublishToStoreModal] onPublish error:', e);
      setError('Erro ao publicar. Tente novamente.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#7C3AED' }}>
                <Store size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Publicar na Loja</h2>
                <p className="text-xs text-white/40">{initialTemplate.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
                Título
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Treino de Hipertrofia 12 Semanas"
                  className="w-full bg-white/5 border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/20 placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
                Descrição <span className="text-white/30 font-normal">(opcional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o treino, objetivos, público-alvo..."
                rows={3}
                className="w-full bg-white/5 border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20 placeholder:text-white/30 resize-none"
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
                Imagem de Capa <span className="text-white/30 font-normal">(URL, opcional)</span>
              </label>
              <div className="relative">
                <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/20 placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
                Preço (R$)
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00 para gratuito"
                  inputMode="decimal"
                  className="w-full bg-white/5 border border-dark-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-white/20 placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
                Duração do Anúncio
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-20 bg-white/5 border border-dark-border rounded-xl px-4 py-3 text-sm text-center focus:outline-none focus:border-white/20"
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as 'weeks' | 'months')}
                  className="flex-1 bg-white/5 border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/20"
                >
                  <option value="weeks">Semanas</option>
                  <option value="months">Meses</option>
                </select>
              </div>
              <p className="text-xs text-white/40 mt-1.5">
                O treino ficará disponível para o comprador por esse período a partir da data de compra
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2 block">
                <Tag size={12} className="inline mr-1" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                      tags.includes(tag)
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-white/5 border-dark-border text-white/60 hover:bg-white/10',
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {/* Custom tag input */}
              <div className="flex gap-2">
                <input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                  placeholder="Tag personalizada..."
                  className="flex-1 bg-white/5 border border-dark-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-white/20 placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-4 py-2.5 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  Adicionar
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2.5 py-1 bg-violet-600/20 border border-violet-500/30 rounded-full text-xs text-violet-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                        className="text-violet-400 hover:text-white transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-white/5 rounded-2xl font-bold hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex-1 py-4 bg-violet-600 rounded-2xl font-bold text-white shadow-lg shadow-violet-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isPublishing ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
