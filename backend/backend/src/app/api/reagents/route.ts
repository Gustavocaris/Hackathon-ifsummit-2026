// src/app/api/reagents/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth, exigirPerfil } from '@/middleware/auth';
import { ok, created, badRequest, serverError } from '@/lib/api-response';
import { CriarReagenteSchema } from '@/types/schemas';

// GET /api/reagents
export async function GET(request: NextRequest) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const reagentes = await prisma.reagent.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
    });
    return ok(reagentes);
  } catch (err) {
    console.error('[GET /reagents]', err);
    return serverError();
  }
}

// POST /api/reagents — apenas TECNICO e ADMIN
export async function POST(request: NextRequest) {
  const { erro } = await exigirPerfil(request, ['TECNICO', 'ADMIN']);
  if (erro) return erro;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const parsed = CriarReagenteSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Dados inválidos.', parsed.error.flatten());
  }

  try {
    const reagente = await prisma.reagent.create({ data: parsed.data });
    return created(reagente);
  } catch (err) {
    console.error('[POST /reagents]', err);
    return serverError();
  }
}
