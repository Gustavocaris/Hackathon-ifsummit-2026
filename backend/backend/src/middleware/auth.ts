// src/middleware/auth.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { unauthorized, forbidden } from '@/lib/api-response';
import { Role } from '@prisma/client';

export type UsuarioAutenticado = {
  id: string;
  supabaseId: string;
  email: string;
  nome: string;
  perfil: Role;
};

/**
 * Valida o Bearer token JWT do Supabase e retorna o usuário local.
 * Uso: const { usuario, erro } = await exigirAuth(request);
 */
export async function exigirAuth(
  request: NextRequest
): Promise<{ usuario: UsuarioAutenticado; erro: null } | { usuario: null; erro: ReturnType<typeof unauthorized> }> {
  const cabecalhoAuth = request.headers.get('authorization');

  if (!cabecalhoAuth || !cabecalhoAuth.startsWith('Bearer ')) {
    return { usuario: null, erro: unauthorized('Token de autenticação ausente.') };
  }

  const token = cabecalhoAuth.replace('Bearer ', '');

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return { usuario: null, erro: unauthorized('Token inválido ou expirado.') };
  }

  const usuarioLocal = await prisma.user.findUnique({
    where: { supabaseId: data.user.id },
  });

  if (!usuarioLocal) {
    return { usuario: null, erro: unauthorized('Usuário não cadastrado no sistema.') };
  }

  return {
    usuario: {
      id:        usuarioLocal.id,
      supabaseId: usuarioLocal.supabaseId,
      email:     usuarioLocal.email,
      nome:      usuarioLocal.nome,
      perfil:    usuarioLocal.perfil,
    },
    erro: null,
  };
}

/**
 * Valida a autenticação E exige um ou mais perfis específicos.
 * Uso: const { usuario, erro } = await exigirPerfil(request, ['TECNICO', 'ADMIN']);
 */
export async function exigirPerfil(
  request: NextRequest,
  perfis: Role[]
): Promise<{ usuario: UsuarioAutenticado; erro: null } | { usuario: null; erro: ReturnType<typeof unauthorized | typeof forbidden> }> {
  const resultado = await exigirAuth(request);

  if (resultado.erro) return resultado;

  if (!perfis.includes(resultado.usuario.perfil)) {
    return {
      usuario: null,
      erro: forbidden(`Acesso restrito a: ${perfis.join(', ')}.`),
    };
  }

  return resultado;
}
