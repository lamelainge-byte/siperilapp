import type { Actor } from '../../../../shared/utils/types.js';
import type { SitePort } from '../../domain/ports/SitePort.js';
import type { CreateSiteDto } from '../dto/SiteDto.js';
import { assertAdmin } from './site-helpers.js';

export class CreateSite {
  constructor(private readonly sites: SitePort) {}

  async execute(actor: Actor, input: CreateSiteDto) {
    assertAdmin(actor);
    // un sitio nace activo si no dicen lo contrario
    return this.sites.create({
      name: input.name,
      company: input.company,
      address: input.address ?? null,
      area: input.area ?? null,
      active: input.active ?? true,
    });
  }
}
