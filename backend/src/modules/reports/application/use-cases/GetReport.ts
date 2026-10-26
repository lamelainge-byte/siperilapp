import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { ReportPort } from '../../domain/ports/ReportPort.js';
import { toPublicReport, type PublicReport } from './report-helpers.js';

export class GetReport {
  constructor(
    private readonly reports: ReportPort,
    private readonly publicBaseUrl: string,
  ) {}

  async execute(id: string, actor: Actor): Promise<PublicReport> {
    const report = await this.reports.findById(id);
    if (!report) throw new AppError(404, 'Reporte no encontrado');
    // solo el dueno o un admin pueden ver el detalle
    if (actor.role !== 'admin' && report.userId !== actor.id) {
      throw new AppError(403, 'No puedes ver este reporte');
    }
    return toPublicReport(report, this.publicBaseUrl);
  }
}
