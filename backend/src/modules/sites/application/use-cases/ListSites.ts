import type { Actor } from '../../../../shared/utils/types.js';
import type { UserPort } from '../../../users/domain/ports/UserPort.js';
import type { SitePort } from '../../domain/ports/SitePort.js';
import { companyOf } from './site-helpers.js';

export class ListSites {
  constructor(
    private readonly sites: SitePort,
    private readonly users: UserPort,
  ) {}

  async execute(actor: Actor, company?: string) {
    if (actor.role === 'admin') return this.sites.list(company);
    // el trabajador solo recibe los sitios activos de su empresa
    const sites = await this.sites.list(await companyOf(this.users, actor));
    return sites.filter((site) => site.active);
  }
}
