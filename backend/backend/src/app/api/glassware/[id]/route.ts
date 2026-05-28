// src/app/api/glassware/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth, exigirPerfil } from '@/middleware/auth';
import { ok, badRequest, notFound, serverError } from '@/lib/api-response';
import { AtualizarEstoqueSchema } from '@/types/schemas';

// GET /api/glassware/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const vidraria = await prisma.glassware.findUnique({ where: { id: params.id } });
    if (!vidraria) return notFound('Vidraria não encontrada.');
    return ok(vidraria);
  } catch (err) {
    console.error('[GET /glassware/:id]', err);
    return serverError();
  }
}

// PATCH /api/glassware/[id] — apenas TECNICO e ADMIN
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { erro } = await exigirPerfil(request, ['TECNICO', 'ADMIN']);
  if (erro) return erro;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const parsed = AtualizarEstoqueSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Dados inválidos.', parsed.error.flatten());
  }

  try {
    const vidraria = await prisma.glassware.findUnique({ where: { id: params.id } });
    if (!vidraria) return notFound('Vidraria não encontrada.');

    const atualizada = await prisma.glassware.update({
      where: { id: params.id },
      data:  { estoqueQtd: parsed.data.estoqueQtd },
    });

    return ok(atualizada);
  } catch (err) {
    console.error('[PATCH /glassware/:id]', err);
    return serverError();
  }
}
