// prisma/seed-data.ts — dados realistas para demonstração
import {
  PrismaClient,
  LaboratoryType,
  Role,
  WasteType,
  Shift,
  ReservationType,
  ReservationStatus,
} from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function diasAFrente(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

// Próximo dia útil (seg-sex) a partir de n dias à frente
function proximoDiaUtil(n: number): Date {
  const d = diasAFrente(n);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}

async function main() {
  console.log('🌱 Populando dados de demonstração...\n');

  // ── 1. Usuários ────────────────────────────────────────────────────────────
  console.log('👥 Usuários...');

  const users = await Promise.all([
    prisma.user.upsert({
      where:  { email: 'docente@ifpr.edu.br' },
      update: {},
      create: { supabaseId: 'supa-docente-001', nome: 'Prof. João Silva', email: 'docente@ifpr.edu.br', perfil: Role.DOCENTE },
    }),
    prisma.user.upsert({
      where:  { email: 'tecnico@ifpr.edu.br' },
      update: {},
      create: { supabaseId: 'supa-tecnico-001', nome: 'Maria Santos', email: 'tecnico@ifpr.edu.br', perfil: Role.TECNICO },
    }),
    prisma.user.upsert({
      where:  { email: 'admin@ifpr.edu.br' },
      update: {},
      create: { supabaseId: 'supa-admin-001', nome: 'Admin IFSlot', email: 'admin@ifpr.edu.br', perfil: Role.ADMIN },
    }),
    prisma.user.upsert({
      where:  { email: 'ana.costa@ifpr.edu.br' },
      update: {},
      create: { supabaseId: 'supa-docente-002', nome: 'Profa. Ana Costa', email: 'ana.costa@ifpr.edu.br', perfil: Role.DOCENTE },
    }),
    prisma.user.upsert({
      where:  { email: 'pedro.lima@ifpr.edu.br' },
      update: {},
      create: { supabaseId: 'supa-docente-003', nome: 'Prof. Pedro Lima', email: 'pedro.lima@ifpr.edu.br', perfil: Role.DOCENTE },
    }),
    prisma.user.upsert({
      where:  { email: 'julia.ferreira@ifpr.edu.br' },
      update: {},
      create: { supabaseId: 'supa-docente-004', nome: 'Profa. Júlia Ferreira', email: 'julia.ferreira@ifpr.edu.br', perfil: Role.DOCENTE },
    }),
  ]);

  const [joao, maria, , ana, pedro, julia] = users;
  console.log(`   ✅ ${users.length} usuários`);

  // ── 2. Laboratórios ────────────────────────────────────────────────────────
  console.log('🏫 Laboratórios...');

  const labQuim = await prisma.laboratory.upsert({
    where:  { id: 'lab-quimica-01' },
    update: { nome: 'Laboratório de Química', capacidade: 30, descricao: 'Lab. principal de química geral e analítica — capelas de exaustão, 10 bancadas duplas.' },
    create: { id: 'lab-quimica-01', nome: 'Laboratório de Química', tipo: LaboratoryType.QUIMICA, capacidade: 30, descricao: 'Lab. principal de química geral e analítica — capelas de exaustão, 10 bancadas duplas.' },
  });

  const labBio = await prisma.laboratory.upsert({
    where:  { id: 'lab-biologia-01' },
    update: { nome: 'Laboratório de Biologia', capacidade: 25, descricao: 'Microscópios ópticos, autoclave, câmara de fluxo laminar e equipamentos de biologia celular.' },
    create: { id: 'lab-biologia-01', nome: 'Laboratório de Biologia', tipo: LaboratoryType.BIOLOGIA, capacidade: 25, descricao: 'Microscópios ópticos, autoclave, câmara de fluxo laminar e equipamentos de biologia celular.' },
  });

  console.log('   ✅ 2 laboratórios');

  // ── 3. Reagentes ───────────────────────────────────────────────────────────
  console.log('🧪 Reagentes...');

  const reagentes = await Promise.all([
    prisma.reagent.upsert({ where: { id: 'r-hcl' },    update: { estoqueQtd: 2400 }, create: { id: 'r-hcl',    nome: 'Ácido Clorídrico',      concentracao: '1 mol/L',      unidade: 'mL', estoqueQtd: 2400, classePerigo: 'GHS05 GHS07', tipoResiduo: WasteType.HALOGENADOS } }),
    prisma.reagent.upsert({ where: { id: 'r-naoh' },   update: { estoqueQtd: 1500 }, create: { id: 'r-naoh',   nome: 'Hidróxido de Sódio',    concentracao: '0,1 mol/L',    unidade: 'mL', estoqueQtd: 1500, classePerigo: 'GHS05',       tipoResiduo: WasteType.OSCILANTE } }),
    prisma.reagent.upsert({ where: { id: 'r-etanol' }, update: { estoqueQtd: 4500 }, create: { id: 'r-etanol', nome: 'Etanol',                 concentracao: '96%',          unidade: 'mL', estoqueQtd: 4500, classePerigo: 'GHS02',       tipoResiduo: WasteType.SOLVENTES_ORGANICOS } }),
    prisma.reagent.upsert({ where: { id: 'r-cuso4' },  update: { estoqueQtd: 800  }, create: { id: 'r-cuso4',  nome: 'Sulfato de Cobre II',   concentracao: '0,5 mol/L',    unidade: 'mL', estoqueQtd: 800,  classePerigo: 'GHS07 GHS09', tipoResiduo: WasteType.METAIS_PESADOS } }),
    prisma.reagent.upsert({ where: { id: 'r-h2so4' },  update: { estoqueQtd: 1200 }, create: { id: 'r-h2so4',  nome: 'Ácido Sulfúrico',       concentracao: '0,5 mol/L',    unidade: 'mL', estoqueQtd: 1200, classePerigo: 'GHS05 GHS08', tipoResiduo: WasteType.OSCILANTE } }),
    prisma.reagent.upsert({ where: { id: 'r-agno3' },  update: { estoqueQtd: 200  }, create: { id: 'r-agno3',  nome: 'Nitrato de Prata',      concentracao: '0,1 mol/L',    unidade: 'mL', estoqueQtd: 200,  classePerigo: 'GHS05 GHS09', tipoResiduo: WasteType.METAIS_PESADOS } }),
    prisma.reagent.upsert({ where: { id: 'r-feno' },   update: { estoqueQtd: 600  }, create: { id: 'r-feno',   nome: 'Fenolftaleína',          concentracao: '1%',           unidade: 'mL', estoqueQtd: 600,  classePerigo: 'GHS07',       tipoResiduo: WasteType.SOLVENTES_ORGANICOS } }),
    prisma.reagent.upsert({ where: { id: 'r-kcl' },    update: { estoqueQtd: 900  }, create: { id: 'r-kcl',    nome: 'Cloreto de Potássio',   concentracao: '1 mol/L',      unidade: 'mL', estoqueQtd: 900,  classePerigo: 'GHS07',       tipoResiduo: WasteType.OSCILANTE } }),
    prisma.reagent.upsert({ where: { id: 'r-azul' },   update: { estoqueQtd: 120  }, create: { id: 'r-azul',   nome: 'Azul de Metileno',      concentracao: '0,01%',        unidade: 'mL', estoqueQtd: 120,  classePerigo: 'GHS07',       tipoResiduo: WasteType.OSCILANTE } }),
    prisma.reagent.upsert({ where: { id: 'r-iodo' },   update: { estoqueQtd: 350  }, create: { id: 'r-iodo',   nome: 'Solução de Lugol',       concentracao: '0,3%',         unidade: 'mL', estoqueQtd: 350,  classePerigo: 'GHS07',       tipoResiduo: WasteType.OSCILANTE } }),
  ]);

  console.log(`   ✅ ${reagentes.length} reagentes`);

  // ── 4. Vidrarias ───────────────────────────────────────────────────────────
  console.log('🫙 Vidrarias...');

  const vidrarias = await Promise.all([
    prisma.glassware.upsert({ where: { id: 'v-beq100'   }, update: { estoqueQtd: 45 }, create: { id: 'v-beq100',    nome: 'Béquer 100 mL',           tipo: 'Béquer',      estoqueQtd: 45 } }),
    prisma.glassware.upsert({ where: { id: 'v-beq250'   }, update: { estoqueQtd: 35 }, create: { id: 'v-beq250',    nome: 'Béquer 250 mL',           tipo: 'Béquer',      estoqueQtd: 35 } }),
    prisma.glassware.upsert({ where: { id: 'v-beq500'   }, update: { estoqueQtd: 20 }, create: { id: 'v-beq500',    nome: 'Béquer 500 mL',           tipo: 'Béquer',      estoqueQtd: 20 } }),
    prisma.glassware.upsert({ where: { id: 'v-erl125'   }, update: { estoqueQtd: 30 }, create: { id: 'v-erl125',    nome: 'Erlenmeyer 125 mL',       tipo: 'Erlenmeyer',  estoqueQtd: 30 } }),
    prisma.glassware.upsert({ where: { id: 'v-erl250'   }, update: { estoqueQtd: 25 }, create: { id: 'v-erl250',    nome: 'Erlenmeyer 250 mL',       tipo: 'Erlenmeyer',  estoqueQtd: 25 } }),
    prisma.glassware.upsert({ where: { id: 'v-bureta'   }, update: { estoqueQtd: 18 }, create: { id: 'v-bureta',    nome: 'Bureta 50 mL',            tipo: 'Bureta',      estoqueQtd: 18 } }),
    prisma.glassware.upsert({ where: { id: 'v-pipeta10' }, update: { estoqueQtd: 22 }, create: { id: 'v-pipeta10',  nome: 'Pipeta Graduada 10 mL',   tipo: 'Pipeta',      estoqueQtd: 22 } }),
    prisma.glassware.upsert({ where: { id: 'v-pipeta5'  }, update: { estoqueQtd: 28 }, create: { id: 'v-pipeta5',   nome: 'Pipeta Graduada 5 mL',    tipo: 'Pipeta',      estoqueQtd: 28 } }),
    prisma.glassware.upsert({ where: { id: 'v-tubo'     }, update: { estoqueQtd: 200 }, create: { id: 'v-tubo',     nome: 'Tubo de Ensaio 15 mL',    tipo: 'Tubo',        estoqueQtd: 200 } }),
    prisma.glassware.upsert({ where: { id: 'v-balao250' }, update: { estoqueQtd: 15 }, create: { id: 'v-balao250',  nome: 'Balão Volumétrico 250 mL',tipo: 'Balão',       estoqueQtd: 15 } }),
    prisma.glassware.upsert({ where: { id: 'v-funil'    }, update: { estoqueQtd: 14 }, create: { id: 'v-funil',     nome: 'Funil de Vidro',          tipo: 'Funil',       estoqueQtd: 14 } }),
    prisma.glassware.upsert({ where: { id: 'v-placa'    }, update: { estoqueQtd: 40 }, create: { id: 'v-placa',     nome: 'Placa de Petri',          tipo: 'Placa',       estoqueQtd: 40 } }),
  ]);

  console.log(`   ✅ ${vidrarias.length} vidrarias`);

  // ── 5. Equipamentos ────────────────────────────────────────────────────────
  console.log('⚗️  Equipamentos...');

  const equipamentos = await Promise.all([
    prisma.equipment.upsert({ where: { id: 'e-balanca'  }, update: { estoqueQtd: 4 }, create: { id: 'e-balanca',   nome: 'Balança Analítica',        estoqueQtd: 4 } }),
    prisma.equipment.upsert({ where: { id: 'e-agitador' }, update: { estoqueQtd: 7 }, create: { id: 'e-agitador',  nome: 'Agitador Magnético',       estoqueQtd: 7 } }),
    prisma.equipment.upsert({ where: { id: 'e-phmetro'  }, update: { estoqueQtd: 5 }, create: { id: 'e-phmetro',   nome: 'pHmetro Digital',          estoqueQtd: 5 } }),
    prisma.equipment.upsert({ where: { id: 'e-microsc'  }, update: { estoqueQtd: 10 }, create: { id: 'e-microsc',  nome: 'Microscópio Óptico',       estoqueQtd: 10 } }),
    prisma.equipment.upsert({ where: { id: 'e-estufa'   }, update: { estoqueQtd: 3 }, create: { id: 'e-estufa',    nome: 'Estufa de Secagem',        estoqueQtd: 3 } }),
    prisma.equipment.upsert({ where: { id: 'e-centri'   }, update: { estoqueQtd: 3 }, create: { id: 'e-centri',    nome: 'Centrífuga',               estoqueQtd: 3 } }),
    prisma.equipment.upsert({ where: { id: 'e-banho'    }, update: { estoqueQtd: 4 }, create: { id: 'e-banho',     nome: 'Banho-Maria',              estoqueQtd: 4 } }),
    prisma.equipment.upsert({ where: { id: 'e-chapa'    }, update: { estoqueQtd: 6 }, create: { id: 'e-chapa',     nome: 'Chapa Aquecedora',         estoqueQtd: 6 } }),
    prisma.equipment.upsert({ where: { id: 'e-espect'   }, update: { estoqueQtd: 2 }, create: { id: 'e-espect',    nome: 'Espectrofotômetro UV-Vis', estoqueQtd: 2 } }),
  ]);

  console.log(`   ✅ ${equipamentos.length} equipamentos`);

  // ── 6. Reservas ────────────────────────────────────────────────────────────
  console.log('📅 Reservas...');

  // Limpa reservas existentes de demo para não duplicar
  await prisma.reservation.deleteMany({
    where: { id: { startsWith: 'res-demo-' } },
  });

  const reservasDefs = [
    // ── Semana atual (aprovadas) ─────────────────────────────────────────────
    {
      id: 'res-demo-01',
      laboratorioId: labQuim.id,
      criadoPorId: joao.id,
      data: proximoDiaUtil(2),
      turno: Shift.MANHA,
      tipo: ReservationType.AULA,
      nomePratica: 'Titulação Ácido-Base',
      disciplina: 'Química Analítica',
      turma: '2A',
      status: ReservationStatus.APROVADA,
      inicio: '08:00', fim: '12:00',
      grupos: [
        { nome: 'Grupo 1', quantidadeAlunos: 6 },
        { nome: 'Grupo 2', quantidadeAlunos: 6 },
        { nome: 'Grupo 3', quantidadeAlunos: 5 },
      ],
      reagentes: [
        { reagenteId: 'r-hcl',  qtdPorGrupo: 50,  qtdTotal: 170 },
        { reagenteId: 'r-naoh', qtdPorGrupo: 50,  qtdTotal: 170 },
        { reagenteId: 'r-feno', qtdPorGrupo: 5,   qtdTotal: 17  },
      ],
      vidrarias: [
        { vidriariaId: 'v-bureta',   qtdPorGrupo: 1, qtdTotal: 3 },
        { vidriariaId: 'v-erl250',   qtdPorGrupo: 2, qtdTotal: 6 },
        { vidriariaId: 'v-beq250',   qtdPorGrupo: 1, qtdTotal: 3 },
        { vidriariaId: 'v-pipeta10', qtdPorGrupo: 1, qtdTotal: 3 },
      ],
    },
    {
      id: 'res-demo-02',
      laboratorioId: labBio.id,
      criadoPorId: ana.id,
      data: proximoDiaUtil(2),
      turno: Shift.TARDE,
      tipo: ReservationType.AULA,
      nomePratica: 'Observação de Células Vegetais',
      disciplina: 'Biologia Celular',
      turma: '1B',
      status: ReservationStatus.APROVADA,
      inicio: '13:00', fim: '17:00',
      grupos: [
        { nome: 'Grupo A', quantidadeAlunos: 5 },
        { nome: 'Grupo B', quantidadeAlunos: 5 },
        { nome: 'Grupo C', quantidadeAlunos: 4 },
      ],
      reagentes: [
        { reagenteId: 'r-azul', qtdPorGrupo: 5, qtdTotal: 14 },
        { reagenteId: 'r-iodo', qtdPorGrupo: 5, qtdTotal: 14 },
      ],
      vidrarias: [
        { vidriariaId: 'v-placa', qtdPorGrupo: 2, qtdTotal: 6 },
        { vidriariaId: 'v-tubo',  qtdPorGrupo: 4, qtdTotal: 12 },
      ],
    },
    // ── Próxima semana (pendentes — aguardando aprovação) ────────────────────
    {
      id: 'res-demo-03',
      laboratorioId: labQuim.id,
      criadoPorId: pedro.id,
      data: proximoDiaUtil(5),
      turno: Shift.TARDE,
      tipo: ReservationType.AULA,
      nomePratica: 'Determinação de pH — Soluções Tampão',
      disciplina: 'Físico-Química',
      turma: '3B',
      status: ReservationStatus.PENDENTE,
      inicio: '13:00', fim: '17:00',
      grupos: [
        { nome: 'Grupo 1', quantidadeAlunos: 7 },
        { nome: 'Grupo 2', quantidadeAlunos: 7 },
      ],
      reagentes: [
        { reagenteId: 'r-hcl',  qtdPorGrupo: 30, qtdTotal: 60 },
        { reagenteId: 'r-kcl',  qtdPorGrupo: 20, qtdTotal: 40 },
      ],
      vidrarias: [
        { vidriariaId: 'v-beq100', qtdPorGrupo: 3, qtdTotal: 6 },
      ],
    },
    {
      id: 'res-demo-04',
      laboratorioId: labBio.id,
      criadoPorId: julia.id,
      data: proximoDiaUtil(5),
      turno: Shift.MANHA,
      tipo: ReservationType.AULA,
      nomePratica: 'Extração de DNA de Banana',
      disciplina: 'Genética',
      turma: '3A',
      status: ReservationStatus.PENDENTE,
      inicio: '08:00', fim: '12:00',
      grupos: [
        { nome: 'Grupo 1', quantidadeAlunos: 6 },
        { nome: 'Grupo 2', quantidadeAlunos: 6 },
        { nome: 'Grupo 3', quantidadeAlunos: 5 },
      ],
      reagentes: [
        { reagenteId: 'r-etanol', qtdPorGrupo: 20, qtdTotal: 60 },
      ],
      vidrarias: [
        { vidriariaId: 'v-beq250', qtdPorGrupo: 1, qtdTotal: 3 },
        { vidriariaId: 'v-tubo',   qtdPorGrupo: 6, qtdTotal: 18 },
        { vidriariaId: 'v-funil',  qtdPorGrupo: 1, qtdTotal: 3 },
      ],
    },
    // ── Semana +2 (aprovadas) ────────────────────────────────────────────────
    {
      id: 'res-demo-05',
      laboratorioId: labQuim.id,
      criadoPorId: joao.id,
      data: proximoDiaUtil(7),
      turno: Shift.MANHA,
      tipo: ReservationType.AULA,
      nomePratica: 'Reações de Oxirredução',
      disciplina: 'Química Geral',
      turma: '1A',
      status: ReservationStatus.APROVADA,
      inicio: '08:00', fim: '12:00',
      grupos: [
        { nome: 'Grupo 1', quantidadeAlunos: 6 },
        { nome: 'Grupo 2', quantidadeAlunos: 6 },
      ],
      reagentes: [
        { reagenteId: 'r-cuso4', qtdPorGrupo: 30, qtdTotal: 60 },
        { reagenteId: 'r-agno3', qtdPorGrupo: 10, qtdTotal: 20 },
      ],
      vidrarias: [
        { vidriariaId: 'v-beq100', qtdPorGrupo: 4, qtdTotal: 8 },
        { vidriariaId: 'v-tubo',   qtdPorGrupo: 8, qtdTotal: 16 },
      ],
    },
    {
      id: 'res-demo-06',
      laboratorioId: labBio.id,
      criadoPorId: ana.id,
      data: proximoDiaUtil(8),
      turno: Shift.TARDE,
      tipo: ReservationType.AULA,
      nomePratica: 'Coloração de Gram em Bactérias',
      disciplina: 'Microbiologia',
      turma: '2B',
      status: ReservationStatus.APROVADA,
      inicio: '13:00', fim: '17:00',
      grupos: [
        { nome: 'Dupla 1', quantidadeAlunos: 2 },
        { nome: 'Dupla 2', quantidadeAlunos: 2 },
        { nome: 'Dupla 3', quantidadeAlunos: 2 },
        { nome: 'Dupla 4', quantidadeAlunos: 2 },
        { nome: 'Dupla 5', quantidadeAlunos: 2 },
      ],
      reagentes: [
        { reagenteId: 'r-azul', qtdPorGrupo: 2, qtdTotal: 10 },
        { reagenteId: 'r-etanol', qtdPorGrupo: 3, qtdTotal: 15 },
      ],
      vidrarias: [
        { vidriariaId: 'v-placa', qtdPorGrupo: 2, qtdTotal: 10 },
      ],
    },
    // ── Em revisão ───────────────────────────────────────────────────────────
    {
      id: 'res-demo-07',
      laboratorioId: labQuim.id,
      criadoPorId: pedro.id,
      data: proximoDiaUtil(10),
      turno: Shift.TARDE,
      tipo: ReservationType.AULA,
      nomePratica: 'Síntese do Sabão (Saponificação)',
      disciplina: 'Química Orgânica',
      turma: '2C',
      status: ReservationStatus.EM_REVISAO,
      justificativa: 'Quantidade de KOH solicitada excede o estoque disponível. Reduzir para 20 mL/grupo.',
      inicio: '13:00', fim: '17:00',
      grupos: [
        { nome: 'Grupo 1', quantidadeAlunos: 5 },
        { nome: 'Grupo 2', quantidadeAlunos: 5 },
        { nome: 'Grupo 3', quantidadeAlunos: 5 },
      ],
      reagentes: [
        { reagenteId: 'r-naoh', qtdPorGrupo: 30, qtdTotal: 90 },
        { reagenteId: 'r-etanol', qtdPorGrupo: 20, qtdTotal: 60 },
      ],
      vidrarias: [
        { vidriariaId: 'v-beq250', qtdPorGrupo: 1, qtdTotal: 3 },
        { vidriariaId: 'v-erl125', qtdPorGrupo: 2, qtdTotal: 6 },
      ],
    },
    // ── Semana +3 (mais reservas) ────────────────────────────────────────────
    {
      id: 'res-demo-08',
      laboratorioId: labQuim.id,
      criadoPorId: julia.id,
      data: proximoDiaUtil(12),
      turno: Shift.MANHA,
      tipo: ReservationType.AULA,
      nomePratica: 'Espectrofotometria — Concentração de Soluções',
      disciplina: 'Química Analítica',
      turma: '3C',
      status: ReservationStatus.APROVADA,
      inicio: '08:00', fim: '12:00',
      grupos: [
        { nome: 'Grupo 1', quantidadeAlunos: 4 },
        { nome: 'Grupo 2', quantidadeAlunos: 4 },
        { nome: 'Grupo 3', quantidadeAlunos: 4 },
        { nome: 'Grupo 4', quantidadeAlunos: 3 },
      ],
      reagentes: [
        { reagenteId: 'r-cuso4', qtdPorGrupo: 20, qtdTotal: 60 },
      ],
      vidrarias: [
        { vidriariaId: 'v-balao250', qtdPorGrupo: 1, qtdTotal: 4 },
        { vidriariaId: 'v-pipeta5',  qtdPorGrupo: 2, qtdTotal: 8 },
      ],
    },
    {
      id: 'res-demo-09',
      laboratorioId: labBio.id,
      criadoPorId: joao.id,
      data: proximoDiaUtil(14),
      turno: Shift.MANHA,
      tipo: ReservationType.AULA,
      nomePratica: 'Osmose e Difusão em Células Vegetais',
      disciplina: 'Biologia Celular',
      turma: '1C',
      status: ReservationStatus.PENDENTE,
      inicio: '08:00', fim: '12:00',
      grupos: [
        { nome: 'Grupo A', quantidadeAlunos: 5 },
        { nome: 'Grupo B', quantidadeAlunos: 5 },
        { nome: 'Grupo C', quantidadeAlunos: 5 },
      ],
      reagentes: [
        { reagenteId: 'r-kcl',    qtdPorGrupo: 15, qtdTotal: 45 },
        { reagenteId: 'r-azul',   qtdPorGrupo: 3,  qtdTotal: 9  },
      ],
      vidrarias: [
        { vidriariaId: 'v-beq100', qtdPorGrupo: 3, qtdTotal: 9 },
        { vidriariaId: 'v-placa',  qtdPorGrupo: 2, qtdTotal: 6 },
      ],
    },
  ];

  for (const r of reservasDefs) {
    await prisma.reservation.create({
      data: {
        id:            r.id,
        laboratorioId: r.laboratorioId,
        criadoPorId:   r.criadoPorId,
        data:          r.data,
        turno:         r.turno,
        tipo:          r.tipo,
        nomePratica:   r.nomePratica,
        disciplina:    r.disciplina,
        turma:         r.turma,
        status:        r.status,
        justificativa: (r as any).justificativa ?? null,
        inicio:        r.inicio,
        fim:           r.fim,
        grupos: { create: r.grupos },
        reagentes: {
          create: r.reagentes.map(re => ({
            reagenteId:  re.reagenteId,
            qtdPorGrupo: re.qtdPorGrupo,
            qtdTotal:    re.qtdTotal,
          })),
        },
        vidrarias: {
          create: r.vidrarias.map(vi => ({
            vidriariaId: vi.vidriariaId,
            qtdPorGrupo: vi.qtdPorGrupo,
            qtdTotal:    vi.qtdTotal,
          })),
        },
      },
    });
    process.stdout.write('.');
  }

  console.log(`\n   ✅ ${reservasDefs.length} reservas`);

  // ── 7. Notificações ────────────────────────────────────────────────────────
  console.log('🔔 Notificações...');

  await prisma.notification.deleteMany({
    where: { id: { startsWith: 'notif-demo-' } },
  });

  const notificacoes = [
    { id: 'notif-demo-01', usuarioId: joao.id,   mensagem: 'Sua reserva de Titulação Ácido-Base foi aprovada ✅',                             tipo: 'reserva_aprovada',   lida: false },
    { id: 'notif-demo-02', usuarioId: pedro.id,  mensagem: 'Sua reserva de Determinação de pH foi recebida e está aguardando aprovação.',     tipo: 'reserva_pendente',   lida: false },
    { id: 'notif-demo-03', usuarioId: pedro.id,  mensagem: 'Ajuste solicitado na reserva "Síntese do Sabão": revise a quantidade de NaOH.', tipo: 'ajuste_solicitado',  lida: false },
    { id: 'notif-demo-04', usuarioId: julia.id,  mensagem: 'Sua reserva de Extração de DNA está pendente de aprovação pelo técnico.',         tipo: 'reserva_pendente',   lida: true  },
    { id: 'notif-demo-05', usuarioId: ana.id,    mensagem: 'Reserva "Observação de Células Vegetais" aprovada para amanhã ✅',                tipo: 'reserva_aprovada',   lida: true  },
    { id: 'notif-demo-06', usuarioId: maria.id,  mensagem: 'Nova reserva pendente: "Determinação de pH — Soluções Tampão" (Prof. Pedro)',   tipo: 'reserva_pendente',   lida: false },
    { id: 'notif-demo-07', usuarioId: maria.id,  mensagem: 'Nova reserva pendente: "Extração de DNA de Banana" (Profa. Júlia)',              tipo: 'reserva_pendente',   lida: false },
    { id: 'notif-demo-08', usuarioId: maria.id,  mensagem: 'Estoque de Azul de Metileno abaixo do mínimo (120 mL restantes).',               tipo: 'estoque_insuficiente', lida: false },
    { id: 'notif-demo-09', usuarioId: joao.id,   mensagem: 'Lembrete: preencha o relatório da aula de ontem no Lab. de Química.',           tipo: 'relatorio_pendente', lida: false },
    { id: 'notif-demo-10', usuarioId: julia.id,  mensagem: 'Sua reserva "Espectrofotometria" foi aprovada ✅',                               tipo: 'reserva_aprovada',   lida: false },
  ];

  for (const n of notificacoes) {
    await prisma.notification.upsert({
      where:  { id: n.id },
      update: { lida: n.lida },
      create: {
        id:        n.id,
        usuarioId: n.usuarioId,
        mensagem:  n.mensagem,
        tipo:      n.tipo,
        lida:      n.lida,
      },
    });
  }

  console.log(`   ✅ ${notificacoes.length} notificações`);

  // ── Resumo ─────────────────────────────────────────────────────────────────
  console.log('\n🎉 Banco de dados atualizado!\n');

  const totais = await Promise.all([
    prisma.user.count(),
    prisma.laboratory.count(),
    prisma.reagent.count(),
    prisma.glassware.count(),
    prisma.equipment.count(),
    prisma.reservation.count(),
    prisma.notification.count(),
  ]);

  console.log('┌──────────────────────┬────────┐');
  console.log('│ Tabela               │ Total  │');
  console.log('├──────────────────────┼────────┤');
  [
    ['Usuários',      totais[0]],
    ['Laboratórios',  totais[1]],
    ['Reagentes',     totais[2]],
    ['Vidrarias',     totais[3]],
    ['Equipamentos',  totais[4]],
    ['Reservas',      totais[5]],
    ['Notificações',  totais[6]],
  ].forEach(([t, n]) =>
    console.log(`│ ${String(t).padEnd(20)} │ ${String(n).padStart(4)}   │`)
  );
  console.log('└──────────────────────┴────────┘');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
