// src/types/schemas.ts
import { z } from 'zod';
import { Shift, ReservationType, WasteType } from '@prisma/client';

// ── Reserva ───────────────────────────────────────────────────────────────────

export const CriarReservaSchema = z.object({
  laboratorioId: z.string().uuid('ID do laboratório inválido.'),

  data: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD.')
    .refine((val) => {
      // RN02: Antecedência mínima de 2 dias
      const dataReserva = new Date(val);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const dataMinima = new Date(hoje);
      dataMinima.setDate(hoje.getDate() + 2);
      return dataReserva >= dataMinima;
    }, 'A reserva deve ser feita com no mínimo 2 dias de antecedência.'),

  turno: z.nativeEnum(Shift),

  tipo: z.nativeEnum(ReservationType),

  nomePratica: z.string().min(3, 'Nome da prática deve ter ao menos 3 caracteres.'),
  disciplina:  z.string().min(2, 'Disciplina/Projeto é obrigatório.'),
  turma:       z.string().min(1, 'Turma é obrigatória.'),

  grupos: z
    .array(
      z.object({
        nome:            z.string().min(1, 'Nome do grupo é obrigatório.'),
        quantidadeAlunos: z.number().int().min(1, 'Número de alunos deve ser ao menos 1.'),
      })
    )
    .min(1, 'Ao menos um grupo é obrigatório.'),

  reagentes: z
    .array(
      z.object({
        reagenteId:  z.string().uuid(),
        qtdPorGrupo: z.number().positive('Quantidade por grupo deve ser positiva.'),
      })
    )
    .optional()
    .default([]),

  vidrarias: z
    .array(
      z.object({
        vidriariaId: z.string().uuid(),
        qtdPorGrupo: z.number().int().positive(),
      })
    )
    .optional()
    .default([]),

  equipamentos: z
    .array(
      z.object({
        equipamentoId: z.string().uuid(),
        quantidade:    z.number().int().positive().default(1),
        observacao:    z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

export type CriarReservaInput = z.infer<typeof CriarReservaSchema>;

// ── Aprovação ─────────────────────────────────────────────────────────────────

export const AvaliarReservaSchema = z.discriminatedUnion('acao', [
  z.object({
    acao: z.literal('APROVAR'),
  }),
  z.object({
    acao:         z.literal('REPROVAR'),
    justificativa: z.string().min(10, 'Justificativa deve ter ao menos 10 caracteres.'),
  }),
  z.object({
    acao:         z.literal('SOLICITAR_AJUSTE'),
    justificativa: z.string().min(10, 'Descreva o ajuste necessário (mínimo 10 caracteres).'),
  }),
]);

export type AvaliarReservaInput = z.infer<typeof AvaliarReservaSchema>;

// ── Reagente ──────────────────────────────────────────────────────────────────

export const CriarReagenteSchema = z.object({
  nome:        z.string().min(2),
  concentracao: z.string().optional(),
  unidade:     z.string().min(1),
  estoqueQtd:  z.number().nonnegative(),
  classePerigo: z.string().optional(),
  tipoResiduo: z.nativeEnum(WasteType),
});

export const AtualizarEstoqueSchema = z.object({
  estoqueQtd: z.number().nonnegative('Estoque não pode ser negativo.'),
});

// ── Vidraria ──────────────────────────────────────────────────────────────────

export const CriarVidriariaSchema = z.object({
  nome:      z.string().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  tipo:      z.string().min(1, 'Tipo é obrigatório.'),
  unidade:   z.string().min(1).default('unidade'),
  estoqueQtd: z.number().int().nonnegative(),
});

export type CriarVidriariaInput = z.infer<typeof CriarVidriariaSchema>;

// ── Equipamento ───────────────────────────────────────────────────────────────

export const CriarEquipamentoSchema = z.object({
  nome:        z.string().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  numeroSerie: z.string().optional(),
  estoqueQtd:  z.number().int().nonnegative(),
});

export type CriarEquipamentoInput = z.infer<typeof CriarEquipamentoSchema>;

// ── Registro de usuário ───────────────────────────────────────────────────────

export const RegistrarUsuarioSchema = z.object({
  nome:  z.string().min(2, 'Nome deve ter ao menos 2 caracteres.'),
  perfil: z.enum(['DOCENTE', 'TECNICO', 'ADMIN']).optional().default('DOCENTE'),
});
