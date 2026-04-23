import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, User, Image, Paperclip, MoreVertical, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils/cn';
import { Student, ChatMessage, UserProfile } from '../../domain/entities';

export function ChatView({ student, messages, onSendMessage, onBack, userProfile }: { 
  student: Student, 
  messages: ChatMessage[], 
  onSendMessage: (text: string) => void, 
  onBack: () => void, 
  userProfile: UserProfile 
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-screen -mx-4 -mt-6 bg-dark-bg relative overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-dark-surface/80 backdrop-blur-xl border-b border-white/5 flex items-center gap-4 sticky top-0 z-30">
        <button onClick={onBack} className="p-2 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="relative">
            <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-dark-surface" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{student.name}</h3>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <button className="p-2 text-white/20 hover:text-white transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-32">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <MessageCircle size={32} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">Inicie uma conversa</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.senderId === userProfile.email;
          const showTime = idx === 0 || messages[idx-1].senderId !== msg.senderId;

          return (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex flex-col max-w-[80%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed shadow-lg",
                isMe 
                  ? "bg-brand-red text-black rounded-tr-none" 
                  : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
              )}>
                {msg.text}
              </div>
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isMe && <ShieldCheck size={10} className="text-brand-red/40" />}
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark-bg/80 backdrop-blur-xl border-t border-white/5 fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-2 flex items-end gap-2 focus-within:border-brand-red/30 transition-all">
            <button className="p-2 text-white/20 hover:text-white transition-colors">
              <Paperclip size={20} />
            </button>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none no-scrollbar max-h-32"
            />
            <button className="p-2 text-white/20 hover:text-white transition-colors">
              <Image size={20} />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={cn(
              "p-4 rounded-2xl transition-all shadow-lg active:scale-95",
              inputText.trim() 
                ? "bg-brand-red text-black shadow-brand-red/20" 
                : "bg-white/5 text-white/10"
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

import { MessageCircle } from 'lucide-react';
