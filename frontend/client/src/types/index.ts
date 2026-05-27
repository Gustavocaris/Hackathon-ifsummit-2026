// User types
export type UserRole = 'docente' | 'tecnico' | 'admin';

export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
  avatar?: string;
}

// Laboratory types
export interface Laboratory {
  id: string;
  nome: string;
  capacidade: number;
  status: 'disponivel' | 'manutencao' | 'ocupado';
  descricao?: string;
}

// Material types
export interface Material {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  validade?: string;
  lote?: string;
  estoque_minimo: number;
  categoria: 'reagente' | 'equipamento' | 'vidraria';
}

// Reservation types
export type ReservationStatus = 'pendente' | 'aprovada' | 'reprovada' | 'ajuste_solicitado';

export interface ReservationMaterial {
  material_id: string;
  material: Material;
  quantidade: number;
  disponivel: boolean;
}

export interface Reservation {
  id: string;
  laboratorio_id: string;
  laboratorio: Laboratory;
  docente_id: string;
  docente: User;
  data: string;
  inicio: string;
  fim: string;
  disciplina: string;
  turma: string;
  quantidade_alunos: number;
  status: ReservationStatus;
  observacoes?: string;
  materiais: ReservationMaterial[];
  justificativa_rejeicao?: string;
  data_criacao: string;
}

// Practice file types
export interface PracticeFile {
  id: string;
  reservation_id: string;
  nome_arquivo: string;
  caminho: string;
  disciplina: string;
  data_upload: string;
  usuario_id: string;
}

// Notification types
export type NotificationType = 'reserva_aprovada' | 'reserva_reprovada' | 'ajuste_solicitado' | 'estoque_insuficiente' | 'manutencao';

export interface Notification {
  id: string;
  usuario_id: string;
  mensagem: string;
  tipo: NotificationType;
  lida: boolean;
  data_criacao: string;
  referencia_id?: string;
}

// Dashboard stats
export interface DashboardStats {
  proximas_reservas: Reservation[];
  laboratorios_disponiveis: Laboratory[];
  reservas_pendentes: Reservation[];
  materiais_criticos: Material[];
  notificacoes_recentes: Notification[];
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  senha: string;
}

export interface ReservationFormData {
  laboratorio_id: string;
  data: string;
  inicio: string;
  fim: string;
  disciplina: string;
  turma: string;
  quantidade_alunos: number;
  observacoes?: string;
  materiais: Array<{
    material_id: string;
    quantidade: number;
  }>;
}

export interface MaterialFormData {
  nome: string;
  quantidade: number;
  unidade: string;
  validade?: string;
  lote?: string;
  estoque_minimo: number;
  categoria: 'reagente' | 'equipamento' | 'vidraria';
}
