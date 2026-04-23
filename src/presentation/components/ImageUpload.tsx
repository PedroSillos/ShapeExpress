import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ImageUploadProps {
  onUploadSuccess?: (url: string) => void;
  onUploadComplete?: (url: string) => void;
  uploadImage?: (file: File) => Promise<{ url: string }>;
  currentImageUrl?: string;
  className?: string;
  label?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'any';
  variant?: 'dropzone' | 'button';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onUploadSuccess,
  onUploadComplete,
  uploadImage,
  currentImageUrl, 
  className,
  label = "Upload de Imagem",
  aspectRatio = 'square',
  variant = 'dropzone'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      let url = '';
      if (uploadImage) {
        const data = await uploadImage(file);
        url = data.url;
      } else {
        const formData = new FormData();
        formData.append('image', file);
        const token = localStorage.getItem('shape_express_token');
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Falha no upload da imagem');
        }

        const data = await response.json();
        url = data.url;
      }

      setPreviewUrl(url);
      if (onUploadSuccess) onUploadSuccess(url);
      if (onUploadComplete) onUploadComplete(url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Erro ao fazer upload. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  if (variant === 'button') {
    return (
      <div className={className} onClick={triggerFileInput}>
        {isUploading ? <Loader2 size={14} className="animate-spin" /> : label}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && typeof label === 'string' && <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</label>}
      
      <div 
        onClick={triggerFileInput}
        className={cn(
          "relative group cursor-pointer overflow-hidden border-2 border-dashed transition-all",
          aspectRatio === 'square' ? "aspect-square rounded-2xl" : "aspect-video rounded-2xl",
          previewUrl ? "border-brand-red/50" : "border-white/10 hover:border-brand-red/30 bg-white/5",
          isUploading && "opacity-50 pointer-events-none"
        )}
      >
        {previewUrl ? (
          <>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="p-3 bg-brand-red rounded-full text-black">
                <Camera size={24} />
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/20 group-hover:text-brand-red/50 transition-colors">
            <Upload size={32} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Selecionar Foto</span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Loader2 size={32} className="animate-spin text-brand-red" />
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {error && <p className="text-[10px] text-brand-red font-bold">{error}</p>}
      {previewUrl && !isUploading && (
        <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
          <Check size={12} /> Imagem carregada com sucesso
        </p>
      )}
    </div>
  );
};
