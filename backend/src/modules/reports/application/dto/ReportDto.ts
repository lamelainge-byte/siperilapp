import type { ReportType } from '../../../../shared/utils/types.js';

export type CreateReportDto = {
  reportType: ReportType;
  description: string;
  incidentDate?: string | null;
  incidentTime?: string | null;
  shift?: string | null;
  place?: string | null;
  siteId?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type UpdateReportDto = Partial<CreateReportDto>;
