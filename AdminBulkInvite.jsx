import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, FileText, ArrowRight } from 'lucide-react';

// Simple CSV parser (headers optional). Returns array of objects keyed by header or index-based keys
function parseCsv(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return [];
  const first = lines[0].split(',').map(c => c.trim());
  const hasHeader = first.some(h => /email|user|type|name|phone/i.test(h));
  const rows = [];
  for (let i = (hasHeader ? 1 : 0); i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim());
    if (hasHeader) {
      const obj = {};
      for (let j = 0; j < first.length; j++) {
        obj[first[j]] = cols[j] || '';
      }
      rows.push(obj);
    } else {
      // fall back: expect order email,userType,full_name,phone
      rows.push({ email: cols[0] || '', userType: cols[1] || 'client', full_name: cols[2] || '', phone: cols[3] || '' });
    }
  }
  return rows;
}

export default function AdminBulkInvite() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [fileText, setFileText] = useState('');
  const [preview, setPreview] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ total: 0, done: 0, errors: [] });

  useEffect(() => {
    (async () => {
      try { const me = await base44.auth.me(); setCurrentUser(me); } catch(e){ setCurrentUser(null); }
    })();
  }, []);

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target.result || '');
      setFileText(text);
      const rows = parseCsv(text);
      setPreview(rows);
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    const rows = parseCsv(fileText);
    if (!rows || rows.length === 0) return alert('Nenhuma linha válida encontrada no CSV');
    setProcessing(true);
    setProgress({ total: rows.length, done: 0, errors: [] });

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const email = (r.email || r.Email || r.E-mail || '').trim();
      const userType = (r.userType || r.type || r.tipo || 'client').trim();
      const full_name = r.full_name || r.name || r.Nome || '';
      const phone = r.phone || '';

      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setProgress(prev => ({ ...prev, done: prev.done + 1, errors: [...prev.errors, { row: i+1, reason: 'email inválido' }] }));
        continue;
      }

      try {
        // create minimal profile (same as AdminCreateUser create without auto-login)
        if (userType === 'cleaner') {
          await base44.entities.CleanerProfile.create({ user_email: email, full_name, phone, verified: false, available: false });
        } else if (userType === 'company') {
          await base44.entities.CompanyAccount.create({ user_email: email, company_name: full_name || email, contact_phone: phone, verified: false });
        } else {
          await base44.entities.ClientProfile.create({ user_email: email, full_name, phone });
        }

        // create invite token
        const token = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : (Math.random().toString(36).slice(2, 10) + Date.now().toString(36));
        const expiresAt = new Date(Date.now() + 7*24*60*60*1000).toISOString();
        let invite = null;
        if (base44.entities.Invite && base44.entities.Invite.create) {
          invite = await base44.entities.Invite.create({ email, token, userType, created_by: currentUser?.email || 'admin', created_date: new Date().toISOString(), expires_at: expiresAt, sent: false, used: false });
        }
        const link = `${window.location.origin}/activate?token=${token}`;

        // audit: bulk invite created
        try { const { auditLog } = await import('./utils/audit'); await auditLog({ actor: currentUser?.email || 'admin', action: 'bulk_invite_create', entity: 'invite', entity_id: invite && invite.id ? invite.id : token, details: { email, userType } }); } catch(e) { console.warn('audit failed', e); }

        // try to send via API if available, otherwise use local server helper
        try {
          if (base44.api && base44.api.sendInvite) {
            await base44.api.sendInvite({ email, link, type: userType, from: currentUser?.email });
          } else {
            const { sendInvite } = await import('./utils/sendInvite');
            await sendInvite({ email, link, type: userType, from: currentUser?.email });
          }
          if (invite && invite.id && base44.entities.Invite && base44.entities.Invite.update) {
            await base44.entities.Invite.update(invite.id, { sent: true });
          }
        } catch (err) {
          throw err;
        }

        setProgress(prev => ({ ...prev, done: prev.done + 1 }));
      } catch (err) {
        setProgress(prev => ({ ...prev, done: prev.done + 1, errors: [...prev.errors, { row: i+1, reason: err.message || String(err) }] }));
      }
    }

    setProcessing(false);
    alert(`Processamento finalizado. Erros: ${progress.errors.length}`);
    // refresh UI or navigate
    navigate(createPageUrl('AdminUsers'));
  };

  const downloadTemplate = () => {
    const csv = 'email,userType,full_name,phone\ncleidycleaner@gmail.com,cleaner,Cleidy Cleaner,(00)00000-0000\nempresa@exemplo.com,company,Empresa Exemplo,(00)00000-0000\ncliente@exemplo.com,client,Cliente Teste,(00)00000-0000\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-invite-template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!currentUser) return (
    <div className="max-w-lg mx-auto">
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          <p>Você precisa estar logado como admin para acessar essa página.</p>
          <Button onClick={() => base44.auth.redirectToLogin(window.location.href)}>Entrar</Button>
        </CardContent>
      </Card>
    </div>
  );

  if (currentUser.role !== 'admin') return (
    <div className="max-w-lg mx-auto">
      <Card className="border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          <p>Acesso negado. Apenas administradores.</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
          <CardTitle className="flex items-center gap-2"><UploadCloud className="w-5 h-5" />Convite em Massa (CSV)</CardTitle>
          <CardDescription className="text-emerald-100">Faça upload de um CSV com colunas: email,userType,full_name,phone</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label>Arquivo CSV</Label>
              <div className="flex items-center gap-2">
                <input id="bulk-file" type="file" accept=".csv" onChange={(e)=>{ const f = e.target.files && e.target.files[0]; if (f) handleFile(f); }} />
                <Button onClick={downloadTemplate}><FileText className="w-4 h-4 mr-2" />Template</Button>
              </div>
            </div>

            <div>
              <Label>Preview</Label>
              <div className="p-4 bg-slate-50 rounded max-h-56 overflow-auto">
                {preview.length === 0 ? <p className="text-sm text-slate-500">Nenhuma linha carregada</p> : (
                  <table className="w-full text-sm">
                    <thead><tr>{Object.keys(preview[0]).map(k=> <th key={k} className="text-left pr-4">{k}</th>)}</tr></thead>
                    <tbody>
                      {preview.map((r, idx)=> (
                        <tr key={idx} className="border-t"><td className="py-1" colSpan={Object.keys(r).length}>{Object.values(r).join(' | ')}</td></tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={handleProcess} disabled={processing || preview.length === 0} className="bg-gradient-to-r from-emerald-500 to-teal-600">{processing ? 'Processando...' : 'Processar e Enviar Convites'}</Button>
              <Button variant="outline" onClick={()=>{ setFileText(''); setPreview([]); }}>Limpar</Button>
              <div className="ml-auto text-sm text-slate-500">Total: {progress.total || preview.length} — Processados: {progress.done}</div>
            </div>

            {progress.errors && progress.errors.length > 0 && (
              <div className="mt-2 p-2 bg-amber-50 rounded">
                <div className="text-sm text-amber-700">Erros:</div>
                <ul className="list-disc ml-4 text-sm">
                  {progress.errors.map((e,i)=>(<li key={i}>{`Linha ${e.row}: ${e.reason}`}</li>))}
                </ul>
              </div>
            )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
