import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LifeBuoy, 
  Users, 
  Calendar,
  DollarSign,
  Search,
  Package,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSupport() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: requests = [] } = useQuery({
    queryKey: ['allRequests'],
    queryFn: () => base44.entities.CleaningRequest.list('-created_date'),
    enabled: !!user
  });

  const { data: cleaners = [] } = useQuery({
    queryKey: ['allCleaners'],
    queryFn: () => base44.entities.CleanerProfile.list(),
    enabled: !!user
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['allClients'],
    queryFn: () => base44.entities.ClientProfile.list(),
    enabled: !!user
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['allWithdrawals'],
    queryFn: () => base44.entities.Withdrawal.list('-created_date'),
    enabled: !!user
  });

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    completedRequests: requests.filter(r => r.status === 'completed').length,
    totalCleaners: cleaners.length,
    verifiedCleaners: cleaners.filter(c => c.verified).length,
    totalClients: clients.length,
    pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
    totalRevenue: requests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + (r.agency_fee || 0), 0)
  };

  const filteredRequests = requests.filter(r => 
    r.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.cleaner_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Suporte Técnico
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Visão completa do sistema para auxílio técnico
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Pedidos</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalRequests}</p>
                  <p className="text-xs text-amber-600 mt-1">{stats.pendingRequests} pendentes</p>
                </div>
                <Calendar className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Faxineiras</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalCleaners}</p>
                  <p className="text-xs text-green-600 mt-1">{stats.verifiedCleaners} verificadas</p>
                </div>
                <Users className="w-12 h-12 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Clientes</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalClients}</p>
                  <p className="text-xs text-slate-500 mt-1">cadastrados</p>
                </div>
                <Package className="w-12 h-12 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Receita Total</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    R$ {stats.totalRevenue.toFixed(0)}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">taxa agência</p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Buscar por email, endereço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Tables */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="requests">Pedidos</TabsTrigger>
          <TabsTrigger value="cleaners">Faxineiras</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="withdrawals">
            Saques
            {stats.pendingWithdrawals > 0 && (
              <span className="ml-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {stats.pendingWithdrawals}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Todos os Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Faxineira</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.slice(0, 20).map((request) => (
                      <tr key={request.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-4 text-xs text-slate-500">{request.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-sm">{request.client_email}</td>
                        <td className="py-3 px-4 text-sm">{request.cleaner_email || '-'}</td>
                        <td className="py-3 px-4 text-sm">{request.scheduled_date}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            request.status === 'completed' ? 'bg-green-100 text-green-700' :
                            request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-medium">
                          R$ {request.total_price?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleaners">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Todas as Faxineiras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Telefone</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Verificada</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Serviços</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cleaners.map((cleaner) => (
                      <tr key={cleaner.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-4 text-sm font-medium">{cleaner.full_name}</td>
                        <td className="py-3 px-4 text-sm">{cleaner.user_email}</td>
                        <td className="py-3 px-4 text-sm">{cleaner.phone}</td>
                        <td className="py-3 px-4 text-center">
                          {cleaner.verified ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-amber-600">⏳</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-sm">{cleaner.total_cleanings || 0}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium">
                          R$ {(cleaner.available_balance || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Todos os Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Nome</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Telefone</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Pedidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-4 text-sm font-medium">{client.full_name}</td>
                        <td className="py-3 px-4 text-sm">{client.user_email}</td>
                        <td className="py-3 px-4 text-sm">{client.phone}</td>
                        <td className="py-3 px-4 text-center text-sm">{client.total_bookings || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Solicitações de Saque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Faxineira</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">PIX</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Valor</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600 dark:text-slate-400">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-3 px-4 text-sm">{withdrawal.cleaner_email}</td>
                        <td className="py-3 px-4 text-sm font-mono">{withdrawal.pix_key}</td>
                        <td className="py-3 px-4 text-right text-sm font-medium">
                          R$ {withdrawal.amount?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            withdrawal.status === 'paid' ? 'bg-green-100 text-green-700' :
                            withdrawal.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {withdrawal.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{new Date(withdrawal.created_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 