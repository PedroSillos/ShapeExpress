import React from 'react';
import { ShoppingBag, Sparkles, Zap, Flame, Heart, ChevronRight, Star, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

export function StoreView() {
  const categories = [
    { id: 'supplements', label: 'Suplementos', icon: <Zap size={18} />, color: 'text-brand-red' },
    { id: 'equipment', label: 'Equipamentos', icon: <Flame size={18} />, color: 'text-orange-500' },
    { id: 'apparel', label: 'Vestuário', icon: <Heart size={18} />, color: 'text-pink-500' }
  ];

  const products = [
    { id: '1', name: 'Whey Protein Isolate', brand: 'Shape Labs', price: 'R$ 189,90', rating: 4.9, image: 'https://picsum.photos/seed/whey/200/200', tag: 'Best Seller' },
    { id: '2', name: 'Creatina Monohidratada', brand: 'Shape Labs', price: 'R$ 89,90', rating: 4.8, image: 'https://picsum.photos/seed/creatine/200/200', tag: 'Popular' },
    { id: '3', name: 'Pré-Treino Igniter', brand: 'Shape Labs', price: 'R$ 149,90', rating: 4.7, image: 'https://picsum.photos/seed/preworkout/200/200', tag: 'New' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Shape Store</h2>
        <button className="p-2 bg-white/5 rounded-full text-white/40 hover:text-brand-red transition-colors">
          <ShoppingBag size={20} />
        </button>
      </div>

      <Card className="p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
        <div className="relative z-10 space-y-4">
          <Badge variant="outline" className="text-[10px] border-brand-red/20 text-brand-red">
            <Sparkles size={10} className="mr-1" />
            Oferta Exclusiva
          </Badge>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold">20% OFF em toda linha Shape Labs</h3>
            <p className="text-sm text-white/40">Use o cupom: <span className="text-brand-red font-bold">SHAPE20</span></p>
          </div>
          <button className="px-6 py-2.5 bg-brand-red text-black rounded-xl text-xs font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform">
            Aproveitar Agora
          </button>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Categorias</h3>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((cat) => (
            <button key={cat.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-red/20 transition-all group">
              <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 mx-auto ${cat.color} group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <p className="text-[10px] font-bold text-center">{cat.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Mais Vendidos</h3>
          <button className="text-[10px] text-brand-red font-bold uppercase tracking-widest flex items-center gap-1">
            Ver Todos <ChevronRight size={10} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="flex items-center gap-4 p-4 group">
              <div className="w-20 h-20 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px] border-brand-red/20 text-brand-red py-0 px-1.5">{product.tag}</Badge>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-bold">{product.rating}</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold truncate">{product.name}</h4>
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{product.brand}</p>
                <p className="text-sm font-bold text-brand-red">{product.price}</p>
              </div>
              <button className="p-3 bg-white/5 rounded-xl text-white/40 hover:bg-brand-red hover:text-black transition-all">
                <ShoppingBag size={18} />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
