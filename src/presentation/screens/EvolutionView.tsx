import React, { useState } from 'react';
import { Ruler, Scale, CalendarIcon, ChevronLeft, Camera, Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { BodyAssessment } from '../../domain/entities';
import { cn } from '../../utils/cn';

interface EvolutionViewProps {
  assessments: BodyAssessment[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function EvolutionView({ assessments, onAdd, onDelete }: EvolutionViewProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'photos'>('metrics');
  
  const latestAssessment = assessments[0];
  const previousAssessment = assessments[1];

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return { value: '0.0', type: 'neutral' };
    const diff = current - previous;
    return {
      value: Math.abs(diff).toFixed(1),
      type: diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'neutral'
    };
  };

  const ChangeBadge = ({ change }: { change: { value: string, type: string } }) => {
    if (change.type === 'neutral') return <Badge variant="outline" className="text-[8px] border-white/10 text-white/40"><Minus size={8} className="mr-1" />0.0</Badge>;
    return (
      <Badge variant="outline" className={cn(
        "text-[8px]",
        change.type === 'increase' ? "border-emerald-500/20 text-emerald-500" : "border-brand-red/20 text-brand-red"
      )}>
        {change.type === 'increase' ? <TrendingUp size={8} className="mr-1" /> : <TrendingDown size={8} className="mr-1" />}
        {change.value}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Evolução</h2>
        <button 
          onClick={onAdd}
          className="p-3 bg-brand-red text-black rounded-xl shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex p-1 bg-white/5 rounded-2xl">
        <button 
          onClick={() => setActiveTab('metrics')}
          className={cn(
            "flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300",
            activeTab === 'metrics' ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" : "text-white/40"
          )}
        >
          Métricas
        </button>
        <button 
          onClick={() => setActiveTab('photos')}
          className={cn(
            "flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300",
            activeTab === 'photos' ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" : "text-white/40"
          )}
        >
          Fotos
        </button>
      </div>

      {activeTab === 'metrics' ? (
        <div className="space-y-6">
          {latestAssessment ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                      <Scale size={20} />
                    </div>
                    <ChangeBadge change={calculateChange(latestAssessment.weight, previousAssessment?.weight || 0)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Peso Atual</p>
                    <p className="text-2xl font-bold">{latestAssessment.weight}kg</p>
                  </div>
                </Card>
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                      <TrendingUp size={20} />
                    </div>
                    <ChangeBadge change={calculateChange(latestAssessment.bodyFat || 0, previousAssessment?.bodyFat || 0)} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Gordura Corp.</p>
                    <p className="text-2xl font-bold">{latestAssessment.bodyFat || 0}%</p>
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Histórico de Medidas</h3>
                <div className="space-y-3">
                  {assessments.map((assessment) => (
                    <Card key={assessment.id} className="p-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                          <CalendarIcon size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">{new Date(assessment.date).toLocaleDateString('pt-BR')}</h4>
                          <p className="text-[10px] text-white/40">{assessment.weight}kg · {assessment.bodyFat}% gordura</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onDelete(assessment.id)}
                        className="p-2 text-white/20 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <Card className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
                <Scale size={32} />
              </div>
              <p className="text-sm text-white/40">Nenhuma avaliação registrada ainda.</p>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="aspect-[3/4] p-0 overflow-hidden relative group">
              <img src="https://picsum.photos/seed/front/400/600" alt="Front" className="w-full h-full object-cover grayscale opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Frente</p>
                <p className="text-xs font-bold">01/03/2024</p>
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-brand-red" />
              </button>
            </Card>
            <Card className="aspect-[3/4] p-0 overflow-hidden relative group">
              <img src="https://picsum.photos/seed/side/400/600" alt="Side" className="w-full h-full object-cover grayscale opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Lado</p>
                <p className="text-xs font-bold">01/03/2024</p>
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-brand-red" />
              </button>
            </Card>
          </div>
          <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold hover:bg-white/10 transition-colors">
            <Plus size={18} className="text-brand-red" />
            Adicionar Fotos
          </button>
        </div>
      )}
    </div>
  );
}
