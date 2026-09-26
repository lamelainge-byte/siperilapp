export type Role = 'worker' | 'admin';

// los cuatro formularios del menu de inicio
export type ReportType =
  | 'unsafe_condition'
  | 'work_accident'
  | 'maintenance'
  | 'road_accident';

export type ReportStatus = 'pending' | 'resolved';

// perfil que guarda el login, sin contraseña
export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string; // jwt corto que viaja en cada peticion
  refreshToken: string; // sirve para pedir otro access cuando vence
  user: User;
}

export interface Report {
  id: string;
  reportType: ReportType;
  userId: string;
  company: string;
  description: string;
  incidentDate: string | null;
  incidentTime: string | null;
  shift: string | null;
  place: string | null;
  latitude: number | null;
  longitude: number | null;
  weatherSummary: string | null; // clima que calculo el backend
  imageUrl: string | null;
  status: ReportStatus;
  resolvedAt: string | null;
  resolvedById: string | null;
  createdAt: string;
  user?: { name: string; email: string };
  resolvedBy?: { name: string } | null;
}

// textos que ve el usuario para cada tipo de reporte
export const REPORT_LABELS: Record<ReportType, string> = {
  unsafe_condition: 'Actos y condiciones inseguras',
  work_accident: 'Accidente de trabajo',
  maintenance: 'Registro de mantenimiento',
  road_accident: 'Accidente vial',
};
