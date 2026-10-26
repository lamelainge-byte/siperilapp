import type { ReportPort, ReportStats } from '../../domain/ports/ReportPort.js';

// conteos para el admin: total, pendientes, resueltos y empresas
// la ruta ya exige el rol admin
export class GetReportStats {
  constructor(private readonly reports: ReportPort) {}

  async execute(company?: string): Promise<ReportStats> {
    // si llega empresa, los numeros salen solo de esa empresa
    return this.reports.stats(company);
  }
}
