import { AppError } from '../../../../shared/utils/errors.js';
import type { Report } from '../../domain/entities/Report.js';
import type { SitePort } from '../../../sites/domain/ports/SitePort.js';

export type PublicReport = Omit<Report, 'imageUrl'> & { imageUrl: string | null };

export function toPublicReport(report: Report, publicBaseUrl: string): PublicReport {
  // si la foto es una ruta local se le antepone la url publica del api
  return {
    ...report,
    imageUrl: report.imageUrl
      ? report.imageUrl.startsWith('http')
        ? report.imageUrl
        : `${publicBaseUrl}${report.imageUrl}`
      : null,
  };
}

export async function resolveSiteId(
  sites: SitePort,
  siteId: string | null | undefined,
  company: string,
): Promise<string | null> {
  if (!siteId) return null;
  const site = await sites.findById(siteId);
  // el sitio debe existir y ser de la misma empresa del usuario
  if (!site) throw new AppError(404, 'Sitio no encontrado');
  if (site.company !== company) throw new AppError(400, 'El sitio no pertenece a tu empresa');
  return site.id;
}
