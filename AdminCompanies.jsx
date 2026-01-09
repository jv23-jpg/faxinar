import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Edit2,
  Eye,
  MoreVertical,
  Bank,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminCompanies() {
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkAuth();
    loadCompanies();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const allCompanies = await base44.entities.CompanyAccount?.filter ? 
        await base44.entities.CompanyAccount.filter({}) : [];
      setCompanies(allCompanies);
    } catch (e) {
      console.error('Erro ao carregar empresas:', e);
    }
    setLoading(false);
  };

  const filteredCompanies = searchEmail 
    ? companies.filter(c => c.user_email.toLowerCase().includes(searchEmail.toLowerCase()))
    : companies;

  const handleVerify = async (companyId, verified) => {
    try {
      await base44.entities.CompanyAccount.update(companyId, { verified });
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, verified } : c
      ));
    } catch (e) {
      console.error('Erro ao validar empresa:', e);
    }
  };

  const handleBankVerify = async (companyId, bankVerified) => {
    try {
      await base44.entities.CompanyAccount.update(companyId, { bank_verified: bankVerified });
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, bank_verified: bankVerified } : c
      ));
    } catch (e) {
      console.error('Erro ao validar conta bancária:', e);
    }
  };

  const handleUpdateCommission = async (companyId, percentage) => {
    try {
      await base44.entities.CompanyAccount.update(companyId, { 
        commission_percentage: parseFloat(percentage) 
      });
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, commission_percentage: parseFloat(percentage) } : c
      ));
      setEditingCompany(null);
    } catch (e) {
      console.error('Erro ao atualizar comissão:', e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Gerenciamento de Empresas
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Valide contas bancárias, verifique dados e gerencie permissões
        </p>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm">Buscar por Email</Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="ex: cleidycleaner@gmail.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline"
                onClick={loadCompanies}
              >
                Recarregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies List */}
      <div className="grid gap-4">
        {filteredCompanies.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Nenhuma empresa encontrada
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCompanies.map((company, idx) => (
            <motion.div
              key={company.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
            >
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Básico */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {company.company_name}
                        </h3>
                        <p className="text-sm text-slate-500">CNPJ: {company.cnpj || '—'}</p>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">{company.user_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">{company.contact_phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {company.addresses?.[0]?.city || '—'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 mb-2">Status</p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-3 h-3 rounded-full ${company.verified ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-sm font-medium">
                            {company.verified ? 'Verificada' : 'Pendente de verificação'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant={company.verified ? 'outline' : 'default'}
                          onClick={() => handleVerify(company.id, !company.verified)}
                          className="w-full"
                        >
                          {company.verified ? 'Remover verificação' : 'Verificar'}
                        </Button>
                      </div>
                    </div>

                    {/* Right: Dados Bancários + Comissão */}
                    <div className="space-y-4">
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Bank className="w-4 h-4 text-amber-600" />
                          <Label className="font-semibold text-amber-900 dark:text-amber-100">
                            Dados Bancários
                          </Label>
                        </div>

                        {company.bank_info ? (
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-xs text-amber-700 dark:text-amber-300">Banco</p>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {company.bank_info.bank_name || '—'}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-amber-700 dark:text-amber-300">Agência</p>
                                <p className="font-medium">{company.bank_info.agency || '—'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-amber-700 dark:text-amber-300">Conta</p>
                                <p className="font-medium">{company.bank_info.account_number || '—'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-amber-700 dark:text-amber-300">PIX</p>
                              <p className="font-medium">{company.bank_info.pix_key || '—'}</p>
                            </div>

                            <div className="pt-3 border-t border-amber-200 dark:border-amber-800">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${company.bank_verified ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
                                <span className="text-xs font-medium">
                                  {company.bank_verified ? 'Conta validada' : 'Pendente validação'}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant={company.bank_verified ? 'outline' : 'default'}
                                onClick={() => handleBankVerify(company.id, !company.bank_verified)}
                                className="w-full"
                              >
                                {company.bank_verified ? 'Cancelar validação' : 'Validar conta'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            Sem dados bancários cadastrados
                          </p>
                        )}
                      </div>

                      {/* Comissão */}
                      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                        <Label className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                          Comissão da Agência
                        </Label>
                        <div className="mt-3 flex items-center gap-2">
                          <Input
                            type="number"
                            value={editingCompany?.id === company.id ? editingCompany.commission : company.commission_percentage || 40}
                            onChange={(e) => setEditingCompany({ id: company.id, commission: e.target.value })}
                            min="0"
                            max="100"
                            step="1"
                            className="w-20"
                          />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">%</span>
                          {editingCompany?.id === company.id && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateCommission(company.id, editingCompany.commission)}
                              className="ml-auto"
                            >
                              Salvar
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                          Taxa cobrada em cada serviço
                        </p>
                      </div>

                      {/* Info */}
                      <div className="text-xs text-slate-500">
                        <p>Criada: {company.created_at ? new Date(company.created_at).toLocaleDateString('pt-BR') : '—'}</p>
                        <p>Transações: {company.total_transactions || 0}</p>
                        <p>Ganho total: R$ {(company.total_earned || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <div className="text-center text-sm text-slate-500">
        Total: {filteredCompanies.length} empresa(s)
      </div>
    </div>
  );
}
