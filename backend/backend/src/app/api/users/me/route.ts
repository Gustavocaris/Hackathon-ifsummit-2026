// src/app/api/users/me/route.ts
import { NextRequest } from 'next/server';
import { exigirAuth } from '@/middleware/auth';
import { ok } from '@/lib/api-response';

// GET /api/users/me
export async function GET(request: NextRequest) {
  const { usuario, erro } = await exigirAuth(request);
  if (erro) return erro;

  return ok({
    id:        usuario.id,
    supabaseId: usuario.supabaseId,
    nome:      usuario.nome,
    email:     usuario.email,
    perfil:    usuario.perfil,
  });
}
