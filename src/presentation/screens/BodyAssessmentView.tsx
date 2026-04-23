import React, { useState } from 'react';
import { Ruler, Scale, CalendarIcon, ChevronLeft, Camera, Plus, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { InputGroup } from '../components/InputGroup';
import { BodyAssessment } from '../../domain/entities';

interface BodyAssessmentViewProps {
  assessments: BodyAssessment[];
  onSave: (a: Partial<BodyAssessment>) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function BodyAssessmentView({ assessments, onSave, onDelete, onBack }: BodyAssessmentViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAssessment, setNewAssessment] = useState<Partial<BodyAssessment>>({
    weight: 0,
    height: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    biceps: 0,
    thigh: 0,
    calf: 0,
    bodyFat: 0,
    date: new Date().toISOString()
  });

  const handleSave = () => {
    onSave(newAssessment);
    setIsAdding(false);
    setNewAssessment({
      weight: 0,
      height: 0,
      chest: 0,
      waist: 0,
      hips: 0,
      biceps: 0,
      thigh: 0,
      calf: 0,
      bodyFat: 0,
      date: new Date().toISOString()
    });
  };

  if (isAdding) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsAdding(false)} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold">Nova Avaliação</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InputGroup 
            label="Peso (kg)" 
            value={newAssessment.weight?.toString() || ''} 
            onChange={(v) => setNewAssessment({...newAssessment, weight: parseFloat(v)})} 
            icon={<Scale size={18} />} 
            type="number"
          />
          <InputGroup 
            label="Altura (cm)" 
            value={newAssessment.height?.toString() || ''} 
            onChange={(v) => setNewAssessment({...newAssessment, height: parseFloat(v)})} 
            icon={<Ruler size={18} />} 
            type="number"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Medidas (cm)</h3>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Peitoral" value={newAssessment.chest?.toString() || ''} onChange={(v) => setNewAssessment({...newAssessment, chest: parseFloat(v)})} icon={<Ruler size={14} />} type="number" />
            <InputGroup label="Cintura" value={newAssessment.waist?.toString() || ''} onChange={(v) => setNewAssessment({...newAssessment, waist: parseFloat(v)})} icon={<Ruler size={14} />} type="number" />
            <InputGroup label="Quadril" value={newAssessment.hips?.toString() || ''} onChange={(v) => setNewAssessment({...newAssessment, hips: parseFloat(v)})} icon={<Ruler size={14} />} type="number" />
            <InputGroup label="Bíceps" value={newAssessment.biceps?.toString() || ''} onChange={(v) => setNewAssessment({...newAssessment, biceps: parseFloat(v)})} icon={<Ruler size={14} />} type="number" />
            <InputGroup label="Coxa" value={newAssessment.thigh?.toString() || ''} onChange={(v) => setNewAssessment({...newAssessment, thigh: parseFloat(v)})} icon={<Ruler size={14} />} type="number" />
            <InputGroup label="Panturrilha" value={newAssessment.calf?.toString() || ''} onChange={(v) => setNewAssessment({...newAssessment, calf: parseFloat(v)})} icon={<Ruler size={14} />} type="number" />
          </div>
        </div>

        <div className="pt-6">
          <button 
            onClick={handleSave}
            className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
          >
            Salvar Avaliação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold">Evolução Corporal</h2>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="p-3 bg-brand-red text-black rounded-xl shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {assessments.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
              <Scale size={32} />
            </div>
            <p className="text-sm text-white/40">Nenhuma avaliação registrada ainda.</p>
          </Card>
        ) : (
          assessments.map((assessment) => (
            <Card key={assessment.id} className="p-6 space-y-4 relative group">
              <button 
                onClick={() => onDelete(assessment.id)}
                className="absolute top-4 right-4 p-2 text-white/20 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-3 text-brand-red">
                <CalendarIcon size={16} />
                <span className="text-sm font-bold">{new Date(assessment.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Peso</p>
                  <p className="text-lg font-bold">{assessment.weight}kg</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Gordura</p>
                  <p className="text-lg font-bold">{assessment.bodyFat}%</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">IMC</p>
                  <p className="text-lg font-bold">{(assessment.weight / ((assessment.height/100) ** 2)).toFixed(1)}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
