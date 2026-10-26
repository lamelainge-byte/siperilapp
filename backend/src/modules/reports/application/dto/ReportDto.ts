// body de crear y editar un reporte, la imagen no va aqui: multer la recibe aparte en la ruta
import type { ReportType } from '../../../../shared/utils/types.js';

export type CreateReportDto = {
  reportType: ReportType;
  description: string;
  incidentDate?: string | null;
  incidentTime?: string | null;
  shift?: string | null;
  place?: string | null;
  office?: string | null;
  equipmentType?: string | null;
  damageKind?: string | null;
  siteId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type UpdateReportDto = Partial<CreateReportDto>;
