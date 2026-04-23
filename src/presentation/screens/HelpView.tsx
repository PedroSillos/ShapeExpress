import React from 'react';
import { Mail, Bell, ChevronLeft } from 'lucide-react';
import { Card } from '../components/Card';

interface HelpViewProps {
  onBack: () => void;
}

export function HelpView({ onBack }: HelpViewProps) {
  const faqs = [
    {
      question: "Como crio um novo treino?",
      answer: "Vá na aba 'Treinos' e clique no botão '+' no topo da tela. Você poderá definir o nome do protocolo, número de vezes por semana e selecionar os exercícios."
    },
    {
      question: "Como registro minha evolução?",
      answer: "Na aba 'Evolução', clique em 'Nova Avaliação'. Você pode registrar seu peso, medidas e até tirar fotos para comparar seu progresso visualmente."
    },
    {
      question: "O que é o Volume Total?",
      answer: "É a soma de (Peso × Repetições × Séries) de todos os exercícios realizados. É um excelente indicador de sobrecarga progressiva."
    },
    {
      question: "Como ganho medalhas?",
      answer: "As medalhas são desbloqueadas automaticamente conforme você atinge marcos, como completar seu primeiro treino, manter uma sequência ou atingir volume recorde."
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Ajuda e Suporte</h2>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Perguntas Frequentes</h3>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={index} className="space-y-2">
              <h4 className="text-sm font-bold text-brand-red">{faq.question}</h4>
              <p className="text-xs text-white/60 leading-relaxed">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">Suporte Direto</h3>
        <Card className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
            <Mail size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold">E-mail de Suporte</h4>
            <p className="text-xs text-white/40">suporte@shapeexpress.com</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
            <Bell size={24} />
          </div>
          <div>
            <h4 className="text-sm font-bold">Comunidade Shape Express</h4>
            <p className="text-xs text-white/40">Acesse nosso Discord oficial</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
