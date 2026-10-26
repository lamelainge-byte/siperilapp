// contrato de reportes: listar, buscar, crear, editar, borrar y estadisticas
import type { ReportStatus, ReportType } from '../../../../shared/utils/types.js';
import type { Report } from '../entities/Report.js';

export type ReportListFilter = { userId?: string; company?: string };

export type NewReport = {
  reportType: ReportType;
  userId: string;
  company: string;
  description: string;
  incidentDate: Date | null;
  incidentTime: string | null;
  shift: string | null;
  place: string | null;
  office: string | null;
  equipmentType: string | null;
  damageKind: string | null;
  siteId: string | null;
  latitude: number | null;
  longitude: number | null;
  weatherSummary: string | null;
  imageUrl: string | null;
};

export type ReportUpdates = {
  reportType?: ReportType;
  description?: string;
  incidentDate?: Date | null;
  incidentTime?: string | null;
  shift?: string | null;
  place?: string | null;
  office?: string | null;
  equipmentType?: string | null;
  damageKind?: string | null;
  siteId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  weatherSummary?: string | null;
  imageUrl?: string;
  status?: ReportStatus;
  resolvedAt?: Date | null;
  resolvedById?: string | null;
};

export type ReportStats = {
  total: number;
  pending: number;
  resolved: number;
  companies: string[];
};

export interface ReportPort {
  list(filter: ReportListFilter): Promise<Report[]>;
  findById(id: string): Promise<Report | null>;
  create(data: NewReport): Promise<Report>;
  update(id: string, data: ReportUpdates): Promise<Report>;
  delete(id: string): Promise<void>;
  stats(company?: string): Promise<ReportStats>;
}
