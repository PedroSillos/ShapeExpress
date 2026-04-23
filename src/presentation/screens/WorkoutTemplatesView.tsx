import React from 'react';
import { Plus, Dumbbell, ChevronRight, Play, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { WorkoutTemplate } from '../../domain/entities';

interface WorkoutTemplatesViewProps {
  studentName?: string;
  templates: WorkoutTemplate[];
  onSelect: (t: WorkoutTemplate) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onBack?: () => void;
}

export function WorkoutTemplatesView({ studentName, templates, onSelect, onAdd, onDelete, onBack }: WorkoutTemplatesViewProps) {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors">
            <ChevronRight size={20} className="rotate-180" />
          </button>
        )}
        <h2 className="text-xl font-bold flex-1">
          {studentName ? `Treinos de ${studentName}` : 'Protocolos de Treino'}
        </h2>
        <button 
          onClick={onAdd}
          className="p-3 bg-brand-red text-black rounded-xl shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {templates.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
              <Dumbbell size={32} />
            </div>
            <p className="text-sm text-white/40">Nenhum protocolo criado ainda.</p>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="p-6 space-y-4 relative group">
              <button 
                onClick={() => onDelete(template.id)}
                className="absolute top-4 right-4 p-2 text-white/20 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{template.name}</h3>
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">
                      {template.category === 'multicycle' ? `${template.cycles?.length || 0} Ciclos` : `${template.sheets?.length || 0} Vezes por Semana`}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] border-brand-red/20 text-brand-red">
                  {template.category === 'multicycle' ? 'Multiciclo' : 'Básico'}
                </Badge>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => onSelect(template)}
                  className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-brand-red">Editar Treino</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight size={16} className="text-white/20" />
                  </div>
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
