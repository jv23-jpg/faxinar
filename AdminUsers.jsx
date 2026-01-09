import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, User, Trash, Mail, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => { (async () => {
    try { const me = await base44.auth.me(); setUser(me); } catch(e){ setUser(null); }
  })(); }, []);

  const { data: cleaners = [] } = useQuery({ queryKey: ['adminCleaners'], queryFn: () => base44.entities.CleanerProfile.list('-created_date'), enabled: !!user });
  const { data: clients = [] } = useQuery({ queryKey: ['adminClients'], queryFn: () => base44.entities.ClientProfile.list('-created_date'), enabled: !!user });
  const { data: companies = [] } = useQuery({ queryKey: ['adminCompanies'], queryFn: () => base44.entities.CompanyAccount.list('-created_date'), enabled: !!user });
  const { data: invites = [] } = useQuery({ queryKey: ['adminInvites'], queryFn: () => base44.entities.Invite ? base44.entities.Invite.list('-created_date') : [], enabled: !!user });

  const resendMutation = useMutation({ mutationFn: async ({ email, link }) => {
    try {
      if (base44.api && base44.api.sendInvite) {
        await base44.api.sendInvite({ email, link, from: user.email });
        return true;
      }
      const { sendInvite } = await import('./utils/sendInvite');
      await sendInvite({ email, link, from: user.email });
      return true;
    } catch (err) {
      console.warn('sendInvite failed:', err);
      throw err;
    }
  }, onSuccess: () => toast.success('Convite reenviado') });

  const deleteMutation = useMutation({ mutationFn: async ({ entity, id, type, email }) => {
    let nameOrEmail = email || id;
    if (entity && entity.delete) {
      await entity.delete(id);
    } else if (entity && entity.update) {
      await entity.update(id, { archived: true });
    } else {
      throw new Error('Remoção não suportada');
    }

    // audit
    try { const { auditLog } = await import('./utils/audit'); await auditLog({ actor: user?.email || 'admin', action: 'delete_user', entity: type, entity_id: id, details: { email: nameOrEmail } }); } catch (e) { console.warn('audit failed', e); }

    return true;
  }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminCleaners','adminClients','adminCompanies'] }); toast.success('Removido/arquivado'); } });

  const saveEdit = async (type, id) => {
    try {
      if (type === 'cleaner') {
        await base44.entities.CleanerProfile.update(id, editData);
      } else if (type === 'client') {
        await base44.entities.ClientProfile.update(id, editData);
      } else if (type === 'company') {
        await base44.entities.CompanyAccount.update(id, editData);
      }
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ['adminCleaners','adminClients','adminCompanies'] });
      toast.success('Atualizado');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar');
    }
  };

  const combined = [
    ...cleaners.map(c => ({ ...c, __type: 'cleaner' })),
    ...clients.map(c => ({ ...c, __type: 'client' })),
    ...companies.map(c => ({ ...c, __type: 'company' }))
  ];

  const filtered = combined.filter(it => {
    if (filterType !== 'all' && it.__type !== filterType) return false;
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (it.full_name || it.company_name || '').toLowerCase().includes(s) || (it.user_email || '').toLowerCase().includes(s);
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gerenciar Usuários</h1>
        <p className="text-slate-600 dark:text-slate-400">Liste, edite e remova clientes, faxineiras e empresas</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select onValueChange={(v)=>setFilterType(v)} defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="client">Clientes</SelectItem>
                <SelectItem value="cleaner">Faxineiras</SelectItem>
                <SelectItem value="company">Empresas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="border-0 shadow-lg"><CardContent className="p-12 text-center text-slate-600">Nenhum usuário encontrado</CardContent></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((u, idx) => (
            <motion.div key={u.id || idx} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.03 }}>
              <Card className={`border-0 shadow-lg ${u.__type === 'cleaner' && !u.verified ? 'border-l-4 border-l-amber-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {u.__type === 'company' ? u.company_name : u.full_name}
                      </h3>
                      <div className="text-sm text-slate-500 mt-1">{u.user_email}</div>
                      <div className="text-sm text-slate-500 mt-1">{u.__type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(u); setEditData({ full_name: u.full_name, phone: u.phone, company_name: u.company_name, contact_phone: u.contact_phone }); }}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={async () => {
                        if (!confirm('Tem certeza que deseja remover/arquivar este usuário?')) return;
                        try { await deleteMutation.mutateAsync({ entity: u.__type === 'cleaner' ? base44.entities.CleanerProfile : u.__type === 'client' ? base44.entities.ClientProfile : base44.entities.CompanyAccount, id: u.id, type: u.__type, email: u.user_email }); } catch(e){ toast.error('Erro ao remover'); }
                      }}>
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={async () => {
                        const invite = invites.find(i => i.email === u.user_email);
                        if (invite) {
                          try {
                            await resendMutation.mutateAsync({ email: invite.email, link: `${window.location.origin}/activate?token=${invite.token}` });
                            if (invite.id && base44.entities.Invite && base44.entities.Invite.update) {
                              await base44.entities.Invite.update(invite.id, { sent: true });
                            }
                          } catch (err) { toast.error('Erro ao reenviar'); }
                        } else {
                          toast.error('Nenhum convite encontrado para este e-mail');
                        }
                      }}>
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {editing && editing.id === u.id && (
                    <div className="mt-4 space-y-2">
                      {u.__type !== 'company' && (
                        <div>
                          <Label>Nome</Label>
                          <Input value={editData.full_name || ''} onChange={(e)=>setEditData({...editData, full_name: e.target.value})} />
                        </div>
                      )}
                      <div>
                        <Label>Telefone</Label>
                        <Input value={editData.phone || ''} onChange={(e)=>setEditData({...editData, phone: e.target.value})} />
                      </div>
                      {u.__type === 'company' && (
                        <div>
                          <Label>Nome da Empresa</Label>
                          <Input value={editData.company_name || ''} onChange={(e)=>setEditData({...editData, company_name: e.target.value})} />
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <Button onClick={()=>saveEdit(u.__type, u.id)}>Salvar</Button>
                        <Button variant="outline" onClick={()=>setEditing(null)}>Cancelar</Button>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
