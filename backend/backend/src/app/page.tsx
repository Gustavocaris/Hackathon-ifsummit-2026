'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, X, Check, Clock,
  X as XIcon, FlaskConical, LogOut, Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type SlotStatus = 'livre' | 'ocupado' | 'pendente' | 'bloqueado';

type LabSlots = { MANHA: SlotStatus; TARDE: SlotStatus };

type DayMap = Record<string, Record<string, LabSlots>>;

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

type User = { id: string; nome: string; email: string; perfil: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const API = '';   // same origin
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

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last  = new Date(year, month + 1, 0);
  const cells: (Date | null)[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function calcStatus(date: Date, labId: string, turno: 'MANHA'|'TARDE', reservas: Reserva[]): SlotStatus {
  const minDate = addDays(sob(new Date()), 2);
  if (sob(date) < minDate) return 'bloqueado';
  const k = toKey(date);
  const match = reservas.find(r =>
    r.data.slice(0,10) === k &&
    r.laboratorioId === labId &&
    r.turno === turno
  );
  if (!match) return 'livre';
  if (match.status === 'APROVADA') return 'ocupado';
  if (match.status === 'PENDENTE' || match.status === 'EM_REVISAO') return 'pendente';
  return 'livre';
}

async function apiFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? `Falha: ${path}`);
  return json.data as T;
}

// ─── Status Pill ──────────────────────────────────────────────────────────────

const PILL_CONFIG: Record<SlotStatus, {
  bg: string; text: string; border: string; label: string; Icon?: React.ElementType;
}> = {
  livre:    { bg:'bg-green-50',  text:'text-green-700', border:'border-green-200', label:'Livre',  Icon: Check  },
  ocupado:  { bg:'bg-red-50',    text:'text-red-700',   border:'border-red-200',   label:'Ocup.',  Icon: XIcon  },
  pendente: { bg:'bg-yellow-50', text:'text-yellow-700',border:'border-yellow-200',label:'Pend.',  Icon: Clock  },
  bloqueado:{ bg:'bg-gray-100',  text:'text-gray-400',  border:'border-gray-200',  label:'—'                    },
};

function Pill({ status, size = 'sm' }: { status: SlotStatus; size?: 'sm' | 'md' }) {
  const c = PILL_CONFIG[status];
  const Icon = c.Icon;
  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 rounded-full border font-medium',
      c.bg, c.text, c.border,
      size === 'sm' ? 'px-1.5 py-0 text-[9px] leading-4' : 'px-2.5 py-1 text-xs',
    )}>
      {Icon && <Icon className={size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'} strokeWidth={2.5} />}
      {c.label}
    </span>
  );
}

// ─── Lab Mini Block ───────────────────────────────────────────────────────────

function LabBlock({
  label, slots, loading,
}: {
  label: string;
  slots?: LabSlots;
  loading: boolean;
}) {
  const Sk = () => <div className="h-4 w-10 rounded-full bg-gray-200 animate-pulse" />;
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-none mb-0.5">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-gray-400 w-3">M</span>
        {loading ? <Sk /> : <Pill status={slots?.MANHA ?? 'bloqueado'} />}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[9px] text-gray-400 w-3">T</span>
        {loading ? <Sk /> : <Pill status={slots?.TARDE ?? 'bloqueado'} />}
      </div>
    </div>
  );
}

// ─── Day Card ─────────────────────────────────────────────────────────────────

function DayCard({
  date, isToday, isOtherMonth, isWeekend,
  slots, loading, onClick,
}: {
  date: Date | null;
  isToday: boolean;
  isOtherMonth: boolean;
  isWeekend: boolean;
  slots?: Record<string, LabSlots>;
  loading: boolean;
  quimId?: string;
  bioId?: string;
  onClick?: () => void;
}) {
  if (!date) {
    return <div className="border-r border-b border-gray-100 bg-gray-50/50" />;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'border-r border-b border-gray-100 p-2 text-left flex flex-col',
        'transition-all duration-150 focus:outline-none group relative',
        'hover:bg-blue-50/60 hover:shadow-inner hover:z-10',
        isWeekend && 'bg-gray-50/70',
        isToday && 'ring-2 ring-inset ring-blue-500 bg-blue-50/40',
        isOtherMonth && 'opacity-35',
      )}
    >
      {/* Date number */}
      <span className={cn(
        'text-sm font-semibold self-end leading-none mb-auto',
        isToday
          ? 'flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-xs'
          : 'text-gray-700',
      )}>
        {date.getDate()}
      </span>

      {/* Lab blocks */}
      {slots && (
        <div className="flex gap-1.5 mt-1 w-full">
          {Object.entries(slots).map(([labId, labSlots]) => {
            const key = labId;
            // We pass labId as key, label computed from outside context
            return null; // placeholder — rendered below
          })}
        </div>
      )}
    </button>
  );
}

// ─── Sheet (side panel) ───────────────────────────────────────────────────────

function Sheet({
  open, onClose, title, children,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl',
          'flex flex-col border-l border-gray-200 transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>{title}</div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

// ─── Slot Card (in sheet) ─────────────────────────────────────────────────────

function SlotCard({
  turno, status, reserva, dateKey, labId,
}: {
  turno: 'MANHA' | 'TARDE';
  status: SlotStatus;
  reserva?: Reserva;
  dateKey: string;
  labId: string;
}) {
  const label = turno === 'MANHA' ? 'Manhã' : 'Tarde';
  const bg: Record<SlotStatus, string> = {
    livre:    'bg-green-50 border-green-200',
    ocupado:  'bg-red-50 border-red-200',
    pendente: 'bg-yellow-50 border-yellow-200',
    bloqueado:'bg-gray-50 border-gray-200',
  };

  return (
    <div className={cn('rounded-xl border p-4 space-y-2', bg[status])}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-800">{label}</span>
          <Pill status={status} size="md" />
        </div>
        {status === 'livre' && (
          <a
            href={`/api/reservations/new?data=${dateKey}&turno=${turno}&laboratorioId=${labId}`}
            className="text-sm font-semibold text-[#1E7A40] hover:underline"
          >
            Reservar →
          </a>
        )}
        {status === 'bloqueado' && (
          <span className="text-xs text-gray-400">Prazo insuficiente</span>
        )}
      </div>
      {reserva && (
        <div className="space-y-0.5 pl-1">
          <p className="font-semibold text-sm text-gray-900">{reserva.nomePratica}</p>
          <p className="text-xs text-gray-500">
            {reserva.disciplina}
          </p>
          <p className="text-xs text-gray-500">
            Docente: {reserva.criadoPor?.nome}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Login screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (token: string, user: User) => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message ?? 'Credenciais inválidas');
      const { token, user } = json.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      onLogin(token, user);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <FlaskConical className="w-7 h-7 text-[#1E7A40]" />
          <span className="text-xl font-bold text-gray-900">IFSlot</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Entrar</h2>
        <p className="text-sm text-gray-500 mb-7">Acesse com suas credenciais institucionais</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nome@ifpr.edu.br"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7A40]/30 focus:border-[#1E7A40]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7A40]/30 focus:border-[#1E7A40]"
            />
          </div>
          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1E7A40] text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-[#185f32] transition-colors disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onDismiss }: { msg: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-red-600 text-white rounded-xl px-5 py-3 text-sm font-medium shadow-xl flex items-center gap-3 animate-fade-in">
      {msg}
      <button onClick={onDismiss}><X className="w-4 h-4" /></button>
    </div>
  );
}

// ─── Main Calendar Page ───────────────────────────────────────────────────────

export default function CalendarioPage() {
  const today = new Date();
  const [token, setToken]       = useState<string | null>(null);
  const [user, setUser]         = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [month, setMonth]       = useState(today.getMonth());
  const [year, setYear]         = useState(today.getFullYear());

  const [labs, setLabs]         = useState<Lab[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loadingLabs, setLoadingLabs]   = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [toast, setToast]       = useState('');

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen]     = useState(false);

  // ── Auth init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    const u = localStorage.getItem('auth_user');
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u) as User);
      } catch { /* ignore */ }
    }
    setAuthReady(true);
  }, []);

  function handleLogin(t: string, u: User) {
    setToken(t);
    setUser(u);
  }

  function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }

  // ── Fetch labs ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!token) return;
    setLoadingLabs(true);
    apiFetch<Lab[]>('/api/laboratories', token)
      .then(setLabs)
      .catch(() => setToast('Erro ao carregar laboratórios'))
      .finally(() => setLoadingLabs(false));
  }, [token]);

  // ── Fetch month reservations ───────────────────────────────────────────────
  const fetchMonth = useCallback(async (t: string, y: number, m: number) => {
    setLoadingMonth(true);
    const pad = (n: number) => String(n).padStart(2,'0');
    const inicio = `${y}-${pad(m+1)}-01`;
    const fim    = `${y}-${pad(m+1)}-${new Date(y, m+1, 0).getDate()}`;
    try {
      const data = await apiFetch<Reserva[]>(
        `/api/reservations?dataInicio=${inicio}&dataFim=${fim}`, t
      );
      setReservas(data);
    } catch {
      setToast('Erro ao carregar reservas do mês');
      setReservas([]);
    } finally {
      setLoadingMonth(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchMonth(token, year, month);
  }, [token, year, month, fetchMonth]);

  // ── Slot map ───────────────────────────────────────────────────────────────
  const dayMap = useMemo<DayMap>(() => {
    if (!labs.length) return {};
    const cells = buildCalendar(year, month);
    const map: DayMap = {};
    cells.forEach(d => {
      if (!d) return;
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

  // ── Navigation ─────────────────────────────────────────────────────────────
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y-1); }
    else setMonth(m => m-1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y+1); }
    else setMonth(m => m+1);
  }

  function openDay(d: Date) {
    setSelectedDay(d);
    setSheetOpen(true);
  }

  const cells    = buildCalendar(year, month);
  const quimLab  = labs.find(l => l.tipo === 'QUIMICA');
  const bioLab   = labs.find(l => l.tipo === 'BIOLOGIA');
  const loading  = loadingLabs || loadingMonth;

  const dayReservas = useMemo(() => {
    if (!selectedDay) return [];
    const k = toKey(selectedDay);
    return reservas.filter(r => r.data.slice(0,10) === k);
  }, [selectedDay, reservas]);

  // ── Render gates ───────────────────────────────────────────────────────────
  if (!authReady) return null;
  if (!token || !user) return <LoginScreen onLogin={handleLogin} />;

  const numRows = cells.length / 7;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1E7A40] flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">IFSlot</span>
          <span className="hidden sm:block text-gray-300 mx-1">|</span>
          <span className="hidden sm:block text-sm text-gray-500">Calendário de Laboratórios</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Month nav */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-1 py-1">
            <button
              onClick={prevMonth}
              className="p-1 rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-800 w-36 text-center select-none">
              {MESES[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today button */}
          <button
            onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()); }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-[#1E7A40] border border-gray-200 rounded-lg px-3 py-1.5 hover:border-[#1E7A40]/50 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            Hoje
          </button>

          {/* Legend */}
          <div className="hidden lg:flex items-center gap-3 border-l pl-3 border-gray-200">
            {(['livre','ocupado','pendente','bloqueado'] as SlotStatus[]).map(s => (
              <Pill key={s} status={s} size="md" />
            ))}
          </div>

          {/* User */}
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-7 h-7 rounded-full bg-[#1E7A40]/10 flex items-center justify-center">
              <span className="text-xs font-bold text-[#1E7A40]">
                {user.nome.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {user.nome.split(' ')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Calendar body ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 bg-white shrink-0">
          {DIAS_SEMANA.map((d, i) => (
            <div
              key={d}
              className={cn(
                'py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide',
                (i === 0 || i === 6) && 'text-gray-400',
              )}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div
          className="flex-1 grid grid-cols-7 border-l border-t border-gray-200 overflow-hidden"
          style={{ gridTemplateRows: `repeat(${numRows}, 1fr)` }}
        >
          {cells.map((d, i) => {
            if (!d) {
              return (
                <div
                  key={i}
                  className="border-r border-b border-gray-100 bg-gray-50/60"
                />
              );
            }

            const k        = toKey(d);
            const isToday  = k === toKey(today);
            const isSel    = selectedDay && k === toKey(selectedDay);
            const dow      = d.getDay();
            const isWknd   = dow === 0 || dow === 6;
            const daySlots = dayMap[k];

            return (
              <button
                key={i}
                onClick={() => openDay(d)}
                className={cn(
                  'border-r border-b border-gray-100 p-2 text-left flex flex-col',
                  'transition-all duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400',
                  'hover:bg-blue-50/70 hover:shadow-inner',
                  isWknd && 'bg-gray-50/60',
                  isToday && 'ring-2 ring-inset ring-blue-500 bg-blue-50/40',
                  isSel && 'bg-blue-50',
                )}
              >
                {/* Date number */}
                <span className={cn(
                  'leading-none self-end text-sm',
                  isToday
                    ? 'w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold'
                    : 'font-semibold text-gray-700',
                )}>
                  {d.getDate()}
                </span>

                {/* Lab blocks */}
                <div className="flex-1 flex items-end">
                  <div className="flex gap-1.5 w-full mt-1">
                    {[
                      { lab: quimLab, label: 'Quím' },
                      { lab: bioLab,  label: 'Bio'  },
                    ].map(({ lab, label }) => {
                      if (!lab) return null;
                      return (
                        <div
                          key={lab.id}
                          className="flex-1 bg-white/80 rounded-md border border-gray-100 px-1 py-1 min-w-0"
                        >
                          <LabBlock
                            label={label}
                            slots={daySlots?.[lab.id]}
                            loading={loading}
                          />
                        </div>
                      );
                    })}
                    {/* Skeleton while labs load */}
                    {!labs.length && loading && (
                      <div className="flex-1 h-12 rounded-md bg-gray-100 animate-pulse" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Day Sheet ── */}
      <Sheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setTimeout(() => setSelectedDay(null), 300); }}
        title={
          selectedDay ? (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                {DIAS_SEMANA[selectedDay.getDay()]}
              </p>
              <h2 className="text-xl font-bold text-gray-900 mt-0.5">
                {selectedDay.getDate()} de {MESES[selectedDay.getMonth()]}
              </h2>
              <p className="text-sm text-gray-500">{year}</p>
            </div>
          ) : null
        }
      >
        {selectedDay && (
          <div className="p-6 space-y-8">
            {labs.map(lab => {
              const labKey   = toKey(selectedDay);
              const slots    = dayMap[labKey]?.[lab.id];
              const labLabel = lab.tipo === 'QUIMICA' ? 'Química' : 'Biologia';
              const accent   = lab.tipo === 'QUIMICA' ? 'bg-blue-500' : 'bg-emerald-600';

              return (
                <div key={lab.id} className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-1.5 h-7 rounded-full', accent)} />
                    <div>
                      <p className="font-bold text-gray-900">{lab.nome}</p>
                      <p className="text-xs text-gray-500">Laboratório de {labLabel}</p>
                    </div>
                  </div>

                  {(['MANHA', 'TARDE'] as const).map(turno => {
                    const status  = slots?.[turno] ?? 'bloqueado';
                    const reserva = dayReservas.find(r =>
                      r.laboratorioId === lab.id && r.turno === turno
                    );
                    return (
                      <SlotCard
                        key={turno}
                        turno={turno}
                        status={status}
                        reserva={reserva}
                        dateKey={labKey}
                        labId={lab.id}
                      />
                    );
                  })}
                </div>
              );
            })}

            {!labs.length && loadingLabs && (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* ── Toast ── */}
      {toast && <Toast msg={toast} onDismiss={() => setToast('')} />}
    </div>
  );
}
