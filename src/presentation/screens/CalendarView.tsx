import React, { useState } from 'react';
import { CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2, Dumbbell, Clock } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { cn } from '../../utils/cn';
import { WorkoutSession } from '../../domain/entities';

interface CalendarViewProps {
  sessions: WorkoutSession[];
}

export function CalendarView({ sessions }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthName = currentMonth.toLocaleString('pt-BR', { month: 'long' });
  const year = currentMonth.getFullYear();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const hasWorkoutOnDay = (day: number) => {
    return sessions.some(s => {
      const d = new Date(s.date);
      return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
  };

  const getWorkoutsOnDay = (day: number) => {
    return sessions.filter(s => {
      const d = new Date(s.date);
      return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
  };

  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Calendário</h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-brand-red transition-colors"><ChevronLeft size={16} /></button>
          <span className="text-sm font-bold capitalize">{monthName} {year}</span>
          <button onClick={nextMonth} className="p-2 bg-white/5 rounded-full text-white/40 hover:text-brand-red transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-white/20 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const hasWorkout = hasWorkoutOnDay(day);
            const isSelected = selectedDay === day;
            const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

            return (
              <button 
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-300",
                  isSelected ? "bg-brand-red text-black shadow-lg shadow-brand-red/20" : "hover:bg-white/5",
                  isToday && !isSelected && "border border-brand-red/40"
                )}
              >
                <span className="text-xs font-bold">{day}</span>
                {hasWorkout && (
                  <div className={cn(
                    "w-1 h-1 rounded-full mt-1",
                    isSelected ? "bg-black" : "bg-brand-red"
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-[10px] text-white/40 font-bold uppercase tracking-widest px-2">
          {selectedDay ? `Treinos em ${selectedDay} de ${monthName}` : 'Selecione um dia'}
        </h3>
        <div className="space-y-3">
          {selectedDay && getWorkoutsOnDay(selectedDay).length > 0 ? (
            getWorkoutsOnDay(selectedDay).map(session => (
              <Card key={session.id} className="p-4 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                    <Dumbbell size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{session.workoutName}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      <Clock size={10} />
                      {Math.floor(session.duration / 60)} min
                    </div>
                  </div>
                </div>
                <CheckCircle2 size={20} className="text-brand-red" />
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center space-y-2 opacity-40">
              <CalendarIcon size={24} className="mx-auto text-white/20" />
              <p className="text-xs">Nenhum treino registrado para este dia.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
