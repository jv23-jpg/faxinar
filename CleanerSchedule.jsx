import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin,
  Package,
  CheckCircle2,
  PlayCircle,
  User,
  Phone
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from 'sonner';

export default function CleanerSchedule() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    
    const profiles = await base44.entities.CleanerProfile.filter({ user_email: userData.email });
    if (profiles.length > 0) {
      setProfile(profiles[0]);
    }
  };

  const { data: myRequests = [] } = useQuery({
    queryKey: ['myCleanerRequests', user?.email],
    queryFn: () => base44.entities.CleaningRequest.filter({ cleaner_email: user.email }, '-scheduled_date'),
    enabled: !!user
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['allPendingRequests'],
    queryFn: () => base44.entities.CleaningRequest.filter({ status: 'pending' }, '-created_date'),
    enabled: !!user && !!profile?.verified
  });

  const acceptMutation = useMutation({
    mutationFn: async (requestId) => {
      await base44.entities.CleaningRequest.update(requestId, { 
        status: 'accepted', 
        cleaner_email: user.email 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCleanerRequests'] });
      queryClient.invalidateQueries({ queryKey: ['allPendingRequests'] });
      toast.success('Serviço aceito com sucesso!');
    }
  });

  const startMutation = useMutation({
    mutationFn: (requestId) => base44.entities.CleaningRequest.update(requestId, { status: 'in_progress' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCleanerRequests'] });
      toast.success('Serviço iniciado!');
    }
  });

  const completeMutation = useMutation({
    mutationFn: async (request) => {
      await base44.entities.CleaningRequest.update(request.id, { status: 'completed' });
      
      // Update cleaner earnings and available balance
      if (profile) {
        const earnings = request.cleaner_earnings || 0;
        await base44.entities.CleanerProfile.update(profile.id, {
          total_earnings: (profile.total_earnings || 0) + earnings,
          available_balance: (profile.available_balance || 0) + earnings
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myCleanerRequests'] });
      toast.success('Serviço concluído! Saldo disponível para saque.');
    }
  });

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    return addDays(start, i);
  });

  const filteredRequests = myRequests.filter(r => 
    isSameDay(new Date(r.scheduled_date), selectedDate)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Minha Agenda</h1>
        <p className="text-slate-600 dark:text-slate-400">Gerencie seus serviços</p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="schedule">Meus Serviços</TabsTrigger>
          <TabsTrigger value="available" className="relative">
            Disponíveis
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-6">
          {/* Week calendar */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {weekDays.map((day, index) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const hasRequests = myRequests.some(r => isSameDay(new Date(r.scheduled_date), day));
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`flex-shrink-0 w-16 p-3 rounded-xl text-center transition-all ${
                        isSelected 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg' 
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <p className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {format(day, 'EEE', { locale: ptBR })}
                      </p>
                      <p className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {format(day, 'd')}
                      </p>
                      {hasRequests && !isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mx-auto mt-1" />
                      )}
                      {isToday && !isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mx-auto mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Day's requests */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            
            {filteredRequests.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Nenhum serviço agendado para este dia
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex flex-col items-center justify-center">
                            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {request.scheduled_time}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-600 dark:text-slate-400">{request.hours}h</span>
                              <StatusBadge status={request.status} />
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {request.address}
                            </p>
                            {request.include_products && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                                <Package className="w-3 h-3" />
                                Produtos inclusos
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                              R$ {request.cleaner_earnings?.toFixed(2)}
                            </p>
                          </div>
                          
                          {request.status === 'accepted' && (
                            <Button
                              onClick={() => startMutation.mutate(request.id)}
                              className="bg-blue-500 hover:bg-blue-600"
                            >
                              <PlayCircle className="w-4 h-4 mr-1" />
                              Iniciar
                            </Button>
                          )}
                          
                          {request.status === 'in_progress' && (
                            <Button
                              onClick={() => completeMutation.mutate(request)}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Concluir
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {!profile?.verified ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <User className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                  Perfil em Verificação
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  Seu perfil ainda está sendo verificado. Em breve você poderá aceitar serviços.
                </p>
              </CardContent>
            </Card>
          ) : pendingRequests.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Nenhum serviço disponível no momento
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            {format(new Date(request.scheduled_date), 'dd')}
                          </span>
                          <span className="text-xs text-amber-600 dark:text-amber-400 uppercase">
                            {format(new Date(request.scheduled_date), 'MMM', { locale: ptBR })}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {request.scheduled_time}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-600 dark:text-slate-400">{request.hours}h</span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {request.address}
                          </p>
                          {request.include_products && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                              <Package className="w-3 h-3" />
                              Produtos inclusos
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            R$ {request.cleaner_earnings?.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">Você recebe</p>
                        </div>
                        
                        <Button
                          onClick={() => acceptMutation.mutate(request.id)}
                          disabled={acceptMutation.isPending}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Aceitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}