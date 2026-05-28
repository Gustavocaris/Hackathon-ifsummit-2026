import { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDataStore } from '@/store/dataStore';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronLeft, ChevronRight, Check, X as XIcon, Clock, Calendar,
} from 'lucide-react';
import { Link } from 'wouter';

// ─── Types ────────────────────────────────────────────────────────────────────

type SlotStatus = 'livre' | 'ocupado' | 'pendente' | 'bloqueado';
type LabSlots   = { MANHA: SlotStatus; TARDE: SlotStatus };
type DayMap     = Record<string, Record<string, LabSlots>>;

type Reserva = {
  id: string;
  data: string;
  turno: 'MANHA' | 'TARDE';
  laboratorioId: string;
  status: string;
  nomePratica: string;
  disciplina: string;
  criadoPor: { nome: string; email: string };
  laboratorio: { id: string; nome: string; tipo: string };
};

type Lab = { id: string; nome: string; tipo: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];
const DIAS_SEMANA = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sob(d: Date) { const c = new Date(d); c.setHours(0,0,0,0); return c; }
function addDays(d: Date, n: number) { const c = new Date(d); c.setDate(c.getDate()+n); return c; }
function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function buildCalendar(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const cells: (Date | null)[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
function calcStatus(date: Date, labId: string, turno: 'MANHA'|'TARDE', reservas: Reserva[]): SlotStatus {
  if (sob(date) < addDays(sob(new Date()), 2)) return 'bloqueado';
  const k = toKey(date);
  const match = reservas.find(r =>
    r.data.slice(0,10) === k && r.laboratorioId === labId && r.turno === turno,
  );
  if (!match) return 'livre';
  if (match.status === 'APROVADA') return 'ocupado';
  if (match.status === 'PENDENTE' || match.status === 'EM_REVISAO') return 'pendente';
  return 'livre';
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

const PILL: Record<SlotStatus, {
  bg: string; text: string; border: string; label: string; Icon?: React.ElementType;
}> = {
  livre:    { bg:'bg-green-50',  text:'text-green-700',          border:'border-green-200',  label:'Livre', Icon:Check  },
  ocupado:  { bg:'bg-red-50',    text:'text-red-700',            border:'border-red-200',    label:'Ocup.', Icon:XIcon  },
  pendente: { bg:'bg-yellow-50', text:'text-yellow-700',         border:'border-yellow-200', label:'Pend.', Icon:Clock  },
  bloqueado:{ bg:'bg-muted',     text:'text-muted-foreground',   border:'border-border',     label:'—'               },
};

function StatusPill({ status, size='sm' }: { status: SlotStatus; size?: 'sm'|'md' }) {
  const c = PILL[status];
  const Icon = c.Icon;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 rounded-full border font-semibold',
      c.bg, c.text, c.border,
      size === 'sm' ? 'px-1.5 py-px text-[9px] leading-[14px]' : 'px-2.5 py-1 text-xs',
    )}>
      {Icon && <Icon className={size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'} strokeWidth={2.5} />}
      {c.label}
    </span>
  );
}

// ─── Lab mini-block ───────────────────────────────────────────────────────────

function LabBlock({ label, slots, loading }: { label:string; slots?:LabSlots; loading:boolean }) {
  return (
    <div className="flex flex-col gap-[3px]">
      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
        {label}
      </span>
      {loading ? (
        <>
          <Skeleton className="h-[14px] w-10 rounded-full" />
          <Skeleton className="h-[14px] w-10 rounded-full" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-muted-foreground w-2.5 shrink-0">M</span>
            <StatusPill status={slots?.MANHA ?? 'bloqueado'} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[8px] text-muted-foreground w-2.5 shrink-0">T</span>
            <StatusPill status={slots?.TARDE ?? 'bloqueado'} />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Slot card (inside Sheet) ─────────────────────────────────────────────────

function SlotCard({ turno, status, reserva, dateKey, labId }: {
  turno: 'MANHA'|'TARDE'; status: SlotStatus;
  reserva?: Reserva; dateKey: string; labId: string;
}) {
  const bg: Record<SlotStatus, string> = {
    livre:    'bg-green-50 border-green-200',
    ocupado:  'bg-red-50 border-red-200',
    pendente: 'bg-yellow-50 border-yellow-200',
    bloqueado:'bg-muted border-border',
  };
  return (
    <div className={cn('rounded-xl border p-4 space-y-2.5', bg[status])}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{turno === 'MANHA' ? 'Manhã' : 'Tarde'}</span>
          <StatusPill status={status} size="md" />
        </div>
        {status === 'livre' && (
          <Link href={`/reservas?data=${dateKey}&turno=${turno}&laboratorioId=${labId}`}>
            <Button size="sm" className="h-7 text-xs">Reservar</Button>
          </Link>
        )}
        {status === 'bloqueado' && (
          <span className="text-xs text-muted-foreground">Prazo insuficiente</span>
        )}
      </div>
      {reserva && (
        <div className="pl-1 border-t pt-2 space-y-0.5">
          <p className="font-semibold text-sm">{reserva.nomePratica}</p>
          <p className="text-xs text-muted-foreground">{reserva.disciplina}</p>
          <p className="text-xs text-muted-foreground">Docente: {reserva.criadoPor?.nome}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Agenda() {
  const today = new Date();
  const { laboratories, fetchLaboratories } = useDataStore();

  const [month, setMonth]       = useState(today.getMonth());
  const [year, setYear]         = useState(today.getFullYear());
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [labs, setLabs]         = useState<Lab[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [selectedDay, setSelectedDay]   = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [toast, setToast]               = useState('');

  // Sync labs from store
  useEffect(() => {
    if (laboratories.length > 0) {
      setLabs(laboratories.map(l => ({ id: l.id, nome: l.nome, tipo: l.tipo ?? '' })));
    } else {
      fetchLaboratories();
    }
  }, []);
  useEffect(() => {
    if (laboratories.length > 0)
      setLabs(laboratories.map(l => ({ id: l.id, nome: l.nome, tipo: l.tipo ?? '' })));
  }, [laboratories]);

  // Fetch month reservations
  const fetchMonth = useCallback(async (y: number, m: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    setLoadingMonth(true);
    const pad = (n: number) => String(n).padStart(2,'0');
    const ini = `${y}-${pad(m+1)}-01`;
    const fim = `${y}-${pad(m+1)}-${new Date(y, m+1, 0).getDate()}`;
    try {
      const res  = await fetch(`/api/reservations?dataInicio=${ini}&dataFim=${fim}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setReservas(json.data);
      else throw new Error(json.message);
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : 'Erro ao carregar reservas');
    } finally {
      setLoadingMonth(false);
    }
  }, []);

  useEffect(() => { fetchMonth(year, month); }, [year, month, fetchMonth]);

  // Build slot map
  const dayMap = useMemo<DayMap>(() => {
    const cells = buildCalendar(year, month);
    const map: DayMap = {};
    cells.forEach(d => {
      if (!d || !labs.length) return;
      const k = toKey(d);
      map[k] = {};
      labs.forEach(lab => {
        map[k][lab.id] = {
          MANHA: calcStatus(d, lab.id, 'MANHA', reservas),
          TARDE: calcStatus(d, lab.id, 'TARDE', reservas),
        };
      });
    });
    return map;
  }, [year, month, labs, reservas]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y-1); }
    else setMonth(m => m-1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y+1); }
    else setMonth(m => m+1);
  }

  const cells   = buildCalendar(year, month);
  const numRows = cells.length / 7;
  const quim    = labs.find(l => l.tipo === 'QUIMICA');
  const bio     = labs.find(l => l.tipo === 'BIOLOGIA');

  const dayReservas = useMemo(() => {
    if (!selectedDay) return [];
    const k = toKey(selectedDay);
    return reservas.filter(r => r.data.slice(0,10) === k);
  }, [selectedDay, reservas]);

  return (
    <DashboardLayout title="Agenda">
      {/* -m-6 escapa o padding do DashboardLayout para o calendário preencher a tela */}
      <div className="-m-6 flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

        {/* Sub-header */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b bg-card shrink-0">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-md hover:bg-background transition-all text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold w-40 text-center select-none">
              {MESES[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-md hover:bg-background transition-all text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline" size="sm" className="h-8 gap-1.5"
              onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
            >
              <Calendar className="w-3.5 h-3.5" />
              Hoje
            </Button>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l">
              {(['livre','ocupado','pendente','bloqueado'] as SlotStatus[]).map(s => (
                <StatusPill key={s} status={s} size="md" />
              ))}
            </div>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30 shrink-0">
          {DIAS_SEMANA.map((d, i) => (
            <div
              key={d}
              className={cn(
                'py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                (i===0||i===6) && 'opacity-60',
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div
          className="flex-1 grid grid-cols-7 border-l border-t overflow-hidden"
          style={{ gridTemplateRows: `repeat(${numRows}, 1fr)` }}
        >
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="border-r border-b bg-muted/20" />;

            const k       = toKey(d);
            const isToday = k === toKey(today);
            const isSel   = selectedDay && k === toKey(selectedDay);
            const isWknd  = d.getDay()===0 || d.getDay()===6;
            const slots   = dayMap[k];

            return (
              <button
                key={i}
                onClick={() => { setSelectedDay(d); setSheetOpen(true); }}
                className={cn(
                  'border-r border-b p-2 text-left flex flex-col',
                  'transition-colors duration-100 focus:outline-none',
                  'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                  'hover:bg-accent/60',
                  isWknd && 'bg-muted/25',
                  isToday && 'ring-2 ring-inset ring-blue-500 bg-blue-50/30 dark:bg-blue-950/20',
                  isSel && 'bg-accent',
                )}
              >
                <span className={cn(
                  'self-end leading-none text-sm',
                  isToday
                    ? 'w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold'
                    : 'font-semibold text-foreground',
                )}>
                  {d.getDate()}
                </span>

                <div className="flex-1 flex items-end mt-1">
                  <div className="flex gap-1 w-full">
                    {[{lab:quim,label:'Quím'},{lab:bio,label:'Bio'}].map(({lab,label}) => {
                      if (!lab) return loadingMonth
                        ? <div key={label} className="flex-1 h-10 rounded bg-muted animate-pulse" />
                        : null;
                      return (
                        <div key={lab.id} className="flex-1 bg-background/80 rounded border px-1 py-1 min-w-0 shadow-sm">
                          <LabBlock label={label} slots={slots?.[lab.id]} loading={loadingMonth} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md flex flex-col p-0">
          <SheetHeader className="px-6 py-5 border-b shrink-0">
            <SheetTitle asChild>
              {selectedDay ? (
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
                    {DIAS_SEMANA[selectedDay.getDay()]}
                  </p>
                  <p className="text-xl font-bold mt-0.5">
                    {selectedDay.getDate()} de {MESES[selectedDay.getMonth()]}
                  </p>
                  <p className="text-sm text-muted-foreground font-normal">{year}</p>
                </div>
              ) : <span />}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {selectedDay && labs.map(lab => {
              const k        = toKey(selectedDay);
              const slots    = dayMap[k]?.[lab.id];
              const labLabel = lab.tipo === 'QUIMICA' ? 'Química' : 'Biologia';
              const accent   = lab.tipo === 'QUIMICA' ? 'bg-blue-500' : 'bg-emerald-600';
              return (
                <div key={lab.id} className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-1.5 h-7 rounded-full shrink-0', accent)} />
                    <div>
                      <p className="font-bold">{lab.nome}</p>
                      <p className="text-xs text-muted-foreground">Lab. de {labLabel}</p>
                    </div>
                  </div>
                  {(['MANHA','TARDE'] as const).map(turno => (
                    <SlotCard
                      key={turno}
                      turno={turno}
                      status={slots?.[turno] ?? 'bloqueado'}
                      reserva={dayReservas.find(r => r.laboratorioId===lab.id && r.turno===turno)}
                      dateKey={toKey(selectedDay)}
                      labId={lab.id}
                    />
                  ))}
                </div>
              );
            })}

            {selectedDay && !labs.length && (
              <div className="space-y-6">
                {[1,2].map(i => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-destructive text-destructive-foreground rounded-xl px-5 py-3 text-sm font-medium shadow-xl flex items-center gap-3">
          {toast}
          <button onClick={() => setToast('')}><XIcon className="w-4 h-4" /></button>
        </div>
      )}
    </DashboardLayout>
  );
}
