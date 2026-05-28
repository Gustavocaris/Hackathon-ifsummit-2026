# 📚 EduManager - Sistema de Gestão e Reserva de Laboratórios Acadêmicos

**Versão:** 1.0.0  
**Última Atualização:** Maio 2026  
**Instituição:** Instituto Federal do Paraná (IFPR)

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Grupos de Acesso e Permissões](#grupos-de-acesso-e-permissões)
6. [Fluxos de Dados](#fluxos-de-dados)
7. [Instalação e Setup](#instalação-e-setup)
8. [Contas de Teste](#contas-de-teste)
9. [Funcionalidades Principais](#funcionalidades-principais)
10. [Guia de Desenvolvimento](#guia-de-desenvolvimento)

---

## 🎯 Visão Geral

**EduManager** é um sistema web moderno de gestão e reserva de laboratórios acadêmicos desenvolvido para o Instituto Federal do Paraná. O sistema permite que professores reservem laboratórios, preencham relatórios de uso, e que técnicos gerenciem aprovações e inventário de materiais.

### Objetivos Principais

- ✅ Centralizar reservas de laboratórios
- ✅ Automatizar workflow de aprovações
- ✅ Controlar inventário de materiais
- ✅ Gerar relatórios de uso e estatísticas
- ✅ Facilitar comunicação entre professores e técnicos
- ✅ Manter histórico de atividades

---

## 🛠️ Stack Tecnológico

### Frontend

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **React** | 19.2.1 | Framework UI |
| **TypeScript** | 5.6.3 | Type safety |
| **Vite** | 7.1.7 | Build tool e dev server |
| **TailwindCSS** | 4.1.14 | Styling e design system |
| **shadcn/ui** | Latest | Componentes UI reutilizáveis |
| **Wouter** | 3.3.5 | Roteamento client-side |
| **Zustand** | Latest | State management |
| **Recharts** | 2.15.2 | Gráficos e visualizações |
| **Lucide React** | 0.453.0 | Ícones |
| **Sonner** | 2.0.7 | Toast notifications |
| **React Hook Form** | 7.64.0 | Gerenciamento de formulários |
| **Zod** | 4.1.12 | Validação de schemas |

### Backend (Recomendado)

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Node.js** | 22.13.0 | Runtime |
| **Express** | 4.21.2 | Framework web |
| **Prisma** | Latest | ORM |
| **Supabase** | - | Database (PostgreSQL) |
| **JWT** | - | Autenticação |
| **Bcrypt** | - | Hash de senhas |

### Infraestrutura

- **Hospedagem:** Manus (built-in)
- **Database:** Supabase (PostgreSQL)
- **Storage:** S3 (para fotos de perfil e documentos)
- **Email:** SMTP (para notificações)

---

## 🏗️ Arquitetura do Sistema

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React SPA (Vite)                                    │   │
│  │  ├─ Pages (Login, Dashboard, Agenda, etc)          │   │
│  │  ├─ Components (UI, Forms, Charts)                 │   │
│  │  ├─ Contexts (Auth, Theme)                         │   │
│  │  ├─ Stores (Zustand - Auth, Data)                  │   │
│  │  └─ Services (API, Utils)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/HTTPS
                   │ REST API
┌──────────────────▼──────────────────────────────────────────┐
│                  SERVIDOR (Backend)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js + Node.js                               │   │
│  │  ├─ Routes (Autenticação, CRUD, Aprovações)        │   │
│  │  ├─ Middleware (JWT, Validação, CORS)              │   │
│  │  ├─ Services (Lógica de negócio)                    │   │
│  │  ├─ Controllers (Requisições/Respostas)            │   │
│  │  └─ Database Layer (Prisma ORM)                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │ SQL
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              DATABASE (Supabase/PostgreSQL)                 │
│  ├─ Usuários (Docentes, Técnicos, Admins)                 │
│  ├─ Laboratórios (Química, Biologia)                      │
│  ├─ Materiais (Inventário)                                │
│  ├─ Reservas (Agendamentos)                               │
│  ├─ Relatórios (Uso de laboratórios)                      │
│  ├─ Aprovações (Workflow)                                 │
│  └─ Notificações (Sistema de alertas)                     │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Autenticação

```
1. Usuário acessa login
   ↓
2. Preenche email + senha
   ↓
3. Sistema gera código 2FA (0-100)
   ↓
4. Usuário digita código
   ↓
5. Backend valida credenciais
   ↓
6. JWT gerado e armazenado em localStorage
   ↓
7. Redirecionado para Dashboard
   ↓
8. Todas as requisições incluem JWT no header
```

---

## 📁 Estrutura de Pastas

```
lab-management-system/
├── client/                          # Frontend React
│   ├── public/
│   │   ├── images/
│   │   │   └── ifpr/               # Imagens do carrossel (campus1.jpg, campus2.jpg, campus3.jpg)
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── pages/                   # Páginas da aplicação
│       │   ├── Login.tsx            # Landing page com carrossel + login
│       │   ├── Dashboard.tsx        # Dashboard (diferente por perfil)
│       │   ├── Agenda.tsx           # Calendário com reservas
│       │   ├── Reservas.tsx         # Gerenciamento de reservas
│       │   ├── Estoque.tsx          # Inventário com export PDF
│       │   ├── Aprovacoes.tsx       # Workflow de aprovações
│       │   ├── Notificacoes.tsx     # Sistema de notificações
│       │   ├── Admin.tsx            # Gerenciamento de usuários
│       │   ├── Home.tsx             # Página inicial
│       │   └── NotFound.tsx         # 404
│       │
│       ├── components/              # Componentes reutilizáveis
│       │   ├── ui/                  # shadcn/ui components
│       │   ├── Sidebar.tsx          # Navegação lateral
│       │   ├── DashboardLayout.tsx  # Layout principal
│       │   ├── ProtectedRoute.tsx   # Rota protegida por autenticação
│       │   └── ErrorBoundary.tsx    # Tratamento de erros
│       │
│       ├── contexts/                # React Contexts
│       │   └── ThemeContext.tsx     # Dark/Light mode
│       │
│       ├── hooks/                   # Custom React hooks
│       │   ├── useComposition.ts
│       │   ├── useMobile.tsx
│       │   └── usePersistFn.ts
│       │
│       ├── lib/                     # Utilitários
│       │   └── utils.ts             # Funções auxiliares
│       │
│       ├── store/                   # Zustand stores (State Management)
│       │   ├── authStore.ts         # Autenticação e usuário
│       │   ├── dataStore.ts         # Dados globais (reservas, materiais)
│       │   └── mockData.ts          # Dados mock para demo
│       │
│       ├── types/                   # TypeScript interfaces
│       │   └── index.ts             # Tipos globais
│       │
│       ├── App.tsx                  # Componente raiz com rotas
│       ├── main.tsx                 # Entry point React
│       ├── index.css                # Estilos globais + Tailwind
│       └── const.ts                 # Constantes da aplicação
│
├── server/                          # Backend (placeholder para compatibilidade)
│   └── index.ts                     # Será implementado com Express + Prisma
│
├── shared/                          # Código compartilhado
│   └── const.ts                     # Constantes globais
│
├── package.json                     # Dependências do projeto
├── tsconfig.json                    # Configuração TypeScript
├── vite.config.ts                   # Configuração Vite
├── tailwind.config.ts               # Configuração TailwindCSS
└── README.md                        # Este arquivo
```

---

## 👥 Grupos de Acesso e Permissões

### 1️⃣ **DOCENTE** (Professor)

**Descrição:** Professores que reservam laboratórios para aulas e pesquisa.

**Permissões:**
- ✅ Visualizar calendário de reservas
- ✅ Criar novas reservas
- ✅ Editar próprias reservas (antes da aprovação)
- ✅ Cancelar próprias reservas
- ✅ Visualizar reservas de outros professores no calendário
- ✅ Preencher relatório de uso após aula
- ✅ Visualizar próprias notificações
- ✅ Editar perfil pessoal

**Restrições:**
- ❌ Não pode aprovar/rejeitar reservas
- ❌ Não pode gerenciar usuários
- ❌ Não pode acessar estoque
- ❌ Não pode visualizar dados de outros professores

**Dados Visíveis:**
- Próprio dashboard com próxima reserva e relatórios pendentes
- Calendário com todas as reservas (cor indica disponibilidade)
- Notificações de aprovação/rejeição
- Lembretes para preencher relatórios

---

### 2️⃣ **TÉCNICO** (Responsável de Laboratório)

**Descrição:** Técnicos responsáveis pela manutenção e aprovação de reservas.

**Permissões:**
- ✅ Visualizar todas as reservas
- ✅ Aprovar/rejeitar reservas
- ✅ Visualizar e gerenciar estoque
- ✅ Exportar relatório de estoque em PDF
- ✅ Visualizar gráficos de uso mensal
- ✅ Visualizar relatórios preenchidos pelos professores
- ✅ Visualizar notificações de relatórios pendentes
- ✅ Filtrar aprovações por mês
- ✅ Visualizar estatísticas (aprovadas, rejeitadas, pendentes)

**Restrições:**
- ❌ Não pode criar reservas
- ❌ Não pode gerenciar usuários
- ❌ Não pode acessar painel admin

**Dados Visíveis:**
- Dashboard com métricas (reservas pendentes, relatórios)
- Gráfico de frequência de uso mensal
- Calendário de todas as reservas
- Fila de aprovações com filtro por mês
- Estoque com alertas de materiais críticos
- Relatórios preenchidos pelos professores

---

### 3️⃣ **ADMIN** (Administrador)

**Descrição:** Administrador do sistema com acesso total.

**Permissões:**
- ✅ Todas as permissões de Técnico
- ✅ Criar/editar/deletar usuários (Docentes, Técnicos, Admins)
- ✅ Gerenciar laboratórios
- ✅ Gerenciar materiais
- ✅ Visualizar logs de atividades
- ✅ Configurar permissões de usuários
- ✅ Acessar painel de administração completo
- ✅ Upload de foto de perfil para usuários

**Restrições:**
- Nenhuma (acesso total)

**Dados Visíveis:**
- Todos os dados do sistema
- Painel Admin com gerenciamento de usuários
- Formulários de criação com validação de senha

---

## 🔄 Fluxos de Dados

### Fluxo 1: Criar Reserva (Docente)

```
1. Docente acessa Agenda
   ↓
2. Clica em data/horário disponível
   ↓
3. Preenche formulário:
   - Laboratório
   - Data/Hora
   - Disciplina
   - Quantidade de alunos
   - Observações
   ↓
4. Clica "Solicitar Reserva"
   ↓
5. Dados enviados ao backend
   ↓
6. Backend valida e salva no banco
   ↓
7. Status: "Pendente de Aprovação"
   ↓
8. Técnico recebe notificação
   ↓
9. Docente vê no Dashboard: "Reservas Pendentes"
```

### Fluxo 2: Aprovar Reserva (Técnico)

```
1. Técnico acessa "Aprovações"
   ↓
2. Vê fila de reservas pendentes
   ↓
3. Clica em reserva para detalhar
   ↓
4. Analisa informações
   ↓
5. Clica "Aprovar" ou "Rejeitar"
   ↓
6. Se rejeitar: digita motivo
   ↓
7. Dados salvos no banco
   ↓
8. Status muda para "Aprovada" ou "Rejeitada"
   ↓
9. Docente recebe notificação
   ↓
10. Calendário atualiza com cores:
    - 🟢 Verde: Disponível
    - 🟡 Amarelo: Parcialmente ocupado
    - 🔴 Vermelho: Totalmente ocupado
```

### Fluxo 3: Preencher Relatório (Docente)

```
1. Reserva termina
   ↓
2. Docente recebe notificação: "Relatório Pendente"
   ↓
3. Clica em "Preencher Relatório"
   ↓
4. Redirecionado para Dashboard
   ↓
5. Preenche 2 tópicos:
   - Observações Gerais + Materiais Utilizados
   - Consumo de Reagentes (Data, Ensino/Pesquisa, Resíduo, Assinatura)
   ↓
6. Clica "Enviar Relatório"
   ↓
7. Dados salvos no banco
   ↓
8. Técnico vê em "Relatórios Preenchidos"
   ↓
9. Notificação desaparece
```

### Fluxo 4: Gerenciar Estoque (Técnico)

```
1. Técnico acessa "Estoque"
   ↓
2. Vê tabela com:
   - Material
   - Quantidade
   - Status (Crítico/Baixo/Normal)
   - Laboratório
   ↓
3. Pode filtrar por:
   - Laboratório
   - Status
   ↓
4. Clica "Gerar Relatório"
   ↓
5. PDF gerado com:
   - Data do relatório
   - Tabela completa
   - Totais por status
   ↓
6. Arquivo baixado automaticamente
   ↓
7. Técnico apresenta à diretoria
```

### Fluxo 5: Criar Usuário (Admin)

```
1. Admin acessa "Painel Admin"
   ↓
2. Seleciona tipo: Docente/Técnico/Admin
   ↓
3. Preenche formulário:
   - Nome Completo
   - Email Institucional
   - Departamento (Docente)
   - Matéria (Docente)
   - Laboratórios (Técnico)
   - Senha (validação: min 8 chars + 1 especial)
   ↓
4. Faz upload de foto (JPG/PNG, max 5MB)
   ↓
5. Clica "Criar Usuário"
   ↓
6. Backend valida dados
   ↓
7. Senha é hasheada com bcrypt
   ↓
8. Usuário salvo no banco
   ↓
9. Usuário recebe email com credenciais
   ↓
10. Admin vê usuário na lista
```

---

## 🚀 Instalação e Setup

### Pré-requisitos

- Node.js 22.13.0+
- npm ou pnpm
- Git

### Passo 1: Clonar Repositório

```bash
git clone <seu-repositorio>
cd lab-management-system
```

### Passo 2: Instalar Dependências

```bash
# Usando npm
npm install --legacy-peer-deps

# OU usando pnpm (recomendado)
pnpm install
```

### Passo 3: Configurar Variáveis de Ambiente

Crie arquivo `.env.local` na raiz do projeto:

```env
# Frontend
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=EduManager
VITE_APP_LOGO=https://seu-logo.png

# Backend (quando implementado)
DATABASE_URL=postgresql://user:password@localhost:5432/edumanager
JWT_SECRET=sua-chave-secreta-super-segura
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

### Passo 4: Adicionar Imagens do Carrossel

Crie a pasta e adicione suas imagens:

```bash
mkdir -p client/public/images/ifpr/
# Copie seus arquivos:
# - campus1.jpg
# - campus2.jpg
# - campus3.jpg
```

### Passo 5: Iniciar Servidor de Desenvolvimento

```bash
# Frontend
npm run dev
# ou
pnpm dev

# Acesse: http://localhost:5173
```

### Passo 6: Build para Produção

```bash
npm run build
# ou
pnpm build
```

---

## 🔐 Contas de Teste

| Perfil | Email | Senha | 2FA |
|--------|-------|-------|-----|
| 👨‍🏫 Prof. João | joao@lab.com | 123456 | Automático |
| 👨‍🏫 Prof. Lucas | lucas@lab.com | 123456 | Automático |
| 👨‍🔧 Técnico | tecnico@lab.com | 123456 | Automático |
| 👨‍💼 Admin | admin@lab.com | 123456 | Automático |

**Nota:** O código 2FA é gerado automaticamente (0-100) e muda a cada 30 segundos.

---

## ✨ Funcionalidades Principais

### 📅 Agenda (Calendário)

- Visualização mensal com cores de disponibilidade
- Horários exibidos nas células
- Tooltip ao passar mouse mostrando professor e detalhes
- Filtro por laboratório
- Navegação entre meses

### 📝 Reservas

- Criar nova reserva
- Editar reserva pendente
- Cancelar reserva
- Visualizar histórico
- Status em tempo real

### ✅ Aprovações

- Fila de reservas pendentes
- Aprovar/rejeitar com motivo
- Filtro por mês
- Estatísticas (gráfico de barras)
- Contador de aprovadas/rejeitadas/pendentes

### 📦 Estoque

- Tabela com materiais
- Status visual (Crítico/Baixo/Normal)
- Filtro por laboratório e status
- Gerar e baixar relatório em PDF
- Alertas de materiais críticos

### 📊 Notificações

- Relatórios pendentes
- Aprovações/rejeições
- Lembretes de preenchimento
- Histórico de notificações

### 👥 Gerenciamento de Usuários (Admin)

- Criar Docentes, Técnicos, Admins
- Upload de foto de perfil
- Validação de senha (min 8 chars + 1 especial)
- Deletar usuários
- Listar todos os usuários

### 🌓 Dark/Light Mode

- Toggle no header
- Preferência salva em localStorage
- Suporta `prefers-color-scheme`

---

## 📚 Guia de Desenvolvimento

### Adicionar Nova Página

1. Crie arquivo em `client/src/pages/NovaPagina.tsx`
2. Exporte componente padrão
3. Adicione rota em `client/src/App.tsx`
4. Adicione link no `client/src/components/Sidebar.tsx`

### Adicionar Novo Componente

1. Crie em `client/src/components/MeuComponente.tsx`
2. Use shadcn/ui quando possível
3. Exporte como default
4. Importe onde necessário

### Adicionar Novo Store (Zustand)

1. Crie em `client/src/store/meuStore.ts`
2. Defina interface e estado
3. Exporte hook `useMeuStore`
4. Use em componentes com `const { dados } = useMeuStore()`

### Adicionar Validação de Formulário

1. Use React Hook Form + Zod
2. Defina schema com `z.object()`
3. Use `useForm()` com `zodResolver`
4. Valide em tempo real

### Adicionar Gráfico

1. Use Recharts
2. Prepare dados em formato correto
3. Importe componente (LineChart, BarChart, etc)
4. Configure eixos e legenda

---

## 🔗 Comunicação Frontend-Backend

### Padrão de Requisição

```typescript
// client/src/lib/api.ts
const API_URL = import.meta.env.VITE_API_URL;

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}
```

### Endpoints Esperados (Backend)

```
POST   /api/auth/login          - Autenticação
POST   /api/auth/logout         - Logout
GET    /api/users               - Listar usuários
POST   /api/users               - Criar usuário
PUT    /api/users/:id           - Editar usuário
DELETE /api/users/:id           - Deletar usuário

GET    /api/reservas            - Listar reservas
POST   /api/reservas            - Criar reserva
PUT    /api/reservas/:id        - Editar reserva
DELETE /api/reservas/:id        - Cancelar reserva

POST   /api/aprovacoes/:id/aprovar   - Aprovar reserva
POST   /api/aprovacoes/:id/rejeitar  - Rejeitar reserva

GET    /api/estoque             - Listar materiais
POST   /api/estoque             - Criar material
PUT    /api/estoque/:id         - Editar material

GET    /api/relatorios          - Listar relatórios
POST   /api/relatorios          - Criar relatório

GET    /api/notificacoes        - Listar notificações
```

---

## 📊 Modelo de Dados (Banco)

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('docente', 'tecnico', 'admin'),
  departamento VARCHAR(100),
  materia VARCHAR(100),
  foto_url VARCHAR(500),
  laboratorios_responsaveis JSON,
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);

-- Laboratórios
CREATE TABLE laboratorios (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  capacidade INT,
  criado_em TIMESTAMP
);

-- Materiais
CREATE TABLE materiais (
  id UUID PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  quantidade INT,
  quantidade_minima INT,
  laboratorio_id UUID REFERENCES laboratorios(id),
  criado_em TIMESTAMP
);

-- Reservas
CREATE TABLE reservas (
  id UUID PRIMARY KEY,
  docente_id UUID REFERENCES users(id),
  laboratorio_id UUID REFERENCES laboratorios(id),
  data_inicio TIMESTAMP,
  data_fim TIMESTAMP,
  disciplina VARCHAR(100),
  quantidade_alunos INT,
  status ENUM('pendente', 'aprovada', 'rejeitada', 'cancelada'),
  motivo_rejeicao TEXT,
  criado_em TIMESTAMP
);

-- Relatórios
CREATE TABLE relatorios (
  id UUID PRIMARY KEY,
  reserva_id UUID REFERENCES reservas(id),
  docente_id UUID REFERENCES users(id),
  observacoes TEXT,
  materiais_utilizados TEXT,
  consumo_reagentes JSON,
  criado_em TIMESTAMP
);

-- Notificações
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES users(id),
  tipo ENUM('aprovacao', 'rejeicao', 'relatorio_pendente'),
  mensagem TEXT,
  lida BOOLEAN DEFAULT false,
  criado_em TIMESTAMP
);
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module '@/components/ui/button'"

**Solução:** Verifique se `tsconfig.json` tem o alias `@` configurado:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["client/src/*"]
    }
  }
}
```

### Erro: "Nested <a> tags"

**Solução:** Use `<button>` ou `<div>` com `onClick` em vez de `<a>` aninhado.

### Imagens do carrossel não aparecem

**Solução:** Verifique se os arquivos estão em:
```
client/public/images/ifpr/campus1.jpg
client/public/images/ifpr/campus2.jpg
client/public/images/ifpr/campus3.jpg
```

### Dark mode não funciona

**Solução:** Verifique se `ThemeProvider` tem `switchable` ativado em `App.tsx`.

---

## 📞 Suporte e Contribuição

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

## 📄 Licença

© 2026 EduManager. Todos os direitos reservados.

---

**Última atualização:** Maio 2026  
**Versão do documento:** 1.0.0
