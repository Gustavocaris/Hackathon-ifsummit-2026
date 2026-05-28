// src/app/api/materials/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth } from '@/middleware/auth';
import { ok, created, badRequest, serverError } from '@/lib/api-response';

type Categoria = 'reagente' | 'equipamento' | 'vidraria';

function mapReagente(r: {
  id: string; nome: string; unidade: string; estoqueQtd: number;
  concentracao?: string | null; classePerigo?: string | null; ativo: boolean;
}) {
  return {
    id:              r.id,
    nome:            r.nome,
    quantidade:      r.estoqueQtd,
    unidade:         r.unidade,
    estoque_minimo:  0,
    categoria:       'reagente' as Categoria,
  };
}

function mapVidraria(v: {
  id: string; nome: string; unidade: string; estoqueQtd: number; ativo: boolean;
}) {
  return {
    id:             v.id,
    nome:           v.nome,
    quantidade:     v.estoqueQtd,
    unidade:        v.unidade,
    estoque_minimo: 0,
    categoria:      'vidraria' as Categoria,
  };
}

function mapEquipamento(e: {
  id: string; nome: string; estoqueQtd: number; ativo: boolean;
}) {
  return {
    id:             e.id,
    nome:           e.nome,
    quantidade:     e.estoqueQtd,
    unidade:        'unidade',
    estoque_minimo: 0,
    categoria:      'equipamento' as Categoria,
  };
}

// GET /api/materials
// Retorna todos os reagentes, vidrarias e equipamentos unificados
export async function GET(request: NextRequest) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const [reagentes, vidrarias, equipamentos] = await Promise.all([
      prisma.reagent.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      prisma.glassware.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
      prisma.equipment.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
    ]);

    const materiais = [
      ...reagentes.map(mapReagente),
      ...vidrarias.map(mapVidraria),
      ...equipamentos.map(mapEquipamento),
    ];

    return ok(materiais);
  } catch (err) {
    console.error('[GET /materials]', err);
    return serverError();
  }
}

// POST /api/materials
// Body: { nome, quantidade, unidade, validade?, lote?, estoque_minimo, categoria }
export async function POST(request: NextRequest) {
  const { erro } = await exigirAuth(request);
  if (erro) return erro;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const { nome, quantidade, unidade, categoria } = body as {
    nome?: string;
    quantidade?: number;
    unidade?: string;
    categoria?: string;
  };

  if (!nome || !categoria) {
    return badRequest('Nome e categoria são obrigatórios.');
  }

  try {
    if (categoria === 'reagente') {
      const reagente = await prisma.reagent.create({
        data: {
          nome,
          unidade:    unidade ?? 'mL',
          estoqueQtd: quantidade ?? 0,
          tipoResiduo: 'OSCILANTE',
        },
      });
      return created(mapReagente(reagente));
    }

    if (categoria === 'vidraria') {
      const vidraria = await prisma.glassware.create({
        data: {
          nome,
          tipo:       'geral',
          unidade:    unidade ?? 'unidade',
          estoqueQtd: quantidade ?? 0,
        },
      });
      return created(mapVidraria(vidraria));
    }

    if (categoria === 'equipamento') {
      const equipamento = await prisma.equipment.create({
        data: {
          nome,
          estoqueQtd: quantidade ?? 0,
        },
      });
      return created(mapEquipamento(equipamento));
    }

    return badRequest('Categoria inválida. Use: reagente, vidraria ou equipamento.');
  } catch (err) {
    console.error('[POST /materials]', err);
    return serverError();
  }
}
