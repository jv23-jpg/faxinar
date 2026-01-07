import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  DollarSign,
  Percent,
  Award,
  Save,
  Package,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    first_hour_price: 40,
    additional_hour_price: 20,
    products_price: 30,
    agency_fee_percentage: 40,
    reward_bonus: 50,
    reward_threshold: 10,
    pix_key: '',
    pix_key_type: 'cpf',
    bank_name: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: existingSettings } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: async () => {
      const list = await base44.entities.PaymentSettings.list();
      return list[0] || null;
    },
    enabled: !!user
  });

  useEffect(() => {
    if (existingSettings) {
      setSettings({
        first_hour_price: existingSettings.first_hour_price || 40,
        additional_hour_price: existingSettings.additional_hour_price || 20,
        products_price: existingSettings.products_price || 30,
        agency_fee_percentage: existingSettings.agency_fee_percentage || 40,
        reward_bonus: existingSettings.reward_bonus || 50,
        reward_threshold: existingSettings.reward_threshold || 10,
        pix_key: existingSettings.pix_key || '',
        pix_key_type: existingSettings.pix_key_type || 'cpf',
        bank_name: existingSettings.bank_name || ''
      });
    }
  }, [existingSettings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const dataToSave = { ...settings, reward_bonus: 100 };
      if (existingSettings) {
        await base44.entities.PaymentSettings.update(existingSettings.id, dataToSave);
      } else {
        await base44.entities.PaymentSettings.create(dataToSave);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
      toast.success('Configurações salvas com sucesso!');
    }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configurações</h1>
        <p className="text-slate-600 dark:text-slate-400">Configure preços e pagamentos</p>
      </div>

      {/* Pricing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Preços
            </CardTitle>
            <CardDescription>
              Configure os valores base dos serviços
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_hour" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Primeira Hora
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                  <Input
                    id="first_hour"
                    type="number"
                    value={settings.first_hour_price}
                    onChange={(e) => setSettings({ ...settings, first_hour_price: parseFloat(e.target.value) })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_hour" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hora Adicional
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                  <Input
                    id="additional_hour"
                    type="number"
                    value={settings.additional_hour_price}
                    onChange={(e) => setSettings({ ...settings, additional_hour_price: parseFloat(e.target.value) })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="products" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Produtos de Limpeza
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                  <Input
                    id="products"
                    type="number"
                    value={settings.products_price}
                    onChange={(e) => setSettings({ ...settings, products_price: parseFloat(e.target.value) })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agency_fee" className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Taxa da Agência
                </Label>
                <div className="relative">
                  <Input
                    id="agency_fee"
                    type="number"
                    value={settings.agency_fee_percentage}
                    onChange={(e) => setSettings({ ...settings, agency_fee_percentage: parseFloat(e.target.value) })}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="w-5 h-5 text-purple-600" />
              Sistema de Recompensas
            </CardTitle>
            <CardDescription>
              Configure os bônus para faxineiras
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="reward_bonus">Valor do Bônus (Fixo)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                  <Input
                    id="reward_bonus"
                    type="number"
                    value={100}
                    disabled
                    className="pl-10 bg-slate-100 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward_threshold">Avaliações 5★ Necessárias</Label>
                <Input
                  id="reward_threshold"
                  type="number"
                  value={settings.reward_threshold}
                  onChange={(e) => setSettings({ ...settings, reward_threshold: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                💡 Faxineiras que receberem {settings.reward_threshold} avaliações 5 estrelas seguidas 
                ganharão um bônus fixo de R$ 100,00.
              </p>
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
              <Settings className="w-5 h-5 text-slate-600" />
              Dados de Pagamento da Agência
            </CardTitle>
            <CardDescription>
              Configure os dados para receber pagamentos dos clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 <strong>Importante:</strong> O cliente paga o valor total (serviço + taxa da agência). 
                A agência recebe tudo e depois repassa o valor do serviço para a faxineira.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pix_key">Sua Chave PIX (Agência)</Label>
              <Input
                id="pix_key"
                value={settings.pix_key}
                onChange={(e) => setSettings({ ...settings, pix_key: e.target.value })}
                placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
              />
              <p className="text-xs text-slate-500">
                Onde o cliente fará o pagamento completo do serviço
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_name">Banco</Label>
              <Input
                id="bank_name"
                value={settings.bank_name}
                onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                placeholder="Nome do banco"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Button 
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
      >
        <Save className="w-4 h-4 mr-2" />
        {saveMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
      </Button>
    </div>
  );
}