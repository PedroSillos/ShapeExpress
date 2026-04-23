import React from 'react';
import { Trophy } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';
import { cn } from '../../utils/cn';

export interface ProtocolCardProps {
  protocol: any;
  featured?: boolean;
  purchased?: boolean;
  onPurchase?: (id: string) => void;
}

export function ProtocolCard({ protocol, featured, purchased, onPurchase }: ProtocolCardProps) {
  return (
    <Card className={cn("p-0 overflow-hidden border-white/5 hover:border-brand-red/30 transition-all group", featured && "border-brand-red/20", purchased && "border-emerald-500/20")}>
      <div className="relative aspect-video">
        <img src={protocol.imageUrl || protocol.image} alt={protocol.title || protocol.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-1">
          {purchased && (
            <Badge className="bg-emerald-500 text-black border-none text-[8px]">Adquirido</Badge>
          )}
          {protocol.tags?.slice(0, 2).map((tag: string) => (
            <Badge key={tag} className="bg-black/60 backdrop-blur-md border border-white/10 text-[8px]">{tag}</Badge>
          ))}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div>
            <h4 className="font-bold text-sm leading-tight">{protocol.title || protocol.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-brand-red">
                <Trophy size={10} />
                <span className="text-[10px] font-bold">{protocol.rating || '5.0'}</span>
              </div>
              <span className="text-[10px] text-white/40">•</span>
              <span className="text-[10px] text-white/40">{protocol.sales || '0'} alunos</span>
            </div>
          </div>
          <div className="text-right">
            {purchased ? (
              <button className="px-4 py-1.5 bg-emerald-500 text-black rounded-lg text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform">
                Acessar
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  onPurchase && onPurchase(protocol.id);
                }}
                className="px-4 py-1.5 bg-brand-red text-black rounded-lg text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
              >
                Comprar R$ {Number(protocol.price || 0).toFixed(2).replace('.', ',')}
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
