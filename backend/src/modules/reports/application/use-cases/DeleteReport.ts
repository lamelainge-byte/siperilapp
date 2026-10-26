import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { ReportPort } from '../../domain/ports/ReportPort.js';

export class DeleteReport {
  constructor(private readonly reports: ReportPort) {}

  async execute(id: string, actor: Actor): Promise<void> {
    const report = await this.reports.findById(id);
    if (!report) throw new AppError(404, 'Reporte no encontrado');
    // el trabajador borra solo los suyos y el admin cualquiera
    if (actor.role !== 'admin' && report.userId !== actor.id) {
      throw new AppError(403, 'No puedes eliminar este reporte');
    }
    await this.reports.delete(id);
  }
}
