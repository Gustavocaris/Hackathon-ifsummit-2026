// prisma/seed-users.ts
// Cria usuários no Supabase Auth + registros locais para testes
// Uso: npm run db:seed-users

import { PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

// ── Usuários de teste ──────────────────────────────────────────────────────────
const USUARIOS = [
  {
    nome:    'Prof. João Silva',
    email:   'docente@ifpr.edu.br',
    senha:   'Ifslot@2025',
    perfil:  Role.DOCENTE,
  },
  {
    nome:    'Maria Santos',
    email:   'tecnico@ifpr.edu.br',
    senha:   'Ifslot@2025',
    perfil:  Role.TECNICO,
  },
  {
    nome:    'Admin IFSlot',
    email:   'admin@ifpr.edu.br',
    senha:   'Ifslot@2025',
    perfil:  Role.ADMIN,
  },
] as const;

// ── Helper: cria ou busca usuário no Supabase Auth ─────────────────────────────
async function upsertAuthUser(email: string, senha: string): Promise<string> {
  // Tenta criar
  const { data: created, error: errCreate } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,   // pula confirmação de e-mail
    });

  if (!errCreate && created.user) {
    return created.user.id;
  }

  // Já existe — busca pelo e-mail
  if (errCreate?.message?.includes('already')) {
    const { data: list } = await supabaseAdmin.auth.admin.listUsers();
    const found = list?.users.find(u => u.email === email);
    if (found) return found.id;
  }

  throw new Error(`Erro ao criar usuário ${email}: ${errCreate?.message}`);
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log('👤 Criando usuários de teste...\n');

  for (const u of USUARIOS) {
    process.stdout.write(`  → ${u.email} (${u.perfil})... `);

    const supabaseId = await upsertAuthUser(u.email, u.senha);

    // Atualiza registro existente (pode ter supabaseId falso do seed anterior)
    await prisma.user.upsert({
      where:  { email: u.email },
      update: { supabaseId, nome: u.nome, perfil: u.perfil },
      create: { supabaseId, email: u.email, nome: u.nome, perfil: u.perfil },
    });

    console.log('✅');
  }

  console.log('\n✨ Usuários prontos!\n');
  console.log('┌─────────────────────────────┬──────────────────────┬─────────────┐');
  console.log('│ Nome                        │ E-mail               │ Perfil      │');
  console.log('├─────────────────────────────┼──────────────────────┼─────────────┤');
  for (const u of USUARIOS) {
    const nome   = u.nome.padEnd(27);
    const email  = u.email.padEnd(20);
    const perfil = u.perfil.padEnd(11);
    console.log(`│ ${nome} │ ${email} │ ${perfil} │`);
  }
  console.log('└─────────────────────────────┴──────────────────────┴─────────────┘');
  console.log('\n🔑 Senha de todos: Ifslot@2025');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
