import type { ReportPort } from '../../domain/ports/ReportPort.js';

export class GetReportStats {
  constructor(private readonly reports: ReportPort) {}

  async execute(company?: string) {
    return this.reports.stats(company);
  }
}
