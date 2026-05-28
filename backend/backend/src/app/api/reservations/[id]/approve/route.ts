// src/app/api/reservations/[id]/approve/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirPerfil } from '@/middleware/auth';
import { ok, badRequest, notFound, conflict, serverError } from '@/lib/api-response';
import { ReservationStatus } from '@prisma/client';

type BackendAcao = 'APROVAR' | 'REPROVAR' | 'SOLICITAR_AJUSTE';
type FrontendStatus = 'aprovada' | 'reprovada' | 'ajuste_solicitado';

function resolverAcao(body: Record<string, unknown>): BackendAcao | null {
  // Suporta formato backend: { acao: 'APROVAR' }
  if (body.acao) {
    const acao = String(body.acao) as BackendAcao;
    if (['APROVAR', 'REPROVAR', 'SOLICITAR_AJUSTE'].includes(acao)) return acao;
  }

  // Suporta formato frontend: { status: 'aprovada' }
  const map: Record<FrontendStatus, BackendAcao> = {
    aprovada:          'APROVAR',
    reprovada:         'REPROVAR',
    ajuste_solicitado: 'SOLICITAR_AJUSTE',
  };
  if (body.status && map[body.status as FrontendStatus]) {
    return map[body.status as FrontendStatus];
  }

  return null;
}

function backendStatusParaFrontend(status: ReservationStatus) {
  const map: Record<ReservationStatus, string> = {
    PENDENTE:   'pendente',
    APROVADA:   'aprovada',
    REPROVADA:  'reprovada',
    EM_REVISAO: 'ajuste_solicitado',
    CANCELADA:  'cancelada',
  };
  return map[status] ?? 'pendente';
}

// PATCH /api/reservations/[id]/approve
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { usuario, erro } = await exigirPerfil(request, ['TECNICO', 'ADMIN']);
  if (erro) return erro;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body inválido.');
  }

  const acao = resolverAcao(body);
  if (!acao) {
    return badRequest(
      'Forneça "acao" (APROVAR|REPROVAR|SOLICITAR_AJUSTE) ou "status" (aprovada|reprovada|ajuste_solicitado).'
    );
  }

  // justificativa é obrigatória para REPROVAR e SOLICITAR_AJUSTE
  const justificativa = (body.justificativa as string | undefined) ?? undefined;
  if ((acao === 'REPROVAR' || acao === 'SOLICITAR_AJUSTE') && (!justificativa || justificativa.length < 10)) {
    return badRequest('Justificativa deve ter ao menos 10 caracteres.');
  }

  const reserva = await prisma.reservation.findUnique({
    where: { id: params.id },
    include: {
      reagentes:    true,
      vidrarias:    true,
      equipamentos: true,
    },
  });

  if (!reserva) return notFound('Reserva não encontrada.');

  if (
    reserva.status !== ReservationStatus.PENDENTE &&
    reserva.status !== ReservationStatus.EM_REVISAO
  ) {
    return conflict(`Reserva não pode ser avaliada. Status atual: ${reserva.status}.`);
  }

  try {
    if (acao === 'APROVAR') {
      await prisma.$transaction(async (tx) => {
        for (const r of reserva.reagentes) {
          await tx.reagent.update({
            where: { id: r.reagenteId },
            data:  { estoqueQtd: { decrement: r.qtdTotal } },
          });
        }
        for (const v of reserva.vidrarias) {
          await tx.glassware.update({
            where: { id: v.vidriariaId },
            data:  { estoqueQtd: { decrement: v.qtdTotal } },
          });
        }
        await tx.reservation.update({
          where: { id: params.id },
          data: {
            status:        ReservationStatus.APROVADA,
            revisadoPorId: usuario.id,
            justificativa: null,
          },
        });
      }, { timeout: 30000 });

    } else if (acao === 'REPROVAR') {
      await prisma.reservation.update({
        where: { id: params.id },
        data: {
          status:        ReservationStatus.REPROVADA,
          revisadoPorId: usuario.id,
          justificativa,
        },
      });

    } else if (acao === 'SOLICITAR_AJUSTE') {
      await prisma.reservation.update({
        where: { id: params.id },
        data: {
          status:        ReservationStatus.EM_REVISAO,
          revisadoPorId: usuario.id,
          justificativa,
        },
      });
    }

    const atualizada = await prisma.reservation.findUnique({
      where: { id: params.id },
      include: {
        laboratorio:  { select: { id: true, nome: true } },
        criadoPor:    { select: { id: true, nome: true, email: true, perfil: true } },
        revisadoPor:  { select: { id: true, nome: true } },
        grupos:       true,
        reagentes:    { include: { reagente: true } },
        vidrarias:    { include: { vidraria: true } },
        equipamentos: { include: { equipamento: true } },
      },
    });

    // Retorna no formato frontend
    if (!atualizada) return serverError();

    const quantidadeAlunos = atualizada.grupos.reduce((acc, g) => acc + g.quantidadeAlunos, 0);

    return ok({
      id:             atualizada.id,
      laboratorio_id: atualizada.laboratorioId,
      laboratorio:    atualizada.laboratorio,
      docente_id:     atualizada.criadoPorId,
      docente:        atualizada.criadoPor
        ? {
            id:     atualizada.criadoPor.id,
            nome:   atualizada.criadoPor.nome,
            email:  atualizada.criadoPor.email,
            perfil: atualizada.criadoPor.perfil?.toLowerCase(),
          }
        : undefined,
      data:             atualizada.data instanceof Date
        ? atualizada.data.toISOString().split('T')[0]
        : String(atualizada.data).split('T')[0],
      inicio:           atualizada.inicio ?? (atualizada.turno === 'MANHA' ? '08:00' : '13:00'),
      fim:              atualizada.fim    ?? (atualizada.turno === 'MANHA' ? '12:00' : '17:00'),
      disciplina:       atualizada.disciplina,
      turma:            atualizada.turma,
      quantidade_alunos: quantidadeAlunos,
      status:           backendStatusParaFrontend(atualizada.status),
      observacoes:      atualizada.observacoes ?? atualizada.justificativa ?? undefined,
      data_criacao:     atualizada.criadoEm.toISOString(),
    });
  } catch (err) {
    console.error('[PATCH /reservations/approve]', err);
    return serverError();
  }
}
