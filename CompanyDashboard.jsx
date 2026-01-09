import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  Briefcase,
  DollarSign,
  Settings,
  LogOut,
  Mail,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const companies = await base44.entities.CompanyAccount?.filter 
        ? await base44.entities.CompanyAccount.filter({ user_email: userData.email })
        : [];

      if (companies.length > 0) {
        setCompany(companies[0]);
      } else {
        navigate(createPageUrl('Cadastro'));
      }
    } catch (e) {
      base44.auth.redirectToLogin(window.location.href);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl('Home'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  const stats = [
    {
      label: 'Transações',
      value: company.total_transactions || 0,
      icon: <CreditCard className="w-5 h-5" />,
      color: 'emerald'
    },
    {
      label: 'Ganho Total',
      value: `R$ ${(company.total_earned || 0).toFixed(2)}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'green'
    },
    {
      label: 'Status',
      value: company.verified ? 'Verificada' : 'Pendente',
      icon: <Briefcase className="w-5 h-5" />,
      color: company.verified ? 'emerald' : 'amber'
    },
    {
      label: 'Conta Bancária',
      value: company.bank_verified ? 'Validada' : 'Pendente',
      icon: <CreditCard className="w-5 h-5" />,
      color: company.bank_verified ? 'emerald' : 'amber'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {company.company_name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Painel de controle da empresa
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(createPageUrl('AdminSettings'))}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/50 flex items-center justify-center text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Dados da Empresa */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              Informações da Empresa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">CNPJ</p>
              <p className="font-medium text-slate-900 dark:text-white">{company.cnpj || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Pessoa de Contato</p>
              <p className="font-medium text-slate-900 dark:text-white">{company.contact_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <p className="text-slate-700 dark:text-slate-300">{company.contact_phone}</p>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <p className="text-slate-700 dark:text-slate-300">{company.user_email}</p>
            </div>
            {company.addresses?.[0] && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                <div>
                  <p className="text-slate-700 dark:text-slate-300">{company.addresses[0].address}</p>
                  <p className="text-sm text-slate-500">{company.addresses[0].city} - {company.addresses[0].cep}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados Bancários */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-600" />
              Informações Bancárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.bank_info ? (
              <>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Banco</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {company.bank_info.bank_name || '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Agência</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {company.bank_info.agency || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Conta</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {company.bank_info.account_number || '—'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Tipo de Conta</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {company.bank_info.account_type || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Chave PIX</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {company.bank_info.pix_key || '—'}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${company.bank_verified ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                    <span className="text-sm font-medium">
                      {company.bank_verified ? '✓ Conta validada' : '⏳ Aguardando validação do admin'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Nenhuma conta bancária cadastrada. Entre em contato com o suporte para adicionar seus dados.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
          <CardHeader>
            <CardTitle>Ações Úteis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate(createPageUrl('AdminRequests'))}
              className="justify-start"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Ver Pedidos
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(createPageUrl('AdminCleaners'))}
              className="justify-start"
            >
              <Users className="w-4 h-4 mr-2" />
              Ver Faxineiras
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(createPageUrl('AdminSupport'))}
              className="justify-start"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Suporte
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
