# LabReserva — Backend

API REST construída com **Next.js App Router + TypeScript + Prisma + Supabase**.

---

## Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 14.x | API Routes (App Router) |
| TypeScript | 5.x | Tipagem estrita |
| Prisma | 5.x | ORM + Migrations |
| Supabase | 2.x | Auth + PostgreSQL + Storage |
| Zod | 3.x | Validação de schemas |

---

## Setup

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/seu-time/labreserva-backend.git
cd labreserva-backend
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env` com as credenciais do seu projeto Supabase:
- Acesse [supabase.com](https://supabase.com) → seu projeto → Settings → API
- Copie `URL`, `anon key` e `service_role key`
- Em Settings → Database → Connection string (Transaction Pooler) para `DATABASE_URL`

### 3. Gerar o Prisma Client

```bash
npm run db:generate
```

### 4. Aplicar as migrations (criar tabelas)

```bash
npm run db:push
```

> Use `db:push` em desenvolvimento/hackathon. Em produção, use `db:migrate`.

### 5. Popular o banco com dados de exemplo

```bash
npm run db:seed
```

### 6. Rodar o servidor

```bash
npm run dev
# Servidor rodando em http://localhost:3001
```

---

## Estrutura de Pastas

```
src/
├── app/
│   └── api/                    # API Routes (Next.js App Router)
│       ├── reservations/
│       │   ├── route.ts        # GET (listar) | POST (criar)
│       │   └── [id]/
│       │       └── approve/
│       │           └── route.ts # PATCH (aprovar/reprovar/ajuste)
│       ├── laboratories/
│       │   └── route.ts        # GET (listar com disponibilidade)
│       ├── reagents/
│       │   └── route.ts        # GET (listar) | POST (criar)
│       ├── glassware/
│       │   └── route.ts        # GET | POST
│       ├── equipments/
│       │   └── route.ts        # GET | POST
│       └── approvals/
│           └── daily-panel/
│               └── route.ts    # GET (painel do técnico)
├── lib/
│   ├── prisma.ts               # Singleton do Prisma Client
│   ├── supabase.ts             # Clientes Supabase (public + admin)
│   └── api-response.ts         # Helpers de resposta padronizada
├── middleware/
│   └── auth.ts                 # requireAuth() e requireRole()
└── types/
    └── schemas.ts              # Schemas Zod de validação
prisma/
├── schema.prisma               # Modelo de dados completo
└── seed.ts                     # Dados iniciais para desenvolvimento
```

---

## Endpoints

### Autenticação
Todas as rotas exigem header:
```
Authorization: Bearer <supabase_jwt_token>
```

### Laboratórios
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/laboratories` | Todos | Lista labs. Com `?date=YYYY-MM-DD` retorna disponibilidade. |

### Reservas
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/reservations` | Todos | Docente vê as próprias. Técnico/Admin vê todas. Filtros: `status`, `laboratoryId`, `dateFrom`, `dateTo`. |
| POST | `/api/reservations` | Todos | Cria reserva com validação de estoque e regras de negócio. |
| PATCH | `/api/reservations/[id]/approve` | Técnico / Admin | Aprovar, reprovar ou solicitar ajuste. |

### Insumos
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/reagents` | Todos | Lista reagentes ativos. |
| POST | `/api/reagents` | Técnico / Admin | Cadastra novo reagente. |
| GET | `/api/glassware` | Todos | Lista vidrarias ativas. |
| GET | `/api/equipments` | Todos | Lista equipamentos ativos. |

### Painel do Técnico
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/approvals/daily-panel?date=YYYY-MM-DD` | Técnico / Admin | Reservas aprovadas do dia com totais calculados para montagem da bancada. |

---

## Regras de Negócio Implementadas

| # | Regra |
|---|---|
| RN01 | Máximo 1 reserva de aula por laboratório por turno (constraint `@@unique` no Prisma) |
| RN02 | Antecedência mínima de 2 dias (validado no Zod schema) |
| RN03 | Projetos somente seg/qua/sex no turno da tarde |
| RN04 | Equipamentos não compartilhados entre projetos no mesmo slot |
| RN05 | `totalQty = qtyPerGroup × numberOfGroups` calculado automaticamente |
| RN06 | Justificativa obrigatória para reprovação e solicitação de ajuste |
