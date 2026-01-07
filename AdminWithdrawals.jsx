import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminWithdrawals() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: withdrawals = [], isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => base44.entities.Withdrawal.list('-created_date'),
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => {
      return base44.entities.Withdrawal.update(id, {
        status,
        processed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      toast.success('Status atualizado!');
    }
  });

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesSearch = w.cleaner_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    pending: { label: 'Pendente', icon: Clock, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    approved: { label: 'Aprovado', icon: CheckCircle2, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    paid: { label: 'Pago', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejeitado', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200' }
  };

  const stats = {
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    paid: withdrawals.filter(w => w.status === 'paid').length,
    totalPending: withdrawals
      .filter(w => w.status === 'pending' || w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0)
  };

  if (isLoading) {
    return <div className="text-center py-12">Carregando...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Gerenciar Saques</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Aprove ou rejeite solicitações de saque das faxineiras
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pendentes</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Aprovados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pagos</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600">
          <CardContent className="p-4 text-white">
            <div>
              <p className="text-sm opacity-90">Total a Pagar</p>
              <p className="text-2xl font-bold">R$ {stats.totalPending.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'paid', 'rejected'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-emerald-600' : ''}
                >
                  {status === 'all' ? 'Todos' : statusConfig[status]?.label || status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals List */}
      <div className="space-y-3">
        {filteredWithdrawals.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center text-slate-500">
              Nenhuma solicitação encontrada
            </CardContent>
          </Card>
        ) : (
          filteredWithdrawals.map((withdrawal) => {
            const config = statusConfig[withdrawal.status];
            const Icon = config.icon;

            return (
              <motion.div
                key={withdrawal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {withdrawal.cleaner_email}
                            </p>
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                            R$ {withdrawal.amount.toFixed(2)}
                          </p>
                          <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                            <p>PIX: {withdrawal.pix_key}</p>
                            <p>Solicitado: {format(new Date(withdrawal.created_date), 'dd/MM/yyyy HH:mm')}</p>
                            {withdrawal.processed_date && (
                              <p>Processado: {format(new Date(withdrawal.processed_date), 'dd/MM/yyyy HH:mm')}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {withdrawal.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => updateStatusMutation.mutate({ id: withdrawal.id, status: 'rejected' })}
                            disabled={updateStatusMutation.isPending}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeitar
                          </Button>
                          <Button
                            onClick={() => updateStatusMutation.mutate({ id: withdrawal.id, status: 'approved' })}
                            disabled={updateStatusMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                        </div>
                      )}

                      {withdrawal.status === 'approved' && (
                        <Button
                          onClick={() => updateStatusMutation.mutate({ id: withdrawal.id, status: 'paid' })}
                          disabled={updateStatusMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Marcar como Pago
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}