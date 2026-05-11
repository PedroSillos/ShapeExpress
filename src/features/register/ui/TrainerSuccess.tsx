import { CheckCircle2, Smartphone, Link as LinkIcon, QrCode } from 'lucide-react';
import { motion } from 'motion/react';
import { Card } from '../../../presentation/components/Card';

interface Props {
  onFinalize: () => void;
}

export function TrainerSuccess({ onFinalize }: Props) {
  return (
    <motion.div
      key="step5-trainer-success"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-[70vh] flex flex-col justify-center space-y-8 py-12"
    >
      <Card className="p-8 text-center space-y-8">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="text-emerald-500" size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Conta criada com sucesso!</h2>
          <p className="text-sm text-white/40">Convide seus primeiros alunos para começar a gerenciar seus treinos.</p>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <button className="w-full py-4 bg-white/5 border border-dark-border rounded-2xl flex items-center justify-center gap-3 font-bold text-sm active:scale-95 transition-transform">
            <LinkIcon size={18} className="text-brand-red" />Enviar link
          </button>
          <button className="w-full py-4 bg-white/5 border border-dark-border rounded-2xl flex items-center justify-center gap-3 font-bold text-sm active:scale-95 transition-transform">
            <Smartphone size={18} className="text-emerald-500" />Compartilhar no WhatsApp
          </button>
          <button className="w-full py-4 bg-white/5 border border-dark-border rounded-2xl flex items-center justify-center gap-3 font-bold text-sm active:scale-95 transition-transform">
            <QrCode size={18} className="text-blue-400" />QR Code
          </button>
        </div>
        <button onClick={onFinalize} data-testid="btn-ir-dashboard" className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform">
          Ir para o Dashboard
        </button>
      </Card>
    </motion.div>
  );
}
