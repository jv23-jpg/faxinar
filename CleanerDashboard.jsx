import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Star,
  DollarSign,
  TrendingUp,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusBadge } from '@/components/common/StatusBadge';

export default function CleanerDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

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

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['cleanerRequests', user?.email],
    queryFn: () => base44.entities.CleaningRequest.filter({ cleaner_email: user.email }, '-created_date', 10),
    enabled: !!user
  });

  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: () => base44.entities.CleaningRequest.filter({ status: 'pending' }, '-created_date', 5),
    enabled: !!user && !!profile?.verified
  });

  const todayRequests = requests.filter(r => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return r.scheduled_date === today && ['accepted', 'in_progress'].includes(r.status);
  });

  const completedThisMonth = requests.filter(r => {
    const now = new Date();
    const requestDate = new Date(r.scheduled_date);
    return r.status === 'completed' && 
           requestDate.getMonth() === now.getMonth() &&
           requestDate.getFullYear() === now.getFullYear();
  });

  const monthlyEarnings = completedThisMonth.reduce((acc, r) => acc + (r.cleaner_earnings || 0), 0);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Olá, {profile?.full_name || 'Profissional'}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Veja seus serviços de hoje
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile?.verified ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verificada
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              <AlertCircle className="w-3 h-3 mr-1" />
              Aguardando verificação
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/50 dark:to-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Ganhos do Mês</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    R$ {monthlyEarnings.toFixed(0)}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total de Serviços</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {profile?.total_cleanings || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Avaliação Média</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-2">
                    {profile?.average_rating?.toFixed(1) || '0.0'}
                    <Star className="w-6 h-6 fill-current" />
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/50 dark:to-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">5★ Seguidas</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {profile?.consecutive_five_stars || 0}/10
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Today's services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Serviços de Hoje</CardTitle>
            <Link to={createPageUrl('CleanerSchedule')}>
              <Button variant="ghost" size="sm" className="text-emerald-600 dark:text-emerald-400">
                Ver agenda
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {todayRequests.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Nenhum serviço agendado para hoje
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayRequests.map((request) => (
                  <div 
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {request.scheduled_time} • {request.hours}h
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                          {request.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={request.status} />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        R$ {request.cleaner_earnings?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Available requests (only for verified cleaners) */}
      {profile?.verified && pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Serviços Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div 
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20"
                  >
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {format(new Date(request.scheduled_date), "dd 'de' MMM", { locale: ptBR })} às {request.scheduled_time}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {request.hours}h • {request.address?.substring(0, 30)}...
                      </p>
                    </div>
                    <Link to={createPageUrl('CleanerSchedule')}>
                      <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500">
                        Ver detalhes
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link to={createPageUrl('CleanerRewards')}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Recompensas</h3>
                <p className="text-purple-100 text-sm">
                  {profile?.rewards_earned || 0} bônus conquistados
                </p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('CleanerProfile')}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Meu Perfil</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Editar informações</p>
              </div>
              <ArrowRight className="w-5 h-5 ml-auto text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
} 