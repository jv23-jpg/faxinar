import React from 'react';

export default function Tasks() {
  const todos = [
    { id: 1, text: 'Implementar envio de e‑mail no backend (done) ✅' },
    { id: 2, text: 'Finalizar testes e2e (Playwright) — em progresso' },
    { id: 3, text: 'Configurar CI para rodar testes e2e' },
    { id: 4, text: 'Forçar upload de documentos antes de concluir onboarding' },
    { id: 5, text: 'Implementar auto‑preenchimento de CEP (ViaCEP)' },
    { id: 6, text: 'Adicionar logs/auditoria para ações administrativas' },
    { id: 7, text: 'Atualizar README e documentação' }
  ];

  return (
    <div className="tasks">
      <h1>Lista de tarefas</h1>
      <ul>
        {todos.map(t => <li key={t.id}>{t.text}</li>)}
      </ul>
      <p>Use esta página para visualizar o status geral das pendências e navegar para as features relacionadas.</p>
    </div>
  );
}
