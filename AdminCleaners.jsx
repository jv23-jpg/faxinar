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

                    <div>
                      <input type="file" className="hidden" id={`doc-upload-${cleaner.id}`} onChange={async (e)=>{
                        const f = e.target.files && e.target.files[0];
                        if (!f) return;
                        try {
                          let url = null;
                          if (base44.api && base44.api.uploadFile) {
                            const res = await base44.api.uploadFile(f);
                            url = res?.url || null;
                          }
                          if (!url) {
                            alert('Upload não disponível. Use a URL manual.');
                            return;
                          }
                          const docs = cleaner.documents ? [...cleaner.documents] : [];
                          docs.push({ url, uploaded_date: new Date().toISOString() });
                          await base44.entities.CleanerProfile.update(cleaner.id, { documents: docs });
                          queryClient.invalidateQueries({ queryKey: ['adminCleaners'] });
                          toast.success('Documento enviado');
                        } catch (err) {
                          console.error(err); toast.error('Erro ao enviar');
                        }
                      }} />
                      <label htmlFor={`doc-upload-${cleaner.id}`} className="btn btn-sm btn-ghost text-sm">Enviar Documento</label>

                      {/* Review & verify */}
                      <div className="ml-3 inline-block">
                        <details className="mt-2">
                          <summary className="text-sm text-slate-600 cursor-pointer">Ver documentos ({(cleaner.documents || []).length})</summary>
                          <div className="mt-2 space-y-2">
                            {(cleaner.documents || []).map((d, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800">
                                <a href={d.url} target="_blank" rel="noreferrer" className="text-sm text-emerald-600">{d.label || d.url}</a>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">{new Date(d.uploaded_date).toLocaleString()}</span>
                                  <Button size="sm" variant="ghost" onClick={async ()=>{
                                    if (!confirm('Remover este documento?')) return;
                                    const docs = cleaner.documents ? cleaner.documents.filter((_, i)=>i !== idx) : [];
                                    await base44.entities.CleanerProfile.update(cleaner.id, { documents: docs });
                                    queryClient.invalidateQueries({ queryKey: ['adminCleaners'] });
                                    toast.success('Documento removido');
                                  }}>Remover</Button>
                                </div>
                              </div>
                            ))}

                            <div className="pt-2 border-t mt-2">
                              <Label htmlFor={`verify_note_${cleaner.id}`}>Observação (opcional)</Label>
                              <input id={`verify_note_${cleaner.id}`} className="w-full p-2 border rounded" placeholder="Escreva uma observação que será registrada" />
                              <div className="flex items-center gap-2 mt-2">
                                <Button size="sm" onClick={async ()=>{
                                  const note = document.getElementById(`verify_note_${cleaner.id}`).value || '';
                                  if (!confirm('Aprovar a verificação dessa faxineira?')) return;
                                  try {
                                    const history = cleaner.verification_history ? [...cleaner.verification_history] : [];
                                    history.push({ by: user.email, date: new Date().toISOString(), action: 'approved', note });
                                    await base44.entities.CleanerProfile.update(cleaner.id, { verified: true, verification_history: history });
                                    queryClient.invalidateQueries({ queryKey: ['adminCleaners'] });

                                    // audit
                                    try { const { auditLog } = await import('./utils/audit'); await auditLog({ actor: user.email, action: 'approve_cleaner', entity: 'cleaner', entity_id: cleaner.id, details: { note } }); } catch(e){ console.warn('audit failed', e); }

                                    try {
                                      if (base44.api && base44.api.sendInvite) {
                                        await base44.api.sendInvite({ email: cleaner.user_email, type: 'verification_result', status: 'approved', note, from: user.email });
                                      } else {
                                        const { sendInvite } = await import('./utils/sendInvite');
                                        try { await sendInvite({ email: cleaner.user_email, type: 'verification_result', status: 'approved', note, from: user.email }); } catch(e){ console.warn('Erro ao notificar via servidor local:', e); }
                                      }
                                    } catch (err) { console.warn('Erro ao notificar:', err); }

                                    toast.success('Faxineira verificada!');
                                  } catch (err) { console.error(err); toast.error('Erro ao aprovar'); }
                                }}>Aprovar</Button>

                                <Button size="sm" variant="destructive" onClick={async ()=>{
                                  const note = document.getElementById(`verify_note_${cleaner.id}`).value || '';
                                  if (!confirm('Rejeitar a verificação dessa faxineira?')) return;
                                  try {
                                    const history = cleaner.verification_history ? [...cleaner.verification_history] : [];
                                    history.push({ by: user.email, date: new Date().toISOString(), action: 'rejected', note });
                                    await base44.entities.CleanerProfile.update(cleaner.id, { verified: false, verification_history: history });
                                    queryClient.invalidateQueries({ queryKey: ['adminCleaners'] });

                                    // audit
                                    try { const { auditLog } = await import('./utils/audit'); await auditLog({ actor: user.email, action: 'reject_cleaner', entity: 'cleaner', entity_id: cleaner.id, details: { note } }); } catch(e){ console.warn('audit failed', e); }

                                    try {
                                      if (base44.api && base44.api.sendInvite) {
                                        await base44.api.sendInvite({ email: cleaner.user_email, type: 'verification_result', status: 'rejected', note, from: user.email });
                                      } else {
                                        const { sendInvite } = await import('./utils/sendInvite');
                                        try { await sendInvite({ email: cleaner.user_email, type: 'verification_result', status: 'rejected', note, from: user.email }); } catch(e){ console.warn('Erro ao notificar via servidor local:', e); }
                                      }
                                    } catch (err) { console.warn('Erro ao notificar:', err); }

                                    toast.success('Verificação rejeitada.');
                                  } catch (err) { console.error(err); toast.error('Erro ao rejeitar'); }
                                }}>Rejeitar</Button>

                              </div>
                            </div>

                          </div>
                        </details>
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