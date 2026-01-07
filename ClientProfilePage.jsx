import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Phone, 
  MapPin, 
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ClientProfilePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    cpf: '',
    addresses: []
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
    
    const profiles = await base44.entities.ClientProfile.filter({ user_email: userData.email });
    if (profiles.length > 0) {
      setProfile(profiles[0]);
      setFormData({
        full_name: profiles[0].full_name || '',
        phone: profiles[0].phone || '',
        cpf: profiles[0].cpf || '',
        addresses: profiles[0].addresses || []
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    await base44.entities.ClientProfile.update(profile.id, formData);
    toast.success('Perfil atualizado com sucesso!');
    
    setLoading(false);
  };

  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, { label: '', address: '', complement: '', city: '' }]
    });
  };

  const updateAddress = (index, field, value) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData({ ...formData, addresses: newAddresses });
  };

  const removeAddress = (index) => {
    setFormData({
      ...formData,
      addresses: formData.addresses.filter((_, i) => i !== index)
    });
  };

  if (!profile) {
    return <div className="text-center py-12 text-slate-500">Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meu Perfil</h1>
        <p className="text-slate-600 dark:text-slate-400">Gerencie suas informações</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Endereços
              </CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addAddress}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.addresses.length === 0 ? (
                <p className="text-center py-8 text-slate-500">
                  Nenhum endereço cadastrado
                </p>
              ) : (
                formData.addresses.map((addr, index) => (
                  <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Nome (ex: Casa, Trabalho)"
                        value={addr.label}
                        onChange={(e) => updateAddress(index, 'label', e.target.value)}
                        className="max-w-[200px] bg-white dark:bg-slate-800"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAddress(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Endereço completo"
                      value={addr.address}
                      onChange={(e) => updateAddress(index, 'address', e.target.value)}
                      className="bg-white dark:bg-slate-800"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Complemento"
                        value={addr.complement}
                        onChange={(e) => updateAddress(index, 'complement', e.target.value)}
                        className="bg-white dark:bg-slate-800"
                      />
                      <Input
                        placeholder="Cidade"
                        value={addr.city}
                        onChange={(e) => updateAddress(index, 'city', e.target.value)}
                        className="bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                ))
              )}
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