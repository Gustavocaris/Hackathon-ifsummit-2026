// src/app/api/laboratories/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth } from '@/middleware/auth';
import { ok, serverError } from '@/lib/api-response';

// GET /api/laboratories
// Retorna laboratórios ativos com campo status compatível com o frontend
export async function GET(request: NextRequest) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data'); // YYYY-MM-DD

  try {
    const laboratorios = await prisma.laboratory.findMany({
      where: { ativo: true },
      include: data
        ? {
            reservas: {
              where: {
                data: new Date(data),
                status: { notIn: ['REPROVADA', 'CANCELADA'] },
              },
              select: { turno: true, tipo: true, nomePratica: true, status: true },
            },
          }
        : undefined,
      orderBy: { nome: 'asc' },
    });

    // Mapeia para o formato esperado pelo frontend
    const resultado = laboratorios.map((lab) => ({
      id:        lab.id,
      nome:      lab.nome,
      capacidade: lab.capacidade,
      descricao: lab.descricao ?? undefined,
      status:    'disponivel' as const,
      // Mantém campos extras para compatibilidade com outras partes do backend
      tipo:      lab.tipo,
      ativo:     lab.ativo,
      ...(data ? { reservas: (lab as any).reservas } : {}),
    }));

    return ok(resultado);
  } catch (err) {
    console.error('[GET /laboratories]', err);
    return serverError();
  }
}
