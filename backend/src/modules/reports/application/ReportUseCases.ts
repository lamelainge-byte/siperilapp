import type { CreateReport } from './use-cases/CreateReport.js';
import type { DeleteReport } from './use-cases/DeleteReport.js';
import type { GetReport } from './use-cases/GetReport.js';
import type { GetReportStats } from './use-cases/GetReportStats.js';
import type { ListReports } from './use-cases/ListReports.js';
import type { ResolveReport } from './use-cases/ResolveReport.js';
import type { UpdateReport } from './use-cases/UpdateReport.js';

export type ReportUseCases = {
  listReports: ListReports;
  getReport: GetReport;
  createReport: CreateReport;
  updateReport: UpdateReport;
  deleteReport: DeleteReport;
  resolveReport: ResolveReport;
  getReportStats: GetReportStats;
};
