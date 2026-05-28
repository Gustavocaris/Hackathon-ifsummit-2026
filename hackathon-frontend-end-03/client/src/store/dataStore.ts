import { create } from 'zustand';
import {
  Laboratory,
  Material,
  Reservation,
  Notification,
  ReservationStatus,
} from '@/types';

// ─────────────────────────────────────────────
// API helper
// ─────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message ?? `Request failed: ${path}`);
  }

  return json.data as T;
}

// ─────────────────────────────────────────────
// Store interface
// ─────────────────────────────────────────────

interface DataState {
  initialized: boolean;

  // Laboratories
  laboratories: Laboratory[];
  getLaboratories: () => Laboratory[];
  getLaboratoryById: (id: string) => Laboratory | undefined;
  fetchLaboratories: () => Promise<void>;

  // Materials
  materials: Material[];
  getMaterials: () => Material[];
  getMaterialById: (id: string) => Material | undefined;
  updateMaterialQuantity: (id: string, quantidade: number) => Promise<void>;
  addMaterial: (material: Omit<Material, 'id'>) => Promise<Material>;
  deleteMaterial: (id: string) => Promise<void>;
  fetchMaterials: () => Promise<void>;

  // Reservations
  reservations: Reservation[];
  getReservations: () => Reservation[];
  getReservationById: (id: string) => Reservation | undefined;
  getReservationsByDocente: (docente_id: string) => Reservation[];
  getReservationsByLaboratory: (lab_id: string) => Reservation[];
  getPendingReservations: () => Reservation[];
  createReservation: (data: {
    laboratorio_id: string;
    data: string;
    inicio: string;
    fim: string;
    disciplina: string;
    turma: string;
    quantidade_alunos: number;
    observacoes?: string;
    materiais?: Array<{ material_id: string; quantidade: number }>;
  }) => Promise<Reservation>;
  updateReservationStatus: (
    id: string,
    status: ReservationStatus,
    justificativa?: string
  ) => Promise<void>;
  fetchReservations: () => Promise<void>;

  // Notifications
  notifications: Notification[];
  getNotifications: () => Notification[];
  getUnreadNotifications: () => Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  fetchNotifications: () => Promise<void>;

  // Bulk fetch
  fetchAll: () => Promise<void>;
}

// ─────────────────────────────────────────────
// Store implementation
// ─────────────────────────────────────────────

export const useDataStore = create<DataState>((set, get) => ({
  initialized: false,

  // ── Laboratories ──────────────────────────────────

  laboratories: [],

  getLaboratories: () => get().laboratories,

  getLaboratoryById: (id: string) => get().laboratories.find((l) => l.id === id),

  fetchLaboratories: async () => {
    try {
      const data = await apiFetch<Laboratory[]>('/api/laboratories');
      set({ laboratories: data });
    } catch (err) {
      console.error('[fetchLaboratories]', err);
    }
  },

  // ── Materials ─────────────────────────────────────

  materials: [],

  getMaterials: () => get().materials,

  getMaterialById: (id: string) => get().materials.find((m) => m.id === id),

  fetchMaterials: async () => {
    try {
      const data = await apiFetch<Material[]>('/api/materials');
      set({ materials: data });
    } catch (err) {
      console.error('[fetchMaterials]', err);
    }
  },

  updateMaterialQuantity: async (id: string, quantidade: number) => {
    try {
      await apiFetch(`/api/materials/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantidade }),
      });
      set((state) => ({
        materials: state.materials.map((m) =>
          m.id === id ? { ...m, quantidade } : m
        ),
      }));
    } catch (err) {
      console.error('[updateMaterialQuantity]', err);
      throw err;
    }
  },

  addMaterial: async (material) => {
    const created = await apiFetch<Material>('/api/materials', {
      method: 'POST',
      body: JSON.stringify(material),
    });
    set((state) => ({ materials: [...state.materials, created] }));
    return created;
  },

  deleteMaterial: async (id: string) => {
    await apiFetch(`/api/materials/${id}`, { method: 'DELETE' });
    set((state) => ({
      materials: state.materials.filter((m) => m.id !== id),
    }));
  },

  // ── Reservations ──────────────────────────────────

  reservations: [],

  getReservations: () => get().reservations,

  getReservationById: (id: string) => get().reservations.find((r) => r.id === id),

  getReservationsByDocente: (docente_id: string) =>
    get().reservations.filter((r) => r.docente_id === docente_id),

  getReservationsByLaboratory: (lab_id: string) =>
    get().reservations.filter((r) => r.laboratorio_id === lab_id),

  getPendingReservations: () =>
    get().reservations.filter((r) => r.status === 'pendente'),

  fetchReservations: async () => {
    try {
      const data = await apiFetch<Reservation[]>('/api/reservations');
      set({ reservations: data });
    } catch (err) {
      console.error('[fetchReservations]', err);
    }
  },

  createReservation: async (data) => {
    const reserva = await apiFetch<Reservation>('/api/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    set((state) => ({ reservations: [...state.reservations, reserva] }));
    return reserva;
  },

  updateReservationStatus: async (
    id: string,
    status: ReservationStatus,
    justificativa?: string
  ) => {
    const updated = await apiFetch<Reservation>(`/api/reservations/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ status, justificativa }),
    });
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id ? updated : r
      ),
    }));
  },

  // ── Notifications ─────────────────────────────────

  notifications: [],

  getNotifications: () => get().notifications,

  getUnreadNotifications: () => get().notifications.filter((n) => !n.lida),

  fetchNotifications: async () => {
    try {
      const data = await apiFetch<Notification[]>('/api/notifications');
      set({ notifications: data });
    } catch (err) {
      console.error('[fetchNotifications]', err);
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, lida: true } : n
        ),
      }));
    } catch (err) {
      console.error('[markNotificationAsRead]', err);
      throw err;
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  // ── Bulk fetch ────────────────────────────────────

  fetchAll: async () => {
    await Promise.allSettled([
      get().fetchLaboratories(),
      get().fetchMaterials(),
      get().fetchReservations(),
      get().fetchNotifications(),
    ]);
    set({ initialized: true });
  },
}));
