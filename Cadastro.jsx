import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Sparkles, 
  Phone,
  MapPin,
  FileText,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Home as HomeIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cadastro() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState('client');
  const [loading, setLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    cpf: '',
    address: '',
    city: '',
    bio: '',
    pix_key: '',
    photo_url: '',
    roupas_claras: true,
    bank_name: '',
    agency: '',
    account_number: '',
    account_type: '',
    // company fields
    company_name: '',
    cnpj: '',
    cep: '',
    contact_name: '',
    contact_phone: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData(prev => ({ ...prev, full_name: userData.full_name || '' }));
      
      // Check if user already has a profile (cleaner, company, client)
      const cleanerProfiles = await base44.entities.CleanerProfile.filter({ user_email: userData.email });
      if (cleanerProfiles.length > 0) {
        setExistingProfile({ type: 'cleaner', data: cleanerProfiles[0] });
        return;
      }

      const companyProfiles = await base44.entities.CompanyAccount?.filter ? await base44.entities.CompanyAccount.filter({ user_email: userData.email }) : [];
      if (companyProfiles.length > 0) {
        setExistingProfile({ type: 'company', data: companyProfiles[0] });
        return;
      }
      
      const clientProfiles = await base44.entities.ClientProfile.filter({ user_email: userData.email });
      if (clientProfiles.length > 0) {
        setExistingProfile({ type: 'client', data: clientProfiles[0] });
      }
    } catch (e) {
      // Not logged in - will show login prompt
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setLoading(true);

    if (userType === 'cleaner') {
      await base44.entities.CleanerProfile.create({
        user_email: user.email,
        full_name: formData.full_name,
        phone: formData.phone,
        cpf: formData.cpf,
        address: formData.address,
        city: formData.city,
        bio: formData.bio,
        photo_url: formData.photo_url,
        pix_key: formData.pix_key,
        bank_info: {
          bank_name: formData.bank_name,
          agency: formData.agency,
          account_number: formData.account_number,
          account_type: formData.account_type,
          pix_key: formData.pix_key
        },
        roupas_claras: formData.roupas_claras,
        available: true,
        verified: false,
        total_cleanings: 0,
        average_rating: 0,
        consecutive_five_stars: 0,
        rewards_earned: 0,
        total_earnings: 0
      });
      navigate(createPageUrl('CleanerDashboard'));
    } else if (userType === 'company') {
      await base44.entities.CompanyAccount.create({
        user_email: user.email,
        company_name: formData.company_name,
        cnpj: formData.cnpj,
        contact_name: formData.contact_name,
        contact_phone: formData.contact_phone,
        photo_url: formData.photo_url,
        addresses: formData.address ? [{
          label: 'Sede',
          address: formData.address,
          city: formData.city,
          cep: formData.cep
        }] : [],
        bank_info: {
          bank_name: formData.bank_name,
          agency: formData.agency,
          account_number: formData.account_number,
          account_type: formData.account_type,
          pix_key: formData.pix_key
        },
        verified: false,
        bank_verified: false,
        active: true,
        created_at: new Date().toISOString(),
        total_transactions: 0,
        total_earned: 0,
        commission_percentage: 40
      });
      navigate(createPageUrl('CompanyDashboard'));
    } else {
      await base44.entities.ClientProfile.create({
        user_email: user.email,
        full_name: formData.full_name,
        phone: formData.phone,
        cpf: formData.cpf,
        photo_url: formData.photo_url,
        addresses: formData.address ? [{
          label: 'Casa',
          address: formData.address,
          city: formData.city,
          cep: formData.cep
        }] : [],
        total_bookings: 0,
        favorite_cleaners: []
      });
      navigate(createPageUrl('ClientDashboard'));
    }

    setLoading(false);
  };

  if (existingProfile) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Você já está cadastrado!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Seu perfil de {existingProfile.type === 'cleaner' ? 'faxineira' : existingProfile.type === 'company' ? 'empresa' : 'cliente'} já existe.
            </p>
            <Button 
              onClick={() => navigate(createPageUrl(
                existingProfile.type === 'cleaner' ? 'CleanerDashboard' : 
                existingProfile.type === 'company' ? 'CompanyDashboard' : 
                'ClientDashboard'
              ))}
              className="bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-slate-900 dark:text-white mb-4"
        >
          Crie sua Conta
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-600 dark:text-slate-400"
        >
          {user ? 'Complete seu cadastro para começar' : 'Faça login para continuar'}
        </motion.p>
      </div>

      {!user ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Faça login para continuar
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                É rápido, fácil e seguro
              </p>
              <Button 
                onClick={() => base44.auth.redirectToLogin(window.location.href)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Entrar / Criar Conta
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Complete seu Perfil
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Logado como {user.email}
              </CardDescription>
            </CardHeader>
            {user?.role === 'admin' && (
              <div className="p-4">
                <Card className="border-0">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Você é administrador</p>
                      <p className="text-sm text-slate-500">Use o painel administrativo para criar usuários por e-mail (ex.: cleidycleaner@gmail.com).</p>
                    </div>
                    <div>
                      <Button onClick={() => navigate(createPageUrl('AdminCreateUser'))} className="bg-emerald-500 text-white">Criar Usuário</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User type selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Eu sou:</Label>
                  <RadioGroup
                    value={userType}
                    onValueChange={setUserType}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="client" id="client" className="peer sr-only" />
                      <Label
                        htmlFor="client"
                        className="flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-950/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <HomeIcon className="w-8 h-8 text-emerald-600 mb-2" />
                        <span className="font-medium">Contratante</span>
                        <span className="text-xs text-slate-500">Quero contratar</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="cleaner" id="cleaner" className="peer sr-only" />
                      <Label
                        htmlFor="cleaner"
                        className="flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-950/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Briefcase className="w-8 h-8 text-teal-600 mb-2" />
                        <span className="font-medium">Faxineira</span>
                        <span className="text-xs text-slate-500">Quero trabalhar</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="company" id="company" className="peer sr-only" />
                      <Label
                        htmlFor="company"
                        className="flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-950/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <FileText className="w-8 h-8 text-amber-600 mb-2" />
                        <span className="font-medium">Empresa</span>
                        <span className="text-xs text-slate-500">Quero cadastrar a empresa</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10"
                        placeholder="(00) 00000-0000"
                        required
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
                        placeholder="000.000.000-00"
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
                  <Label htmlFor="photo_url">Foto (URL)</Label>
                  <Input
                    id="photo_url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://example.com/minha-foto.jpg"
                  />
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

                {userType === 'cleaner' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Sobre você</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Conte um pouco sobre sua experiência..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pix_key">Chave PIX (para recebimentos)</Label>
                      <Input
                        id="pix_key"
                        value={formData.pix_key}
                        onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank_name">Banco</Label>
                        <Input
                          id="bank_name"
                          value={formData.bank_name}
                          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="agency">Agência</Label>
                        <Input
                          id="agency"
                          value={formData.agency}
                          onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="account_number">Número da conta</Label>
                        <Input
                          id="account_number"
                          value={formData.account_number}
                          onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account_type">Tipo de conta</Label>
                        <Input
                          id="account_type"
                          value={formData.account_type}
                          onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">Roupas claras</Label>
                      <Switch
                        checked={formData.roupas_claras}
                        onCheckedChange={(val) => setFormData({ ...formData, roupas_claras: val })}
                      />
                    </div>

                  </>
                )}


                {userType === 'company' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nome da Empresa *</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          value={formData.cnpj}
                          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                          id="cep"
                          value={formData.cep}
                          onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact_name">Pessoa de contato</Label>
                        <Input
                          id="contact_name"
                          value={formData.contact_name}
                          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_phone">Telefone de contato</Label>
                        <Input
                          id="contact_phone"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="photo_url">Logo / Foto (URL)</Label>
                      <Input
                        id="photo_url"
                        value={formData.photo_url}
                        onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                        placeholder="https://example.com/logo.jpg"
                      />
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Dados Bancários</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank_name">Banco</Label>
                          <Input
                            id="bank_name"
                            value={formData.bank_name}
                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                            placeholder="Ex: Itau, Bradesco..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agency">Agência</Label>
                          <Input
                            id="agency"
                            value={formData.agency}
                            onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                            placeholder="0001"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="account_number">Número da conta</Label>
                          <Input
                            id="account_number"
                            value={formData.account_number}
                            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                            placeholder="12345-6"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="account_type">Tipo de conta</Label>
                          <Input
                            id="account_type"
                            value={formData.account_type}
                            onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                            placeholder="Corrente / Poupança"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label htmlFor="pix_key_company">Chave PIX</Label>
                        <Input
                          id="pix_key_company"
                          value={formData.pix_key}
                          onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                          placeholder="CPF, email, telefone ou chave aleatória"
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Criar Conta'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}