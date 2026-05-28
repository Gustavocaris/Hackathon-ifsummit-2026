// src/app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, badRequest, conflict, serverError, unauthorized } from '@/lib/api-response';
import { RegistrarUsuarioSchema } from '@/types/schemas';

// POST /api/auth/register
// Sincroniza o usuário do Supabase Auth com a tabela local users.
// Deve ser chamado imediatamente após o signup no cliente.
export async function POST(request: NextRequest) {
  const cabecalhoAuth = request.headers.get('authorization');
  if (!cabecalhoAuth?.startsWith('Bearer ')) {
    return unauthorized('Token de autenticação ausente.');
  }

  const token = cabecalhoAuth.replace('Bearer ', '');
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return unauthorized('Token inválido ou expirado.');
  }

  const supabaseUser = data.user;
  const email = supabaseUser.email;

  if (!email) {
    return badRequest('Conta Supabase sem e-mail associado.');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const parsed = RegistrarUsuarioSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Dados inválidos.', parsed.error.flatten());
  }

  const jaExiste = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });

  if (jaExiste) {
    return conflict('Usuário já registrado no sistema.');
  }

  try {
    const usuario = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        email,
        nome:   parsed.data.nome,
        perfil: parsed.data.perfil as 'DOCENTE' | 'TECNICO' | 'ADMIN',
      },
      select: {
        id: true, nome: true, email: true, perfil: true, criadoEm: true,
      },
    });

    return ok(usuario, 201);
  } catch (err) {
    console.error('[POST /auth/register]', err);
    return serverError();
  }
}
