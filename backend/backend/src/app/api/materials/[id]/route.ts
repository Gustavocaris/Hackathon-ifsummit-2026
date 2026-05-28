// src/app/api/materials/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth } from '@/middleware/auth';
import { ok, noContent, badRequest, notFound, serverError } from '@/lib/api-response';

async function encontrarMaterial(id: string) {
  const reagente = await prisma.reagent.findUnique({ where: { id } });
  if (reagente) return { tipo: 'reagente' as const, item: reagente };

  const vidraria = await prisma.glassware.findUnique({ where: { id } });
  if (vidraria) return { tipo: 'vidraria' as const, item: vidraria };

  const equipamento = await prisma.equipment.findUnique({ where: { id } });
  if (equipamento) return { tipo: 'equipamento' as const, item: equipamento };

  return null;
}

// PATCH /api/materials/[id]
// Body: { quantidade?: number, nome?: string, unidade?: string }
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const { quantidade, nome, unidade } = body as {
    quantidade?: number;
    nome?: string;
    unidade?: string;
  };

  const encontrado = await encontrarMaterial(params.id);
  if (!encontrado) return notFound('Material não encontrado.');

  try {
    if (encontrado.tipo === 'reagente') {
      const atualizado = await prisma.reagent.update({
        where: { id: params.id },
        data: {
          ...(quantidade !== undefined ? { estoqueQtd: quantidade } : {}),
          ...(nome ? { nome } : {}),
          ...(unidade ? { unidade } : {}),
        },
      });
      return ok({ id: atualizado.id, nome: atualizado.nome, quantidade: atualizado.estoqueQtd, unidade: atualizado.unidade, categoria: 'reagente' });
    }

    if (encontrado.tipo === 'vidraria') {
      const atualizado = await prisma.glassware.update({
        where: { id: params.id },
        data: {
          ...(quantidade !== undefined ? { estoqueQtd: quantidade } : {}),
          ...(nome ? { nome } : {}),
          ...(unidade ? { unidade } : {}),
        },
      });
      return ok({ id: atualizado.id, nome: atualizado.nome, quantidade: atualizado.estoqueQtd, unidade: atualizado.unidade, categoria: 'vidraria' });
    }

    if (encontrado.tipo === 'equipamento') {
      const atualizado = await prisma.equipment.update({
        where: { id: params.id },
        data: {
          ...(quantidade !== undefined ? { estoqueQtd: quantidade } : {}),
          ...(nome ? { nome } : {}),
        },
      });
      return ok({ id: atualizado.id, nome: atualizado.nome, quantidade: atualizado.estoqueQtd, unidade: 'unidade', categoria: 'equipamento' });
    }

    return notFound('Material não encontrado.');
  } catch (err) {
    console.error('[PATCH /materials/:id]', err);
    return serverError();
  }
}

// DELETE /api/materials/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  const encontrado = await encontrarMaterial(params.id);
  if (!encontrado) return notFound('Material não encontrado.');

  try {
    if (encontrado.tipo === 'reagente') {
      await prisma.reagent.update({ where: { id: params.id }, data: { ativo: false } });
    } else if (encontrado.tipo === 'vidraria') {
      await prisma.glassware.update({ where: { id: params.id }, data: { ativo: false } });
    } else if (encontrado.tipo === 'equipamento') {
      await prisma.equipment.update({ where: { id: params.id }, data: { ativo: false } });
    }

    return noContent();
  } catch (err) {
    console.error('[DELETE /materials/:id]', err);
    return serverError();
  }
}
