// prisma/seed.ts
import { PrismaClient, LaboratoryType, Role, WasteType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Populando banco de dados...');

  // ── Laboratórios ──────────────────────────────────────────────────────────
  const labQuimica = await prisma.laboratory.upsert({
    where:  { id: 'lab-quimica-01' },
    update: {},
    create: {
      id:        'lab-quimica-01',
      nome:      'Laboratório de Química',
      tipo:      LaboratoryType.QUIMICA,
      capacidade: 30,
      descricao: 'Laboratório principal de química geral e analítica.',
    },
  });

  const labBiologia = await prisma.laboratory.upsert({
    where:  { id: 'lab-biologia-01' },
    update: {},
    create: {
      id:        'lab-biologia-01',
      nome:      'Laboratório de Biologia',
      tipo:      LaboratoryType.BIOLOGIA,
      capacidade: 25,
      descricao: 'Laboratório de biologia celular e microbiologia.',
    },
  });

  console.log(`✅ Laboratórios: ${labQuimica.nome}, ${labBiologia.nome}`);

  // ── Usuários de exemplo ───────────────────────────────────────────────────
  // ATENÇÃO: Em produção, usuários são criados via Supabase Auth.
  // Este seed cria registros locais para dev/testes.
  const docente = await prisma.user.upsert({
    where:  { email: 'docente@ifpr.edu.br' },
    update: {},
    create: {
      supabaseId: 'supabase-uid-docente-001',
      nome:       'Prof. João Silva',
      email:      'docente@ifpr.edu.br',
      perfil:     Role.DOCENTE,
    },
  });

  const tecnico = await prisma.user.upsert({
    where:  { email: 'tecnico@ifpr.edu.br' },
    update: {},
    create: {
      supabaseId: 'supabase-uid-tecnico-001',
      nome:       'Técnico Maria Santos',
      email:      'tecnico@ifpr.edu.br',
      perfil:     Role.TECNICO,
    },
  });

  console.log(`✅ Usuários: ${docente.nome}, ${tecnico.nome}`);

  // ── Reagentes ─────────────────────────────────────────────────────────────
  const reagentes = await Promise.all([
    prisma.reagent.upsert({
      where:  { id: 'reagent-hcl' },
      update: {},
      create: {
        id:          'reagent-hcl',
        nome:        'Ácido Clorídrico',
        concentracao: '1 mol/L',
        unidade:     'mL',
        estoqueQtd:  2000,
        classePerigo: 'GHS05 GHS07',
        tipoResiduo: WasteType.HALOGENADOS,
      },
    }),
    prisma.reagent.upsert({
      where:  { id: 'reagent-naoh' },
      update: {},
      create: {
        id:          'reagent-naoh',
        nome:        'Hidróxido de Sódio',
        concentracao: '0,1 mol/L',
        unidade:     'mL',
        estoqueQtd:  1500,
        classePerigo: 'GHS05',
        tipoResiduo: WasteType.OSCILANTE,
      },
    }),
    prisma.reagent.upsert({
      where:  { id: 'reagent-etanol' },
      update: {},
      create: {
        id:          'reagent-etanol',
        nome:        'Etanol',
        concentracao: '96%',
        unidade:     'mL',
        estoqueQtd:  5000,
        classePerigo: 'GHS02',
        tipoResiduo: WasteType.SOLVENTES_ORGANICOS,
      },
    }),
    prisma.reagent.upsert({
      where:  { id: 'reagent-cuso4' },
      update: {},
      create: {
        id:          'reagent-cuso4',
        nome:        'Sulfato de Cobre II',
        concentracao: '0,5 mol/L',
        unidade:     'mL',
        estoqueQtd:  800,
        classePerigo: 'GHS07 GHS09',
        tipoResiduo: WasteType.METAIS_PESADOS,
      },
    }),
  ]);

  console.log(`✅ Reagentes: ${reagentes.length} cadastrados`);

  // ── Vidrarias ─────────────────────────────────────────────────────────────
  const vidrarias = await Promise.all([
    prisma.glassware.upsert({
      where:  { id: 'glass-bequer-100' },
      update: {},
      create: { id: 'glass-bequer-100', nome: 'Béquer 100mL', tipo: 'Béquer', estoqueQtd: 40 },
    }),
    prisma.glassware.upsert({
      where:  { id: 'glass-bequer-250' },
      update: {},
      create: { id: 'glass-bequer-250', nome: 'Béquer 250mL', tipo: 'Béquer', estoqueQtd: 30 },
    }),
    prisma.glassware.upsert({
      where:  { id: 'glass-erlenmeyer-125' },
      update: {},
      create: { id: 'glass-erlenmeyer-125', nome: 'Erlenmeyer 125mL', tipo: 'Erlenmeyer', estoqueQtd: 25 },
    }),
    prisma.glassware.upsert({
      where:  { id: 'glass-bureta' },
      update: {},
      create: { id: 'glass-bureta', nome: 'Bureta 50mL', tipo: 'Bureta', estoqueQtd: 15 },
    }),
    prisma.glassware.upsert({
      where:  { id: 'glass-pipeta' },
      update: {},
      create: { id: 'glass-pipeta', nome: 'Pipeta Graduada 10mL', tipo: 'Pipeta', estoqueQtd: 20 },
    }),
  ]);

  console.log(`✅ Vidrarias: ${vidrarias.length} cadastradas`);

  // ── Equipamentos ──────────────────────────────────────────────────────────
  const equipamentos = await Promise.all([
    prisma.equipment.upsert({
      where:  { id: 'equip-balanca' },
      update: {},
      create: { id: 'equip-balanca', nome: 'Balança Analítica', estoqueQtd: 3 },
    }),
    prisma.equipment.upsert({
      where:  { id: 'equip-agitador' },
      update: {},
      create: { id: 'equip-agitador', nome: 'Agitador Magnético', estoqueQtd: 6 },
    }),
    prisma.equipment.upsert({
      where:  { id: 'equip-phmetro' },
      update: {},
      create: { id: 'equip-phmetro', nome: 'pHmetro Digital', estoqueQtd: 4 },
    }),
    prisma.equipment.upsert({
      where:  { id: 'equip-microscopio' },
      update: {},
      create: { id: 'equip-microscopio', nome: 'Microscópio Óptico', estoqueQtd: 8 },
    }),
    prisma.equipment.upsert({
      where:  { id: 'equip-estufa' },
      update: {},
      create: { id: 'equip-estufa', nome: 'Estufa de Secagem', estoqueQtd: 2 },
    }),
  ]);

  console.log(`✅ Equipamentos: ${equipamentos.length} cadastrados`);
  console.log('🎉 Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
