export type Role = 'worker' | 'admin';

export type ReportType =
  | 'unsafe_condition'
  | 'work_accident'
  | 'maintenance'
  | 'road_accident';

export type ReportStatus = 'pending' | 'resolved';

export type Actor = {
  id: string;
  role: Role;
  email: string;
};
