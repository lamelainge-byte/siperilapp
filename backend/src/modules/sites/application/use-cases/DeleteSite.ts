import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { SitePort } from '../../domain/ports/SitePort.js';
import { assertAdmin } from './site-helpers.js';

export class DeleteSite {
  constructor(private readonly sites: SitePort) {}

  async execute(id: string, actor: Actor): Promise<void> {
    assertAdmin(actor);
    const site = await this.sites.findById(id);
    if (!site) throw new AppError(404, 'Sitio no encontrado');
    const linked = await this.sites.countReports(id);
    // con reportes ligados no se borra, se desactiva
    if (linked > 0) {
      throw new AppError(409, 'No se puede eliminar un sitio con reportes. Desactívalo en su lugar.');
    }
    await this.sites.delete(id);
  }
}
