export type Role = 'worker' | 'admin';

// los cuatro formularios del menu de inicio
export type ReportType =
  | 'unsafe_condition'
  | 'work_accident'
  | 'maintenance'
  | 'road_accident'
  | 'height_equipment';

export type HeightEquipment =
  | 'harness'
  | 'positioning_sling'
  | 'tie_off'
  | 'carabiner'
  | 'helmet'
  | 'pretales'
  | 'ladder'
  | 'other';

export type EquipmentDamageKind = 'damage' | 'wear' | 'loss';

export type ReportStatus = 'pending' | 'resolved';

// perfil que guarda el login, sin contraseña
export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  employeeNumber?: string | null;
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
  office?: string | null;
  equipmentType?: HeightEquipment | null;
  damageKind?: EquipmentDamageKind | null;
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
  height_equipment: 'Daño de equipos de trabajo en alturas',
};

export const EQUIPMENT_LABELS: Record<HeightEquipment, string> = {
  harness: 'Arnés',
  positioning_sling: 'Eslinga de posicionamiento',
  tie_off: 'Tie Off',
  carabiner: 'Mosquetón',
  helmet: 'Casco',
  pretales: 'Pretales',
  ladder: 'Escalera',
  other: 'Otro',
};

export const DAMAGE_KIND_LABELS: Record<EquipmentDamageKind, string> = {
  damage: 'Daño',
  wear: 'Desgaste',
  loss: 'Pérdida',
};
