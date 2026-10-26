// tipos que comparten todos los modulos, actor es quien hizo la peticion, sacado del token
export type Role = 'worker' | 'admin';

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

export type Actor = {
  id: string;
  role: Role;
  email: string;
};
