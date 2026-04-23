import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Card } from '../components/Card';
import { NotificationToggle } from '../components/NotificationToggle';

interface SettingsNotificationsViewProps {
  onSave: () => void;
  onCancel: () => void;
}

export function SettingsNotificationsView({ onSave, onCancel }: SettingsNotificationsViewProps) {
  const [settings, setSettings] = useState({
    reminders: true,
    achievements: true,
    weeklyReport: true,
    marketing: false
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 bg-white/5 rounded-full"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-bold">Notificações</h2>
      </div>

      <Card className="divide-y divide-dark-border">
        <NotificationToggle 
          label="Lembretes de Treino" 
          description="Avisar quando for hora de esmagar."
          active={settings.reminders}
          onToggle={() => setSettings({...settings, reminders: !settings.reminders})}
        />
        <NotificationToggle 
          label="Novas Conquistas" 
          description="Notificar quando você desbloquear medalhas."
          active={settings.achievements}
          onToggle={() => setSettings({...settings, achievements: !settings.achievements})}
        />
        <NotificationToggle 
          label="Relatório Semanal" 
          description="Resumo da sua performance a cada domingo."
          active={settings.weeklyReport}
          onToggle={() => setSettings({...settings, weeklyReport: !settings.weeklyReport})}
        />
        <NotificationToggle 
          label="Novidades e Dicas" 
          description="Conteúdo exclusivo para atletas Shape Express."
          active={settings.marketing}
          onToggle={() => setSettings({...settings, marketing: !settings.marketing})}
        />
      </Card>

      <div className="pt-6">
        <button 
          onClick={onSave}
          className="w-full py-4 red-gradient rounded-2xl text-black font-bold shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
        >
          Salvar Preferências
        </button>
      </div>
    </div>
  );
}
