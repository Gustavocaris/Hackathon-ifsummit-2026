import { create } from 'zustand';
import {
  Laboratory,
  Material,
  Reservation,
  Notification,
  ReservationStatus,
} from '@/types';
import {
  MOCK_LABORATORIES,
  MOCK_MATERIALS,
  MOCK_RESERVATIONS,
  MOCK_NOTIFICATIONS,
} from './mockData';

interface DataState {
  // Laboratories
  laboratories: Laboratory[];
  getLaboratories: () => Laboratory[];
  getLaboratoryById: (id: string) => Laboratory | undefined;

  // Materials
  materials: Material[];
  getMaterials: () => Material[];
  getMaterialById: (id: string) => Material | undefined;
  updateMaterialQuantity: (id: string, quantidade: number) => void;
  addMaterial: (material: Material) => void;

  // Reservations
  reservations: Reservation[];
  getReservations: () => Reservation[];
  getReservationById: (id: string) => Reservation | undefined;
  getReservationsByDocente: (docente_id: string) => Reservation[];
  getReservationsByLaboratory: (lab_id: string) => Reservation[];
  getPendingReservations: () => Reservation[];
  createReservation: (reservation: Reservation) => void;
  updateReservationStatus: (id: string, status: ReservationStatus, justificativa?: string) => void;

  // Notifications
  notifications: Notification[];
  getNotifications: () => Notification[];
  getUnreadNotifications: () => Notification[];
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Notification) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  // Laboratories
  laboratories: MOCK_LABORATORIES,
  getLaboratories: () => get().laboratories,
  getLaboratoryById: (id: string) => get().laboratories.find((l) => l.id === id),

  // Materials
  materials: MOCK_MATERIALS,
  getMaterials: () => get().materials,
  getMaterialById: (id: string) => get().materials.find((m) => m.id === id),
  updateMaterialQuantity: (id: string, quantidade: number) => {
    set((state) => ({
      materials: state.materials.map((m) =>
        m.id === id ? { ...m, quantidade } : m
      ),
    }));
  },
  addMaterial: (material: Material) => {
    set((state) => ({
      materials: [...state.materials, material],
    }));
  },

  // Reservations
  reservations: MOCK_RESERVATIONS,
  getReservations: () => get().reservations,
  getReservationById: (id: string) => get().reservations.find((r) => r.id === id),
  getReservationsByDocente: (docente_id: string) =>
    get().reservations.filter((r) => r.docente_id === docente_id),
  getReservationsByLaboratory: (lab_id: string) =>
    get().reservations.filter((r) => r.laboratorio_id === lab_id),
  getPendingReservations: () =>
    get().reservations.filter((r) => r.status === 'pendente'),
  createReservation: (reservation: Reservation) => {
    set((state) => ({
      reservations: [...state.reservations, reservation],
    }));
  },
  updateReservationStatus: (id: string, status: ReservationStatus, justificativa?: string) => {
    set((state) => ({
      reservations: state.reservations.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              justificativa_rejeicao: justificativa,
            }
          : r
      ),
    }));
  },

  // Notifications
  notifications: MOCK_NOTIFICATIONS,
  getNotifications: () => get().notifications,
  getUnreadNotifications: () => get().notifications.filter((n) => !n.lida),
  markNotificationAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, lida: true } : n
      ),
    }));
  },
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },
}));
