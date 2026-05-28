// src/app/api/reservations/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exigirAuth } from '@/middleware/auth';
import { ok, forbidden, notFound, conflict, serverError } from '@/lib/api-response';
import { ReservationStatus, Role } from '@prisma/client';

// GET /api/reservations/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { usuario, erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const reserva = await prisma.reservation.findUnique({
      where:   { id: params.id },
      include: {
        laboratorio:  { select: { id: true, nome: true, tipo: true } },
        criadoPor:    { select: { id: true, nome: true, email: true } },
        revisadoPor:  { select: { id: true, nome: true } },
        grupos:       true,
        reagentes:    { include: { reagente: true } },
        vidrarias:    { include: { vidraria: true } },
        equipamentos: { include: { equipamento: true } },
      },
    });

    if (!reserva) return notFound('Reserva não encontrada.');

    // Docente só pode ver suas próprias reservas
    if (usuario.perfil === Role.DOCENTE && reserva.criadoPorId !== usuario.id) {
      return forbidden('Acesso negado.');
    }

    return ok(reserva);
  } catch (err) {
    console.error('[GET /reservations/:id]', err);
    return serverError();
  }
}

// DELETE /api/reservations/[id] — cancela a reserva (docente: só as próprias; técnico/admin: qualquer)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { usuario, erro } = await exigirAuth(request);
  if (erro) return erro;

  try {
    const reserva = await prisma.reservation.findUnique({ where: { id: params.id } });
    if (!reserva) return notFound('Reserva não encontrada.');

    if (usuario.perfil === Role.DOCENTE && reserva.criadoPorId !== usuario.id) {
      return forbidden('Você só pode cancelar suas próprias reservas.');
    }

    const statusCancelavel: ReservationStatus[] = [
      ReservationStatus.PENDENTE,
      ReservationStatus.EM_REVISAO,
    ];

    if (!statusCancelavel.includes(reserva.status)) {
      return conflict(`Reserva com status "${reserva.status}" não pode ser cancelada.`);
    }

    const cancelada = await prisma.reservation.update({
      where: { id: params.id },
      data:  { status: ReservationStatus.CANCELADA },
      select: { id: true, status: true, nomePratica: true },
    });

    return ok(cancelada);
  } catch (err) {
    console.error('[DELETE /reservations/:id]', err);
    return serverError();
  }
}
