import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function CleanerAvailability() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const queryClient = useQueryClient();

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const [defaultAvailability, setDefaultAvailability] = useState(
    daysOfWeek.map((_, idx) => ({ day_of_week: idx, time_slots: [] }))
  );

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    const profiles = await base44.entities.CleanerProfile.filter({ user_email: userData.email });
    if (profiles.length > 0) setProfile(profiles[0]);
  };

  const { data: availability } = useQuery({
    queryKey: ['availability', user?.email, currentMonth],
    queryFn: async () => {
      const list = await base44.entities.CleanerAvailability.filter({ 
        cleaner_email: user.email, 
        month_year: currentMonth 
      });
      return list[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (availability?.default_availability) {
      setDefaultAvailability(availability.default_availability);
    }
  }, [availability]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (availability) {
        await base44.entities.CleanerAvailability.update(availability.id, {
          default_availability: defaultAvailability,
          blocked_dates: availability.blocked_dates || []
        });
      } else {
        await base44.entities.CleanerAvailability.create({
          cleaner_email: user.email,
          default_availability: defaultAvailability,
          blocked_dates: [],
          month_year: currentMonth
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['availability']);
      toast.success('Disponibilidade salva!');
    }
  });

  const toggleTimeSlot = (dayIndex, time) => {
    setDefaultAvailability(prev => {
      const newAvail = [...prev];
      const day = newAvail[dayIndex];
      if (day.time_slots.includes(time)) {
        day.time_slots = day.time_slots.filter(t => t !== time);
      } else {
        day.time_slots = [...day.time_slots, time];
      }
      return newAvail;
    });
  };

  if (!profile) return <div className="text-center py-12">Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Minha Disponibilidade
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Configure seus horários disponíveis para o mês de {format(new Date(currentMonth), 'MMMM yyyy', { locale: ptBR })}
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Disponibilidade Padrão Mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Selecione os horários em que você está disponível em cada dia da semana. 
            Esta configuração será aplicada automaticamente todo mês.
          </p>

          {defaultAvailability.map((day, dayIndex) => (
            <div key={dayIndex} className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {daysOfWeek[dayIndex]}
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {timeSlots.map(time => {
                  const isSelected = day.time_slots.includes(time);
                  return (
                    <button
                      key={time}
                      onClick={() => toggleTimeSlot(dayIndex, time)}
                      className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Disponibilidade'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}