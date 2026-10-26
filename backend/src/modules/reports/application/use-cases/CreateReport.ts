import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { UserPort } from '../../../users/domain/ports/UserPort.js';
import type { SitePort } from '../../../sites/domain/ports/SitePort.js';
import type { NotifierPort } from '../../domain/ports/NotifierPort.js';
import type { WeatherPort } from '../../domain/ports/WeatherPort.js';
import type { ReportPort } from '../../domain/ports/ReportPort.js';
import type { CreateReportDto } from '../dto/ReportDto.js';
import { resolveSiteId, toPublicReport, type PublicReport } from './report-helpers.js';

export class CreateReport {
  constructor(
    private readonly reports: ReportPort,
    private readonly users: UserPort,
    private readonly sites: SitePort,
    private readonly weather: WeatherPort,
    private readonly notifier: NotifierPort,
    private readonly publicBaseUrl: string,
  ) {}

  async execute(actor: Actor, body: CreateReportDto, imagePath?: string): Promise<PublicReport> {
    const dbUser = await this.users.getUserById(actor.id);
    if (!dbUser) throw new AppError(404, 'Usuario no encontrado');
    let weatherSummary: string | null = null;
    // con coordenadas consulta el clima y lo guarda junto al reporte
    if (body.latitude != null && body.longitude != null) {
      weatherSummary = await this.weather.getSummary(body.latitude, body.longitude);
    }
    const report = await this.reports.create({
      reportType: body.reportType,
      userId: dbUser.id,
      company: dbUser.company,
      description: body.description,
      incidentDate: body.incidentDate ? new Date(body.incidentDate) : null,
      incidentTime: body.incidentTime ?? null,
      shift: body.shift ?? null,
      place: body.place ?? null,
      office: body.office ?? null,
      equipmentType: body.equipmentType ?? null,
      damageKind: body.damageKind ?? null,
      siteId: await resolveSiteId(this.sites, body.siteId, dbUser.company),
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      weatherSummary,
      imageUrl: imagePath ?? null,
    });
    // avisa por correo despues de guardar, si emailjs no esta configurado se omite
    await this.notifier.notifyNewReport({
      userName: dbUser.name,
      company: dbUser.company,
      description: body.description,
      reportType: body.reportType,
      place: body.place ?? null,
      date: new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
    });
    return toPublicReport(report, this.publicBaseUrl);
  }
}
