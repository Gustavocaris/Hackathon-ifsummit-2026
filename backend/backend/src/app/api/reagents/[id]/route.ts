// src/app/api/reagents/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth, exigirPerfil } from '@/middleware/auth';
import { ok, badRequest, notFound, serverError } from '@/lib/api-response';
import { AtualizarEstoqueSchema } from '@/types/schemas';

// GET /api/reagents/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const reagente = await prisma.reagent.findUnique({ where: { id: params.id } });
    if (!reagente) return notFound('Reagente não encontrado.');
    return ok(reagente);
  } catch (err) {
    console.error('[GET /reagents/:id]', err);
    return serverError();
  }
}

// PATCH /api/reagents/[id] — apenas TECNICO e ADMIN
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
    const reagente = await prisma.reagent.findUnique({ where: { id: params.id } });
    if (!reagente) return notFound('Reagente não encontrado.');

    const atualizado = await prisma.reagent.update({
      where: { id: params.id },
      data:  { estoqueQtd: parsed.data.estoqueQtd },
    });

    return ok(atualizado);
  } catch (err) {
    console.error('[PATCH /reagents/:id]', err);
    return serverError();
  }
}
