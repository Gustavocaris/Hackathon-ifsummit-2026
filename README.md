# IFSlot — Sistema de Gestão de Laboratórios

> Plataforma digital para reserva e gestão de laboratórios de química e biologia do Instituto Federal do Paraná — Campus Cascavel.

---

## Sobre o Projeto

O IFSlot centraliza a gestão de recursos, insumos e cronogramas dos laboratórios, automatizando a comunicação entre docentes e técnicos e garantindo rastreabilidade de todo o material consumido — desde a solicitação de reserva até a conclusão da aula prática.

**Problemas que resolve:**
- Conflitos de agendamento por falta de visibilidade de disponibilidade
- Desabastecimento de insumos por controle manual desvinculado das reservas
- Sobrecarga administrativa dos técnicos
- Ausência de rastreabilidade do consumo de reagentes e equipamentos

---

## Arquitetura

```
ifslot/
├── backend/backend/          ← API REST + Frontend calendário (Next.js 14, porta 3001)
└── hackathon-frontend-end-03/ ← SPA completo (Vite + React, porta 3000)
```

| Camada | Tecnologia | Porta |
|---|---|---|
| API REST | Next.js 14 App Router + TypeScript | 3001 |
| Banco de dados | PostgreSQL via Supabase + Prisma ORM | — |
| Autenticação | Supabase Auth (JWT) | — |
| Frontend SPA | Vite + React 19 + TypeScript | 3000 |
| UI | Tailwind CSS + shadcn/ui (Radix UI) | — |

---

## Perfis de Acesso

| Perfil | Acesso |
|---|---|
| **Docente** | Visualiza calendário, cria e acompanha reservas próprias |
| **Técnico** | Aprova/reprova reservas, gerencia estoque, visualiza painel diário |
| **Admin** | Acesso total — inclui gestão de usuários e laboratórios |

---

## Pré-requisitos

Antes de iniciar, instale:

| Software | Versão mínima | Link |
|---|---|---|
| Node.js | 20+ | https://nodejs.org |
| npm | 10+ | (incluso no Node.js) |
| Git | qualquer | https://git-scm.com |

**Verificar instalação:**
```bash
node -v    # deve retornar v20.x.x ou superior
npm -v     # deve retornar 10.x.x ou superior
```

---

## Instalação e Execução

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <nome-da-pasta>
```

---

### 2. Configurar o Backend (API)

```bash
cd backend/backend
```

#### 2.1 Instalar dependências

```bash
npm install
```

#### 2.2 Configurar variáveis de ambiente

Crie o arquivo `.env.local` na pasta `backend/backend/`:

```env
# Supabase — obtenha em https://supabase.com > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_XXXXXXXXXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Banco de dados PostgreSQL (pooler de transação — para uso normal)
DATABASE_URL="postgresql://postgres.SEU_PROJETO:SENHA@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Banco de dados PostgreSQL (sessão — para migrações)
DIRECT_URL="postgresql://postgres.SEU_PROJETO:SENHA@aws-1-us-west-2.pooler.supabase.com:5432/postgres"
```

> **Onde encontrar as chaves?**
> 1. Acesse [supabase.com](https://supabase.com) e abra seu projeto
> 2. Vá em **Settings → API** para `SUPABASE_URL` e as chaves
> 3. Vá em **Settings → Database** para as strings de conexão PostgreSQL

#### 2.3 Sincronizar o banco de dados

```bash
npm run db:push
```

#### 2.4 Criar usuários de teste (Supabase Auth + banco local)

```bash
npm run db:seed-users
```

#### 2.5 Popular dados de demonstração

```bash
npm run db:seed-data
```

#### 2.6 Iniciar o servidor

```bash
npm run dev
```

✅ API disponível em `http://localhost:3001`
✅ Calendário disponível em `http://localhost:3001` (abre no navegador)

---

### 3. Configurar o Frontend (SPA)

Abra um **novo terminal** e execute:

```bash
cd hackathon-frontend-end-03
```

#### 3.1 Instalar dependências

```bash
npm install --legacy-peer-deps
```

> O parâmetro `--legacy-peer-deps` é necessário devido a conflitos de compatibilidade entre versões do Vite e algumas dependências.

#### 3.2 Iniciar o frontend

```bash
npm run dev
```

✅ Frontend disponível em `http://localhost:3000`

---

### 4. Acessar o sistema

Abra `http://localhost:3000` no navegador e faça login com:

| E-mail | Senha | Perfil |
|---|---|---|
| `docente@ifpr.edu.br` | `Ifslot@2025` | Docente |
| `tecnico@ifpr.edu.br` | `Ifslot@2025` | Técnico |
| `admin@ifpr.edu.br` | `Ifslot@2025` | Admin |

---

## Scripts disponíveis

### Backend (`backend/backend/`)

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor em modo desenvolvimento (porta 3001) |
| `npm run build` | Gera build de produção |
| `npm run db:push` | Sincroniza o schema Prisma com o banco de dados |
| `npm run db:generate` | Regenera o Prisma Client após mudanças no schema |
| `npm run db:studio` | Abre o Prisma Studio (interface visual do banco) |
| `npm run db:seed` | Popula laboratórios, reagentes, vidrarias e equipamentos básicos |
| `npm run db:seed-users` | Cria usuários de teste no Supabase Auth e banco local |
| `npm run db:seed-data` | Popula dados realistas de demonstração (reservas, notificações) |

### Frontend (`hackathon-frontend-end-03/`)

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o frontend em modo desenvolvimento (porta 3000) |
| `npm run build` | Gera build de produção |
| `npm run preview` | Pré-visualiza o build de produção localmente |

---

## Solução de Problemas

### Erro no PowerShell (Windows)

Se aparecer o erro `npm.ps1 não pode ser carregado`, execute no PowerShell como administrador:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Confirme digitando `S` e pressione Enter.

### Porta já em uso

Se a porta 3000 ou 3001 já estiver sendo utilizada:

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:3001 | xargs kill
```

### Erro de dependências no npm install

Use a flag `--legacy-peer-deps`:

```bash
npm install --legacy-peer-deps
```

### Erro de conexão com o banco

1. Verifique se as variáveis no `.env.local` estão corretas
2. Confirme que o projeto Supabase está ativo em [supabase.com](https://supabase.com)
3. Rode `npm run db:push` novamente para re-sincronizar o schema

### Frontend não consegue acessar a API

O Vite proxeia automaticamente chamadas `/api/*` para `http://localhost:3001`.
Certifique-se de que o backend está rodando **antes** de iniciar o frontend.

---

## Estrutura de Pastas

```
backend/backend/
├── prisma/
│   ├── schema.prisma      ← Modelos do banco de dados
│   ├── seed.ts            ← Seed básico
│   ├── seed-users.ts      ← Seed de usuários (Supabase Auth)
│   └── seed-data.ts       ← Seed de dados de demonstração
├── src/
│   ├── app/
│   │   ├── api/           ← Rotas da API REST
│   │   │   ├── auth/      ← Login e registro
│   │   │   ├── laboratories/
│   │   │   ├── reservations/
│   │   │   ├── materials/ ← Reagentes + vidrarias + equipamentos (unificado)
│   │   │   └── notifications/
│   │   ├── page.tsx       ← Calendário (frontend Next.js)
│   │   └── layout.tsx
│   ├── lib/               ← Prisma, Supabase, utilitários
│   ├── middleware/        ← Autenticação JWT
│   └── middleware.ts      ← CORS para todas as rotas /api/*

hackathon-frontend-end-03/
├── client/
│   └── src/
│       ├── pages/         ← Telas da aplicação
│       │   ├── Login.tsx
│       │   ├── Agenda.tsx     ← Calendário principal
│       │   ├── Dashboard.tsx
│       │   ├── Reservas.tsx
│       │   ├── Estoque.tsx
│       │   ├── Aprovacoes.tsx
│       │   └── Notificacoes.tsx
│       ├── components/    ← Sidebar, Layout, UI components
│       └── store/         ← Estado global (Zustand)
│           ├── authStore.ts   ← Autenticação
│           └── dataStore.ts   ← Dados (laboratórios, reservas, etc.)
```

---

## API — Principais Endpoints

| Método | Rota | Descrição | Perfil |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login — retorna JWT + usuário | Público |
| `POST` | `/api/auth/register` | Registra usuário no banco local | Autenticado |
| `GET` | `/api/laboratories` | Lista laboratórios | Autenticado |
| `GET` | `/api/reservations` | Lista reservas (filtros por data) | Autenticado |
| `POST` | `/api/reservations` | Cria reserva | Autenticado |
| `PATCH` | `/api/reservations/:id/approve` | Aprova / reprova / solicita ajuste | Técnico / Admin |
| `GET` | `/api/materials` | Lista materiais unificados | Autenticado |
| `POST` | `/api/materials` | Cria material | Autenticado |
| `GET` | `/api/notifications` | Lista notificações do usuário | Autenticado |
| `PATCH` | `/api/notifications/:id/read` | Marca notificação como lida | Autenticado |
| `GET` | `/api/approvals/daily-panel` | Painel diário de preparação | Técnico / Admin |

---

## Funcionalidades Implementadas (MVP)

- [x] Autenticação com Supabase Auth e diferenciação de perfis
- [x] Calendário visual interativo com status de disponibilidade por turno
- [x] Indicadores visuais por laboratório (Química / Biologia) em cada dia
- [x] Fluxo completo de reserva com seleção de reagentes, vidrarias e equipamentos
- [x] Workflow de aprovação (aprovar / reprovar / solicitar ajuste)
- [x] Gestão de estoque com criação e atualização de quantidades
- [x] Painel de preparação técnica (painel diário)
- [x] Sistema de notificações
- [x] Controle de acesso por perfil (Docente, Técnico, Admin)

---

## Desenvolvido para

**Hackathon** — Instituto Federal do Paraná · Campus Cascavel

---

*Para dúvidas ou problemas, abra uma issue no repositório.*
