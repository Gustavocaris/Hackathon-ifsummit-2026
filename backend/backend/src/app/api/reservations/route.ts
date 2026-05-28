// src/app/api/reservations/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth } from '@/middleware/auth';
import { ok, created, badRequest, conflict, serverError } from '@/lib/api-response';
import { ReservationStatus, Role, Shift } from '@prisma/client';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

type FrontendStatus = 'pendente' | 'aprovada' | 'reprovada' | 'ajuste_solicitado' | 'cancelada';

function backendStatusParaFrontend(status: ReservationStatus): FrontendStatus {
  const map: Record<ReservationStatus, FrontendStatus> = {
    PENDENTE:   'pendente',
    APROVADA:   'aprovada',
    REPROVADA:  'reprovada',
    EM_REVISAO: 'ajuste_solicitado',
    CANCELADA:  'cancelada',
  };
  return map[status] ?? 'pendente';
}

function perfilParaMinusculas(perfil: string): 'docente' | 'tecnico' | 'admin' {
  const map: Record<string, 'docente' | 'tecnico' | 'admin'> = {
    DOCENTE: 'docente',
    TECNICO: 'tecnico',
    ADMIN:   'admin',
  };
  return map[perfil] ?? 'docente';
}

function turnoParaHorarios(turno: Shift): { inicio: string; fim: string } {
  if (turno === 'MANHA') return { inicio: '08:00', fim: '12:00' };
  return { inicio: '13:00', fim: '17:00' };
}

function horarioParaTurno(inicio: string): Shift {
  const [hStr] = inicio.split(':');
  const hora = parseInt(hStr, 10);
  return hora < 12 ? 'MANHA' : 'TARDE';
}

function mapReservaParaFrontend(reserva: any) {
  const horarios = turnoParaHorarios(reserva.turno);
  const inicioPersistido = reserva.inicio ?? horarios.inicio;
  const fimPersistido    = reserva.fim    ?? horarios.fim;

  const quantidadeAlunos = reserva.grupos
    ? reserva.grupos.reduce((acc: number, g: any) => acc + (g.quantidadeAlunos ?? 0), 0)
    : 0;

  const materiais: any[] = [];

  if (reserva.reagentes) {
    for (const r of reserva.reagentes) {
      materiais.push({
        material_id: r.reagenteId ?? r.reagente?.id,
        material:    r.reagente?.nome ?? '',
        quantidade:  r.qtdTotal ?? r.qtdPorGrupo,
        disponivel:  true,
      });
    }
  }
  if (reserva.vidrarias) {
    for (const v of reserva.vidrarias) {
      materiais.push({
        material_id: v.vidriariaId ?? v.vidraria?.id,
        material:    v.vidraria?.nome ?? '',
        quantidade:  v.qtdTotal ?? v.qtdPorGrupo,
        disponivel:  true,
      });
    }
  }
  if (reserva.equipamentos) {
    for (const e of reserva.equipamentos) {
      materiais.push({
        material_id: e.equipamentoId ?? e.equipamento?.id,
        material:    e.equipamento?.nome ?? '',
        quantidade:  e.quantidade ?? 1,
        disponivel:  true,
      });
    }
  }

  return {
    id:               reserva.id,
    laboratorio_id:   reserva.laboratorioId,
    laboratorio:      reserva.laboratorio
      ? { id: reserva.laboratorio.id, nome: reserva.laboratorio.nome }
      : undefined,
    docente_id:       reserva.criadoPorId,
    docente:          reserva.criadoPor
      ? {
          id:     reserva.criadoPor.id,
          nome:   reserva.criadoPor.nome,
          email:  reserva.criadoPor.email,
          perfil: reserva.criadoPor.perfil ? perfilParaMinusculas(reserva.criadoPor.perfil) : undefined,
        }
      : undefined,
    data:             reserva.data instanceof Date
      ? reserva.data.toISOString().split('T')[0]
      : String(reserva.data).split('T')[0],
    inicio:           inicioPersistido,
    fim:              fimPersistido,
    disciplina:       reserva.disciplina,
    turma:            reserva.turma,
    quantidade_alunos: quantidadeAlunos,
    status:           backendStatusParaFrontend(reserva.status),
    observacoes:      reserva.observacoes ?? reserva.justificativa ?? undefined,
    materiais,
    data_criacao:     reserva.criadoEm instanceof Date
      ? reserva.criadoEm.toISOString()
      : String(reserva.criadoEm),
  };
}

// ─────────────────────────────────────────────
// GET /api/reservations
// ─────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { usuario, erro } = await exigirAuth(request);
  if (erro) return erro;

  const { searchParams } = new URL(request.url);
  const statusParam    = searchParams.get('status');
  const laboratorioId  = searchParams.get('laboratorioId');
  const dataInicio     = searchParams.get('dataInicio');
  const dataFim        = searchParams.get('dataFim');

  // Suporta status frontend ou backend
  const frontendParaBackend: Record<string, ReservationStatus> = {
    pendente:          'PENDENTE',
    aprovada:          'APROVADA',
    reprovada:         'REPROVADA',
    ajuste_solicitado: 'EM_REVISAO',
    cancelada:         'CANCELADA',
  };

  const statusBackend = statusParam
    ? (frontendParaBackend[statusParam] ?? statusParam as ReservationStatus)
    : null;

  try {
    const reservas = await prisma.reservation.findMany({
      where: {
        ...(usuario.perfil === Role.DOCENTE ? { criadoPorId: usuario.id } : {}),
        ...(statusBackend ? { status: statusBackend } : {}),
        ...(laboratorioId ? { laboratorioId } : {}),
        ...(dataInicio || dataFim
          ? {
              data: {
                ...(dataInicio ? { gte: new Date(dataInicio) } : {}),
                ...(dataFim    ? { lte: new Date(dataFim) }    : {}),
              },
            }
          : {}),
      },
      include: {
        laboratorio:  { select: { id: true, nome: true, tipo: true } },
        criadoPor:    { select: { id: true, nome: true, email: true, perfil: true } },
        revisadoPor:  { select: { id: true, nome: true } },
        grupos:       true,
        reagentes:    { include: { reagente: true } },
        vidrarias:    { include: { vidraria: true } },
        equipamentos: { include: { equipamento: true } },
      },
      orderBy: { data: 'asc' },
    });

    return ok(reservas.map(mapReservaParaFrontend));
  } catch (err) {
    console.error('[GET /reservations]', err);
    return serverError();
  }
}

// ─────────────────────────────────────────────
// POST /api/reservations
// Aceita formato frontend
// ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { usuario, erro } = await exigirAuth(request);
  if (erro) return erro;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const {
    laboratorio_id,
    data,
    inicio,
    fim,
    disciplina,
    turma,
    quantidade_alunos,
    observacoes,
    materiais,
  } = body as {
    laboratorio_id?: string;
    data?: string;
    inicio?: string;
    fim?: string;
    disciplina?: string;
    turma?: string;
    quantidade_alunos?: number;
    observacoes?: string;
    materiais?: Array<{ material_id: string; quantidade: number }>;
  };

  if (!laboratorio_id || !data || !disciplina || !turma) {
    return badRequest('laboratorio_id, data, disciplina e turma são obrigatórios.');
  }

  const turno: Shift = inicio ? horarioParaTurno(inicio) : 'MANHA';

  // Resolve materiais: descobre qual tabela tem cada material_id
  type ReagenteItem    = { reagenteId: string;  qtdPorGrupo: number; qtdTotal: number };
  type VidriariaItem   = { vidriariaId: string; qtdPorGrupo: number; qtdTotal: number };
  type EquipamentoItem = { equipamentoId: string; quantidade: number };

  const reagentesList:    ReagenteItem[]    = [];
  const vidriariasList:   VidriariaItem[]   = [];
  const equipamentosList: EquipamentoItem[] = [];

  for (const mat of materiais ?? []) {
    const qty = mat.quantidade ?? 1;

    const reagente = await prisma.reagent.findUnique({ where: { id: mat.material_id } });
    if (reagente) {
      reagentesList.push({ reagenteId: mat.material_id, qtdPorGrupo: qty, qtdTotal: qty });
      continue;
    }
    const vidraria = await prisma.glassware.findUnique({ where: { id: mat.material_id } });
    if (vidraria) {
      vidriariasList.push({ vidriariaId: mat.material_id, qtdPorGrupo: qty, qtdTotal: qty });
      continue;
    }
    const equipamento = await prisma.equipment.findUnique({ where: { id: mat.material_id } });
    if (equipamento) {
      equipamentosList.push({ equipamentoId: mat.material_id, quantidade: qty });
    }
  }

  try {
    // Verifica conflito de turno
    const conflito = await prisma.reservation.findFirst({
      where: {
        laboratorioId: laboratorio_id,
        data:          new Date(data),
        turno,
        status:        { not: ReservationStatus.REPROVADA },
      },
    });
    if (conflito) {
      return conflict('Já existe uma reserva para este laboratório neste turno.');
    }

    const reserva = await prisma.$transaction(async (tx) => {
      return tx.reservation.create({
        data: {
          laboratorioId: laboratorio_id,
          data:          new Date(data),
          turno,
          tipo:          'AULA',
          nomePratica:   disciplina,
          disciplina,
          turma,
          inicio:        inicio ?? null,
          fim:           fim    ?? null,
          observacoes:   observacoes ?? null,
          criadoPorId:   usuario.id,
          status:        ReservationStatus.PENDENTE,
          grupos: {
            create: [{
              nome:             turma,
              quantidadeAlunos: quantidade_alunos ?? 1,
            }],
          },
          reagentes: {
            create: reagentesList.map((r) => ({
              reagenteId:  r.reagenteId,
              qtdPorGrupo: r.qtdPorGrupo,
              qtdTotal:    r.qtdTotal,
            })),
          },
          vidrarias: {
            create: vidriariasList.map((v) => ({
              vidriariaId: v.vidriariaId,
              qtdPorGrupo: v.qtdPorGrupo,
              qtdTotal:    v.qtdTotal,
            })),
          },
          equipamentos: {
            create: equipamentosList.map((e) => ({
              equipamentoId: e.equipamentoId,
              quantidade:    e.quantidade,
            })),
          },
        },
        include: {
          laboratorio:  { select: { id: true, nome: true, tipo: true } },
          criadoPor:    { select: { id: true, nome: true, email: true, perfil: true } },
          grupos:       true,
          reagentes:    { include: { reagente: true } },
          vidrarias:    { include: { vidraria: true } },
          equipamentos: { include: { equipamento: true } },
        },
      });
    }, { timeout: 30000 });

    return created(mapReservaParaFrontend(reserva));
  } catch (err) {
    console.error('[POST /reservations]', err);
    return serverError();
  }
}
