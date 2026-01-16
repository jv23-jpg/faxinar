import React, { useState, useEffect } from 'react';
import { validateCPF, validateEmail, formatPhone, saveProgress, loadProgress, clearProgress,
  createResumeToken, generateResumeLink, sendResumeEmail, getProgressByToken, removeResumeToken } from './utils/registrationUtils';
import { STATES, CITIES } from './utils/locations';

export default function LeidySignup() {
  const [step, setStep] = useState(1);
  const [progressSaving, setProgressSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', cpf: '', email: '', state: '', city: '',
    password: '', passwordConfirm: '', terms: false,
    training: { alignment: false, photo: false, bio: false, verify: false, chat: false }
  });

  useEffect(() => {
    // If URL contains resume token, prefer it
    const params = new URLSearchParams(window.location.search);
    const resume = params.get('resume');
    if (resume) {
      const p = getProgressByToken(resume);
      if (p) {
        setForm(p.form || p);
        setStep(p.step || 1);
        // optionally remove token after use
        try { removeResumeToken(resume); params.delete('resume'); const newUrl = window.location.pathname; window.history.replaceState({}, '', newUrl); } catch(e){}
        return;
      }
    }
    const saved = loadProgress();
    if (saved) setForm(saved.form || form), setStep(saved.step || 1);
  }, []);

  useEffect(() => {
    setProgressSaving(true);
    saveProgress({ step, form });
    const t = setTimeout(()=>setProgressSaving(false), 250);
    return () => clearTimeout(t);
  }, [step, form]);

  const canAdvanceStep1 = () => {
    return form.fullName.trim() && validateEmail(form.email) && form.phone.trim() && validateCPF(form.cpf) && form.state && form.city;
  };

  const next = () => {
    if (step === 1 && !canAdvanceStep1()) return alert('Preencha todos os campos obrigatórios corretamente.');
    if (step === 4) {
      if (!form.password || form.password !== form.passwordConfirm) return alert('As senhas devem ser iguais e não podem estar vazias.');
      if (!form.terms) return alert('Aceite os termos para continuar.');
      // finalize cadastro (aqui você chamaria API)
      clearProgress();
      setStep(5);
      return;
    }
    setStep(s => Math.min(4, s + 1));
  };

  // --- Reentry helpers exposed in UI ---
  const handleCreateAndCopyLink = async () => {
    const payload = { step, form };
    const token = createResumeToken(payload, 24 * 60);
    const link = generateResumeLink(token);
    try { await navigator.clipboard.writeText(link); alert('Link copiado para a área de transferência.'); } catch(e){ prompt('Copie este link:', link); }
  };

  const handleSendEmailLink = () => {
    if (!validateEmail(form.email)) return alert('Informe um e-mail válido no formulário para enviar o link.');
    const payload = { step, form };
    const token = createResumeToken(payload, 24 * 60);
    const link = generateResumeLink(token);
    sendResumeEmail(form.email, link);
  };

  const handleSendSMS = async () => {
    const payload = { step, form };
    const token = createResumeToken(payload, 24 * 60);
    const link = generateResumeLink(token);
    const smsBody = `Retome seu cadastro Leidy Cleaner: ${link}`;
    try { await navigator.clipboard.writeText(smsBody); alert('Mensagem copiada. Cole no app de SMS para enviar.'); } catch(e){ prompt('Copie esta mensagem para enviar por SMS:', smsBody); }
  };

  const handleResumeNow = () => {
    const saved = loadProgress();
    if (!saved) return alert('Nenhum progresso salvo encontrado.');
    setForm(saved.form || saved);
    setStep(saved.step || 1);
  };

  const handleClearProgress = () => {
    if (!confirm('Deseja recomeçar o cadastro? O progresso salvo será apagado.')) return;
    clearProgress();
    setForm({ fullName: '', phone: '', cpf: '', email: '', state: '', city: '', password: '', passwordConfirm: '', terms: false, training: { alignment: false, photo: false, bio: false, verify: false, chat: false } });
    setStep(1);
  };

  const back = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white shadow rounded p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Leidy Cleaner</h1>
            <p className="text-sm text-slate-500">{step <=4 ? ['1 de 4','2 de 4','3 de 4','4 de 4'][step-1] : 'Fase de Treinamento'}</p>
          </div>
          <div className="text-sm text-slate-400">{progressSaving ? 'Salvando...' : 'Progresso salvo'}</div>
        </div>

        {step === 1 && (
          <div>
            {/* If there is a saved progress, show re-entry facilitation options */}
            {loadProgress() && (
              <div className="mb-4 p-3 bg-yellow-50 border rounded flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
                <div className="text-sm text-slate-700">Encontramos um cadastro em andamento. Deseja retomar ou enviar um link para continuar depois?</div>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button className="btn btn-secondary" onClick={handleResumeNow}>Retomar agora</button>
                  <button className="btn" onClick={handleCreateAndCopyLink}>Copiar link</button>
                  <button className="btn" onClick={handleSendEmailLink}>Enviar por e-mail</button>
                  <button className="btn" onClick={handleSendSMS}>Enviar por SMS</button>
                  <button className="btn btn-ghost" onClick={handleClearProgress}>Recomeçar</button>
                </div>
              </div>
            )}
            <p className="mb-4 text-slate-600">Comece informando alguns dados de contato:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Nome completo *</label>
                <input value={form.fullName} onChange={e=>setForm({...form, fullName: e.target.value})} className="mt-1 input" />
              </div>
              <div>
                <label className="block text-sm font-medium">Telefone *</label>
                <input value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} placeholder="(00) 00000-0000" className="mt-1 input" />
              </div>
              <div>
                <label className="block text-sm font-medium">CPF *</label>
                <input value={form.cpf} onChange={e=>setForm({...form, cpf: e.target.value})} placeholder="000.000.000-00" className="mt-1 input" />
              </div>
              <div>
                <label className="block text-sm font-medium">E-mail *</label>
                <input value={form.email} onChange={e=>setForm({...form, email: e.target.value})} placeholder="nome@exemplo.com" className="mt-1 input" />
              </div>
              <div>
                <label className="block text-sm font-medium">Estado *</label>
                <select value={form.state} onChange={e=>{ setForm({...form, state:e.target.value, city: ''}); }} className="mt-1 input">
                  <option value="">Selecione seu estado</option>
                  {STATES.map(s=> <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Cidade *</label>
                <select value={form.city} onChange={e=>setForm({...form, city:e.target.value})} className="mt-1 input">
                  <option value="">Selecione sua cidade</option>
                  {(CITIES[form.state]||[]).map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Ganhos com limpezas</h2>
            <p className="text-sm text-slate-600 mb-4">Agenda liberada; limpezas de 1 a 8 horas. Valores tabelados por cidade. Exemplo: Porto Alegre - Rio Grande do Sul.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 border rounded">
                <table className="w-full text-sm">
                  <thead><tr><th>1 hora</th><th>2 horas</th><th>3 horas</th><th>4 horas</th></tr></thead>
                  <tbody><tr><td>R$ 41,00</td><td>R$ 61,00</td><td>R$ 81,00</td><td>R$ 101,00</td></tr></tbody>
                </table>
              </div>
              <div className="p-4 border rounded">
                <table className="w-full text-sm">
                  <thead><tr><th>5 horas</th><th>6 horas</th><th>7 horas</th><th>8 horas</th></tr></thead>
                  <tbody><tr><td>R$ 121,00</td><td>R$ 141,00</td><td>R$ 161,00</td><td>R$ 181,00</td></tr></tbody>
                </table>
              </div>
            </div>
            <div className="text-sm text-slate-600">
              <p><strong>Explicação do cálculo:</strong></p>
              <ul className="list-disc ml-5">
                <li>R$ 21,00 - Valor base (inclui 2 passagens de ônibus)</li>
                <li>R$ 20,00 - Valor da hora de serviço</li>
              </ul>
              <p className="mt-2">Observação: produtos de limpeza podem gerar adicional por cidade.</p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Exemplo de possíveis ganhos</h2>
            <p className="text-sm text-slate-600 mb-3">A profissional <strong>Donie</strong> utiliza o app há mais de 6 meses. Agenda segunda a sábado, 8h às 18h.</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">D</div>
              <div>
                <div className="font-semibold">Donie</div>
                <div className="text-sm text-slate-500">87 limpezas realizadas • ⭐ 4.9</div>
              </div>
            </div>
            <div className="overflow-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="text-left"><th>Descrição</th><th>Valor</th></tr></thead>
                <tbody>
                  <tr><td>2 limpezas de 2 horas</td><td>R$ 122,00</td></tr>
                  <tr><td>4 limpezas de 3 horas</td><td>R$ 324,00</td></tr>
                  <tr><td>8 limpezas de 4 horas</td><td>R$ 808,00</td></tr>
                  <tr><td>6 limpezas de 6 horas</td><td>R$ 846,00</td></tr>
                  <tr><td>5 limpezas de 8 horas</td><td>R$ 905,00</td></tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-50 rounded">
              <div>Base: R$ 504,00</div>
              <div>Mão de obra (121 horas): R$ 2.140,00</div>
              <div className="text-lg font-bold">Total (25 limpezas): R$ 3.005,00</div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="mb-3">Crie a sua senha e aceite os termos de uso:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Senha</label>
                <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-1 input" />
              </div>
              <div>
                <label className="block text-sm font-medium">Confirmar senha</label>
                <input type="password" value={form.passwordConfirm} onChange={e=>setForm({...form,passwordConfirm:e.target.value})} className="mt-1 input" />
              </div>
            </div>
            <div className="mt-4">
              <label className="inline-flex items-center">
                <input type="checkbox" checked={form.terms} onChange={e=>setForm({...form,terms:e.target.checked})} className="mr-2" />
                Ao continuar declaro que li e aceito os termos de uso e serviço.
              </label>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-xl font-bold text-red-600">VOCÊ ESTÁ EM FASE DE TREINAMENTO!</h2>
            <p className="text-sm text-slate-600 mb-4">Para ativar a sua conta finalize as etapas abaixo.</p>
            <div className="space-y-3">
              <label className="flex items-start gap-3"><input type="checkbox" checked={form.training.alignment} onChange={e=>setForm({...form, training:{...form.training, alignment:e.target.checked}})} /> <div><b>Alinhamento com a Leidy Cleaner</b><div className="text-sm text-slate-500">Conheça o nosso papel, direitos e deveres.</div></div></label>
              <label className="flex items-start gap-3"><input type="checkbox" checked={form.training.photo} onChange={e=>setForm({...form, training:{...form.training, photo:e.target.checked}})} /> <div><b>Cadastre sua foto de perfil</b><div className="text-sm text-slate-500">Foto que os clientes vão ver.</div></div></label>
              <label className="flex items-start gap-3"><input type="checkbox" checked={form.training.bio} onChange={e=>setForm({...form, training:{...form.training, bio:e.target.checked}})} /> <div><b>Escreva sua apresentação</b><div className="text-sm text-slate-500">Pequeno texto para se apresentar.</div></div></label>
              <label className="flex items-start gap-3"><input type="checkbox" checked={form.training.verify} onChange={e=>setForm({...form, training:{...form.training, verify:e.target.checked}})} /> <div><b>Verificar seu cadastro</b><div className="text-sm text-slate-500">Envie informações adicionais.</div></div></label>
              <label className="flex items-start gap-3"><input type="checkbox" checked={form.training.chat} onChange={e=>setForm({...form, training:{...form.training, chat:e.target.checked}})} /> <div><b>Chamar atendente no chat</b><div className="text-sm text-slate-500">Nos avise que terminou o alinhamento.</div></div></label>
            </div>
            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400">Dica: Se estiver com dificuldade, nos chame no suporte ou peça ajuda a um familiar.</div>
            <div className="mt-4">
              <button className="btn mr-2" onClick={()=>alert('Iniciar alinhamento...')}>Começar alinhamento</button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button className="btn btn-secondary" onClick={back} disabled={step===1}>Voltar</button>
          <div>
            {step < 4 && <button className="btn btn-primary" onClick={next}>Avançar</button>}
            {step === 4 && <button className="btn btn-primary" onClick={next}>Criar cadastro</button>}
            {step === 5 && <button className="btn btn-primary" onClick={()=>alert('Pronto! Uma vez que as etapas forem verificadas sua conta será ativada.')}>Concluir Treinamento</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
