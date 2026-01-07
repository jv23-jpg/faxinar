import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Award, 
  Star,
  Gift,
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function CleanerRewards() {
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

  const { data: rewards = [] } = useQuery({
    queryKey: ['cleanerRewards', user?.email],
    queryFn: () => base44.entities.Reward.filter({ cleaner_email: user.email }, '-created_date'),
    enabled: !!user
  });

  const consecutiveProgress = ((profile?.consecutive_five_stars || 0) / 10) * 100;
  const pendingRewards = rewards.filter(r => r.status === 'pending');
  const paidRewards = rewards.filter(r => r.status === 'paid');
  const totalEarned = rewards.reduce((acc, r) => acc + (r.amount || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Minhas Recompensas</h1>
        <p className="text-slate-600 dark:text-slate-400">Acompanhe seus bônus e conquistas</p>
      </div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-8 relative">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-purple-100 mb-1">Progresso para Próximo Bônus</p>
                <h2 className="text-4xl font-bold">
                  {profile?.consecutive_five_stars || 0}/10
                </h2>
                <p className="text-purple-200 text-sm mt-1">
                  avaliações 5★ seguidas
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-200">Progresso</span>
                <span className="font-medium">{consecutiveProgress.toFixed(0)}%</span>
              </div>
              <Progress value={consecutiveProgress} className="h-3 bg-white/20" />
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-xl">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-yellow-300" />
                <div>
                  <p className="font-medium">Bônus de R$ 50</p>
                  <p className="text-sm text-purple-200">
                    Ao completar 10 avaliações 5 estrelas seguidas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {profile?.rewards_earned || 0}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bônus Conquistados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mx-auto mb-4">
                <Star className="w-7 h-7 text-amber-600 dark:text-amber-400 fill-current" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {profile?.average_rating?.toFixed(1) || '0.0'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Avaliação Média
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                R$ {totalEarned}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total em Bônus
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-emerald-600" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                  Receba 5 Estrelas
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Faça um ótimo trabalho e receba avaliação máxima
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                  Complete 10 Seguidas
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Mantenha a qualidade e acumule 10 avaliações 5★
                </p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                  Ganhe R$ 50
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Receba o bônus automaticamente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rewards History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Recompensas</CardTitle>
          </CardHeader>
          <CardContent>
            {rewards.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                  Nenhuma recompensa ainda. Continue fazendo um ótimo trabalho!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rewards.map((reward, index) => (
                  <div 
                    key={reward.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        reward.status === 'paid' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                          : 'bg-amber-100 dark:bg-amber-900/50'
                      }`}>
                        {reward.status === 'paid' ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {reward.description || 'Bônus de Recompensa'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {format(new Date(reward.created_date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={
                        reward.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
                      }>
                        {reward.status === 'paid' ? 'Pago' : 'Pendente'}
                      </Badge>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        R$ {reward.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}