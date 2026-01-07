import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  Search,
  Clock,
  MapPin,
  Package,
  User,
  DollarSign,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { StatusBadge, PaymentBadge } from '@/components/common/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function AdminRequests() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['adminRequests'],
    queryFn: () => base44.entities.CleaningRequest.list('-created_date', 200),
    enabled: !!user
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.CleaningRequest.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      toast.success('Status atualizado!');
    }
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, payment_status }) => base44.entities.CleaningRequest.update(id, { payment_status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRequests'] });
      toast.success('Pagamento atualizado!');
    }
  });

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.cleaner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    in_progress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    cancelled: requests.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciar Pedidos</h1>
        <p className="text-slate-600 dark:text-slate-400">Visualize e gerencie todos os pedidos</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por cliente, faxineira ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({statusCounts.all})</SelectItem>
                  <SelectItem value="pending">Pendentes ({statusCounts.pending})</SelectItem>
                  <SelectItem value="accepted">Aceitos ({statusCounts.accepted})</SelectItem>
                  <SelectItem value="in_progress">Em Andamento ({statusCounts.in_progress})</SelectItem>
                  <SelectItem value="completed">Concluídos ({statusCounts.completed})</SelectItem>
                  <SelectItem value="cancelled">Cancelados ({statusCounts.cancelled})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : filteredRequests.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Nenhum pedido encontrado
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-4 gap-6">
                    {/* Date & Time */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {format(new Date(request.scheduled_date), 'dd')}
                        </span>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase">
                          {format(new Date(request.scheduled_date), 'MMM', { locale: ptBR })}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{request.scheduled_time}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 dark:text-slate-400">{request.hours}h</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {request.address?.substring(0, 30)}...
                        </p>
                      </div>
                    </div>

                    {/* Client & Cleaner */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-slate-600 dark:text-slate-400">Cliente:</span>
                        <span className="font-medium truncate">{request.client_email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-600 dark:text-slate-400">Faxineira:</span>
                        <span className="font-medium truncate">
                          {request.cleaner_email || 'Não atribuída'}
                        </span>
                      </div>
                      {request.include_products && (
                        <div className="flex items-center gap-2 text-xs text-amber-600">
                          <Package className="w-3 h-3" />
                          Produtos inclusos
                        </div>
                      )}
                    </div>

                    {/* Status & Payment */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={request.status} />
                        <Select
                          value={request.status}
                          onValueChange={(value) => updateStatusMutation.mutate({ id: request.id, status: value })}
                        >
                          <SelectTrigger className="w-32 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="accepted">Aceito</SelectItem>
                            <SelectItem value="in_progress">Em Andamento</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <PaymentBadge status={request.payment_status} />
                        <Select
                          value={request.payment_status}
                          onValueChange={(value) => updatePaymentMutation.mutate({ id: request.id, payment_status: value })}
                        >
                          <SelectTrigger className="w-32 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="refunded">Reembolsado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="flex flex-col items-end justify-center gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Total:</span>
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          R$ {request.total_price?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Taxa: R$ {request.agency_fee?.toFixed(2)}</span>
                        <span>Fax: R$ {request.cleaner_earnings?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}