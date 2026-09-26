import type { Actor } from '../../../../shared/utils/types.js';
import type { ReportPort } from '../../domain/ports/ReportPort.js';
import { toPublicReport } from './report-helpers.js';

export class ListReports {
  constructor(
    private readonly reports: ReportPort,
    private readonly publicBaseUrl: string,
  ) {}

  async execute(actor: Actor, company?: string) {
    // el admin ve todos o filtra por empresa y el trabajador solo los suyos
    const filter = actor.role === 'admin' ? (company ? { company } : {}) : { userId: actor.id };
    return (await this.reports.list(filter)).map((report) => toPublicReport(report, this.publicBaseUrl));
  }
}
