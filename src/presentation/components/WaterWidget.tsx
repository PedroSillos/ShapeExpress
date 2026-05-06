import { useState } from 'react';
import { Droplets, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';

export function WaterWidget() {
  const [waterIntake, setWaterIntake] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`water-intake-${today}`);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [waterGoal, setWaterGoal] = useState(() => {
    const saved = localStorage.getItem('water-goal');
    return saved ? parseInt(saved, 10) : 2500;
  });
  const [waterCupSize, setWaterCupSize] = useState(() => {
    const saved = localStorage.getItem('water-cup-size');
    return saved ? parseInt(saved, 10) : 250;
  });
  const [showModal, setShowModal] = useState(false);

  const addWater = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const today = new Date().toISOString().split('T')[0];
    const next = waterIntake + waterCupSize;
    setWaterIntake(next);
    localStorage.setItem(`water-intake-${today}`, next.toString());
  };

  const changeCupSize = (delta: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = Math.max(50, waterCupSize + delta);
    setWaterCupSize(next);
    localStorage.setItem('water-cup-size', next.toString());
  };

  return (
    <>
      <Card className="flex flex-col gap-3 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setShowModal(true)}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-400">
            <Droplets size={18} />
            <h3 className="font-bold">Hidratação</h3>
          </div>
          <span className="text-xs font-bold text-blue-400">{waterIntake} / {waterGoal} ml</span>
        </div>
        <ProgressBar progress={waterIntake} max={waterGoal} className="bg-blue-400/20 [&>div]:bg-blue-400" />
        <div className="flex justify-between items-center mt-2">
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
            {waterIntake >= waterGoal ? 'Meta atingida!' : `Faltam ${Math.max(0, waterGoal - waterIntake)} ml`}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/5 rounded-full px-1 py-1">
              <button onClick={(e) => changeCupSize(-50, e)} className="p-1 text-white/40 hover:text-white transition-colors">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-bold text-blue-400 w-12 text-center">{waterCupSize}ml</span>
              <button onClick={(e) => changeCupSize(50, e)} className="p-1 text-white/40 hover:text-white transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
            <button
              onClick={addWater}
              className="w-8 h-8 rounded-full bg-blue-400/10 text-blue-400 flex items-center justify-center hover:bg-blue-400/20 active:scale-95 transition-all"
            >
              <span className="text-lg font-bold leading-none">+</span>
            </button>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="relative w-full max-w-md bg-dark-surface border border-dark-border rounded-[32px] p-6 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-blue-400">
                  <Droplets size={24} />
                  <h3 className="text-xl font-bold text-white">Hidratação</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-6">
                <div className="bg-dark-card border border-dark-border rounded-2xl p-4">
                  <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-3 block">Meta Diária (ml)</label>
                  <input
                    type="number"
                    value={waterGoal}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) { setWaterGoal(val); localStorage.setItem('water-goal', val.toString()); }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-blue-400 transition-colors"
                  />
                </div>
                <div className="bg-dark-card border border-dark-border rounded-2xl p-6 flex flex-col items-center">
                  <label className="text-xs text-white/40 font-bold uppercase tracking-widest mb-4 block text-center">Tamanho do Copo</label>
                  <div className="flex items-center justify-center gap-6 w-full">
                    <button onClick={() => changeCupSize(-50)} className="p-2 text-white/40 hover:text-white transition-colors">
                      <ChevronLeft size={24} />
                    </button>
                    <div className="bg-white text-blue-500 px-8 py-4 rounded-full flex items-center gap-3 font-bold text-2xl shadow-lg shadow-blue-500/20">
                      <Droplets size={24} />
                      <span>{waterCupSize}ml</span>
                    </div>
                    <button onClick={() => changeCupSize(50)} className="p-2 text-white/40 hover:text-white transition-colors">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
              >
                Concluído
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
