import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';

export default function CleanerOnboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // form state (step 1)
  const [form, setForm] = useState({
    full_name: '', phone: '', cpf: '', email: '', state: '', city: ''
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // training steps (step 5)
  const defaultTraining = [
    { id: 'align', label: 'Alinhamento com a Leidy Cleaner', done: false },
    { id: 'photo', label: 'Cadastre sua foto de perfil', done: false },
    { id: 'bio', label: 'Escreva sua apresentação', done: false },
    { id: 'verify', label: 'Verificar seu cadastro', done: false },
    { id: 'support', label: 'Chamar atendente no chat', done: false }
  ];
  const [training, setTraining] = useState(defaultTraining);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
      const profiles = await base44.entities.CleanerProfile.filter({ user_email: me.email });
      if (profiles.length > 0) {
        const p = profiles[0];
        setProfile(p);
        setForm({ 
          full_name: p.full_name || me.full_name || '', 
          phone: p.phone || '', 
          cpf: p.cpf || '', 
          email: me.email || '',
          state: p.state || '', 
          city: p.city || '' 
        });
        setStep(p.onboarding?.step || 1);
        if (p.training_steps && p.training_steps.length) setTraining(p.training_steps);
      }
    } catch (err) {
      // not logged in or other
    }
  };

  const saveStep = async (nextStep) => {
    setLoading(true);
    try {
      if (!profile) return;
      await base44.entities.CleanerProfile.update(profile.id, { ...form, onboarding: { step: nextStep, completed: false } });
      await loadProfile();
      setStep(nextStep);
    } catch (err) { console.error(err); alert('Erro ao salvar'); }
    setLoading(false);
  };

  const finishOnboarding = async () => {
    if (password !== confirmPassword) return alert('Senhas não coincidem');
    if (!acceptTerms) return alert('Aceite os termos');
    if (!profile) return;
    setLoading(true);
    try {
      await base44.entities.CleanerProfile.update(profile.id, { onboarding: { step: 5, completed: true, accepted_terms: true } });
      await base44.entities.CleanerProfile.update(profile.id, { training_steps: training });
      alert('Parabéns! Seu cadastro foi finalizado.');
      navigate(createPageUrl('CleanerDashboard'));
    } catch (err) { console.error(err); alert('Erro ao finalizar'); }
    setLoading(false);
  };

  const toggleTraining = async (id) => {
    const t = training.map(s => s.id === id ? ({ ...s, done: !s.done }) : s);
    setTraining(t);
    if (profile) {
      await base44.entities.CleanerProfile.update(profile.id, { training_steps: t });
    }
  };

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const citiesByState = {
    'RS': ['Porto Alegre', 'Canoas', 'Pelotas'],
    // add more as needed
  };

  if (!user) {
    return <div className="max-w-lg mx-auto"> <Card className="border-0 shadow-2xl"><CardContent className="p-8 text-center"> <p>Faça login para continuar o onboarding</p> <Button onClick={() => base44.auth.redirectToLogin(window.location.href)}>Entrar</Button> </CardContent></Card></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      {step <= 4 && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>
      )}
      <Card className="card">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardTitle>{step === 1 ? 'Leidy Cleaner' : step === 2 ? 'Ganhos com limpezas' : step === 3 ? 'Leidy Cleaner' : step === 4 ? 'Leidy Cleaner' : 'VOCÊ ESTÁ EM FASE DE TREINAMENTO!'}</CardTitle>
          <CardDescription className="text-green-100">
            {step === 1 && 'Crie a sua conta'}
            {step === 2 && ''}
            {step === 3 && 'Exemplo de possíveis ganhos'}
            {step === 4 && 'Finalize o seu cadastro'}
            {step === 5 && 'Vamos lá!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">

          {step === 1 && (
            <div className="space-y-4">
              <p>Comece informando alguns dados de contato:</p>
              <div><Label>Nome completo</Label><Input value={form.full_name} onChange={(e)=>setForm({...form, full_name: e.target.value})} /></div>
              <div><Label>Telefone (com DDD)</Label><Input value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} /></div>
              <div><Label>CPF</Label><Input value={form.cpf} onChange={(e)=>setForm({...form, cpf: e.target.value})} /></div>
              <div><Label>E-mail</Label><Input value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} /></div>
              <div>
                <Label>Estado</Label>
                <Select value={form.state} onValueChange={(value)=>setForm({...form, state: value, city: ''})}>
                  <SelectTrigger><SelectValue placeholder="Selecione seu estado" /></SelectTrigger>
                  <SelectContent>
                    {brazilianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cidade</Label>
                <Select value={form.city} onValueChange={(value)=>setForm({...form, city: value})}>
                  <SelectTrigger><SelectValue placeholder="Selecione sua cidade" /></SelectTrigger>
                  <SelectContent>
                    {(citiesByState[form.state] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-500">{step} de 4</div>
                <div>
                  <Button variant="outline" onClick={() => navigate('/')}>Voltar</Button>
                  <Button className="ml-2" onClick={() => saveStep(2)} disabled={loading}>Avançar</Button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p>Introdução: agenda liberada, limpezas de 1-8 horas, valores tabelados por cidade. Exemplo para Porto Alegre - Rio Grande do Sul</p>
              <div className="grid md:grid-cols-2 gap-4">
                <table className="w-full text-sm border border-green-200 rounded-lg overflow-hidden">
                  <thead className="bg-green-100">
                    <tr><th className="p-2 text-left">1 hora</th><th className="p-2 text-left">2 horas</th><th className="p-2 text-left">3 horas</th><th className="p-2 text-left">4 horas</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-2 border-t">R$ 41,00</td><td className="p-2 border-t">R$ 61,00</td><td className="p-2 border-t">R$ 81,00</td><td className="p-2 border-t">R$ 101,00</td></tr>
                  </tbody>
                </table>
                <table className="w-full text-sm border border-green-200 rounded-lg overflow-hidden">
                  <thead className="bg-green-100">
                    <tr><th className="p-2 text-left">5 horas</th><th className="p-2 text-left">6 horas</th><th className="p-2 text-left">7 horas</th><th className="p-2 text-left">8 horas</th></tr>
                  </thead>
                  <tbody>
                    <tr><td className="p-2 border-t">R$ 121,00</td><td className="p-2 border-t">R$ 141,00</td><td className="p-2 border-t">R$ 161,00</td><td className="p-2 border-t">R$ 181,00</td></tr>
                  </tbody>
                </table>
              </div>
              <p>R$ 21,00 - Valor base (inclui 2 passagens de ônibus)<br />R$ 20,00 - Valor da hora de serviço</p>
              <p>Observação: Em algumas cidades os clientes podem solicitar produtos de limpeza básicos. Nessas limpezas será incluído um adicional ao valor base.</p>

              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-500">{step} de 4</div>
                <div>
                  <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                  <Button className="ml-2" onClick={() => setStep(3)}>Avançar</Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p>A profissional Donie utiliza o app há mais de 6 meses. Ela disponibiliza sua agenda de segunda à sábados, para realizar limpezas, das 8h às 18h.</p>
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-bold">D</span>
                </div>
                <div>
                  <div className="font-semibold">Donie</div>
                  <div className="text-sm text-gray-600">87 limpezas realizadas</div>
                  <div className="flex items-center gap-1">
                    <span>4.9</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </div>
              <table className="w-full text-sm border border-green-200 rounded-lg overflow-hidden">
                <tbody>
                  <tr><td className="p-2 border-t">2 limpezas de 2 horas</td><td className="p-2 border-t">R$ 122,00</td></tr>
                  <tr><td className="p-2 border-t">4 limpezas de 3 horas</td><td className="p-2 border-t">R$ 324,00</td></tr>
                  <tr><td className="p-2 border-t">8 limpezas de 4 horas</td><td className="p-2 border-t">R$ 808,00</td></tr>
                  <tr><td className="p-2 border-t">6 limpezas de 6 horas</td><td className="p-2 border-t">R$ 846,00</td></tr>
                  <tr><td className="p-2 border-t">5 limpezas de 8 horas</td><td className="p-2 border-t">R$ 905,00</td></tr>
                </tbody>
              </table>
              <div>
                <p>Base: R$ 504,00</p>
                <p>Mão de obra (121 horas): R$ 2.140,00</p>
                <p><strong>Total (25 limpezas): R$ 3.005,00</strong></p>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-500">{step} de 4</div>
                <div>
                  <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                  <Button className="ml-2" onClick={() => setStep(4)}>Avançar</Button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p>Crie a sua senha e aceite os termos de uso:</p>
              <div><Label>Senha</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></div>
              <div><Label>Confirmar senha</Label><Input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} /></div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={acceptTerms} onChange={(e)=>setAcceptTerms(e.target.checked)} />
                <span>Ao continuar declaro que li e aceito os termos de uso e serviço.</span>
              </label>

              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-500">{step} de 4</div>
                <div>
                  <Button variant="outline" onClick={() => setStep(3)}>Voltar</Button>
                  <Button className="ml-2" onClick={finishOnboarding} disabled={loading}>Criar cadastro</Button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p>Para ativar a sua conta e começar a receber limpezas é necessário finalizar as etapas abaixo. Leia com atenção e descubra como o aplicativo funciona.</p>
              <div className="space-y-3">
                {training.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input type="checkbox" checked={t.done} onChange={()=>toggleTraining(t.id)} className="w-5 h-5 text-green-600" />
                    <span className={t.done ? 'line-through text-gray-500' : ''}>{t.label}</span>
                  </div>
                ))}
              </div>
              <Button>Começar alinhamento</Button>
              <div className="bg-yellow-100 p-4 rounded">
                <p>Dica: Se você estiver com dificuldade em usar o aplicativo ou precisar de ajuda, nos chame no suporte (🔄) ou procure a ajuda de algum familiar.</p>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
