// src/app/api/equipment/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth, exigirPerfil } from '@/middleware/auth';
import { ok, badRequest, notFound, serverError } from '@/lib/api-response';
import { AtualizarEstoqueSchema } from '@/types/schemas';

// GET /api/equipment/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const equipamento = await prisma.equipment.findUnique({ where: { id: params.id } });
    if (!equipamento) return notFound('Equipamento não encontrado.');
    return ok(equipamento);
  } catch (err) {
    console.error('[GET /equipment/:id]', err);
    return serverError();
  }
}

// PATCH /api/equipment/[id] — apenas TECNICO e ADMIN
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
    const equipamento = await prisma.equipment.findUnique({ where: { id: params.id } });
    if (!equipamento) return notFound('Equipamento não encontrado.');

    const atualizado = await prisma.equipment.update({
      where: { id: params.id },
      data:  { estoqueQtd: parsed.data.estoqueQtd },
    });

    return ok(atualizado);
  } catch (err) {
    console.error('[PATCH /equipment/:id]', err);
    return serverError();
  }
}
