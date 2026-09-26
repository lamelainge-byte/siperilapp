import type { ReportStatus, ReportType } from '../../../../shared/utils/types.js';

export type ReportAuthor = { name: string; email: string };
export type ReportResolver = { name: string };

export type Report = {
  id: string;
  reportType: ReportType;
  userId: string;
  company: string;
  description: string;
  incidentDate: Date | null;
  incidentTime: string | null;
  shift: string | null;
  place: string | null;
  siteId: string | null;
  latitude: number | null;
  longitude: number | null;
  weatherSummary: string | null;
  imageUrl: string | null;
  status: ReportStatus;
  resolvedAt: Date | null;
  resolvedById: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: ReportAuthor;
  resolvedBy?: ReportResolver | null;
};
