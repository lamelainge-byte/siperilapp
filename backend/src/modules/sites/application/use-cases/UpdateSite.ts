import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { SitePort } from '../../domain/ports/SitePort.js';
import type { UpdateSiteDto } from '../dto/SiteDto.js';
import { assertAdmin } from './site-helpers.js';

export class UpdateSite {
  constructor(private readonly sites: SitePort) {}

  async execute(id: string, actor: Actor, input: UpdateSiteDto) {
    assertAdmin(actor);
    const site = await this.sites.findById(id);
    if (!site) throw new AppError(404, 'Sitio no encontrado');
    return this.sites.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.company !== undefined ? { company: input.company } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.area !== undefined ? { area: input.area } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    });
  }
}
