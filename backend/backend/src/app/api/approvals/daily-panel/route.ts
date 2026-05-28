// src/app/api/approvals/daily-panel/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirPerfil } from '@/middleware/auth';
import { ok, badRequest, serverError } from '@/lib/api-response';

// GET /api/approvals/daily-panel?data=YYYY-MM-DD
// Retorna todas as reservas aprovadas do dia com detalhes de montagem
export async function GET(request: NextRequest) {
  const { erro } = await exigirPerfil(request, ['TECNICO', 'ADMIN']);
  if (erro) return erro;

  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data');

  if (!data) return badRequest('Parâmetro "data" é obrigatório (YYYY-MM-DD).');

  try {
    const reservas = await prisma.reservation.findMany({
      where: {
        data:   new Date(data),
        status: 'APROVADA',
      },
      include: {
        laboratorio: { select: { id: true, nome: true, tipo: true } },
        criadoPor:   { select: { nome: true, email: true } },
        grupos:      true,
        reagentes: {
          include: {
            reagente: {
              select: {
                id:          true,
                nome:        true,
                concentracao: true,
                unidade:     true,
                classePerigo: true,
                tipoResiduo: true,
              },
            },
          },
        },
        vidrarias: {
          include: {
            vidraria: { select: { id: true, nome: true, tipo: true, unidade: true } },
          },
        },
        equipamentos: {
          include: {
            equipamento: { select: { id: true, nome: true } },
          },
        },
      },
      orderBy: [{ turno: 'asc' }, { laboratorio: { nome: 'asc' } }],
    });

    const painel = reservas.map((r) => ({
      reservaId:      r.id,
      laboratorio:    r.laboratorio.nome,
      turno:          r.turno,
      nomePratica:    r.nomePratica,
      disciplina:     r.disciplina,
      turma:          r.turma,
      docente:        r.criadoPor.nome,
      grupos:         r.grupos,
      totalAlunos:    r.grupos.reduce((soma, g) => soma + g.quantidadeAlunos, 0),
      totalGrupos:    r.grupos.length,
      reagentes:      r.reagentes.map((rr) => ({
        nome:        rr.reagente.nome,
        concentracao: rr.reagente.concentracao,
        unidade:     rr.reagente.unidade,
        qtdPorGrupo: rr.qtdPorGrupo,
        qtdTotal:    rr.qtdTotal,
        classePerigo: rr.reagente.classePerigo,
        tipoResiduo: rr.reagente.tipoResiduo,
      })),
      vidrarias:      r.vidrarias.map((vv) => ({
        nome:        vv.vidraria.nome,
        tipo:        vv.vidraria.tipo,
        unidade:     vv.vidraria.unidade,
        qtdPorGrupo: vv.qtdPorGrupo,
        qtdTotal:    vv.qtdTotal,
      })),
      equipamentos:   r.equipamentos.map((ee) => ({
        nome:       ee.equipamento.nome,
        quantidade: ee.quantidade,
        observacao: ee.observacao,
      })),
    }));

    return ok(painel);
  } catch (err) {
    console.error('[GET /approvals/daily-panel]', err);
    return serverError();
  }
}
