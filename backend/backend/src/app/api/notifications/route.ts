// src/app/api/notifications/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth } from '@/middleware/auth';
import { ok, created, badRequest, serverError } from '@/lib/api-response';

// GET /api/notifications
// Retorna notificações do usuário autenticado, ordenadas por data decrescente
export async function GET(request: NextRequest) {
  const { usuario, erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const notificacoes = await prisma.notification.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { criadoEm: 'desc' },
    });

    const resultado = notificacoes.map((n) => ({
      id:           n.id,
      usuario_id:   n.usuarioId,
      mensagem:     n.mensagem,
      tipo:         n.tipo,
      lida:         n.lida,
      data_criacao: n.criadoEm.toISOString(),
      referencia_id: n.referenciaId ?? undefined,
    }));

    return ok(resultado);
  } catch (err) {
    console.error('[GET /notifications]', err);
    return serverError();
  }
}

// POST /api/notifications
// Body: { mensagem, tipo, referencia_id? }
export async function POST(request: NextRequest) {
  const { usuario, erro } = await exigirAuth(request);
  if (erro) return erro;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const { mensagem, tipo, referencia_id, usuario_id } = body as {
    mensagem?: string;
    tipo?: string;
    referencia_id?: string;
    usuario_id?: string;
  };

  if (!mensagem || !tipo) {
    return badRequest('mensagem e tipo são obrigatórios.');
  }

  try {
    const notificacao = await prisma.notification.create({
      data: {
        usuarioId:   usuario_id ?? usuario.id,
        mensagem,
        tipo,
        referenciaId: referencia_id ?? null,
      },
    });

    return created({
      id:           notificacao.id,
      usuario_id:   notificacao.usuarioId,
      mensagem:     notificacao.mensagem,
      tipo:         notificacao.tipo,
      lida:         notificacao.lida,
      data_criacao: notificacao.criadoEm.toISOString(),
      referencia_id: notificacao.referenciaId ?? undefined,
    });
  } catch (err) {
    console.error('[POST /notifications]', err);
    return serverError();
  }
}
