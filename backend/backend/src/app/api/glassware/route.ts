// src/app/api/glassware/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth, exigirPerfil } from '@/middleware/auth';
import { ok, created, badRequest, serverError } from '@/lib/api-response';
import { CriarVidriariaSchema } from '@/types/schemas';

// GET /api/glassware
export async function GET(request: NextRequest) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const vidrarias = await prisma.glassware.findMany({
      where:   { ativo: true },
      orderBy: { nome: 'asc' },
    });
    return ok(vidrarias);
  } catch (err) {
    console.error('[GET /glassware]', err);
    return serverError();
  }
}

// POST /api/glassware — apenas TECNICO e ADMIN
export async function POST(request: NextRequest) {
  const { erro } = await exigirPerfil(request, ['TECNICO', 'ADMIN']);
  if (erro) return erro;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const parsed = CriarVidriariaSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest('Dados inválidos.', parsed.error.flatten());
  }

  try {
    const vidraria = await prisma.glassware.create({ data: parsed.data });
    return created(vidraria);
  } catch (err) {
    console.error('[POST /glassware]', err);
    return serverError();
  }
}
