// src/app/api/equipment/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth, exigirPerfil } from '@/middleware/auth';
import { ok, created, badRequest, serverError } from '@/lib/api-response';
import { CriarEquipamentoSchema } from '@/types/schemas';

// GET /api/equipment
export async function GET(request: NextRequest) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const equipamentos = await prisma.equipment.findMany({
      where:   { ativo: true },
      orderBy: { nome: 'asc' },
    });
    return ok(equipamentos);
  } catch (err) {
    console.error('[GET /equipment]', err);
    return serverError();
  }
}

// POST /api/equipment — apenas TECNICO e ADMIN
export async function POST(request: NextRequest) {
  const { erro } = await exigirPerfil(request, ['TECNICO', 'ADMIN']);
  if (erro) return erro;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const parsed = CriarEquipamentoSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Dados inválidos.', parsed.error.flatten());
  }

  try {
    const equipamento = await prisma.equipment.create({ data: parsed.data });
    return created(equipamento);
  } catch (err) {
    console.error('[POST /equipment]', err);
    return serverError();
  }
}
