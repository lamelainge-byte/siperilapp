import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor, ReportType } from '../../../../shared/utils/types.js';
import type { SitePort } from '../../../sites/domain/ports/SitePort.js';
import type { WeatherPort } from '../../domain/ports/WeatherPort.js';
import type { ReportPort } from '../../domain/ports/ReportPort.js';
import type { UpdateReportDto } from '../dto/ReportDto.js';
import { resolveSiteId, toPublicReport, type PublicReport } from './report-helpers.js';

export class UpdateReport {
  constructor(
    private readonly reports: ReportPort,
    private readonly sites: SitePort,
    private readonly weather: WeatherPort,
    private readonly publicBaseUrl: string,
  ) {}

  async execute(id: string, actor: Actor, body: UpdateReportDto, imagePath?: string): Promise<PublicReport> {
    const report = await this.reports.findById(id);
    if (!report) throw new AppError(404, 'Reporte no encontrado');
    if (actor.role !== 'admin' && report.userId !== actor.id) {
      // el trabajador solo edita reportes que el mismo creo
      throw new AppError(403, 'No puedes editar este reporte');
    }
    // un reporte resuelto solo lo edita un administrador
    if (report.status === 'resolved' && actor.role !== 'admin') {
      throw new AppError(409, 'Un reporte resuelto no se puede editar');
    }
    let weatherSummary = report.weatherSummary;
    if (body.latitude != null && body.longitude != null) {
      // si cambian las coordenadas se vuelve a pedir el clima
      weatherSummary = await this.weather.getSummary(body.latitude, body.longitude);
    }
    const siteId =
      body.siteId === undefined ? undefined : await resolveSiteId(this.sites, body.siteId, report.company);
    return toPublicReport(
      await this.reports.update(id, {
        ...(body.reportType ? { reportType: body.reportType as ReportType } : {}),
        ...(body.description ? { description: body.description } : {}),
        incidentDate: body.incidentDate ? new Date(body.incidentDate) : undefined,
        incidentTime: body.incidentTime ?? undefined,
        shift: body.shift ?? undefined,
        place: body.place ?? undefined,
        office: body.office ?? undefined,
        equipmentType: body.equipmentType ?? undefined,
        damageKind: body.damageKind ?? undefined,
        ...(siteId !== undefined ? { siteId } : {}),
        latitude: body.latitude ?? undefined,
        longitude: body.longitude ?? undefined,
        weatherSummary,
        ...(imagePath ? { imageUrl: imagePath } : {}),
      }),
      this.publicBaseUrl,
    );
  }
}
