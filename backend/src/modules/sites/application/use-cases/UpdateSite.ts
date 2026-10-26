import { AppError } from '../../../../shared/utils/errors.js';
import type { Actor } from '../../../../shared/utils/types.js';
import type { Site } from '../../domain/entities/Site.js';
import type { SitePort } from '../../domain/ports/SitePort.js';
import type { UpdateSiteDto } from '../dto/SiteDto.js';
import { assertAdmin } from './site-helpers.js';

// solo el admin puede editar un sitio
export class UpdateSite {
  constructor(private readonly sites: SitePort) {}

  async execute(id: string, actor: Actor, input: UpdateSiteDto): Promise<Site> {
    assertAdmin(actor);
    const site = await this.sites.findById(id);
    // sin fila responde 404 y no sigue
    if (!site) throw new AppError(404, 'Sitio no encontrado');
    // solo escribe los campos que vinieron en el body
    return this.sites.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.company !== undefined ? { company: input.company } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(input.area !== undefined ? { area: input.area } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    });
  }
}
