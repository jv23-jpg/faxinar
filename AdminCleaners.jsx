import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search,
  Star,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Award,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminCleaners() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: cleaners = [], isLoading } = useQuery({
    queryKey: ['adminCleaners'],
    queryFn: () => base44.entities.CleanerProfile.list('-created_date'),
    enabled: !!user
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }) => base44.entities.CleanerProfile.update(id, { verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCleaners'] });
      toast.success('Status atualizado!');
    }
  });

  const filteredCleaners = cleaners.filter(cleaner => {
    const matchesSearch = 
      cleaner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cleaner.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cleaner.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterVerified === 'all' ||
      (filterVerified === 'verified' && cleaner.verified) ||
      (filterVerified === 'pending' && !cleaner.verified);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciar Faxineiras</h1>
        <p className="text-slate-600 dark:text-slate-400">Verifique e gerencie as profissionais</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome, email ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterVerified === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterVerified('all')}
                className={filterVerified === 'all' ? 'bg-emerald-600' : ''}
              >
                Todas ({cleaners.length})
              </Button>
              <Button
                variant={filterVerified === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterVerified('pending')}
                className={filterVerified === 'pending' ? 'bg-amber-600' : ''}
              >
                Pendentes ({cleaners.filter(c => !c.verified).length})
              </Button>
              <Button
                variant={filterVerified === 'verified' ? 'default' : 'outline'}
                onClick={() => setFilterVerified('verified')}
                className={filterVerified === 'verified' ? 'bg-emerald-600' : ''}
              >
                Verificadas ({cleaners.filter(c => c.verified).length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cleaners List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Carregando...</div>
      ) : filteredCleaners.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nenhuma faxineira encontrada
            </h3>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCleaners.map((cleaner, index) => (
            <motion.div
              key={cleaner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`border-0 shadow-lg overflow-hidden ${
                !cleaner.verified ? 'border-l-4 border-l-amber-500' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 flex items-center justify-center">
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          {cleaner.full_name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {cleaner.full_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {cleaner.verified ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Verificada
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                              Aguardando
                            </Badge>
                          )}
                          {cleaner.available && (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                              Disponível
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{cleaner.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Phone className="w-4 h-4" />
                      <span>{cleaner.phone}</span>
                    </div>
                    {cleaner.city && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{cleaner.city}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-current" />
                        <span className="font-medium">{cleaner.average_rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{cleaner.total_cleanings || 0} serviços</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Award className="w-4 h-4" />
                        <span>{cleaner.rewards_earned || 0} bônus</span>
                      </div>
                    </div>

                    {!cleaner.verified ? (
                      <Button
                        onClick={() => verifyMutation.mutate({ id: cleaner.id, verified: true })}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        size="sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Verificar
                      </Button>
                    ) : (
                      <Button
                        onClick={() => verifyMutation.mutate({ id: cleaner.id, verified: false })}
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    )}
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