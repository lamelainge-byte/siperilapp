import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { UserPort } from '../../../users/domain/ports/UserPort.js';
import type { SitePort } from '../../domain/ports/SitePort.js';
import { companyOf } from './site-helpers.js';

export class GetSite {
  constructor(
    private readonly sites: SitePort,
    private readonly users: UserPort,
  ) {}

  async execute(id: string, actor: Actor) {
    const site = await this.sites.findById(id);
    if (!site) throw new AppError(404, 'Sitio no encontrado');
    if (actor.role !== 'admin' && site.company !== (await companyOf(this.users, actor))) {
      // un trabajador solo ve sitios de su empresa
      throw new AppError(403, 'No puedes ver este sitio');
    }
    return site;
  }
}
