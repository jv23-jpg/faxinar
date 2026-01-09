import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Phone, 
  MapPin, 
  Save,
  CreditCard,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CleanerProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    cpf: '',
    address: '',
    city: '',
    bio: '',
    pix_key: '',
    bank_info: '',
    available: true
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    
    const profiles = await base44.entities.CleanerProfile.filter({ user_email: userData.email });
    if (profiles.length > 0) {
      const p = profiles[0];
      setProfile(p);
      setFormData({
        full_name: p.full_name || '',
        phone: p.phone || '',
        cpf: p.cpf || '',
        address: p.address || '',
        city: p.city || '',
        bio: p.bio || '',
        pix_key: p.pix_key || '',
        bank_info: p.bank_info || '',
        available: p.available ?? true
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await base44.entities.CleanerProfile.update(profile.id, formData);
    toast.success('Perfil atualizado com sucesso!');
    
    setLoading(false);
  };

  const handleUploadDocument = async (file) => {
    setLoading(true);
    try {
      let url = null;
      if (file && base44.api && base44.api.uploadFile) {
        const res = await base44.api.uploadFile(file);
        url = res?.url || null;
      }
      if (!url && typeof file === 'string') {
        url = file; // assume it's a url
      }
      if (!url) {
        return toast.error('Upload não disponível. Use URL.');
      }

      const documents = profile.documents ? [...profile.documents] : [];
      documents.push({ url, uploaded_date: new Date().toISOString() });
      await base44.entities.CleanerProfile.update(profile.id, { documents });
      await loadProfile();
      toast.success('Documento adicionado');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar documento');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDocument = async (idx) => {
    if (!confirm('Remover este documento?')) return;
    setLoading(true);
    try {
      const documents = profile.documents ? profile.documents.filter((_, i) => i !== idx) : [];
      await base44.entities.CleanerProfile.update(profile.id, { documents });
      await loadProfile();
      toast.success('Documento removido');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover documento');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div className="text-center py-12 text-slate-500">Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Onboarding banner */}
      {!profile.onboarding?.completed && (
        <div className="p-4 rounded bg-amber-50 border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Você está em fase de treinamento!</h3>
              <p className="text-sm text-slate-600">Complete o onboarding para ativar sua conta e começar a receber limpezas.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate(createPageUrl('CleanerOnboarding'))}>Ir para Onboarding</Button>
            </div>
          </div>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
        <p className="text-slate-600 dark:text-slate-400">Gerencie suas informações profissionais</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    formData.available 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    <CheckCircle2 className={`w-6 h-6 ${
                      formData.available 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Disponível para Trabalho
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formData.available 
                        ? 'Você aparecerá para novos clientes' 
                        : 'Você não receberá novos pedidos'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-emerald-600" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Sobre Você</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Conte sobre sua experiência e especialidades..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Enviar documento (URL ou arquivo)</Label>
                <div className="flex gap-2">
                  <input type="file" className="hidden" id="doc-upload-input" onChange={(e)=>{
                    const f = e.target.files && e.target.files[0]; if (f) handleUploadDocument(f);
                  }} />
                  <label htmlFor="doc-upload-input" className="btn btn-sm bg-emerald-500 text-white px-3 py-2 rounded">Selecionar arquivo</label>
                  <Button variant="outline" onClick={()=>{
                    const url = prompt('Cole a URL do documento'); if (url) handleUploadDocument(url);
                  }}>Usar URL</Button>
                </div>
              </div>

              <div className="space-y-2">
                {(profile.documents || []).length === 0 ? (
                  <p className="text-sm text-slate-500">Nenhum documento enviado.</p>
                ) : (
                  <div className="grid gap-2">
                    {(profile.documents || []).map((d, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded bg-slate-50 dark:bg-slate-800">
                        <a href={d.url} target="_blank" rel="noreferrer" className="text-sm text-emerald-600">Abrir documento</a>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{new Date(d.uploaded_date).toLocaleString()}</span>
                          <Button size="sm" variant="ghost" onClick={()=>handleRemoveDocument(idx)}>Remover</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification status & history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
                Verificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Status: {profile.verified ? <span className="text-emerald-600">Verificada</span> : <span className="text-amber-600">Pendente</span>}</p>
                <p className="text-sm text-slate-500 mt-1">Seu perfil é revisado por um administrador. Você receberá uma notificação quando a verificação for aprovada ou rejeitada.</p>
              </div>

              <div>
                <h4 className="font-medium">Histórico</h4>
                {(profile.verification_history || []).length === 0 ? (
                  <p className="text-sm text-slate-500">Sem histórico de verificação.</p>
                ) : (
                  <div className="space-y-2 mt-2">
                    {(profile.verification_history || []).map((h, idx) => (
                      <div key={idx} className="p-3 rounded bg-slate-50 dark:bg-slate-800">
                        <div className="text-sm text-slate-700"><strong>{h.action}</strong> por {h.by} em {new Date(h.date).toLocaleString()}</div>
                        {h.note && <div className="text-sm text-slate-500 mt-1">{h.note}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Dados Bancários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input
                  id="pix_key"
                  value={formData.pix_key}
                  onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                  placeholder="CPF, email, telefone ou chave aleatória"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_info">Informações Bancárias (opcional)</Label>
                <Input
                  id="bank_info"
                  value={formData.bank_info}
                  onChange={(e) => setFormData({ ...formData, bank_info: e.target.value })}
                  placeholder="Banco, Agência, Conta"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
          disabled={loading}
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </div>
  );
}