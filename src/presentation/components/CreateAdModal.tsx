import React, { useState } from 'react';
import { X, Image as ImageIcon, Tag, DollarSign, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { WorkoutTemplate } from '../../domain/entities';
import { ProtocolCard } from './ProtocolCard';

interface CreateAdModalProps {
  template: WorkoutTemplate;
  onClose: () => void;
  onSubmit: (adData: any) => void;
}

export function CreateAdModal({ template, onClose, onSubmit }: CreateAdModalProps) {
  const [title, setTitle] = useState(template.name);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('49.90');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');

  const previewProtocol = {
    id: 'preview',
    title: title || 'Título do Anúncio',
    description,
    price: parseFloat(price.replace(',', '.')) || 0,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    tags: tags.split(',').map(t => t.trim()).filter(t => t),
    rating: 5.0,
    sales: 0,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `protocol_${Date.now()}`,
      templateId: template.id,
      title,
      description,
      price: parseFloat(price.replace(',', '.')),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      rating: 5.0,
      sales: 0,
      duration: template.category === 'multicycle' ? `${template.cycles?.length} Ciclos` : 'Contínuo',
      level: 'Intermediário', // Default
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-4 border-b border-dark-border flex justify-between items-center bg-dark-bg/50 shrink-0">
          <h2 className="text-lg font-bold">Criar Anúncio</h2>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Pré-visualização na Loja</label>
            <ProtocolCard protocol={previewProtocol} />
          </div>

          <form id="create-ad-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Título do Anúncio</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} /> Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors h-24 resize-none"
                placeholder="Descreva os benefícios e detalhes deste treino..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={14} /> Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={14} /> URL da Imagem de Capa
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} /> Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-red transition-colors"
                placeholder="Ex: Hipertrofia, Iniciante, Em Casa"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-dark-border bg-dark-bg/50 shrink-0">
          <button
            type="submit"
            form="create-ad-form"
            className="w-full py-4 bg-brand-red text-black font-bold rounded-xl uppercase tracking-widest hover:bg-brand-red/90 transition-colors shadow-lg shadow-brand-red/20"
          >
            Publicar Anúncio
          </button>
        </div>
      </motion.div>
    </div>
  );
}
