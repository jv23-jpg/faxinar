import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { User, Phone, FileText, PlusCircle } from 'lucide-react';

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    userType: 'client',
    full_name: '',
    phone: '',
    cpf: '',
    address: '',
    city: '',
    photo_url: '',
    company_name: '',
    cnpj: '',
    contact_name: '',
    contact_phone: ''
  });
  const [verified, setVerified] = useState(false);
  const [sendInvite, setSendInvite] = useState(true);
  const [inviteLink, setInviteLink] = useState(null);
  const [inviteId, setInviteId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setCurrentUser(me);
      } catch (e) {
        setCurrentUser(null);
      }
    })();
  }, []);

  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">Você precisa estar logado como administrador para acessar esta página.</p>
            <div className="mt-6">
              <Button onClick={() => base44.auth.redirectToLogin(window.location.href)}>Entrar como Admin</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <p className="text-slate-600">Acesso negado. Apenas administradores podem criar usuários deste painel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const checkExisting = async (email, type) => {
    if (type === 'cleaner') {
      const r = await base44.entities.CleanerProfile.filter({ user_email: email });
      return r.length > 0;
    }
    if (type === 'company') {
      const r = await base44.entities.CompanyAccount?.filter ? await base44.entities.CompanyAccount.filter({ user_email: email }) : [];
      return r.length > 0;
    }
    const r = await base44.entities.ClientProfile.filter({ user_email: email });
    return r.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      return window.alert('Informe um e-mail para o usuário.');
    }

    setLoading(true);
    try {
      const exists = await checkExisting(formData.email, formData.userType);
      if (exists) {
        setLoading(false);
        return window.alert('Já existe um perfil deste tipo com este e-mail.');
      }

      // create profile depending on type
      if (formData.userType === 'cleaner') {
        await base44.entities.CleanerProfile.create({
          user_email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          cpf: formData.cpf,
          address: formData.address,
          city: formData.city,
          photo_url: formData.photo_url,
          verified: !!verified,
          available: false
        });
        window.alert('Faxineira criada com sucesso.');
        navigate(createPageUrl('AdminCleaners'));
      } else if (formData.userType === 'company') {
        await base44.entities.CompanyAccount.create({
          user_email: formData.email,
          company_name: formData.company_name,
          cnpj: formData.cnpj,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
          photo_url: formData.photo_url,
          verified: !!verified
        });
        window.alert('Empresa criada com sucesso.');
        navigate(createPageUrl('AdminDashboard'));
      } else {
        await base44.entities.ClientProfile.create({
          user_email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          photo_url: formData.photo_url
        });
        window.alert('Cliente criado com sucesso.');
        navigate(createPageUrl('AdminDashboard'));
      }

      // Generate invite token and store an Invite entity so admin can resend/copy link
      const token = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Math.random().toString(36).slice(2, 10) + Date.now().toString(36));
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      try {
        if (base44.entities.Invite && base44.entities.Invite.create) {
          const created = await base44.entities.Invite.create({
            email: formData.email,
            token,
            userType: formData.userType,
            created_by: currentUser.email,
            created_date: new Date().toISOString(),
            expires_at: expiresAt,
            sent: !!sendInvite,
            used: false
          });
          if (created && created.id) setInviteId(created.id);
        } else {
          console.info('Entidade Invite não disponível no backend; registrando localmente apenas.');
        }
      } catch (err) {
        console.warn('Erro ao criar entidade Invite:', err);
      }

      // Audit: record that admin created a user and generated an invite
      try {
        const { auditLog } = await import('./utils/audit');
        await auditLog({ actor: currentUser?.email || 'admin', action: 'create_user', entity: formData.userType, entity_id: formData.email, details: { invite_token: token } });
      } catch (err) { console.warn('Audit failed:', err); }

      const inviteLink = `${window.location.origin}/activate?token=${token}`;
      // if configured, attempt to send via base44.api.sendInvite (prefer) or our local /api/send-invite
      if (sendInvite) {
        try {
          if (base44.api && base44.api.sendInvite) {
            await base44.api.sendInvite({ email: formData.email, type: formData.userType, link: inviteLink, from: currentUser.email });
            window.alert('Convite enviado por e-mail com sucesso.');
          } else {
            // fallback: call our server endpoint
            const { sendInvite } = await import('./utils/sendInvite');
            try {
              await sendInvite({ email: formData.email, type: formData.userType, link: inviteLink, from: currentUser.email });
              window.alert('Convite enviado por e-mail (via servidor local) com sucesso.');
            } catch (err) {
              console.warn('Erro ao enviar via servidor local:', err);
              window.alert('Convite criado. Copie o link de ativação exibido na tela.');
            }
          }
        } catch (err) {
          console.warn('Erro ao enviar convite:', err);
          window.alert('Erro ao enviar convite automaticamente. O link foi gerado para copiar/manualmente enviar.');
        }
      } else {
        window.alert('Usuário criado. Convite não enviado automaticamente.');
      }

      // expose link in UI for admin convenience (state)
      setTimeout(() => {
        // slight delay to ensure UI navigation doesn't swallow message; set a state property
        setInviteLink(inviteLink);
      }, 200);

    } catch (err) {
      console.error(err);
      window.alert('Erro ao criar usuário. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      window.alert('Link copiado para a área de transferência');
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      window.alert(inviteLink);
    }
  };

  const handleResendInvite = async () => {
    if (!inviteLink) return;
    setLoading(true);
    try {
      if (base44.api && base44.api.sendInvite) {
        await base44.api.sendInvite({ email: formData.email, type: formData.userType, link: inviteLink, from: currentUser.email });
        if (inviteId && base44.entities.Invite && base44.entities.Invite.update) {
          await base44.entities.Invite.update(inviteId, { sent: true });
        }
        window.alert('Convite reenviado com sucesso.');
      } else {
        window.alert('Envio automático não disponível no backend. Copie o link para enviar manualmente.');
      }
    } catch (err) {
      console.error(err);
      window.alert('Erro ao reenviar o convite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <CardTitle className="flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Criar Usuário (Admin)</CardTitle>
          <CardDescription className="text-emerald-100">Crie perfis por e-mail para clientes, faxineiras ou empresas</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="email">E-mail do usuário *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input id="email" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} className="pl-10" placeholder="user@exemplo.com" required />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Tipo de usuário</Label>
              <RadioGroup value={formData.userType} onValueChange={(val)=>setFormData({...formData, userType: val})} className="grid grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem value="client" id="client" className="peer sr-only" />
                  <Label htmlFor="client" className="flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-emerald-500">Cliente</Label>
                </div>
                <div>
                  <RadioGroupItem value="cleaner" id="cleaner" className="peer sr-only" />
                  <Label htmlFor="cleaner" className="flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-emerald-500">Faxineira</Label>
                </div>
                <div>
                  <RadioGroupItem value="company" id="company" className="peer sr-only" />
                  <Label htmlFor="company" className="flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-emerald-500">Empresa</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome</Label>
                <Input id="full_name" value={formData.full_name} onChange={(e)=>setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input id="phone" value={formData.phone} onChange={(e)=>setFormData({...formData, phone: e.target.value})} className="pl-10" />
                </div>
              </div>
            </div>

            {formData.userType === 'company' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa</Label>
                  <Input id="company_name" value={formData.company_name} onChange={(e)=>setFormData({...formData, company_name: e.target.value})} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" value={formData.cnpj} onChange={(e)=>setFormData({...formData, cnpj: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Telefone de contato</Label>
                    <Input id="contact_phone" value={formData.contact_phone} onChange={(e)=>setFormData({...formData, contact_phone: e.target.value})} />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">Marcar como verificado</Label>
              <Switch checked={verified} onCheckedChange={setVerified} />
            </div>

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">Enviar convite por e-mail</Label>
              <Switch checked={sendInvite} onCheckedChange={setSendInvite} />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600" disabled={loading}>{loading ? 'Criando...' : 'Criar Usuário'}</Button>
              <Button variant="outline" onClick={() => navigate(createPageUrl('AdminDashboard'))}>Cancelar</Button>
            </div>

            {inviteLink && (
              <div className="mt-4 p-4 border rounded bg-slate-50">
                <Label>E-mail de convite: <span className="font-medium">{formData.email}</span></Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input readOnly value={inviteLink} className="flex-1" />
                  <Button onClick={handleCopyInvite}>Copiar</Button>
                  <Button onClick={handleResendInvite} disabled={loading}>Reenviar</Button>
                </div>
                <p className="text-sm text-slate-500 mt-2">Link expira em 7 dias.</p>
              </div>
            )}

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
