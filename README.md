# Faxinar

Projeto de aplicação para agendamento e gestão de serviços de limpeza (clientes, faxineiras, empresas) — painel administrativo incluído.

## Funcionalidades principais ✅

- Cadastro de usuários: **Cliente**, **Faxineira**, **Empresa** (via formulário ou criação por admin com e-mail)
- Painel **Admin** com estatísticas e ações rápidas (ver faxineiras, pedidos, configurações)
- Criação de usuários por e-mail via **AdminCreateUser** (o admin pode marcar como verificado)
- Listagem e gestão completa de usuários via **AdminUsers** (filtrar por tipo, editar campos básicos, remover/arquivar, reenviar convite)
- Geração de **link de ativação/convite** (token válido por 7 dias) ao criar um usuário; o link é exibido ao admin para copiar e enviar, e o front tenta usar `base44.api.sendInvite` se disponível
- Upload de documentos para faxineiras (perfil e painel administrativo) e fluxo de verificação (aprovar/rejeitar com observações + histórico)
- Onboarding para faxineiras: fluxo passo-a-passo, simulador de ganhos e checklist de treinamento (Treinamento)
- Fluxos de agendamento, histórico de pedidos e pagamentos básicos

## Melhorias propostas e em andamento 🔧

- Envio de e‑mail automático de convites (integração com SendGrid/Postmark/SMTP) — atualmente a chamada é feita via `base44.api.sendInvite` quando disponível; caso não esteja configurado o link é exibido para envio manual
- Listagem/edição/remoção de usuários no painel admin (próximo passo)
- Upload e validação de documentos para verificação de faxineiras
- Bulk invite (CSV) — admin pode fazer upload de CSV para criar perfis e gerar/enviar convites em massa (implementado)

## Estrutura do projeto

- Componentes React em arquivos `.jsx` no diretório raiz
- Schemas (entidades) em `*.schema.json` — adicionado `Invite.schema.json` para gerenciar convites

## Como usar

1. Rodar a aplicação e acessar mantendo as variáveis de ambiente do provedor (se aplicável)
2. Entrar com conta de admin para acessar o **AdminDashboard**
3. No Admin, usar **Criar Usuário** para gerar perfis por e-mail e convites

> Observação: para envio automático de emails, você pode usar o servidor opcional incluído em `/server` que expõe `POST /api/send-invite` e integra com SendGrid se `SENDGRID_API_KEY` estiver configurada. Para usar:
>
> - Copie `.env.example` para `.env` e set `SENDGRID_API_KEY` e `SENDGRID_FROM` (opcional).
> - Em produção, gere o build do frontend (`npm run build`) e inicie o servidor (`npm run server:start`): o servidor serve o `index.html` gerado e os assets estáticos da pasta `dist` e também expõe a API em `/api/*`.
> - Em desenvolvimento, use `npm run dev` para rodar o Vite (porta 5173) e `npm run server:start` para o servidor de API (porta 4000).
> - O `index.html` inicializa um stub `window.base44.api.sendInvite` que aponta para `/api/send-invite`, fazendo do HTML a base orquestradora das funções de envio de convite.

## Testes e CI

- Unit tests (Jest): `npm test`
- E2E tests (Playwright): instale browsers `npm run e2e:install` e rode `npm run e2e:test`.
- Há um workflow de CI em `.github/workflows/ci.yml` que executa os testes e2e (pode requerer ajustes dependendo de como o frontend é servido no CI).

## Próximos passos sugeridos

- Implementar envio de e‑mail server-side e testes e2e para fluxos de criação/verificação
- Adicionar listagem completa de usuários com filtros e ações (editar, excluir, reenviar convite)
- Implementar impersonation para suporte e auditoria de ações administrativas

Se quiser, começo agora pela integração com um provedor de e‑mail (SendGrid) ou pela listagem/edição de usuários no admin — qual prefere?