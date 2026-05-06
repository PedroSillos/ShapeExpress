import { Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../../presentation/components/Card';

interface Props {
  onFinalize: () => void;
}

export function AthleteSuccess({ onFinalize }: Props) {
  return (
    <motion.div
      key="step8-athlete-success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[70vh] flex flex-col justify-center space-y-8 py-12"
    >
      <Card className="p-8 text-center space-y-8">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto"
        >
          <Trophy className="text-brand-red" size={40} />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">🎉 Tudo pronto!</h2>
          <p className="text-sm text-white/40">Seu treino está esperando.</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <button onClick={onFinalize} className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform">
            Ver meu treino
          </button>
          <button onClick={onFinalize} className="w-full py-4 bg-white/5 border border-dark-border rounded-2xl text-white font-bold active:scale-95 transition-transform">
            Explorar Loja
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
