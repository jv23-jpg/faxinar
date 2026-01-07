import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function CleanerWithdrawals() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
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

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['withdrawals', user?.email],
    queryFn: () => base44.entities.Withdrawal.filter({ cleaner_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const requestWithdrawalMutation = useMutation({
    mutationFn: async (data) => {
      const currentHour = new Date().getHours();
      if (currentHour < 23) {
        throw new Error('Saques só podem ser solicitados após as 23h');
      }

      return base44.entities.Withdrawal.create({
        cleaner_email: user.email,
        amount: parseFloat(data.amount),
        pix_key: profile.pix_key,
        recipient_name: data.recipientName,
        recipient_address: data.recipientAddress,
        status: 'pending',
        request_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      setWithdrawalAmount('');
      setRecipientName('');
      setRecipientAddress('');
      toast.success('Solicitação de saque enviada!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleRequestWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      toast.error('Digite um valor válido');
      return;
    }
    if (amount > availableBalance) {
      toast.error('Saldo insuficiente');
      return;
    }
    if (!profile.pix_key) {
      toast.error('Cadastre uma chave PIX no seu perfil primeiro');
      return;
    }
    if (!recipientName.trim()) {
      toast.error('Digite o nome completo do destinatário');
      return;
    }
    if (!recipientAddress.trim()) {
      toast.error('Digite o endereço completo');
      return;
    }
    requestWithdrawalMutation.mutate({ 
      amount, 
      recipientName, 
      recipientAddress 
    });
  };

  const statusConfig = {
    pending: { label: 'Pendente', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    approved: { label: 'Aprovado', icon: CheckCircle2, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    paid: { label: 'Pago', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejeitado', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200' }
  };

  const totalWithdrawn = withdrawals
    .filter(w => w.status === 'paid')
    .reduce((sum, w) => sum + w.amount, 0);

  const pendingAmount = withdrawals
    .filter(w => w.status === 'pending' || w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);

  const availableBalance = (profile?.total_earnings || 0) - totalWithdrawn - pendingAmount;

  if (!profile) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Saques</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie seus ganhos e solicite saques (disponível após 23h)
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-8 h-8 opacity-80" />
                <span className="text-sm font-medium opacity-90">Disponível</span>
              </div>
              <p className="text-3xl font-bold">R$ {availableBalance.toFixed(2)}</p>
              <p className="text-sm opacity-75 mt-1">Pode sacar agora</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-amber-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Pendente</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">R$ {pendingAmount.toFixed(2)}</p>
              <p className="text-sm text-slate-500 mt-1">Em processamento</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Ganho</span>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">R$ {(profile.total_earnings || 0).toFixed(2)}</p>
              <p className="text-sm text-slate-500 mt-1">Histórico completo</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Request Withdrawal */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Solicitar Saque
          </CardTitle>
          <CardDescription>
            Saques disponíveis após as 23h • Chave PIX: {profile.pix_key || 'Não cadastrada'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!profile.pix_key && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Cadastre sua chave PIX
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Acesse seu perfil para cadastrar uma chave PIX antes de solicitar saques.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Valor do Saque</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  max={availableBalance}
                  step="0.01"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Disponível: R$ {availableBalance.toFixed(2)}
                </p>
              </div>
              <div>
                <Label htmlFor="recipient-name">Nome Completo</Label>
                <Input
                  id="recipient-name"
                  placeholder="Seu nome completo"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="recipient-address">Endereço Completo</Label>
              <Textarea
                id="recipient-address"
                placeholder="Rua, número, bairro, cidade, CEP"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="min-h-[80px]"
              />
              <p className="text-xs text-slate-500 mt-1">
                Necessário para comprovante de transferência
              </p>
            </div>

            <Button
              onClick={handleRequestWithdrawal}
              disabled={requestWithdrawalMutation.isPending || !profile.pix_key}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              {requestWithdrawalMutation.isPending ? 'Enviando...' : 'Solicitar Saque'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals History */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              Nenhuma solicitação de saque ainda
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => {
                const config = statusConfig[withdrawal.status];
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={withdrawal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          R$ {withdrawal.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {format(new Date(withdrawal.created_date), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={config.color}>
                      {config.label}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}