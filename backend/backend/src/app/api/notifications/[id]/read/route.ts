// src/app/api/notifications/[id]/read/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth } from '@/middleware/auth';
import { ok, notFound, forbidden, serverError } from '@/lib/api-response';

// PATCH /api/notifications/[id]/read
// Marca notificação como lida
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { usuario, erro } = await exigirAuth(request);
  if (erro) return erro;

  const notificacao = await prisma.notification.findUnique({
    where: { id: params.id },
  });

  if (!notificacao) return notFound('Notificação não encontrada.');

  // Só o dono pode marcar como lida
  if (notificacao.usuarioId !== usuario.id) {
    return forbidden('Acesso negado.');
  }

  try {
    const atualizada = await prisma.notification.update({
      where: { id: params.id },
      data:  { lida: true },
    });

    return ok({
      id:           atualizada.id,
      usuario_id:   atualizada.usuarioId,
      mensagem:     atualizada.mensagem,
      tipo:         atualizada.tipo,
      lida:         atualizada.lida,
      data_criacao: atualizada.criadoEm.toISOString(),
      referencia_id: atualizada.referenciaId ?? undefined,
    });
  } catch (err) {
    console.error('[PATCH /notifications/:id/read]', err);
    return serverError();
  }
}
