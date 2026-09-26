import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor, ReportStatus } from '../../../../shared/utils/types.js';
import type { ReportPort } from '../../domain/ports/ReportPort.js';
import { toPublicReport } from './report-helpers.js';

export class ResolveReport {
  constructor(
    private readonly reports: ReportPort,
    private readonly publicBaseUrl: string,
  ) {}

  async execute(id: string, actor: Actor) {
    if (actor.role !== 'admin') {
      // la ruta ya exige admin, esta comprobacion es una segunda barrera
      throw new AppError(403, 'Solo un administrador puede resolver reportes');
    }
    const report = await this.reports.findById(id);
    if (!report) throw new AppError(404, 'Reporte no encontrado');
    // marca resuelto y guarda quien y cuando lo cerro
    return toPublicReport(
      await this.reports.update(id, {
        status: 'resolved' as ReportStatus,
        resolvedAt: new Date(),
        resolvedById: actor.id,
      }),
      this.publicBaseUrl,
    );
  }
}
