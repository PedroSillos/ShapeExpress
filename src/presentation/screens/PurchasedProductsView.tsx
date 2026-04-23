import React from 'react';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { ProtocolCard } from '../components/ProtocolCard';
import { MOCK_PROTOCOLS } from '../../constants';

export function PurchasedProductsView({ onBack }: { onBack: () => void }) {
  // Mock data for purchased products
  const purchasedProtocols = MOCK_PROTOCOLS.slice(0, 2);
  
  return (
    <div className="space-y-6 pb-24">
      <div className="sticky top-0 z-30 bg-dark-bg/80 backdrop-blur-xl pt-4 pb-2 -mx-4 px-4 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold">Meus Produtos</h2>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Galeria de Compras</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Protocolos Adquiridos</h3>
        <div className="grid gap-4">
          {purchasedProtocols.map(protocol => (
            <ProtocolCard key={protocol.id} protocol={protocol} purchased />
          ))}
        </div>
      </div>
      
      {purchasedProtocols.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10">
            <ShoppingBag size={40} />
          </div>
          <div className="space-y-1">
            <p className="font-bold">Nenhum produto encontrado</p>
            <p className="text-xs text-white/40 max-w-[200px]">Você ainda não adquiriu nenhum protocolo ou serviço.</p>
          </div>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-brand-red text-black rounded-xl font-bold text-xs uppercase tracking-widest"
          >
            Explorar Loja
          </button>
        </div>
      )}
    </div>
  );
}
