# 🏗️ Arquitetura Backend - EduManager com Prisma + Supabase

## 📋 Visão Geral

Este documento descreve como implementar o backend do EduManager usando:
- **Banco de Dados**: Supabase (PostgreSQL gerenciado)
- **ORM**: Prisma
- **Servidor**: Node.js + Express
- **Autenticação**: Supabase Auth + JWT

---

## 🗂️ Estrutura de Pastas Recomendada

```
backend/
├── src/
│   ├── prisma/
│   │   ├── schema.prisma          ← Definição do banco
│   │   └── migrations/            ← Histórico de mudanças
│   ├── routes/
│   │   ├── auth.ts                ← Login, registro, 2FA
│   │   ├── users.ts               ← CRUD de usuários
│   │   ├── reservations.ts        ← CRUD de reservas
│   │   ├── materials.ts           ← CRUD de materiais
│   │   ├── approvals.ts           ← Aprovação de reservas
│   │   ├── reports.ts             ← Relatórios de uso
│   │   └── notifications.ts       ← Notificações
│   ├── middleware/
│   │   ├── auth.ts                ← Verificação de JWT
│   │   ├── errorHandler.ts        ← Tratamento de erros
│   │   └── validation.ts          ← Validação de dados
│   ├── services/
│   │   ├── authService.ts         ← Lógica de autenticação
│   │   ├── userService.ts         ← Lógica de usuários
│   │   ├── reservationService.ts  ← Lógica de reservas
│   │   └── emailService.ts        ← Envio de emails
│   ├── types/
│   │   └── index.ts               ← Tipos TypeScript
│   ├── utils/
│   │   ├── jwt.ts                 ← Geração/validação JWT
│   │   ├── password.ts            ← Hash de senhas
│   │   └── validators.ts          ← Funções de validação
│   └── index.ts                   ← Arquivo principal
├── .env.example                   ← Variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🗄️ Schema Prisma (prisma/schema.prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Usuários
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  senha_hash    String
  nome_completo String
  perfil        String    // "docente", "tecnico", "admin"
  departamento  String?
  materia       String?
  foto_url      String?
  criado_em     DateTime  @default(now())
  atualizado_em DateTime  @updatedAt

  // Relações
  reservas      Reservation[]
  relatorios    Report[]
  notificacoes  Notification[]

  @@map("users")
}

// Laboratórios
model Laboratory {
  id            String    @id @default(cuid())
  nome          String    @unique
  descricao     String?
  capacidade    Int
  criado_em     DateTime  @default(now())

  // Relações
  reservas      Reservation[]
  materiais     Material[]
  tecnicos      TechnicianLaboratory[]

  @@map("laboratories")
}

// Técnicos responsáveis por laboratórios
model TechnicianLaboratory {
  id            String    @id @default(cuid())
  tecnico_id    String
  laboratorio_id String
  criado_em     DateTime  @default(now())

  laboratorio   Laboratory @relation(fields: [laboratorio_id], references: [id])

  @@unique([tecnico_id, laboratorio_id])
  @@map("technician_laboratories")
}

// Materiais/Estoque
model Material {
  id              String    @id @default(cuid())
  nome            String
  categoria       String    // "reagente", "equipamento", "vidraria"
  quantidade      Int
  unidade         String    // "mL", "g", "unidade"
  estoque_minimo  Int
  validade        DateTime?
  lote            String?
  laboratorio_id  String
  criado_em       DateTime  @default(now())
  atualizado_em   DateTime  @updatedAt

  // Relações
  laboratorio     Laboratory @relation(fields: [laboratorio_id], references: [id])
  reservas        ReservationMaterial[]

  @@map("materials")
}

// Reservas de laboratórios
model Reservation {
  id                String    @id @default(cuid())
  docente_id        String
  laboratorio_id    String
  disciplina        String
  data              DateTime
  inicio            String    // "10:00"
  fim               String    // "12:00"
  quantidade_alunos Int
  observacoes       String?
  status            String    @default("pendente") // "pendente", "aprovada", "reprovada"
  motivo_rejeicao   String?
  criado_em         DateTime  @default(now())
  atualizado_em     DateTime  @updatedAt

  // Relações
  docente           User @relation(fields: [docente_id], references: [id])
  laboratorio       Laboratory @relation(fields: [laboratorio_id], references: [id])
  materiais         ReservationMaterial[]
  relatorio         Report?

  @@map("reservations")
}

// Materiais solicitados em uma reserva
model ReservationMaterial {
  id              String    @id @default(cuid())
  reserva_id      String
  material_id     String
  quantidade      Int
  criado_em       DateTime  @default(now())

  reserva         Reservation @relation(fields: [reserva_id], references: [id], onDelete: Cascade)
  material        Material @relation(fields: [material_id], references: [id])

  @@unique([reserva_id, material_id])
  @@map("reservation_materials")
}

// Relatórios de uso
model Report {
  id                String    @id @default(cuid())
  reserva_id        String    @unique
  docente_id        String
  observacoes       String
  materiais_utilizados String
  data_uso          DateTime
  tipo_uso          String    // "Ensino", "Pesquisa"
  residuo           String
  concentracao      String
  assinatura        String
  criado_em         DateTime  @default(now())

  // Relações
  reserva           Reservation @relation(fields: [reserva_id], references: [id], onDelete: Cascade)
  docente           User @relation(fields: [docente_id], references: [id])

  @@map("reports")
}

// Notificações
model Notification {
  id            String    @id @default(cuid())
  usuario_id    String
  tipo          String    // "reserva_aprovada", "relatorio_pendente", etc
  mensagem      String
  lida          Boolean   @default(false)
  criado_em     DateTime  @default(now())

  // Relações
  usuario       User @relation(fields: [usuario_id], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

---

## 🔐 Variáveis de Ambiente (.env)

```bash
# Banco de dados
DATABASE_URL="postgresql://user:password@host:5432/edumanager"

# Supabase
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_ANON_KEY="sua-chave-anonima"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"

# JWT
JWT_SECRET="sua-chave-secreta-muito-segura"
JWT_EXPIRATION="7d"

# Servidor
PORT=3001
NODE_ENV="development"

# Email (para notificações)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASSWORD="sua-senha-app"

# Frontend
FRONTEND_URL="http://localhost:5173"
```

---

## 🚀 Rotas API Principais

### **Autenticação**
```
POST   /api/auth/register          ← Registrar novo usuário
POST   /api/auth/login             ← Login com email/senha
POST   /api/auth/verify-2fa        ← Verificar código 2FA
POST   /api/auth/refresh-token     ← Renovar JWT
POST   /api/auth/logout            ← Logout
```

### **Usuários (Admin)**
```
GET    /api/users                  ← Listar todos os usuários
POST   /api/users                  ← Criar novo usuário
GET    /api/users/:id              ← Obter usuário por ID
PUT    /api/users/:id              ← Atualizar usuário
DELETE /api/users/:id              ← Deletar usuário
```

### **Reservas**
```
GET    /api/reservations           ← Listar reservas
POST   /api/reservations           ← Criar nova reserva
GET    /api/reservations/:id       ← Obter reserva por ID
PUT    /api/reservations/:id       ← Atualizar reserva
DELETE /api/reservations/:id       ← Deletar reserva
```

### **Aprovações (Técnico)**
```
GET    /api/approvals              ← Listar reservas pendentes
PUT    /api/approvals/:id/approve  ← Aprovar reserva
PUT    /api/approvals/:id/reject   ← Rejeitar reserva
```

### **Estoque**
```
GET    /api/materials              ← Listar materiais
POST   /api/materials              ← Adicionar material
PUT    /api/materials/:id          ← Atualizar material
DELETE /api/materials/:id          ← Deletar material
GET    /api/materials/report       ← Gerar relatório em PDF
```

### **Relatórios**
```
GET    /api/reports                ← Listar relatórios
POST   /api/reports                ← Criar novo relatório
GET    /api/reports/:id            ← Obter relatório por ID
```

### **Notificações**
```
GET    /api/notifications          ← Listar notificações do usuário
PUT    /api/notifications/:id/read ← Marcar como lida
DELETE /api/notifications/:id      ← Deletar notificação
```

---

## 💻 Exemplo de Implementação (Express + Prisma)

### **1. Arquivo Principal (src/index.ts)**

```typescript
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import reservationRoutes from './routes/reservations';
import approvalRoutes from './routes/approvals';
import materialRoutes from './routes/materials';
import reportRoutes from './routes/reports';
import notificationRoutes from './routes/notifications';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Rotas públicas
app.use('/api/auth', authRoutes);

// Middleware de autenticação
app.use(authMiddleware);

// Rotas protegidas
app.use('/api/users', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

// Tratamento de erros
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export { app, prisma };
```

### **2. Middleware de Autenticação (src/middleware/auth.ts)**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    perfil: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
};
```

### **3. Rota de Autenticação (src/routes/auth.ts)**

```typescript
import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const router = express.Router();

// Registro
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, senha, nome_completo, perfil, departamento, materia } = req.body;

    // Validar entrada
    if (!email || !senha || !nome_completo) {
      return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
    }

    // Verificar se usuário já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.user.create({
      data: {
        email,
        senha_hash,
        nome_completo,
        perfil: perfil || 'docente',
        departamento,
        materia,
      },
    });

    // Gerar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.status(201).json({
      mensagem: 'Usuário registrado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome_completo: usuario.nome_completo,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const usuario = await prisma.user.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome_completo: usuario.nome_completo,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao fazer login' });
  }
});

export default router;
```

### **4. Rota de Usuários (src/routes/users.ts)**

```typescript
import express, { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = express.Router();

// Listar todos os usuários (apenas admin)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.perfil !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        nome_completo: true,
        perfil: true,
        departamento: true,
        materia: true,
        foto_url: true,
        criado_em: true,
      },
    });

    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
});

// Criar novo usuário (apenas admin)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.perfil !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const { email, senha, nome_completo, perfil, departamento, materia, foto_url } = req.body;

    const usuario = await prisma.user.create({
      data: {
        email,
        senha_hash: await require('bcrypt').hash(senha, 10),
        nome_completo,
        perfil,
        departamento,
        materia,
        foto_url,
      },
    });

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome_completo: usuario.nome_completo,
        perfil: usuario.perfil,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao criar usuário' });
  }
});

export default router;
```

---

## 📦 Package.json

```json
{
  "name": "edumanager-backend",
  "version": "1.0.0",
  "description": "Backend do sistema EduManager",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.0.3",
    "nodemailer": "^6.9.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "typescript": "^5.0.0",
    "tsx": "^3.12.0",
    "prisma": "^5.0.0"
  }
}
```

---

## 🔄 Fluxo de Integração Frontend ↔ Backend

### **1. Autenticação**
```
Frontend: POST /api/auth/login
  ↓
Backend: Valida credenciais, gera JWT
  ↓
Frontend: Armazena token em localStorage
  ↓
Frontend: Envia token em Authorization header
```

### **2. Criar Reserva**
```
Frontend: POST /api/reservations
  ├─ Headers: { Authorization: "Bearer {token}" }
  └─ Body: { laboratorio_id, data, inicio, fim, materiais: [...] }
    ↓
Backend: Valida token, verifica disponibilidade
  ├─ Cria Reservation
  ├─ Cria ReservationMaterial
  └─ Cria Notification
    ↓
Frontend: Atualiza lista de reservas
```

### **3. Aprovar Reserva (Técnico)**
```
Frontend: PUT /api/approvals/{id}/approve
  ├─ Headers: { Authorization: "Bearer {token}" }
  └─ Body: { motivo: "" }
    ↓
Backend: Valida se é técnico
  ├─ Atualiza status para "aprovada"
  ├─ Verifica estoque
  ├─ Cria Notification para docente
  └─ Envia email
    ↓
Frontend: Atualiza status na tela
```

---

## 🚀 Passo a Passo de Implementação

### **Fase 1: Setup Inicial**
1. Criar projeto Node.js com TypeScript
2. Instalar Prisma e configurar Supabase
3. Criar schema Prisma
4. Executar migrations: `npm run prisma:migrate`

### **Fase 2: Autenticação**
1. Implementar rotas de login/registro
2. Gerar JWT
3. Criar middleware de autenticação
4. Testar com Postman

### **Fase 3: CRUD de Dados**
1. Implementar rotas de usuários
2. Implementar rotas de reservas
3. Implementar rotas de materiais
4. Implementar rotas de relatórios

### **Fase 4: Lógica de Negócio**
1. Implementar aprovação de reservas
2. Implementar verificação de estoque
3. Implementar sistema de notificações
4. Implementar envio de emails

### **Fase 5: Integração Frontend**
1. Atualizar serviços do frontend
2. Remover dados mock
3. Conectar a API real
4. Testar fluxos completos

---

## 🔗 Conexão Frontend com Backend

### **Atualizar serviço de API (client/src/lib/api.ts)**

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, senha: string) =>
    api.post('/auth/login', { email, senha }),
  register: (data: any) =>
    api.post('/auth/register', data),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const reservationAPI = {
  getAll: () => api.get('/reservations'),
  create: (data: any) => api.post('/reservations', data),
  update: (id: string, data: any) => api.put(`/reservations/${id}`, data),
  delete: (id: string) => api.delete(`/reservations/${id}`),
};

export default api;
```

---

## ✅ Checklist de Implementação

- [ ] Setup Supabase e PostgreSQL
- [ ] Criar schema Prisma
- [ ] Executar migrations
- [ ] Implementar autenticação (login/registro)
- [ ] Implementar CRUD de usuários
- [ ] Implementar CRUD de reservas
- [ ] Implementar CRUD de materiais
- [ ] Implementar aprovação de reservas
- [ ] Implementar sistema de notificações
- [ ] Implementar envio de emails
- [ ] Implementar relatórios em PDF
- [ ] Conectar frontend com backend
- [ ] Testar fluxos completos
- [ ] Deploy em produção

---

## 📚 Recursos Úteis

- **Prisma Docs**: https://www.prisma.io/docs/
- **Supabase Docs**: https://supabase.com/docs
- **Express Docs**: https://expressjs.com/
- **JWT Docs**: https://jwt.io/

---

## 💡 Dicas Importantes

1. **Segurança**: Sempre valide dados no backend, nunca confie no frontend
2. **Performance**: Use índices no banco de dados para queries frequentes
3. **Logging**: Implemente logging para debug em produção
4. **Testes**: Escreva testes unitários para rotas críticas
5. **Versionamento de API**: Use `/api/v1/` para facilitar futuras mudanças
6. **Rate Limiting**: Implemente rate limiting para proteger contra abuso
7. **CORS**: Configure CORS corretamente para produção

