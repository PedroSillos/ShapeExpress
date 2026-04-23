import React from 'react';
import { Bell, ChevronLeft, CheckCircle2, MessageSquare, UserCheck, UserPlus, Dumbbell, Flame, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';
import { AppNotification } from '../../domain/entities';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onBack: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onAction: (notification: AppNotification) => void;
}

export function NotificationsView({ 
  notifications, 
  onBack, 
  onMarkAsRead, 
  onClearAll,
  onAction
}: NotificationsViewProps) {
  return (
    <div className="flex flex-col h-full -mx-6">
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-dark-surface/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-bold">Notificações</h2>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="text-xs font-bold text-brand-red uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Limpar Tudo
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {notifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Bell size={32} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest">Tudo limpo por aqui!</p>
              <p className="text-xs mt-1">Você não tem novas notificações.</p>
            </div>
          </div>
        ) : (
          notifications
            .sort((a, b) => {
              const timeA = new Date(a.timestamp).getTime();
              const timeB = new Date(b.timestamp).getTime();
              if (isNaN(timeA)) return 1;
              if (isNaN(timeB)) return -1;
              return timeB - timeA;
            })
            .map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                onMarkAsRead(notification.id);
                onAction(notification);
              }}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer relative",
                notification.read 
                  ? "bg-dark-card/50 border-white/5 opacity-60" 
                  : "bg-dark-card border-brand-red/20 shadow-lg shadow-brand-red/5"
              )}
            >
              {!notification.read && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-brand-red rounded-full" />
              )}
              <div className="flex gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  (notification.type === 'info' || notification.type === 'chat_message') && "bg-blue-500/10 text-blue-500",
                  (notification.type === 'success' || notification.type === 'connection_response') && "bg-emerald-500/10 text-emerald-500",
                  (notification.type === 'warning' || notification.type === 'connection_request') && "bg-amber-500/10 text-amber-500",
                  (notification.type === 'alert' || notification.type === 'workout_assigned') && "bg-brand-red/10 text-brand-red"
                )}>
                  {(notification.type === 'info' || notification.type === 'chat_message') && (notification.type === 'chat_message' ? <MessageSquare size={20} /> : <Bell size={20} />)}
                  {(notification.type === 'success' || notification.type === 'connection_response') && (notification.type === 'connection_response' ? <UserCheck size={20} /> : <CheckCircle2 size={20} />)}
                  {(notification.type === 'warning' || notification.type === 'connection_request') && (notification.type === 'connection_request' ? <UserPlus size={20} /> : <AlertTriangle size={20} />)}
                  {(notification.type === 'alert' || notification.type === 'workout_assigned') && (notification.type === 'workout_assigned' ? <Dumbbell size={20} /> : <Flame size={20} />)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold">{notification.title}</h3>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">{notification.message}</p>
                  <p className="text-[10px] text-white/20 font-bold uppercase pt-1">
                    {new Date(notification.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
