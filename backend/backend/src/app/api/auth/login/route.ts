// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase';
import { ok, badRequest, unauthorized, serverError } from '@/lib/api-response';

function perfilParaMinusculas(perfil: string): 'docente' | 'tecnico' | 'admin' {
  const map: Record<string, 'docente' | 'tecnico' | 'admin'> = {
    DOCENTE: 'docente',
    TECNICO: 'tecnico',
    ADMIN:   'admin',
  };
  return map[perfil] ?? 'docente';
}

// POST /api/auth/login
// Body: { email: string, senha: string }
// Returns: { success: true, data: { token: string, user: { id, nome, email, perfil } } }
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const { email, senha } = body as { email?: string; senha?: string };

  if (!email || !senha) {
    return badRequest('Email e senha são obrigatórios.');
  }

  // Autentica via Supabase
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password: senha,
  });

  if (error || !data.user || !data.session) {
    return unauthorized('Email ou senha inválidos.');
  }

  // Busca usuário local
  const usuarioLocal = await prisma.user.findUnique({
    where: { supabaseId: data.user.id },
  });

  if (!usuarioLocal) {
    return unauthorized('Usuário não cadastrado no sistema.');
  }

  try {
    return ok({
      token: data.session.access_token,
      user: {
        id:     usuarioLocal.id,
        nome:   usuarioLocal.nome,
        email:  usuarioLocal.email,
        perfil: perfilParaMinusculas(usuarioLocal.perfil),
      },
    });
  } catch (err) {
    console.error('[POST /auth/login]', err);
    return serverError();
  }
}
